import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type DashboardResponse =
  | {
      ok: true;
      kpis: { activeStudents: number; publishedCourses: number; pendingCourses: number; avgCompletionRate: number | null; avgRating: number | null };
      courseSummary: { courseId: string; students: number; averageGrade: number | null; engagement: number }[];
      engagementByCourse: { name: string; engaged: number }[];
      activity: { id: string; type: 'enrollment' | 'progress' | 'grade'; text: string; time: string }[];
      topStudents: { id: string; name: string; course: string; grade: number }[];
      atRiskStudents: { id: string; name: string; course: string; engagement: string }[];
      managedCourses: { id: string; name: string; status: string; imageId?: string | null; imageDataUri?: string | null }[];
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
  return String(computed || 'Usuário');
}
 
function formatRelative(dateIso: string): string {
  const d = new Date(dateIso);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}
 
export async function GET() {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies DashboardResponse, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies DashboardResponse, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies DashboardResponse, { status: 403 });
    }
 
    const { data: courseRows, error: courseErr } = await (admin as any)
      .from('courses')
      .select('id, name, status, image_id, image_data_uri')
      .eq('owner_id', session.userId)
      .limit(500);
    if (courseErr) throw courseErr;
    const courses = Array.isArray(courseRows) ? courseRows : [];
    const courseIds = courses.map((c: any) => String(c.id)).filter(Boolean);
 
    const managedCourses = courses.map((c: any) => ({
      id: String(c.id),
      name: String(c.name || c.title || 'Curso'),
      status: String(c.status || 'Ativo'),
      imageId: c.image_id ?? null,
      imageDataUri: c.image_data_uri ?? null,
    }));
 
    if (courseIds.length === 0) {
      return NextResponse.json(
        {
          ok: true,
          kpis: { activeStudents: 0, publishedCourses: 0, pendingCourses: 0, avgCompletionRate: null, avgRating: null },
          courseSummary: [],
          engagementByCourse: [],
          activity: [],
          topStudents: [],
          atRiskStudents: [],
          managedCourses: [],
        } satisfies DashboardResponse,
        { status: 200 }
      );
    }
 
    const { data: enrollRows, error: enrollErr } = await (admin as any)
      .from('course_enrollments')
      .select('id, course_id, student_id, status, progress, quiz_grade, final_grade, enrolled_at, last_activity_at')
      .in('course_id', courseIds)
      .order('last_activity_at', { ascending: false })
      .limit(1000);
    if (enrollErr) throw enrollErr;
    const enrollments = Array.isArray(enrollRows) ? enrollRows : [];
 
    const studentIds = [...new Set(enrollments.map((e: any) => String(e.student_id)).filter(Boolean))];
    const { data: studentRows, error: studentErr } = studentIds.length
      ? await (admin as any).from('users').select('*').in('id', studentIds)
      : { data: [], error: null };
    if (studentErr) throw studentErr;
    const studentById = new Map<string, any>((studentRows || []).map((u: any) => [String(u.id), u]));
 
    const nameByCourseId = new Map<string, string>(managedCourses.map((c) => [c.id, c.name]));
 
    const activeStudents = new Set(
      enrollments.filter((e: any) => String(e.status) === 'Em Curso').map((e: any) => String(e.student_id))
    ).size;
    const publishedCourses = managedCourses.filter((c) => c.status === 'Ativo').length;
    const pendingCourses = managedCourses.filter((c) => c.status === 'Pendente').length;
    const avgCompletionRate =
      enrollments.length > 0 ? Math.round(enrollments.reduce((sum: number, e: any) => sum + Number(e.progress || 0), 0) / enrollments.length) : null;
 
    const byCourse = new Map<string, { sum: number; count: number }>();
    const gradeByCourse = new Map<string, { sum: number; count: number }>();
    for (const e of enrollments as any[]) {
      const cid = String(e.course_id);
      const cur = byCourse.get(cid) || { sum: 0, count: 0 };
      cur.sum += Number(e.progress || 0);
      cur.count += 1;
      byCourse.set(cid, cur);
      const g = e.final_grade ?? e.quiz_grade;
      if (g !== null && g !== undefined && String(g).trim() !== '') {
        const n = Number(g);
        if (Number.isFinite(n)) {
          const gc = gradeByCourse.get(cid) || { sum: 0, count: 0 };
          gc.sum += n;
          gc.count += 1;
          gradeByCourse.set(cid, gc);
        }
      }
    }
    const engagementByCourse = managedCourses.map((c) => {
      const bucket = byCourse.get(c.id);
      const engaged = bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 0;
      return { name: c.name, engaged };
    });
    const courseSummary = managedCourses.map((c) => {
      const bucket = byCourse.get(c.id);
      const gradeBucket = gradeByCourse.get(c.id);
      const engagement = bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 0;
      const averageGrade = gradeBucket && gradeBucket.count > 0 ? Math.round(gradeBucket.sum / gradeBucket.count) : null;
      return { courseId: c.id, students: bucket?.count ?? 0, averageGrade, engagement };
    });
 
    const activity = enrollments.slice(0, 10).map((e: any) => {
      const student = studentById.get(String(e.student_id));
      const studentName = computeDisplayName(student);
      const courseName = nameByCourseId.get(String(e.course_id)) || 'Curso';
      const time = formatRelative(String(e.last_activity_at || e.enrolled_at));
      const type = String(e.last_activity_at) === String(e.enrolled_at) ? 'enrollment' : 'progress';
      const text =
        type === 'enrollment'
          ? `${studentName} inscreveu-se em "${courseName}".`
          : `${studentName} atualizou progresso em "${courseName}".`;
      return { id: String(e.id), type, text, time };
    });
 
    const topStudents = [...enrollments]
      .map((e: any) => {
        const student = studentById.get(String(e.student_id));
        const grade = e.final_grade ?? e.quiz_grade ?? e.progress ?? 0;
        return { e, grade: Number(grade || 0), name: computeDisplayName(student) };
      })
      .sort((a, b) => b.grade - a.grade)
      .slice(0, 5)
      .map(({ e, grade, name }) => ({
        id: String(e.student_id),
        name,
        course: nameByCourseId.get(String(e.course_id)) || 'Curso',
        grade: Math.round(grade),
      }));
 
    const atRiskStudents = [...enrollments]
      .filter((e: any) => String(e.status) === 'Em Curso')
      .sort((a: any, b: any) => Number(a.progress || 0) - Number(b.progress || 0))
      .slice(0, 5)
      .map((e: any) => {
        const student = studentById.get(String(e.student_id));
        const progress = Number(e.progress || 0);
        return {
          id: String(e.student_id),
          name: computeDisplayName(student),
          course: nameByCourseId.get(String(e.course_id)) || 'Curso',
          engagement: `Baixo (${progress}%)`,
        };
      });
 
    return NextResponse.json(
      {
        ok: true,
        kpis: { activeStudents, publishedCourses, pendingCourses, avgCompletionRate, avgRating: null },
        courseSummary,
        engagementByCourse,
        activity,
        topStudents,
        atRiskStudents,
        managedCourses,
      } satisfies DashboardResponse,
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies DashboardResponse, { status: 500 });
  }
}
