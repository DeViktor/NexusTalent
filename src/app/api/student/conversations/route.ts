import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ListConversation = {
  id: string;
  recruiterId: string;
  recruiterName: string;
  recruiterAvatarUrl?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  updatedAt: string;
};
 
type ResponsePayload =
  | { ok: true; conversations: ListConversation[] }
  | { ok: false; error: string };
 
function computeDisplayName(row: any): string {
  const anyRow = row || {};
  const computed =
    anyRow.name ||
    anyRow.full_name ||
    anyRow.fullname ||
    anyRow.display_name ||
    [anyRow.first_name, anyRow.last_name].filter(Boolean).join(' ');
  return String(computed || 'Recrutador');
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
    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: convRows, error: convErr } = await (admin as any)
      .from('conversations')
      .select('id, recruiter_id, updated_at, last_message_at')
      .eq('candidate_id', session.userId)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (convErr) throw convErr;
    const conversations = Array.isArray(convRows) ? convRows : [];
 
    const conversationIds = conversations.map((c: any) => c.id).filter(Boolean);
    const recruiterIds = [...new Set(conversations.map((c: any) => String(c.recruiter_id)).filter(Boolean))];
 
    const { data: lastMessageRows, error: msgErr } = conversationIds.length
      ? await (admin as any)
          .from('conversation_messages')
          .select('conversation_id, body, created_at')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
      : { data: [], error: null };
    if (msgErr) throw msgErr;
 
    const lastMessageByConversation = new Map<string, any>();
    for (const m of (lastMessageRows || []) as any[]) {
      const cid = String(m.conversation_id);
      if (!lastMessageByConversation.has(cid)) lastMessageByConversation.set(cid, m);
    }
 
    const { data: recruiterRows, error: recErr } = recruiterIds.length
      ? await (admin as any).from('users').select('*').in('id', recruiterIds)
      : { data: [], error: null };
    if (recErr) throw recErr;
    const recruiterById = new Map<string, any>((recruiterRows || []).map((r: any) => [String(r.id), r]));
 
    const payload: ListConversation[] = conversations.map((c: any) => {
      const recruiter = recruiterById.get(String(c.recruiter_id));
      const last = lastMessageByConversation.get(String(c.id));
      return {
        id: String(c.id),
        recruiterId: String(c.recruiter_id),
        recruiterName: computeDisplayName(recruiter),
        recruiterAvatarUrl: recruiter?.avatar_url ?? null,
        lastMessageText: last?.body ?? null,
        lastMessageAt: last?.created_at ?? c.last_message_at ?? null,
        updatedAt: String(c.updated_at),
      };
    });
 
    return NextResponse.json({ ok: true, conversations: payload } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

