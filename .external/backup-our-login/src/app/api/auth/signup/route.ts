import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw: string | undefined = body?.email;
    const password: string | undefined = body?.password;
    const firstName: string | undefined = body?.firstName;
    const lastName: string | undefined = body?.lastName;
    const userType: string | undefined = body?.userType;
    const companyName: string | undefined = body?.companyName;
    const specialization: string | undefined = body?.specialization;

    if (!emailRaw || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ ok: false, error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    const email = emailRaw.toLowerCase().trim();
    const name = `${firstName} ${lastName}`.trim();

    const admin = getServerSupabase();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        userType,
      },
    });

    if (createError) {
      const message = createError.message || 'Erro ao criar usuário';
      const status = /already registered|already exists/i.test(message) ? 409 : 400;
      return NextResponse.json({ ok: false, error: message }, { status });
    }

    const authUser = created?.user;
    if (!authUser?.id) {
      return NextResponse.json({ ok: false, error: 'Usuário criado sem ID' }, { status: 500 });
    }

    const company = userType === 'recruiter' ? (companyName || null) : null;
    const bio = userType === 'instructor' ? (specialization || null) : null;

    const { error: upsertError } = await admin.from('users').upsert({
      id: authUser.id,
      email,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
      profile_picture_url: undefined,
      phone_number: undefined,
      summary: bio ?? undefined,
    });

    if (upsertError) {
      return NextResponse.json({ ok: false, error: upsertError.message || 'Erro ao salvar perfil' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro ao criar conta' }, { status: 500 });
  }
}
