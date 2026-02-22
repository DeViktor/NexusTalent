import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { verifySession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const cookieHeader = (req as any).headers?.get?.('cookie') as string | undefined;
    const appSession = cookieHeader
      ?.split(';')
      .map(s => s.trim())
      .find(s => s.startsWith('app_session='))
      ?.split('=')[1];
    if (!appSession) {
      return NextResponse.json({ ok: false, error: 'Sem sessão' }, { status: 401 });
    }

    const payload = await verifySession(appSession);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Sessão inválida' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const firstName: string | undefined = body?.firstName;
    const lastName: string | undefined = body?.lastName;
    const email: string | undefined = body?.email;
    const profilePictureUrl: string | undefined = body?.profilePictureUrl;
    const academicHistory: Array<{ institution: string; degree: string; year?: string }>|undefined = body?.academicHistory;
    const workExperience: Array<{ company: string; role: string; period: string; description?: string }>|undefined = body?.workExperience;

    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    const updates: Record<string, any> = {};
    if (fullName) updates.name = fullName;
    if (email) updates.email = email;
    if (typeof profilePictureUrl === 'string') updates.avatar_url = profilePictureUrl;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    const admin = getServerSupabase();
    const { data, error } = await (admin as any)
      .from('users')
      .update(updates)
      .eq('id', payload.userId)
      .select('*')
      .single();
    if (error) {
      return NextResponse.json({ ok: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
    }

    async function resolveTable(candidates: string[]) {
      for (const name of candidates) {
        try {
          const r = await (admin as any).from(name).select('*').limit(1);
          if (!r.error) return name;
        } catch {}
      }
      return null;
    }

    if (Array.isArray(academicHistory)) {
      const table = await resolveTable(['user_academic_history','academic_history','user_educations','educations']);
      if (table) {
        await (admin as any).from(table).delete().eq('user_id', payload.userId);
        const rows = academicHistory.map(h => ({ user_id: payload.userId, institution: h.institution, degree: h.degree, year: h.year || null }));
        if (rows.length > 0) await (admin as any).from(table).insert(rows);
      }
    }

    if (Array.isArray(workExperience)) {
      const table = await resolveTable(['user_work_experience','work_experience','user_experiences','experiences']);
      if (table) {
        await (admin as any).from(table).delete().eq('user_id', payload.userId);
        const rows = workExperience.map(w => ({ user_id: payload.userId, company: w.company, role: w.role, period: w.period, description: w.description || null }));
        if (rows.length > 0) await (admin as any).from(table).insert(rows);
      }
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
