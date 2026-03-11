import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { verifySession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
 
type MetricsResponse =
  | {
      ok: true;
      scope: 'recruiter' | 'global';
      kpis: { activeVacancies: number; newApplications7d: number; hiresThisQuarter: number; hireRate: number };
      chart: { rangeLabel: string; data: { month: string; applications: number; hired: number }[] };
    }
  | { ok: false; error: string };
 
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies MetricsResponse, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies MetricsResponse, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: userRows, error: userErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (userErr) throw userErr;
    const role = (Array.isArray(userRows) ? (userRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'recruiter' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies MetricsResponse, { status: 403 });
    }
 
    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const labelMonth = (d: Date) => {
      const raw = monthFormatter.format(d).replace('.', '');
      return raw ? raw[0].toUpperCase() + raw.slice(1) : '—';
    };
 
    const months: { key: string; label: string; date: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labelMonth(d), date: d });
    }
    const rangeLabel = `${labelMonth(months[0]!.date)} - ${labelMonth(months[months.length - 1]!.date)} ${months[months.length - 1]!.date.getFullYear()}`;
 
    const baseChart = months.map((m) => ({ month: m.label, applications: 0, hired: 0 }));
 
    let scope: 'recruiter' | 'global' = 'recruiter';
    let vacancyRows: any[] = [];
 
    const { data: recruiterVacancies, error: vacErr } = await (admin as any)
      .from('vacancies')
      .select('id, expires_at, status, recruiter_id')
      .eq('recruiter_id', session.userId);
    if (vacErr) throw vacErr;
    vacancyRows = Array.isArray(recruiterVacancies) ? recruiterVacancies : [];
 
    if (vacancyRows.length === 0) {
      scope = 'global';
      const { data: allVacancies, error: allVacErr } = await (admin as any)
        .from('vacancies')
        .select('id, expires_at, status, recruiter_id');
      if (allVacErr) throw allVacErr;
      vacancyRows = Array.isArray(allVacancies) ? allVacancies : [];
    }
 
    const activeVacancies = vacancyRows.filter((v: any) => {
      const expiresOk = !v.expires_at || new Date(v.expires_at) > now;
      const statusOk = String(v.status || 'active') === 'active';
      return expiresOk && statusOk;
    }).length;
 
    const vacancyIds = vacancyRows.map((v: any) => v.id).filter(Boolean);
    if (vacancyIds.length === 0) {
      return NextResponse.json(
        {
          ok: true,
          scope,
          kpis: { activeVacancies, newApplications7d: 0, hiresThisQuarter: 0, hireRate: 0 },
          chart: { rangeLabel, data: baseChart },
        } satisfies MetricsResponse,
        { status: 200 }
      );
    }
 
    const { data: appRows, error: appErr } = await (admin as any)
      .from('applications')
      .select('id, status, created_at, job_posting_id')
      .in('job_posting_id', vacancyIds);
    if (appErr) throw appErr;
    const applications = Array.isArray(appRows) ? appRows : [];
 
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const newApplications7d = applications.filter((a: any) => a.created_at && new Date(a.created_at) >= sevenDaysAgo).length;
 
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const appsThisQuarter = applications.filter((a: any) => a.created_at && new Date(a.created_at) >= quarterStart);
    const hiresThisQuarter = appsThisQuarter.filter((a: any) => String(a.status) === 'Contratado').length;
    const hireRate = appsThisQuarter.length > 0 ? Math.round((hiresThisQuarter / appsThisQuarter.length) * 100) : 0;
 
    const byKey = new Map(months.map((m) => [m.key, { applications: 0, hired: 0 }]));
    for (const a of applications as any[]) {
      if (!a.created_at) continue;
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      bucket.applications += 1;
      if (String(a.status) === 'Contratado') bucket.hired += 1;
    }
 
    const finalChart = months.map((m) => {
      const bucket = byKey.get(m.key);
      return { month: m.label, applications: bucket?.applications ?? 0, hired: bucket?.hired ?? 0 };
    });
 
    return NextResponse.json(
      {
        ok: true,
        scope,
        kpis: { activeVacancies, newApplications7d, hiresThisQuarter, hireRate },
        chart: { rangeLabel, data: finalChart },
      } satisfies MetricsResponse,
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies MetricsResponse, { status: 500 });
  }
}
