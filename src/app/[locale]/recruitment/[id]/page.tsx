
import { notFound } from "next/navigation";
import type { JobPosting } from "@/lib/types";
import { type Metadata } from 'next';
import { VacancyClientPage } from "@/app/recruitment/[id]/page";
import { getVacancy, getVacancies } from "@/lib/supabase/vacancy-service";

// Helper to convert Timestamp to a serializable format (string)
const toSerializableDate = (date: string | Date | undefined): string | null => {
  if (!date) return null;
  if (typeof date === 'string') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return date.toISOString();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vacancy = await getVacancy(id);

  if (!vacancy) {
    return {
      title: 'Emprego não encontrado',
      description: 'O emprego que você está procurando não existe.',
    };
  }

  return {
    title: `${vacancy.title} | Empregos NexusTalent`,
    description: vacancy.description.substring(0, 160),
  };
}

export async function generateStaticParams() {
  const vacancies = await getVacancies(true);
  return vacancies.map((v) => ({ id: v.id }));
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vacancy = await getVacancy(id);

  if (!vacancy) {
    notFound();
  }

  const job: JobPosting = {
    id: vacancy.id,
    title: vacancy.title,
    description: vacancy.description,
    employerName: vacancy.company,
    location: vacancy.location,
    type: vacancy.job_type as JobPosting['type'],
    salaryRange: vacancy.salary_range ?? undefined,
    showSalary: Boolean(vacancy.salary_range),
    postedDate: vacancy.created_at ? new Date(vacancy.created_at) : undefined,
    closingDate: vacancy.expires_at ? new Date(vacancy.expires_at) : undefined,
    category: 'geral',
    responsibilities: Array.isArray(vacancy.benefits) ? vacancy.benefits : [],
    requirements: Array.isArray(vacancy.requirements) ? vacancy.requirements : [],
    screeningQuestions: [],
    recruiterId: vacancy.recruiter_id,
    featured: Boolean(vacancy.featured),
  };

  const serializableJob = {
    ...job,
    postedDate: toSerializableDate(vacancy.created_at),
    closingDate: toSerializableDate(vacancy.expires_at),
  } as any;

  return <VacancyClientPage vacancy={serializableJob} />;
}
