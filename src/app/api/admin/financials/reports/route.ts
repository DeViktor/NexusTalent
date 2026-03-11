import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';

type ReportResponse = {
  ok: true;
  data: {
    currency: string;
    totalRevenueMinor: number;
    courseSalesCount: number;
    activeSubscriptionsCount: number;
    revenueByMonth: { name: string; revenueMinor: number }[];
    topCourses: { id: string; name: string; sales: number; revenueMinor: number }[];
  };
} | { ok: false; error: string };

function monthLabel(date: Date): string {
  const label = date.toLocaleString('pt-PT', { month: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; res: NextResponse }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('app_session')?.value;
  if (!token) return { ok: false, res: NextResponse.json({ ok: false, error: 'Sem sessão' }, { status: 401 }) };
  const payload = await verifySession(token);
  if (!payload?.userId) return { ok: false, res: NextResponse.json({ ok: false, error: 'Sessão inválida' }, { status: 401 }) };

  const admin = getServerSupabase();
  const { data: rows, error } = await (admin as any).from('users').select('role').eq('id', payload.userId).limit(1);
  if (error) return { ok: false, res: NextResponse.json({ ok: false, error: 'Erro ao validar utilizador' }, { status: 500 }) };
  const role = (Array.isArray(rows) ? rows[0]?.role : undefined) as string | undefined;
  if (role !== 'admin') return { ok: false, res: NextResponse.json({ ok: false, error: 'Acesso negado' }, { status: 403 }) };
  return { ok: true, userId: payload.userId };
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.res;

    const url = new URL(req.url);
    const months = Math.min(Math.max(Number(url.searchParams.get('months') ?? 6), 1), 24);
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const admin = getServerSupabase();

    const { data: purchases, error: purchasesError } = await (admin as any)
      .from('purchased_courses')
      .select('course_id, amount, currency, purchase_date')
      .gte('purchase_date', start.toISOString())
      .order('purchase_date', { ascending: true });
    if (purchasesError) {
      const body: ReportResponse = { ok: false, error: purchasesError.message || 'Erro ao buscar compras' };
      return NextResponse.json(body, { status: 500 });
    }

    const { data: subs, error: subsError } = await (admin as any)
      .from('subscriptions')
      .select('id, status, current_period_end')
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString());
    if (subsError) {
      const body: ReportResponse = { ok: false, error: subsError.message || 'Erro ao buscar subscrições' };
      return NextResponse.json(body, { status: 500 });
    }

    const currencyRaw = (purchases?.find((p: any) => p?.currency)?.currency ?? 'AOA') as string;
    const currency = currencyRaw.toUpperCase();

    const revenueByMonthMap = new Map<string, number>();
    const courseAgg = new Map<string, { sales: number; revenueMinor: number }>();

    let totalRevenueMinor = 0;

    for (const p of purchases ?? []) {
      const amount = Number(p?.amount ?? 0);
      totalRevenueMinor += amount;

      const d = new Date(p.purchase_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) ?? 0) + amount);

      const courseId = String(p.course_id);
      const prev = courseAgg.get(courseId) ?? { sales: 0, revenueMinor: 0 };
      courseAgg.set(courseId, { sales: prev.sales + 1, revenueMinor: prev.revenueMinor + amount });
    }

    const revenueByMonth: { name: string; revenueMinor: number }[] = [];
    const cursor = new Date(start);
    for (let i = 0; i < months; i++) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth.push({ name: monthLabel(cursor), revenueMinor: revenueByMonthMap.get(key) ?? 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const topCourseIds = [...courseAgg.entries()]
      .sort((a, b) => b[1].revenueMinor - a[1].revenueMinor)
      .slice(0, 10)
      .map(([id]) => id);

    let courseNameById = new Map<string, string>();
    if (topCourseIds.length > 0) {
      const { data: courseRows } = await (admin as any).from('courses').select('id, name').in('id', topCourseIds);
      courseNameById = new Map((courseRows ?? []).map((r: any) => [String(r.id), String(r.name ?? r.id)]));
    }

    const topCourses = topCourseIds.map((id) => {
      const agg = courseAgg.get(id)!;
      return { id, name: courseNameById.get(id) ?? id, sales: agg.sales, revenueMinor: agg.revenueMinor };
    });

    const body: ReportResponse = {
      ok: true,
      data: {
        currency,
        totalRevenueMinor,
        courseSalesCount: (purchases ?? []).length,
        activeSubscriptionsCount: (subs ?? []).length,
        revenueByMonth,
        topCourses,
      },
    };
    return NextResponse.json(body);
  } catch (e: any) {
    const body: ReportResponse = { ok: false, error: e?.message || 'Erro' };
    return NextResponse.json(body, { status: 500 });
  }
}
