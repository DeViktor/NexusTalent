import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .schema('auth')
      .from('users')
      .select('id, email')
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sample: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
