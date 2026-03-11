import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; count: number }
  | { ok: false; error: string };
 
export async function POST(req: Request) {
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
    if (role !== 'admin') return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
 
    const body = await req.json().catch(() => null);
    const segments = Array.isArray(body?.segments) ? body.segments.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const functionalAreas = Array.isArray(body?.functionalAreas) ? body.functionalAreas.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const targetCourses = Array.isArray(body?.targetCourses) ? body.targetCourses.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const targetVacancies = Array.isArray(body?.targetVacancies) ? body.targetVacancies.map((s: any) => String(s).trim()).filter(Boolean) : [];
 
    const userIds = new Set<string>();
 
    if (segments.length > 0 || functionalAreas.length > 0) {
      let q = (admin as any).from('users').select('id');
      if (segments.length > 0) q = q.in('role', segments);
      if (functionalAreas.length > 0) q = q.in('functional_area', functionalAreas);
      const { data: rows, error } = await q.limit(10000);
      if (error) throw error;
      (rows || []).forEach((r: any) => userIds.add(String(r.id)));
    }
 
    if (targetCourses.length > 0) {
      const { data: rows, error } = await (admin as any)
        .from('course_enrollments')
        .select('student_id')
        .in('course_id', targetCourses)
        .limit(10000);
      if (error) throw error;
      (rows || []).forEach((r: any) => userIds.add(String(r.student_id)));
    }
 
    if (targetVacancies.length > 0) {
      const { data: rows, error } = await (admin as any)
        .from('applications')
        .select('applicant_id')
        .in('job_posting_id', targetVacancies)
        .limit(10000);
      if (error) throw error;
      (rows || []).forEach((r: any) => userIds.add(String(r.applicant_id)));
    }
 
    return NextResponse.json({ ok: true, count: userIds.size } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

