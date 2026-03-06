import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { signSession } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string | undefined = body?.email;
    const password: string | undefined = body?.password;
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Credenciais ausentes' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !anon) {
      return NextResponse.json({ ok: false, error: 'Ambiente Supabase inválido' }, { status: 500 });
    }

    const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
    const authFromSupabase = !signInError && !!signInData?.user;

    let authUserId: string;
    let authEmail: string;
    let role: string | undefined = undefined;

    if (authFromSupabase) {
      authUserId = signInData!.user!.id;
      authEmail = signInData!.user!.email ?? email.toLowerCase();

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const admin = getServerSupabase();
        const { data: userRow } = await admin.from('users').select('role').eq('id', authUserId).limit(1);
        role = (userRow?.[0] as any)?.role as any;
      }
    } else {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const message = signInError?.message || 'Credenciais inválidas';
        return NextResponse.json({ ok: false, error: message }, { status: 401 });
      }

      const admin = getServerSupabase();
      const { data: userRows, error: userError } = await admin
        .from('users')
        .select('id,email,role,password_hash')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (userError || !userRows || userRows.length === 0) {
        return NextResponse.json({ ok: false, error: 'Credenciais inválidas' }, { status: 401 });
      }

      const userRow = userRows[0] as any;
      const passwordHash = userRow?.password_hash as string | undefined;
      if (!passwordHash) {
        return NextResponse.json({ ok: false, error: 'Credenciais inválidas' }, { status: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ ok: false, error: 'Credenciais inválidas' }, { status: 401 });
      }

      authUserId = String(userRow.id);
      authEmail = String(userRow.email ?? email.toLowerCase());
      role = (userRow.role ?? undefined) as any;
    }

    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = await signSession({ userId: authUserId as string, email: authEmail as string, role, exp });

    const res = NextResponse.json({ ok: true, user: { id: authUserId, email: authEmail, role } });
    res.cookies.set('app_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro ao autenticar' }, { status: 500 });
  }
}
