'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, ClipboardCheck, Users, BarChart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Vacancy, AssessmentTest } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ManageAssessmentsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const vacancyId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [vacancy, setVacancy] = useState<Vacancy | null | undefined>(undefined);
  const [tests, setTests] = useState<AssessmentTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testToDelete, setTestToDelete] = useState<AssessmentTest | null>(null);

  useEffect(() => {
    if (!vacancyId) return;
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [vacRes, testRes] = await Promise.all([
          fetch(`/api/recruiter/vacancies/${vacancyId}`, { cache: 'no-store', credentials: 'include' }),
          fetch(`/api/recruiter/vacancies/${vacancyId}/assessments`, { cache: 'no-store', credentials: 'include' }),
        ]);
        const vacJson = await vacRes.json();
        const testJson = await testRes.json();
        if (!active) return;
        if (!vacRes.ok || !vacJson?.ok) throw new Error(vacJson?.error || 'Falha ao carregar vaga.');
        if (!testRes.ok || !testJson?.ok) throw new Error(testJson?.error || 'Falha ao carregar testes.');
        const v = vacJson.vacancy;
        setVacancy({
          id: String(v.id),
          title: String(v.title || ''),
          description: String(v.description || ''),
          location: String(v.location || ''),
          closingDate: v.closing_date ? new Date(String(v.closing_date)) : null,
          postedDate: v.created_at ? new Date(String(v.created_at)) : new Date(),
          company: String(v.company || ''),
          recruiterId: String(v.recruiter_id || ''),
          status: String(v.status || 'Ativo') as any,
          employmentType: String(v.employment_type || '') as any,
          salaryRange: v.salary_range ?? null,
          requirements: Array.isArray(v.requirements) ? v.requirements : [],
          responsibilities: Array.isArray(v.responsibilities) ? v.responsibilities : [],
          benefits: Array.isArray(v.benefits) ? v.benefits : [],
          category: String(v.category || ''),
        } as Vacancy);
        setTests((Array.isArray(testJson.tests) ? testJson.tests : []).map((t: any) => ({
          id: String(t.id),
          jobId: String(t.vacancyId || vacancyId),
          title: String(t.title || ''),
          questions: Array.isArray(t.questions) ? t.questions : [],
        } as AssessmentTest)));
      } catch (e: any) {
        if (!active) return;
        setVacancy(null);
        setTests([]);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [vacancyId]);
  
  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
        const res = await fetch(`/api/recruiter/assessments/${testToDelete.id}`, { method: 'DELETE', credentials: 'include' });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao excluir teste.');
        setTests(prev => prev.filter(t => t.id !== testToDelete.id));
        toast({ title: "Teste Excluído", description: "O teste de avaliação foi removido."});
    } catch(e) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível excluir o teste."});
    } finally {
        setTestToDelete(null);
    }
  };


  if (isLoading) {
    return <div className="container mx-auto p-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!vacancy) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar à Vaga
        </Button>

         <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline text-3xl">Testes de Avaliação</CardTitle>
                        <CardDescription>Gerencie os testes para a vaga: <strong className='text-foreground'>{vacancy.title}</strong></CardDescription>
                    </div>
                    <Button asChild>
                        <Link href={`/dashboard/recruiter/vacancies/${vacancyId}/assessment/new`}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Criar Novo Teste
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {tests.length === 0 ? (
                    <Alert>
                        <ClipboardCheck className="h-4 w-4" />
                        <AlertTitle>Nenhum teste criado</AlertTitle>
                        <AlertDescription>
                            Ainda não criou nenhum teste para esta vaga. Clique em "Criar Novo Teste" para começar.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        {tests.map(test => (
                            <Card key={test.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold">{test.title}</h4>
                                    <p className="text-sm text-muted-foreground">{test.questions.length} perguntas</p>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm" disabled>
                                        <Users className="mr-2 h-4 w-4" /> Ver Submissões
                                    </Button>
                                    <Button variant="outline" size="sm" disabled>
                                        <BarChart className="mr-2 h-4 w-4" /> Ver Estatísticas
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setTestToDelete(test)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Esta ação irá excluir permanentemente o teste <strong className='text-foreground'>{testToDelete?.title}</strong> e todos os seus dados associados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setTestToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTest} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
