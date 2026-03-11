import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getServerSupabase } from '@/lib/supabase/client';
 
type ResponsePayload =
  | {
      ok: true;
      enrollments: {
        id: string;
        student: { id: string; name: string; email: string; avatarUrl?: string | null };
        status: string;
        progress: number;
        quizGrade: number | null;
        finalGrade: number | null;
        updatedAt: string;
      }[];
    }
  | { ok: false; error: string };
 
function computeDisplayName(row: any): string {
  const anyRow = row || {};
  const computed =
    anyRow.name ||
    anyRow.full_name ||
    anyRow.fullname ||
    anyRow.display_name ||
    [anyRow.first_name, anyRow.last_name].filter(Boolean).join(' ');
  return String(computed || 'Aluno');
}
 
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const courseId = String(params.id || '').trim();
    if (!courseId) return NextResponse.json({ ok: false, error: 'ID inválido' } satisfies ResponsePayload, { status: 400 });
 
    const cookieStore = await cookies();
    const appSession = cookieStore.get('app_session')?.value || null;
    if (!appSession) return NextResponse.json({ ok: false, error: 'Sem sessão' } satisfies ResponsePayload, { status: 401 });
 
    const session = await verifySession(appSession);
    if (!session?.userId) return NextResponse.json({ ok: false, error: 'Sessão inválida' } satisfies ResponsePayload, { status: 401 });
 
    const admin = getServerSupabase();
    const { data: roleRows, error: roleErr } = await admin.from('users').select('role').eq('id', session.userId).limit(1);
    if (roleErr) throw roleErr;
    const role = (Array.isArray(roleRows) ? (roleRows[0] as any)?.role : undefined) as string | undefined;
    if (role !== 'instructor' && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: courseRows, error: courseErr } = await (admin as any).from('courses').select('id, owner_id').eq('id', courseId).limit(1);
    if (courseErr) throw courseErr;
    const ownerId = (Array.isArray(courseRows) ? courseRows[0]?.owner_id : null) as string | null;
    if (!ownerId) return NextResponse.json({ ok: false, error: 'Curso não encontrado' } satisfies ResponsePayload, { status: 404 });
    if (String(ownerId) !== String(session.userId) && role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acesso negado' } satisfies ResponsePayload, { status: 403 });
    }
 
    const { data: enrollRows, error: enrollErr } = await (admin as any)
      .from('course_enrollments')
      .select('id, student_id, status, progress, quiz_grade, final_grade, updated_at')
      .eq('course_id', courseId)
      .order('updated_at', { ascending: false })
      .limit(500);
    if (enrollErr) throw enrollErr;
    const enrollments = Array.isArray(enrollRows) ? enrollRows : [];
 
    const studentIds = [...new Set(enrollments.map((e: any) => String(e.student_id)).filter(Boolean))];
    const { data: studentRows, error: studentErr } = studentIds.length
      ? await (admin as any).from('users').select('*').in('id', studentIds)
      : { data: [], error: null };
    if (studentErr) throw studentErr;
    const studentById = new Map<string, any>((studentRows || []).map((u: any) => [String(u.id), u]));
 
    const payload = enrollments.map((e: any) => {
      const u = studentById.get(String(e.student_id));
      return {
        id: String(e.id),
        student: { id: String(e.student_id), name: computeDisplayName(u), email: String(u?.email || ''), avatarUrl: u?.avatar_url ?? null },
        status: String(e.status || 'Em Curso'),
        progress: Number(e.progress || 0),
        quizGrade: e.quiz_grade !== null && e.quiz_grade !== undefined ? Number(e.quiz_grade) : null,
        finalGrade: e.final_grade !== null && e.final_grade !== undefined ? Number(e.final_grade) : null,
        updatedAt: String(e.updated_at),
      };
    });
 
    return NextResponse.json({ ok: true, enrollments: payload } satisfies ResponsePayload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' } satisfies ResponsePayload, { status: 500 });
  }
}

