import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
import crypto from 'node:crypto';
 
type ResponsePayload =
  | { ok: true }
  | { ok: false; error: string };
 
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const inviteId = String(params.id || '').trim();
    if (!inviteId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const body = await req.json().catch(() => null);
    const action = String(body?.action || '').trim();
    if (!action) return NextResponse.json({ ok: false, error: 'Ação inválida' } satisfies ResponsePayload, { status: 400 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const userRole = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: invite, error: inviteErr } = await (admin as any)
      .from('recruiter_team_invites')
      .select('id, owner_recruiter_id')
      .eq('id', inviteId)
      .single();
    if (inviteErr) throw inviteErr;
    if (String(invite.owner_recruiter_id) !== String(session.userId) && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const now = new Date().toISOString();
    if (action === 'resend') {
      const token = crypto.randomBytes(24).toString('hex');
      const { error: updErr } = await (admin as any)
        .from('recruiter_team_invites')
        .update({ status: 'Convidado', token, updated_at: now })
        .eq('id', inviteId);
      if (updErr) throw updErr;
      return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
    }
 
    if (action === 'revoke') {
      const { error: updErr } = await (admin as any)
        .from('recruiter_team_invites')
        .update({ status: 'Revogado', updated_at: now })
        .eq('id', inviteId);
      if (updErr) throw updErr;
      return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
    }
 
    return NextResponse.json({ ok: false, error: 'Ação inválida' } satisfies ResponsePayload, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
