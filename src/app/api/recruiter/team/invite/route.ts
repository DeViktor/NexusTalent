import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
import crypto from 'node:crypto';
 
type ResponsePayload =
  | { ok: true; inviteId: string }
  | { ok: false; error: string };
 
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const body = await req.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    const role = String(body?.role || '').trim();
    if (!email) return NextResponse.json({ ok: false, error: 'Email inválido' } satisfies ResponsePayload, { status: 400 });
    if (!role) return NextResponse.json({ ok: false, error: 'Função inválida' } satisfies ResponsePayload, { status: 400 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const userRole = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const token = crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();
 
    const { data: existingInvite, error: existingInviteErr } = await (admin as any)
      .from('recruiter_team_invites')
      .select('id, status')
      .eq('owner_recruiter_id', session.userId)
      .eq('email', email)
      .limit(1);
    if (existingInviteErr) throw existingInviteErr;
    const existingId = Array.isArray(existingInvite) && existingInvite[0]?.id ? String(existingInvite[0].id) : null;
    if (existingId) {
      const { error: updErr } = await (admin as any)
        .from('recruiter_team_invites')
        .update({ role, status: 'Convidado', token, updated_at: now })
        .eq('id', existingId);
      if (updErr) throw updErr;
      return NextResponse.json({ ok: true, inviteId: existingId } satisfies ResponsePayload, { status: 200 });
    }
 
    const { data: created, error: createErr } = await (admin as any)
      .from('recruiter_team_invites')
      .insert({ owner_recruiter_id: session.userId, email, role, status: 'Convidado', token, created_at: now, updated_at: now })
      .select('id')
      .single();
    if (createErr) throw createErr;
 
    const { data: userRows, error: userErr } = await (admin as any).from('users').select('id').eq('email', email).limit(1);
    if (userErr) throw userErr;
    const memberUserId = Array.isArray(userRows) && userRows[0]?.id ? String(userRows[0].id) : null;
    if (memberUserId) {
      const { data: existingMember, error: exMemberErr } = await (admin as any)
        .from('recruiter_team_members')
        .select('id')
        .eq('owner_recruiter_id', session.userId)
        .eq('member_user_id', memberUserId)
        .limit(1);
      if (exMemberErr) throw exMemberErr;
      if (!Array.isArray(existingMember) || existingMember.length === 0) {
        const { error: memberInsertErr } = await (admin as any)
          .from('recruiter_team_members')
          .insert({ owner_recruiter_id: session.userId, member_user_id: memberUserId, role, status: 'Convidado', created_at: now, updated_at: now });
        if (memberInsertErr) throw memberInsertErr;
      }
    }
 
    return NextResponse.json({ ok: true, inviteId: String(created.id) } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
