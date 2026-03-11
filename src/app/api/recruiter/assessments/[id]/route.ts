import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true }
  | { ok: false; error: string };
 
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const testId = String(params.id || '').trim();
    if (!testId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'recruiter' && role !== 'admin') return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
 
    const { data: test, error: testErr } = await (admin as any)
      .from('assessment_tests')
      .select('id, recruiter_id')
      .eq('id', testId)
      .single();
    if (testErr) throw testErr;
    if (String(test.recruiter_id) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { error: delErr } = await (admin as any).from('assessment_tests').delete().eq('id', testId);
    if (delErr) throw delErr;
 
    return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

