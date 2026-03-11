import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type TeamRow =
  | { kind: 'member'; id: string; name: string; email: string; role: string; status: string; userId: string }
  | { kind: 'invite'; id: string; name: string; email: string; role: string; status: string };
 
type ResponsePayload =
  | { ok: true; team: TeamRow[] }
  | { ok: false; error: string };
 
function computeDisplayName(row: any): string {
  const anyRow = row || {};
  const computed =
    anyRow.name ||
    anyRow.full_name ||
    anyRow.fullname ||
    anyRow.display_name ||
    [anyRow.first_name, anyRow.last_name].filter(Boolean).join(' ');
  const s = String(computed || '').trim();
  return s || 'Usuário';
}
 
export async function GET() {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'recruiter' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: memberRows, error: membersErr } = await (admin as any)
      .from('recruiter_team_members')
      .select('id, member_user_id, role, status, updated_at')
      .eq('owner_recruiter_id', session.userId)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (membersErr) throw membersErr;
    const members = Array.isArray(memberRows) ? memberRows : [];
    const memberUserIds = [...new Set(members.map((m: any) => String(m.member_user_id)).filter(Boolean))];
 
    const { data: memberUserRows, error: memberUsersErr } = memberUserIds.length
      ? await (admin as any).from('users').select('*').in('id', memberUserIds)
      : { data: [], error: null };
    if (memberUsersErr) throw memberUsersErr;
    const userById = new Map<string, any>((memberUserRows || []).map((u: any) => [String(u.id), u]));
 
    const memberPayload: TeamRow[] = members.map((m: any) => {
      const u = userById.get(String(m.member_user_id));
      return {
        kind: 'member',
        id: String(m.id),
        userId: String(m.member_user_id),
        name: computeDisplayName(u),
        email: String(u?.email || ''),
        role: String(m.role),
        status: String(m.status),
      };
    });
 
    const { data: inviteRows, error: invitesErr } = await (admin as any)
      .from('recruiter_team_invites')
      .select('id, email, role, status, updated_at')
      .eq('owner_recruiter_id', session.userId)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (invitesErr) throw invitesErr;
 
    const invites = (inviteRows || []).map((i: any) => {
      const email = String(i.email || '');
      const name = email ? email.split('@')[0] : 'Convidado';
      return {
        kind: 'invite',
        id: String(i.id),
        name,
        email,
        role: String(i.role),
        status: String(i.status),
      } satisfies TeamRow;
    });
 
    const team = [...memberPayload, ...invites];
    return NextResponse.json({ ok: true, team } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
