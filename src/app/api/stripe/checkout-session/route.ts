import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import process from 'process';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY nas variáveis de ambiente.' }, { status: 503 });
    }
    const body = await req.json();
    const { items, mode, success_url, cancel_url, customer_email, metadata } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unit_amount: item.amount, // Amount in smallest currency unit (e.g., cents)
          recurring: mode === 'subscription' ? { interval: item.interval || 'month' } : undefined,
        },
        quantity: item.quantity || 1,
      })),
      mode: mode || 'payment',
      success_url: success_url || `${req.headers.get('origin')}/dashboard`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/`,
      customer_email: customer_email,
      metadata: metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
