import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
import { verifySession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const url = new URL((req as any).url || 'http://local');
    const debug = url.searchParams.get('debug') === '1';
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
    // Descobrir colunas disponíveis e localizar a linha do utilizador
    let sampleRow: any = null;
    try {
      const sample = await (admin as any).from('users').select('*').limit(1);
      if (!sample.error && Array.isArray(sample.data) && sample.data[0]) sampleRow = sample.data[0];
    } catch {}

    // Se a tabela estiver vazia, criamos um conjunto de colunas padrão para tentativa
    const defaultKeys = [
      'first_name','last_name','name','full_name','fullname','display_name',
      'email','user_email','mail',
      'profile_picture_url','avatar_url','profile_image','photo_url','image_url',
      'id','user_id','uid'
    ];
    const sampleKeys: string[] = sampleRow ? Object.keys(sampleRow) : defaultKeys;
    const sampleHas = (k: string) => sampleKeys.includes(k);
    const emailCols = ['email','user_email','mail'];
    const idCols = ['id','user_id','uid'];
    const availableEmailCol = emailCols.find(c => sampleHas(c));
    const availableIdCol = idCols.find(c => sampleHas(c));

    let existingRow: any = null;
    if (availableEmailCol && payload.email) {
      try {
        const byEmail = await (admin as any).from('users').select('*').eq(availableEmailCol, payload.email).single();
        if (!byEmail.error) existingRow = byEmail.data;
      } catch {}
    }
    if (!existingRow && availableIdCol) {
      try {
        const byId = await (admin as any).from('users').select('*').eq(availableIdCol, payload.userId).single();
        if (!byId.error) existingRow = byId.data;
      } catch {}
    }

    const keys: string[] = existingRow ? Object.keys(existingRow) : (sampleRow ? Object.keys(sampleRow) : []);
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

    if (debug) {
      return NextResponse.json({
        ok: true,
        info: {
          sampleKeys,
          candidateIdCols: idCols,
          candidateEmailCols: emailCols,
          suggestedUpdates: updates,
        }
      });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nenhum campo compatível com o schema atual' }, { status: 400 });
    }

    let updatedRow: any = null;
    let lastErr: any = null;

    // Escolher melhor coluna para localizar o utilizador (preferir ID por unicidade)
    const filter: { col: string; val: string } | null = (() => {
      if (availableIdCol) return { col: availableIdCol, val: payload.userId };
      if (availableEmailCol && payload.email) return { col: availableEmailCol, val: payload.email };
      // fallback padrão caso não detectado por amostra
      if (!availableIdCol) return { col: 'id', val: payload.userId };
      return null;
    })();

    async function tryUpdate(u: Record<string, any>) {
      if (!filter) throw new Error('Não foi possível identificar chave para localizar o utilizador');
      const { data, error } = await (admin as any)
        .from('users')
        .update(u)
        .eq(filter.col, filter.val)
        .select('*');
      if (error) throw error;
      if (Array.isArray(data)) return data[0] ?? null;
      return data ?? null;
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
          if (!r.error) return { table: name, sample: Array.isArray(r.data) ? r.data[0] : null } as { table: string; sample: any };
        } catch {}
      }
      return null as any;
    }

    if (Array.isArray(academicHistory)) {
      const info = await resolveTable(['user_academic_history','academic_history','user_educations','educations']);
      if (info?.table) {
        const cols = info.sample ? Object.keys(info.sample) : [];
        const has = (k: string) => cols.includes(k);
        await (admin as any).from(info.table).delete().eq('user_id', payload.userId);
        const rows = academicHistory.map(h => {
          const row: any = {};
          if (has('user_id')) row.user_id = payload.userId;
          if (has('institution')) row.institution = h.institution;
          if (has('school')) row.school = h.institution;
          if (has('degree')) row.degree = h.degree;
          if (has('course')) row.course = h.degree;
          const yr = h.year ? parseInt(h.year, 10) : null;
          if (has('year')) row.year = Number.isFinite(yr as any) ? yr : h.year || null;
          if (!has('year')) {
            if (has('start_year')) row.start_year = Number.isFinite(yr as any) ? yr : null;
            if (has('end_year')) row.end_year = Number.isFinite(yr as any) ? yr : null;
          }
          return row;
        });
        const valid = rows.map(r => {
          // mantém ao menos user_id + algum outro campo
          const keys = Object.keys(r);
          return keys.length >= 2 ? r : null;
        }).filter(Boolean);
        if (valid.length > 0) await (admin as any).from(info.table).insert(valid);
      }
    }

    if (Array.isArray(workExperience)) {
      const info = await resolveTable(['user_work_experience','work_experience','user_experiences','experiences']);
      if (info?.table) {
        const cols = info.sample ? Object.keys(info.sample) : [];
        const has = (k: string) => cols.includes(k);
        await (admin as any).from(info.table).delete().eq('user_id', payload.userId);
        const rows = workExperience.map(w => {
          const row: any = {};
          if (has('user_id')) row.user_id = payload.userId;
          if (has('company')) row.company = w.company;
          if (has('employer')) row.employer = w.company;
          if (has('role')) row.role = w.role;
          if (has('title')) row.title = w.role;
          if (has('position')) row.position = w.role;
          if (has('description')) row.description = w.description || null;
          if (has('summary')) row.summary = w.description || null;
          // período: se existir campo simples 'period', usar string; caso contrário, mapear inicio/fim se disponíveis
          if (has('period')) row.period = w.period;
          const range = (w.period || '').match(/(\d{4})\D+(\d{4})/);
          const startYear = range ? parseInt(range[1], 10) : undefined;
          const endYear = range ? parseInt(range[2], 10) : undefined;
          if (!has('period')) {
            if (has('start_year')) row.start_year = Number.isFinite(startYear as any) ? startYear : null;
            if (has('end_year')) row.end_year = Number.isFinite(endYear as any) ? endYear : null;
          }
          if (has('start_date') || has('end_date')) {
            // se houver colunas de data, deixamos nulo quando não inferível
            if (has('start_date') && startYear) row.start_date = `${startYear}-01-01`;
            if (has('end_date') && endYear) row.end_date = `${endYear}-12-31`;
          }
          return row;
        });
        const valid = rows.map(r => {
          const keys = Object.keys(r);
          return keys.length >= 2 ? r : null;
        }).filter(Boolean);
        if (valid.length > 0) await (admin as any).from(info.table).insert(valid);
      }
    }

    return NextResponse.json({ ok: true, data: updatedRow });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
