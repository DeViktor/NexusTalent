import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ListConversation = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatarUrl?: string | null;
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
  return String(computed || 'Candidato');
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
 
    const { data: conversationRows, error: convErr } = await (admin as any)
      .from('conversations')
      .select('id, candidate_id, updated_at, last_message_at')
      .eq('recruiter_id', session.userId)
      .order('updated_at', { ascending: false })
      .limit(100);
    if (convErr) throw convErr;
    const conversations = Array.isArray(conversationRows) ? conversationRows : [];
 
    const candidateIds = [...new Set(conversations.map((c: any) => String(c.candidate_id)).filter(Boolean))];
    const { data: candidateRows, error: candErr } = candidateIds.length
      ? await (admin as any).from('users').select('*').in('id', candidateIds)
      : { data: [], error: null };
    if (candErr) throw candErr;
    const candidateById = new Map<string, any>((candidateRows || []).map((r: any) => [String(r.id), r]));
 
    const ids = conversations.map((c: any) => String(c.id));
    const { data: msgRows, error: msgErr } = ids.length
      ? await (admin as any)
          .from('conversation_messages')
          .select('conversation_id, body, created_at')
          .in('conversation_id', ids)
          .order('created_at', { ascending: false })
          .limit(500)
      : { data: [], error: null };
    if (msgErr) throw msgErr;
 
    const lastMessageByConversation = new Map<string, any>();
    for (const m of msgRows || []) {
      const cid = String((m as any).conversation_id);
      if (!lastMessageByConversation.has(cid)) lastMessageByConversation.set(cid, m);
    }
 
    const payload: ListConversation[] = conversations.map((c: any) => {
      const candidate = candidateById.get(String(c.candidate_id));
      const last = lastMessageByConversation.get(String(c.id));
      return {
        id: String(c.id),
        candidateId: String(c.candidate_id),
        candidateName: computeDisplayName(candidate),
        candidateAvatarUrl: candidate?.avatar_url ?? null,
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
