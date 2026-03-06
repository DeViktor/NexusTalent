import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
      const metadata = session.metadata;
      
      if (!metadata || !metadata.userId) {
          console.error('Missing metadata in Stripe session', session.id);
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const userId = metadata.userId;

      if (metadata.type === 'course_purchase') {
          const courseId = metadata.courseId;
          const amount = session.amount_total;
          const currency = session.currency;

          if (courseId) {
             const { error } = await (supabaseAdmin as any).from('purchased_courses').insert({
                 user_id: userId,
                 course_id: courseId,
                 amount: amount || 0,
                 currency: currency || 'aoa',
                 stripe_checkout_session_id: session.id
             });

             if (error) {
                 console.error('Error inserting purchased course:', error);
                 return NextResponse.json({ error: 'Database error' }, { status: 500 });
             }
          }
      } else if (metadata.type === 'subscription') {
          // Handle subscription
           const { error } = await (supabaseAdmin as any).from('subscriptions').insert({
                 user_id: userId,
                 status: 'active', // Simplified. Ideally check subscription status
                 price_id: metadata.planName, // Using plan name as ID for now
                 stripe_subscription_id: session.subscription as string,
                 quantity: 1,
                 current_period_start: new Date().toISOString(), // Simplified
                 current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Simplified +30 days
             });

             if (error) {
                 console.error('Error inserting subscription:', error);
                 // Don't fail the webhook for this, but log it.
             }
             
             // Also update user role if needed
             // await supabaseAdmin.from('users').update({ role: 'recruiter' }).eq('id', userId);
      }
  }

  return NextResponse.json({ received: true });
}
