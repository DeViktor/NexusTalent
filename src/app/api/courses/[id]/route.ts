import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

function mapRow(row: any) {
  return {
    id: String(row.id ?? row.code),
    name: row.name ?? row.title ?? 'Curso',
    category: row.category ?? 'geral',
    imageId: row.image_id ?? row.imageId ?? 'course-power-bi',
    imageDataUri: row.image_data_uri ?? row.imageDataUri,
    duration: row.duration ?? '—',
    format: row.format ?? 'Online',
    generalObjective: row.general_objective ?? row.generalObjective ?? '',
    whatYouWillLearn: Array.isArray(row.what_you_will_learn)
      ? row.what_you_will_learn
      : Array.isArray(row.whatYouWillLearn)
      ? row.whatYouWillLearn
      : [],
    modules: Array.isArray(row.modules) ? row.modules : [],
    status: row.status ?? 'Ativo',
  };
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const supabase = getServerSupabase();
    let byId = await (supabase as any).from('courses').select('*').eq('id', id).single();
    if (byId?.data) {
      return NextResponse.json({ ok: true, data: mapRow(byId.data) });
    }
    const numericId = Number(id);
    if (Number.isInteger(numericId) && String(numericId) === id.trim()) {
      const byNumericId = await (supabase as any).from('courses').select('*').eq('id', numericId).single();
      if (byNumericId?.data) {
        return NextResponse.json({ ok: true, data: mapRow(byNumericId.data) });
      }
    }
    const byCode = await (supabase as any).from('courses').select('*').eq('code', id).single();
    if (byCode?.data) {
      return NextResponse.json({ ok: true, data: mapRow(byCode.data) });
    }
    return NextResponse.json({ ok: false, error: 'Curso não encontrado' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  }
}
