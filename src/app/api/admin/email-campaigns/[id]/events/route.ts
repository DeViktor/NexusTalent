import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; events: { id: string; name: string; email: string; action: 'Abertura' | 'Clique'; timestamp: string }[] }
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
 
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const campaignId = String(params.id || '').trim();
    if (!campaignId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
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
      .from('email_campaign_events')
      .select('id, user_id, action, created_at')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
 
    const events = Array.isArray(rows) ? rows : [];
    const userIds = [...new Set(events.map((e: any) => String(e.user_id)).filter(Boolean))];
    const { data: userRows, error: userErr } = userIds.length
      ? await (admin as any).from('users').select('*').in('id', userIds)
      : { data: [], error: null };
    if (userErr) throw userErr;
    const userById = new Map<string, any>((userRows || []).map((u: any) => [String(u.id), u]));
 
    const payload = events.map((e: any) => {
      const u = userById.get(String(e.user_id));
      return {
        id: String(e.id),
        name: computeDisplayName(u),
        email: String(u?.email || ''),
        action: (String(e.action) === 'Clique' ? 'Clique' : 'Abertura') as 'Abertura' | 'Clique',
        timestamp: String(e.created_at),
      };
    });
 
    return NextResponse.json({ ok: true, events: payload } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

