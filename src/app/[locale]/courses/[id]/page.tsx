
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { CourseDetailClientPage } from "@/components/courses/course-detail-client-page";
import { getServerSupabase } from "@/lib/supabase/client";
import type { Course } from "@/lib/types";

function mapRowToCourse(row: any): Course {
  return {
    id: String(row.id ?? row.code ?? crypto.randomUUID()),
    name: row.name ?? row.title ?? 'Curso',
    category: row.category ?? 'geral',
    imageId: row.image_id ?? row.imageId ?? 'course-power-bi',
    imageDataUri: row.image_data_uri ?? row.imageDataUri,
    duration: row.duration ?? '—',
    format: (row.format ?? 'Online') as Course['format'],
    generalObjective: row.general_objective ?? row.generalObjective ?? '',
    whatYouWillLearn: Array.isArray(row.what_you_will_learn)
      ? row.what_you_will_learn
      : Array.isArray(row.whatYouWillLearn)
      ? row.whatYouWillLearn
      : [],
    modules: Array.isArray(row.modules) ? row.modules : [],
    status: (row.status ?? 'Ativo') as Course['status'],
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const course = await fetchCourse(id);

  if (!course) {
    return {
      title: 'Curso não encontrado',
      description: 'O curso que você está procurando não existe.',
    };
  }

  return {
    title: `${course.name} | Cursos NexusTalent`,
    description: course.generalObjective,
  };
}

export async function generateStaticParams() {
  try {
    const admin = getServerSupabase();
    const { data, error } = await (admin as any).from('courses').select('id, code');
    if (error || !data) return [];
    return data.map((row: any) => ({ id: String(row.id ?? row.code) }));
  } catch {
    return [];
  }
}

async function fetchCourse(idOrCode: string): Promise<Course | null> {
  // Tentativa 1: buscar por id (string ou uuid)
  try {
    const admin = getServerSupabase();
    const byId = await (admin as any).from('courses').select('*').eq('id', idOrCode).single();
    if (byId.data) return mapRowToCourse(byId.data);
  } catch {}

  // Tentativa 2: se for número, buscar por id numérico
  const numericId = Number(idOrCode);
  if (Number.isInteger(numericId) && String(numericId) === idOrCode.trim()) {
    try {
      const admin = getServerSupabase();
      const byNumericId = await (admin as any).from('courses').select('*').eq('id', numericId).single();
      if (byNumericId.data) return mapRowToCourse(byNumericId.data);
    } catch {}
  }

  // Tentativa 3: buscar por código
  try {
    const admin = getServerSupabase();
    const byCode = await (admin as any).from('courses').select('*').eq('code', idOrCode).single();
    if (byCode.data) return mapRowToCourse(byCode.data);
  } catch {}

  return null;
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const course = await fetchCourse(id);

  if (!course) {
    notFound();
  }

  return <CourseDetailClientPage course={course} />;
}
