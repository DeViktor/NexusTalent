import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | {
      ok: true;
      conversation: {
        id: string;
        candidate: { id: string; name: string; avatarUrl?: string | null };
        messages: { id: string; sender: 'recruiter' | 'candidate'; text: string; timestamp: string }[];
      };
    }
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
 
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const conversationId = String(params.id || '').trim();
    if (!conversationId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
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
 
    const { data: conv, error: convErr } = await (admin as any)
      .from('conversations')
      .select('id, recruiter_id, candidate_id')
      .eq('id', conversationId)
      .single();
    if (convErr) throw convErr;
    if (!conv) return NextResponse.json({ ok: false, error: 'Conversa não encontrada' } satisfies ResponsePayload, { status: 404 });
    if (String(conv.recruiter_id) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const candidateId = String(conv.candidate_id);
    const { data: candidateRows, error: candErr } = await (admin as any)
      .from('users')
      .select('*')
      .eq('id', candidateId)
      .limit(1);
    if (candErr) throw candErr;
    const candidate = Array.isArray(candidateRows) ? candidateRows[0] : null;
 
    const { data: messageRows, error: msgErr } = await (admin as any)
      .from('conversation_messages')
      .select('id, sender_role, body, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(500);
    if (msgErr) throw msgErr;
 
    const messages = (messageRows || []).map((m: any) => ({
      id: String(m.id),
      sender: (String(m.sender_role) === 'candidate' ? 'candidate' : 'recruiter') as 'recruiter' | 'candidate',
      text: String(m.body || ''),
      timestamp: String(m.created_at),
    }));
 
    return NextResponse.json(
      {
        ok: true,
        conversation: {
          id: String(conv.id),
          candidate: { id: candidateId, name: computeDisplayName(candidate), avatarUrl: candidate?.avatar_url ?? null },
          messages,
        },
      } satisfies ResponsePayload,
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
