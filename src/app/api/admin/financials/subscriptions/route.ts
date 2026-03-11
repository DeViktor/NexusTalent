import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';

type SubscriptionsResponse = {
  ok: true;
  data: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    plan: string;
    status: string;
    nextBilling: string | null;
    created: string;
    stripeSubscriptionId: string | null;
  }[];
} | { ok: false; error: string };

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
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 200), 1), 1000);

    const admin = getServerSupabase();
    const { data: subs, error: subsError } = await (admin as any)
      .from('subscriptions')
      .select('id, user_id, status, price_id, created, current_period_end, stripe_subscription_id')
      .order('created', { ascending: false })
      .limit(limit);
    if (subsError) {
      const body: SubscriptionsResponse = { ok: false, error: subsError.message || 'Erro ao buscar subscrições' };
      return NextResponse.json(body, { status: 500 });
    }

    const userIds = [...new Set((subs ?? []).map((s: any) => String(s.user_id)).filter(Boolean))];
    const userById = new Map<string, { name: string; email: string }>();
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await (admin as any)
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      if (usersError) {
        const body: SubscriptionsResponse = { ok: false, error: usersError.message || 'Erro ao buscar utilizadores' };
        return NextResponse.json(body, { status: 500 });
      }
      for (const u of users ?? []) {
        userById.set(String(u.id), { name: String(u.name ?? ''), email: String(u.email ?? '') });
      }
    }

    const data = (subs ?? []).map((s: any) => {
      const userId = String(s.user_id);
      const u = userById.get(userId);
      return {
        id: String(s.id),
        userId,
        userName: u?.name || '—',
        userEmail: u?.email || '—',
        plan: String(s.price_id ?? '—'),
        status: String(s.status ?? '—'),
        nextBilling: s.current_period_end ? String(s.current_period_end) : null,
        created: String(s.created),
        stripeSubscriptionId: s.stripe_subscription_id ? String(s.stripe_subscription_id) : null,
      };
    });

    const body: SubscriptionsResponse = { ok: true, data };
    return NextResponse.json(body);
  } catch (e: any) {
    const body: SubscriptionsResponse = { ok: false, error: e?.message || 'Erro' };
    return NextResponse.json(body, { status: 500 });
  }
}

