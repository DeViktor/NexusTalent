'use client';

import { useEffect, useState } from 'react';
import { useJobWishlist } from '@/hooks/use-job-wishlist';
import { getVacancies } from '@/lib/supabase/vacancy-service';
import type { JobPosting } from '@/lib/types';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function WishlistJobs() {
  const { wishlist, isLoading: isWishlistLoading } = useJobWishlist();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistJobs = async () => {
      try {
        const vacancies = await getVacancies(true);
        const mapped: JobPosting[] = (vacancies || []).map(v => ({
          id: String(v.id),
          title: v.title,
          location: v.location,
          type: v.job_type.toLowerCase().includes('part') ? 'Part-time' : v.job_type.toLowerCase().includes('remote') ? 'Remote' : 'Full-time',
          category: 'Sem Categoria',
          description: v.description,
          recruiterId: String(v.recruiter_id),
          postedDate: v.created_at ? new Date(v.created_at) : new Date(),
          closingDate: v.expires_at ? new Date(v.expires_at) : undefined,
          responsibilities: [],
          requirements: Array.isArray(v.requirements) ? v.requirements : [],
          aiScreeningQuestions: [],
          screeningQuestions: [],
          industry: undefined,
          minExperience: undefined,
          numberOfVacancies: undefined,
          requiredNationality: undefined,
          languages: undefined,
          salaryRange: v.salary_range,
          showSalary: undefined,
          employerName: v.company,
          aboutEmployer: undefined,
          hideEmployerData: undefined,
          minEducationLevel: undefined,
        }));
        const wishlistJobs = mapped.filter(job => wishlist.includes(job.id));
        setJobs(wishlistJobs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlistJobs();
  }, [wishlist]);

  const renderContent = () => {
    if (isWishlistLoading || isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <p className="text-sm text-muted-foreground p-4 text-center">
          A sua lista de empregos guardados está vazia. Clique no ícone de coração (♡) nos anúncios para os adicionar aqui.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {jobs.map(job => (
           <Link href={`/recruitment/${job.id}`} key={job.id} className="block p-3 border rounded-md hover:bg-secondary">
                <p className="font-semibold text-sm">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.location}</p>
            </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
}
