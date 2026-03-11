import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; stats: { courses: number; students: number; vacancies: number; satisfaction: string | null } }
  | { ok: false; error: string };
 
export async function GET() {
  try {
    const admin = getServerSupabase();
    const [{ count: courses }, { count: vacancies }, { count: students }, { data: siteRow }] = await Promise.all([
      (admin as any).from('courses').select('id', { count: 'exact', head: true }),
      (admin as any).from('vacancies').select('id', { count: 'exact', head: true }),
      (admin as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      (admin as any).from('site_data').select('data').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const satisfaction = siteRow?.data?.stats?.satisfaction ? String(siteRow.data.stats.satisfaction) : null;
    return NextResponse.json(
      { ok: true, stats: { courses: Number(courses || 0), students: Number(students || 0), vacancies: Number(vacancies || 0), satisfaction } } satisfies ResponsePayload,
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
