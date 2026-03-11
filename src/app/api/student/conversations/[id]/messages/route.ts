import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; message: { id: string; sender: 'candidate'; text: string; timestamp: string } }
  | { ok: false; error: string };
 
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const conversationId = String(params.id || '').trim();
    if (!conversationId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const body = await req.json().catch(() => null);
    const text = String(body?.text || '').trim();
    if (!text) return NextResponse.json({ ok: false, error: 'Mensagem vazia' } satisfies ResponsePayload, { status: 400 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: conv, error: convErr } = await (admin as any)
      .from('conversations')
      .select('id, candidate_id')
      .eq('id', conversationId)
      .single();
    if (convErr) throw convErr;
    if (String(conv.candidate_id) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const now = new Date().toISOString();
    const { data: created, error: createErr } = await (admin as any)
      .from('conversation_messages')
      .insert({ conversation_id: conversationId, sender: 'candidate', body: text, created_at: now })
      .select('id, sender, body, created_at')
      .single();
    if (createErr) throw createErr;
 
    const { error: updErr } = await (admin as any)
      .from('conversations')
      .update({ updated_at: now, last_message_at: now })
      .eq('id', conversationId);
    if (updErr) throw updErr;
 
    return NextResponse.json(
      {
        ok: true,
        message: { id: String(created.id), sender: 'candidate', text: String(created.body ?? ''), timestamp: String(created.created_at) },
      } satisfies ResponsePayload,
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

