import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | { ok: true; data: any }
  | { ok: false; error: string };
 
export async function GET() {
  try {
    const admin = getServerSupabase();
    const { data, error } = await (admin as any)
      .from('site_data')
      .select('data')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, data: data?.data ?? null } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}
