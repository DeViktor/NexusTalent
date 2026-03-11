import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };
 
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const body = await req.json().catch(() => null);
    const candidateId = String(body?.candidateId || '').trim();
    if (!candidateId) return NextResponse.json({ ok: false, error: 'candidateId inválido' } satisfies ResponsePayload, { status: 400 });
    if (candidateId === session.userId) return NextResponse.json({ ok: false, error: 'candidateId inválido' } satisfies ResponsePayload, { status: 400 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'recruiter' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: candidateRows, error: candErr } = await (admin as any)
      .from('users')
      .select('id, role')
      .eq('id', candidateId)
      .limit(1);
    if (candErr) throw candErr;
    const candidateRole = (Array.isArray(candidateRows) ? (candidateRows[0] as any)?.role : undefined) as string | undefined;
    if (!candidateRole) return NextResponse.json({ ok: false, error: 'Candidato não encontrado' } satisfies ResponsePayload, { status: 404 });
 
    const { data: existingRows, error: existingErr } = await (admin as any)
      .from('conversations')
      .select('id')
      .eq('recruiter_id', session.userId)
      .eq('candidate_id', candidateId)
      .limit(1);
    if (existingErr) throw existingErr;
    const existingId = Array.isArray(existingRows) && existingRows[0]?.id ? String(existingRows[0].id) : null;
    if (existingId) return NextResponse.json({ ok: true, conversationId: existingId } satisfies ResponsePayload, { status: 200 });
 
    const now = new Date().toISOString();
    const { data: created, error: createErr } = await (admin as any)
      .from('conversations')
      .insert({ recruiter_id: session.userId, candidate_id: candidateId, created_at: now, updated_at: now })
      .select('id')
      .single();
    if (createErr) throw createErr;
 
    return NextResponse.json({ ok: true, conversationId: String(created.id) } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
