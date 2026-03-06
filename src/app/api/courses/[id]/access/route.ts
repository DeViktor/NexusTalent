import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cookieHeader = (req as any).headers?.get?.('cookie') as string | undefined;
    const appSession = cookieHeader
      ?.split(';')
      .map((s: string) => s.trim())
      .find((s: string) => s.startsWith('app_session='))
      ?.split('=')[1];

    if (!appSession) {
      return NextResponse.json({ ok: false, hasAccess: false }, { status: 401 });
    }

    const payload = await verifySession(appSession);
    if (!payload) {
      return NextResponse.json({ ok: false, hasAccess: false }, { status: 401 });
    }

    if (payload.role === 'admin' || payload.role === 'instructor') {
      return NextResponse.json({ ok: true, hasAccess: true });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('purchased_courses')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('course_id', id)
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, hasAccess: false }, { status: 500 });
    }

    const hasAccess = Array.isArray(data) && data.length > 0;
    return NextResponse.json({ ok: true, hasAccess });
  } catch {
    return NextResponse.json({ ok: false, hasAccess: false }, { status: 500 });
  }
}
