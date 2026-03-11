import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; tests: any[] }
  | { ok: false; error: string };
 
type CreatePayload =
  | { ok: true; id: string }
  | { ok: false; error: string };
 
async function requireRecruiterOrAdmin(userId: string) {
  const admin = getServerSupabase();
  const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', userId).limit(1);
  if (roleErr) throw roleErr;
  const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
  if (role !== 'recruiter' && role !== 'admin') return null;
  return { admin, role };
}
 
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const vacancyId = String(params.id || '').trim();
    if (!vacancyId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const ctxRole = await requireRecruiterOrAdmin(session.userId);
    if (!ctxRole) return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
 
    const { admin, role } = ctxRole;
    const { data: vacancyRows, error: vacErr } = await (admin as any).from('vacancies').select('id, recruiter_id').eq('id', vacancyId).limit(1);
    if (vacErr) throw vacErr;
    const recruiterId = (Array.isArray(vacancyRows) ? vacancyRows[0]?.recruiter_id : null) as string | null;
    if (!recruiterId) return NextResponse.json({ ok: false, error: 'Vaga não encontrada' } satisfies ResponsePayload, { status: 404 });
    if (String(recruiterId) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: rows, error } = await (admin as any)
      .from('assessment_tests')
      .select('id, vacancy_id, recruiter_id, title, description, questions, created_at, updated_at')
      .eq('vacancy_id', vacancyId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
 
    const tests = (rows || []).map((r: any) => ({
      id: String(r.id),
      vacancyId: String(r.vacancy_id),
      recruiterId: String(r.recruiter_id),
      title: String(r.title || ''),
      description: r.description ?? null,
      questions: Array.isArray(r.questions) ? r.questions : (r.questions || []),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    }));
 
    return NextResponse.json({ ok: true, tests } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
 
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const vacancyId = String(params.id || '').trim();
    if (!vacancyId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies CreatePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies CreatePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies CreatePayload, { status: 401 });
 
    const ctxRole = await requireRecruiterOrAdmin(session.userId);
    if (!ctxRole) return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies CreatePayload, { status: 403 });
 
    const { admin, role } = ctxRole;
    if (role !== 'recruiter' && role !== 'admin') return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies CreatePayload, { status: 403 });
 
    const { data: vacancyRows, error: vacErr } = await (admin as any).from('vacancies').select('id, recruiter_id').eq('id', vacancyId).limit(1);
    if (vacErr) throw vacErr;
    const recruiterId = (Array.isArray(vacancyRows) ? vacancyRows[0]?.recruiter_id : null) as string | null;
    if (!recruiterId) return NextResponse.json({ ok: false, error: 'Vaga não encontrada' } satisfies CreatePayload, { status: 404 });
    if (String(recruiterId) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies CreatePayload, { status: 403 });
    }
 
    const body = await req.json().catch(() => null);
    const title = String(body?.title || '').trim();
    const description = body?.description !== undefined ? String(body.description).trim() : null;
    const questions = body?.questions;
    if (!title) return NextResponse.json({ ok: false, error: 'Título inválido' } satisfies CreatePayload, { status: 400 });
    if (!questions) return NextResponse.json({ ok: false, error: 'Perguntas inválidas' } satisfies CreatePayload, { status: 400 });
 
    const now = new Date().toISOString();
    const { data: created, error } = await (admin as any)
      .from('assessment_tests')
      .insert({ vacancy_id: vacancyId, recruiter_id: session.userId, title, description, questions, created_at: now, updated_at: now })
      .select('id')
      .single();
    if (error) throw error;
 
    return NextResponse.json({ ok: true, id: String(created.id) } satisfies CreatePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies CreatePayload, { status: 500 });
  }
}

