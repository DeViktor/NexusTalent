'use client';

import { getCourseCategories } from "@/lib/course-service";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle, Target, List, Video } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import React from "react";
import type { Course, CourseCategory } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CourseDetailClientPage({ course }: { course: Course }) {
  const [category, setCategory] = React.useState<CourseCategory | null>(null);
  
  React.useEffect(() => {
    getCourseCategories().then(cats => {
        const found = cats.find(c => c.id === course.category) || null;
        setCategory(found);
    });
  }, [course.category]);

  const [relatedCourses, setRelatedCourses] = React.useState<Course[]>([]);
  const imageSrc = course.imageDataUri || null;

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (!active) return;
        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        const payload = await res.json().catch(() => null);
        setIsLoggedIn(Boolean(payload?.ok && payload?.user?.id));
      } catch {
        if (active) setIsLoggedIn(false);
      }
    })();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('category', course.category)
          .neq('id', course.id)
          .eq('status', 'Ativo')
          .limit(4);
        if (error) throw error;
        if (!active) return;
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
        setRelatedCourses(mapped);
      } catch {
        if (active) setRelatedCourses([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [course.category, course.id]);
  const router = useRouter();
  const { toast } = useToast();

  const handleEnroll = () => {
    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Você precisa fazer login para se inscrever num curso.",
      });
      router.push('/login');
      return;
    }
    // Redirect to the new enrollment page
    router.push(`/courses/${course.id}/enroll`);
  };

  return (
    <>
      <Header />
      <main className="bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft size={16} /> Voltar para cursos
          </Link>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              {category && <Badge className="mb-2">{category.name}</Badge>}
              <h1 className="font-headline text-3xl md:text-4xl font-bold">{course.name}</h1>
              <p className="text-lg text-muted-foreground mt-2 font-mono">{course.id}</p>
              
              <div className="mt-8 prose prose-lg max-w-none text-foreground/90">
                  <div className="p-6 border rounded-lg bg-background">
                      <div className="flex items-start gap-4">
                          <Target className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                          <div>
                              <h3 className="font-headline text-xl mt-0">Objetivo Geral</h3>
                              <p className="text-base">{course.generalObjective}</p>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8">
                      <h3 className="font-headline flex items-center gap-2"><CheckCircle className="w-6 h-6 text-primary" /> O que vai aprender</h3>
                      <ul className="mt-4 space-y-2">
                          {course.whatYouWillLearn.map((objective, index) => (
                              <li key={index} className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0"/>
                                  <span>{objective}</span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  <div className="mt-12">
                      <h3 className="font-headline flex items-center gap-2"><List className="w-6 h-6 text-primary"/> Conteúdo Programático (Módulos)</h3>
                      <Accordion type="single" collapsible className="w-full mt-4">
                          {course.modules.map((module, index) => (
                              <AccordionItem value={`item-${index}`} key={index}>
                                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">{module.title}</AccordionTrigger>
                                  <AccordionContent>
                                      <ul className="list-disc pl-5 space-y-2 text-base mb-4">
                                          {module.topics.map((topic, topicIndex) => (
                                              <li key={topicIndex}>{topic.title}</li>
                                          ))}
                                      </ul>
                                       {module.videoUrl && (
                                            <Button asChild>
                                                <a href={module.videoUrl} target="_blank" rel="noopener noreferrer">
                                                    <Video className="mr-2 h-4 w-4" /> Assistir Aula
                                                </a>
                                            </Button>
                                        )}
                                  </AccordionContent>
                              </AccordionItem>
                          ))}
                      </Accordion>
                  </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                  {imageSrc && (
                      <div className="relative w-full h-56 rounded-lg overflow-hidden mb-6 shadow-lg">
                          <Image src={imageSrc} alt={image?.description || course.name} fill className="object-cover" data-ai-hint={image?.imageHint} />
                      </div>
                  )}
                  <div className="border rounded-lg p-6 bg-background">
                      <div className="space-y-4 text-sm">
                          <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-muted-foreground" />
                              <span><strong>Modalidade:</strong> {course.format}</span>
                          </div>
                           <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-muted-foreground" />
                              <span><strong>Nível:</strong> Todos os níveis</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <span><strong>Carga Horária:</strong> {course.duration}</span>
                          </div>
                      </div>
                      <Button size="lg" className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleEnroll}>Inscreva-se Agora</Button>
                  </div>
              </div>
            </div>
          </div>
        </div>
        {relatedCourses.length > 0 && (
          <div className="bg-background py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="font-headline text-3xl font-bold text-center mb-10">Mais cursos para carreiras Profissional de {category?.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {relatedCourses.map(relatedCourse => (
                          <CourseCard key={relatedCourse.id} course={relatedCourse} />
                      ))}
                  </div>
              </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
