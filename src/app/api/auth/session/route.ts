import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { verifySession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const cookieHeader = (req as any).headers?.get?.('cookie') as string | undefined;
    // Fallback for Next.js Request: use standard cookie parsing from the runtime
    const appSession = cookieHeader
      ?.split(';')
      .map(s => s.trim())
      .find(s => s.startsWith('app_session='))
      ?.split('=')[1];

    if (!appSession) {
      return NextResponse.json({ ok: false, error: 'Sem sessão' });
    }

    const payload = await verifySession(appSession);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Sessão inválida' });
    }

    const admin = getServerSupabase();
    const { data: profileRows, error: profileError } = await admin
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .limit(1);
    if (profileError) throw profileError;
    const profile = Array.isArray(profileRows) ? profileRows[0] : undefined;

    const firstName = (profile as any)?.first_name || '';
    const lastName = (profile as any)?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || null;
    const photoURL = (profile as any)?.profile_picture_url || null;
    const profileRole = ((profile as any)?.role as string | null | undefined) ?? undefined;
    const profileUserType = ((profile as any)?.user_type as string | null | undefined) ?? undefined;
    const rawRole =
      profileUserType && (profileRole === undefined || profileRole === null || profileRole === 'student')
        ? profileUserType
        : (profileRole ?? profileUserType ?? payload.role);
    const normalizedRole =
      rawRole === 'Aluno' ? 'student' :
      rawRole === 'Instrutor' ? 'instructor' :
      rawRole === 'Empresa' ? 'recruiter' :
      rawRole;
    const role = normalizedRole || undefined;

    const user = {
      id: payload.userId,
      email: payload.email,
      displayName: fullName || payload.email,
      photoURL,
      role,
    };

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
