'use client';
import { supabase } from '@/lib/supabase/client';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/types';

interface FeaturedCoursesProps {
    title?: string;
}

export function FeaturedCourses({ title = "Cursos em Destaque" }: FeaturedCoursesProps) {
  const [featured, setFeatured] = useState<Course[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) throw error;
        const mapped = (data ?? []).map((row: any) => ({
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
        } as Course));
        // Escolhe os 8 primeiros como destaque por ora
        setFeatured(mapped.slice(0, 8));
      } catch {
        setFeatured([]);
      }
    };
    fetchFeatured();
  }, []);


  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">{title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Comece sua jornada de aprendizado com nossos cursos mais populares.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/courses">
              Ver todos os cursos
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
