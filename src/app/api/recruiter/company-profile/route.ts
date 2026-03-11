import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type CompanyProfile = {
  companyName: string;
  about: string;
  culture: string;
  values: string;
  benefits: { value: string }[];
  photos: string[];
};
 
type ResponsePayload =
  | { ok: true; profile: CompanyProfile | null }
  | { ok: false; error: string };
 
function normalizeCsv(input: any): string {
  const s = String(input || '');
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .join(', ');
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
    if (role !== 'recruiter' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data, error } = await (admin as any)
      .from('recruiter_company_profiles')
      .select('*')
      .eq('recruiter_id', session.userId)
      .limit(1);
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return NextResponse.json({ ok: true, profile: null } satisfies ResponsePayload, { status: 200 });
 
    const profile: CompanyProfile = {
      companyName: String(row.company_name || ''),
      about: String(row.about || ''),
      culture: String(row.culture || ''),
      values: (Array.isArray(row.values) ? row.values : []).join(', '),
      benefits: (Array.isArray(row.benefits) ? row.benefits : []).map((v: any) => ({ value: String(v) })),
      photos: Array.isArray(row.photos) ? row.photos.map((p: any) => String(p)) : [],
    };
 
    return NextResponse.json({ ok: true, profile } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
 
export async function PUT(req: Request) {
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
    if (role !== 'recruiter' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const body = await req.json().catch(() => null);
    const companyName = String(body?.companyName || '').trim();
    const about = String(body?.about || '').trim();
    const culture = String(body?.culture || '').trim();
    const values = normalizeCsv(body?.values);
    const benefits = Array.isArray(body?.benefits) ? body.benefits.map((b: any) => String(b?.value || '').trim()).filter(Boolean) : [];
    const photos = Array.isArray(body?.photos) ? body.photos.map((p: any) => String(p || '').trim()).filter(Boolean) : [];
 
    if (!companyName || companyName.length < 3) return NextResponse.json({ ok: false, error: 'Nome inválido' } satisfies ResponsePayload, { status: 400 });
    if (!about || about.length < 50) return NextResponse.json({ ok: false, error: 'Sobre inválido' } satisfies ResponsePayload, { status: 400 });
    if (!culture || culture.length < 50) return NextResponse.json({ ok: false, error: 'Cultura inválida' } satisfies ResponsePayload, { status: 400 });
    if (benefits.length === 0) return NextResponse.json({ ok: false, error: 'Benefícios inválidos' } satisfies ResponsePayload, { status: 400 });
 
    const now = new Date().toISOString();
    const payload = {
      recruiter_id: session.userId,
      company_name: companyName,
      about,
      culture,
      values: values ? values.split(',').map((x) => x.trim()).filter(Boolean) : [],
      benefits,
      photos,
      updated_at: now,
    };
 
    const { error: upsertErr } = await (admin as any)
      .from('recruiter_company_profiles')
      .upsert(payload, { onConflict: 'recruiter_id' });
    if (upsertErr) throw upsertErr;
 
    return NextResponse.json({ ok: true, profile: null } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

