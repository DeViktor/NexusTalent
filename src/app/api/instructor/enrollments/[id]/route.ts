import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true }
  | { ok: false; error: string };
 
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const enrollmentId = String(params.id || '').trim();
    if (!enrollmentId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const body = await req.json().catch(() => null);
    const finalGradeRaw = body?.finalGrade;
    const statusRaw = body?.status;
 
    const updates: any = { updated_at: new Date().toISOString() };
    if (finalGradeRaw !== undefined && finalGradeRaw !== null && String(finalGradeRaw).trim() !== '') {
      const n = Number(finalGradeRaw);
      if (Number.isFinite(n)) updates.final_grade = n;
    }
    if (statusRaw !== undefined && statusRaw !== null && String(statusRaw).trim() !== '') {
      updates.status = String(statusRaw).trim();
    }
    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ ok: false, error: 'Nada para atualizar' } satisfies ResponsePayload, { status: 400 });
    }
 
    const { data: enr, error: enrErr } = await (admin as any)
      .from('course_enrollments')
      .select('id, course_id')
      .eq('id', enrollmentId)
      .single();
    if (enrErr) throw enrErr;
 
    const { data: courseRows, error: courseErr } = await (admin as any).from('courses').select('id, owner_id').eq('id', String(enr.course_id)).limit(1);
    if (courseErr) throw courseErr;
    const ownerId = (Array.isArray(courseRows) ? courseRows[0]?.owner_id : null) as string | null;
    if (!ownerId) return NextResponse.json({ ok: false, error: 'Curso não encontrado' } satisfies ResponsePayload, { status: 404 });
    if (String(ownerId) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { error: updErr } = await (admin as any).from('course_enrollments').update(updates).eq('id', enrollmentId);
    if (updErr) throw updErr;
 
    return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

