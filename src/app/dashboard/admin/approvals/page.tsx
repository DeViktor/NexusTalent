
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Check, X, FileWarning } from 'lucide-react';
import type { Course } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { updateCourseStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getImages } from '@/lib/site-data';
import Link from 'next/link';

export default function CourseApprovalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/pending-courses', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar cursos pendentes');
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const mapped = rows.map((row: any) => ({
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
          status: (row.status ?? 'Pendente') as Course['status'],
        } as Course));
        if (active) setPendingCourses(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleUpdateStatus = async (courseId: string, newStatus: 'Ativo' | 'Rejeitado') => {
    try {
      const res = await updateCourseStatusAction(courseId, newStatus);
      if (!res.success) throw new Error(res.message);
      setPendingCourses(prev => prev.filter(c => c.id !== courseId));
      toast({
        title: `Curso ${newStatus === 'Ativo' ? 'Aprovado' : 'Rejeitado'}!`,
        description: `O curso foi movido para o status de ${newStatus.toLowerCase()}.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: e?.message || 'Não foi possível alterar o status do curso.',
      });
    }
  };

  const allImages = getImages();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (pendingCourses.length === 0) {
      return (
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Nenhuma Pendência</AlertTitle>
          <AlertDescription>
            Não há cursos aguardando aprovação no momento.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {pendingCourses.map(course => {
          const image = allImages.find(p => p.id === course.imageId);
          const imageSrc = course.imageDataUri || image?.imageUrl;
          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>
                  Formato: {course.format} | Categoria: {course.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                {imageSrc && (
                  <div className="relative h-40 rounded-md overflow-hidden">
                    <Image src={imageSrc} alt={course.name} fill className="object-cover" />
                  </div>
                )}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="font-semibold">Objetivo Geral</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{course.generalObjective}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" asChild size="sm">
                    <Link href={`/courses/${course.id}`} target="_blank">Ver Página do Curso</Link>
                </Button>
                <Button variant="destructive" onClick={() => handleUpdateStatus(course.id, 'Rejeitado')}>
                  <X className="mr-2 h-4 w-4" /> Rejeitar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(course.id, 'Ativo')}>
                  <Check className="mr-2 h-4 w-4" /> Aprovar
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Painel
      </Button>
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Aprovações de Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Reveja e publique os novos cursos submetidos pelos formadores.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
