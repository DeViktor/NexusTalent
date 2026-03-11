import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | {
      ok: true;
      applications: { id: string; userId: string; jobPostingId: string; status: string; applicationDate: string }[];
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
 
    const { data: rows, error } = await (admin as any)
      .from('applications')
      .select('id, applicant_id, job_posting_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
 
    const applications = (rows || []).map((r: any) => ({
      id: String(r.id),
      userId: String(r.applicant_id),
      jobPostingId: String(r.job_posting_id),
      status: String(r.status || 'Recebida'),
      applicationDate: String(r.created_at),
    }));
 
    return NextResponse.json({ ok: true, applications } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

