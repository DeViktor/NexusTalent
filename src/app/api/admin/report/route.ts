import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; data: any }
  | { ok: false; error: string };
 
function dayLabel(d: Date): string {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return labels[d.getDay()] || '';
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
    if (role !== 'admin') return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
 
    const [
      { data: courseRows, count: totalCourses, error: courseErr },
      { data: vacancyRows, count: totalVacancies, error: vacancyErr },
      { data: userRows, count: totalUsers, error: userErr },
      { data: appRows, count: totalApplications, error: appErr },
      { data: enrollRows, error: enrollErr },
    ] = await Promise.all([
      (admin as any).from('courses').select('id, category', { count: 'exact' }),
      (admin as any).from('vacancies').select('id, location', { count: 'exact' }),
      (admin as any).from('users').select('id, created_at, resume_url, phone_number, bio', { count: 'exact' }),
      (admin as any).from('applications').select('id, status', { count: 'exact' }),
      (admin as any).from('course_enrollments').select('id, status, progress'),
    ]);
    if (courseErr) throw courseErr;
    if (vacancyErr) throw vacancyErr;
    if (userErr) throw userErr;
    if (appErr) throw appErr;
    if (enrollErr) throw enrollErr;
 
    const courses = Array.isArray(courseRows) ? courseRows : [];
    const vacancies = Array.isArray(vacancyRows) ? vacancyRows : [];
    const users = Array.isArray(userRows) ? userRows : [];
    const applications = Array.isArray(appRows) ? appRows : [];
    const enrollments = Array.isArray(enrollRows) ? enrollRows : [];
 
    const coursesByCategoryMap = new Map<string, number>();
    for (const c of courses as any[]) {
      const key = String(c.category || 'Sem Categoria');
      coursesByCategoryMap.set(key, (coursesByCategoryMap.get(key) || 0) + 1);
    }
    const coursesByCategory = [...coursesByCategoryMap.entries()].map(([name, total]) => ({ name, total }));
 
    const vacanciesByLocationMap = new Map<string, number>();
    for (const v of vacancies as any[]) {
      const key = String(v.location || '—');
      vacanciesByLocationMap.set(key, (vacanciesByLocationMap.get(key) || 0) + 1);
    }
    const vacanciesByLocation = [...vacanciesByLocationMap.entries()].map(([name, total]) => ({ name, total }));
 
    const now = new Date();
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyMap = new Map<string, number>();
    for (const u of users as any[]) {
      const createdAt = u.created_at ? new Date(String(u.created_at)) : null;
      if (!createdAt) continue;
      if (createdAt < cutoff) continue;
      const label = dayLabel(createdAt);
      weeklyMap.set(label, (weeklyMap.get(label) || 0) + 1);
    }
    const weeklyEngagement = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => ({ day, users: weeklyMap.get(day) || 0 }));
 
    const statusCount = new Map<string, number>();
    for (const a of applications as any[]) {
      const s = String(a.status || 'Recebida');
      statusCount.set(s, (statusCount.get(s) || 0) + 1);
    }
    const recruitmentFunnel = [
      { stage: 'Candidaturas', count: Number(totalApplications || 0) },
      { stage: 'Triagem', count: (statusCount.get('Triagem') || 0) + (statusCount.get('Recebida') || 0) },
      { stage: 'Entrevista', count: statusCount.get('Entrevista') || 0 },
      { stage: 'Oferta', count: statusCount.get('Oferta') || 0 },
      { stage: 'Contratado', count: statusCount.get('Contratado') || 0 },
    ];
 
    const completed = enrollments.filter((e: any) => String(e.status) === 'Concluído' || Number(e.progress || 0) >= 100).length;
    const completionRate = enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0;
 
    const profilesComplete = users.filter((u: any) => Boolean(u.resume_url) && Boolean(u.phone_number) && Boolean(u.bio)).length;
    const profileCompletionRate = users.length > 0 ? Math.round((profilesComplete / users.length) * 100) : 0;
 
    const applicationsPerVacancy =
      Number(totalVacancies || 0) > 0 ? Math.round(((Number(totalApplications || 0) / Number(totalVacancies || 0)) * 10)) / 10 : 0;
 
    const data = {
      totalCourses: Number(totalCourses || 0),
      totalVacancies: Number(totalVacancies || 0),
      totalUsers: Number(totalUsers || 0),
      coursesByCategory,
      vacanciesByLocation,
      weeklyEngagement,
      recruitmentFunnel,
      lmsKpis: {
        completionRate,
        averageRating: null,
        firstAttemptSuccessRate: null,
      },
      atsKpis: {
        applicationsPerVacancy,
        timeToHire: null,
        profileCompletionRate,
      },
    };
 
    return NextResponse.json({ ok: true, data } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

