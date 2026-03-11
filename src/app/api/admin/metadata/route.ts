import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | {
      ok: true;
      courses: { id: string; name: string }[];
      vacancies: { id: string; title: string }[];
      functionalAreas: string[];
    }
  | { ok: false; error: string };
 
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
 
    const [{ data: courseRows, error: courseErr }, { data: vacancyRows, error: vacancyErr }, { data: userRows, error: userErr }] =
      await Promise.all([
        (admin as any).from('courses').select('id, name').order('created_at', { ascending: false }).limit(500),
        (admin as any).from('vacancies').select('id, title').order('created_at', { ascending: false }).limit(500),
        (admin as any).from('users').select('functional_area').limit(5000),
      ]);
    if (courseErr) throw courseErr;
    if (vacancyErr) throw vacancyErr;
    if (userErr) throw userErr;
 
    const courses = (courseRows || []).map((c: any) => ({ id: String(c.id), name: String(c.name || c.title || 'Curso') }));
    const vacancies = (vacancyRows || []).map((v: any) => ({ id: String(v.id), title: String(v.title || 'Vaga') }));
    const functionalAreas = [...new Set((userRows || []).map((u: any) => String(u.functional_area || '').trim()).filter(Boolean))].sort();
 
    return NextResponse.json({ ok: true, courses, vacancies, functionalAreas } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
