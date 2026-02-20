import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const admin = getServerSupabase();
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // optional filter
    let query = (admin as any).from('courses').select('*');
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
