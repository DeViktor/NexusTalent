import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | {
      ok: true;
      campaigns: { id: string; subject: string; sentDate: string | null; recipients: number; openRate: number; clickRate: number }[];
    }
  | { ok: false; error: string };
 
type CreatePayload =
  | { ok: true; id: string }
  | { ok: false; error: string };
 
async function requireAdmin(userId: string) {
  const admin = getServerSupabase();
  const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', userId).limit(1);
  if (roleErr) throw roleErr;
  const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
  if (role !== 'admin') return null;
  return admin;
}
 
export async function GET() {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = await requireAdmin(session.userId);
    if (!admin) return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
 
    const { data: rows, error } = await (admin as any)
      .from('email_campaigns')
      .select('id, subject, audience_count, open_count, click_count, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
 
    const campaigns = (rows || []).map((r: any) => {
      const recipients = Number(r.audience_count || 0);
      const openCount = Number(r.open_count || 0);
      const clickCount = Number(r.click_count || 0);
      return {
        id: String(r.id),
        subject: String(r.subject || ''),
        sentDate: r.sent_at ? String(r.sent_at) : (r.created_at ? String(r.created_at) : null),
        recipients,
        openRate: recipients > 0 ? Math.round((openCount / recipients) * 1000) / 10 : 0,
        clickRate: recipients > 0 ? Math.round((clickCount / recipients) * 1000) / 10 : 0,
      };
    });
 
    return NextResponse.json({ ok: true, campaigns } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
 
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies CreatePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies CreatePayload, { status: 401 });
 
    const admin = await requireAdmin(session.userId);
    if (!admin) return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies CreatePayload, { status: 403 });
 
    const body = await req.json().catch(() => null);
    const subject = String(body?.subject || '').trim();
    const bodyHtml = String(body?.bodyHtml || '').trim();
    const audienceCount = Number(body?.audienceCount || 0);
    if (!subject) return NextResponse.json({ ok: false, error: 'Assunto inválido' } satisfies CreatePayload, { status: 400 });
    if (!bodyHtml) return NextResponse.json({ ok: false, error: 'HTML inválido' } satisfies CreatePayload, { status: 400 });
    if (!Number.isFinite(audienceCount) || audienceCount <= 0) return NextResponse.json({ ok: false, error: 'Público inválido' } satisfies CreatePayload, { status: 400 });
 
    const now = new Date().toISOString();
    const { data: created, error } = await (admin as any)
      .from('email_campaigns')
      .insert({ created_by: session.userId, subject, body_html: bodyHtml, audience_count: audienceCount, status: 'Enviada', created_at: now, sent_at: now })
      .select('id')
      .single();
    if (error) throw error;
 
    return NextResponse.json({ ok: true, id: String(created.id) } satisfies CreatePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies CreatePayload, { status: 500 });
  }
}

