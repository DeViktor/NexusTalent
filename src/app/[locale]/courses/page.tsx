'use client';

import { useState, useMemo, useEffect } from 'react';
import { getCourseCategories } from '@/lib/course-service';
import { supabase } from '@/lib/supabase/client';
import { CourseCard } from '@/components/courses/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FeaturedCourses } from '@/components/home/featured-courses';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RunningCourses } from '@/components/home/running-courses';
import type { Course, CourseCategory } from '@/lib/types';

const COURSES_PER_PAGE = 12;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Buscar cursos diretamente do Supabase; em caso de erro, lista vazia.
    const fetchCourses = async () => {
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
        setCourses(mapped);
      } catch (e) {
        setCourses([]);
      }
    };

    fetchCourses();
    setCourseCategories(getCourseCategories());
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);

  const paginatedCourses = useMemo(() => {
      const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
      const endIndex = startIndex + COURSES_PER_PAGE;
      return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <>
    <Header />
    <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold">Catálogo de Cursos</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Encontre o curso perfeito para impulsionar sua carreira. Explore nossas áreas de conhecimento.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-background/95 py-4 z-10 backdrop-blur-sm">
            <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por nome ou código do curso..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
            <div className='md:w-1/3'>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {courseCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                        {category.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </div>

        {paginatedCourses.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {paginatedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                    <Button onClick={handlePreviousPage} disabled={currentPage === 1} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>
                    <span className="text-sm font-medium">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
            </>
        ) : (
            <div className="text-center py-16">
            <p className="text-xl font-semibold">Nenhum curso encontrado.</p>
            <p className="text-muted-foreground mt-2">Tente ajustar sua busca ou filtros.</p>
            </div>
        )}
        </div>
        <RunningCourses />
        <div className="bg-card py-16 mt-16">
            <FeaturedCourses title="Cursos em Alta" />
        </div>
    </main>
    <Footer />
    </>
  );
}
