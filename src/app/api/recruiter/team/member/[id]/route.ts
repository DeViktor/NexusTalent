import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true }
  | { ok: false; error: string };
 
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const memberId = String(params.id || '').trim();
    if (!memberId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const body = await req.json().catch(() => null);
    const role = body?.role !== undefined ? String(body.role).trim() : undefined;
    const status = body?.status !== undefined ? String(body.status).trim() : undefined;
    if (role === undefined && status === undefined) {
      return NextResponse.json({ ok: false, error: 'Nada para atualizar' } satisfies ResponsePayload, { status: 400 });
    }
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const userRole = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: member, error: memberErr } = await (admin as any)
      .from('recruiter_team_members')
      .select('id, owner_recruiter_id')
      .eq('id', memberId)
      .single();
    if (memberErr) throw memberErr;
    if (String(member.owner_recruiter_id) !== String(session.userId) && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const updates: any = { updated_at: new Date().toISOString() };
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
 
    const { error: updErr } = await (admin as any).from('recruiter_team_members').update(updates).eq('id', memberId);
    if (updErr) throw updErr;
 
    return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
 
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const memberId = String(params.id || '').trim();
    if (!memberId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const userRole = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: member, error: memberErr } = await (admin as any)
      .from('recruiter_team_members')
      .select('id, owner_recruiter_id')
      .eq('id', memberId)
      .single();
    if (memberErr) throw memberErr;
    if (String(member.owner_recruiter_id) !== String(session.userId) && userRole !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { error: delErr } = await (admin as any).from('recruiter_team_members').delete().eq('id', memberId);
    if (delErr) throw delErr;
 
    return NextResponse.json({ ok: true } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
