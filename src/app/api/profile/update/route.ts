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

    const admin = getServerSupabase();
    // Descobrir colunas existentes da tabela users para construir o payload correto
    let existingRow: any = null;
    try {
      const probe = await (admin as any)
        .from('users')
        .select('*')
        .eq('id', payload.userId)
        .single();
      if (!probe.error) existingRow = probe.data;
    } catch {}

    const keys: string[] = existingRow ? Object.keys(existingRow) : [];
    const has = (k: string) => keys.includes(k);

    // Preferir SEMPRE colunas first_name/last_name quando existirem
    const fnPref = firstName || (fullName ? fullName.split(' ')[0] : undefined);
    const lnPref = lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : undefined);
    if (has('first_name') && typeof fnPref === 'string') updates.first_name = fnPref;
    if (has('last_name') && typeof lnPref === 'string') updates.last_name = lnPref;

    // Fallback para esquemas antigos somente se first/last não existirem
    if (!has('first_name') && !has('last_name') && fullName) {
      if (has('name')) updates.name = fullName;
      else if (has('full_name')) updates.full_name = fullName;
      else if (has('fullname')) updates.fullname = fullName;
      else if (has('display_name')) updates.display_name = fullName;
    }

    if (email) {
      if (has('email')) updates.email = email;
      else if (has('user_email')) updates.user_email = email;
      else if (has('mail')) updates.mail = email;
    }

    if (typeof profilePictureUrl === 'string') {
      if (has('profile_picture_url')) updates.profile_picture_url = profilePictureUrl;
      else if (has('avatar_url')) updates.avatar_url = profilePictureUrl;
      else if (has('profile_image')) updates.profile_image = profilePictureUrl;
      else if (has('photo_url')) updates.photo_url = profilePictureUrl;
      else if (has('image_url')) updates.image_url = profilePictureUrl;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nenhum campo compatível com o schema atual' }, { status: 400 });
    }

    let updatedRow: any = null;
    let lastErr: any = null;

    async function tryUpdate(u: Record<string, any>) {
      const { data, error } = await (admin as any)
        .from('users')
        .update(u)
        .eq('id', payload.userId)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }

    try {
      updatedRow = await tryUpdate(updates);
    } catch (e: any) {
      lastErr = e;
      if (profilePictureUrl && /column .* (schema cache|does not exist)/i.test(String(e?.message || ''))) {
        const avatarColumns = ['profile_picture_url','avatar_url','profile_image','photo_url','image_url'];
        let success = false;
        for (const col of avatarColumns) {
          try {
            const alt = { ...updates } as any;
            delete alt.avatar_url;
            delete alt.profile_picture_url;
            alt[col] = profilePictureUrl;
            updatedRow = await tryUpdate(alt);
            success = true;
            break;
          } catch (err) {
            lastErr = err;
          }
        }
        if (!success) {
          // Tenta atualizar apenas name/email caso avatar falhe em todas
          try {
            const minimal: any = { ...updates };
            delete minimal.avatar_url;
            delete minimal.profile_picture_url;
            updatedRow = await tryUpdate(minimal);
          } catch (err) {
            lastErr = err;
          }
        }
      }
    }

    if (!updatedRow) {
      return NextResponse.json({ ok: false, error: lastErr?.message || 'Erro ao atualizar' }, { status: 500 });
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

    return NextResponse.json({ ok: true, data: updatedRow });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
