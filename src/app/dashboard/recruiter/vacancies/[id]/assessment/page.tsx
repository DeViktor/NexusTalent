'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, ClipboardCheck, Users, BarChart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVacancyById } from '@/lib/vacancy-service';
import { getTestsForVacancy, deleteTest } from '@/lib/test-service';
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
    if (vacancyId) {
      const foundVacancy = getVacancyById(vacancyId);
      const foundTests = getTestsForVacancy(vacancyId);
      setVacancy(foundVacancy);
      setTests(foundTests);
      setIsLoading(false);
    }
  }, [vacancyId]);
  
  const handleDeleteTest = () => {
    if (!testToDelete) return;
    try {
        deleteTest(testToDelete.id);
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
