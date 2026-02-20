import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const admin = getServerSupabase();
    const { data, error } = await (admin as any)
      .from('courses')
      .select('*')
      .eq('status', 'Pendente');
    if (error) {
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
