'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, FileWarning, PlusCircle, ArrowLeft, ArrowRight, ClipboardCheck, Users, ThumbsUp, Eye, Copy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/lib/auth/use-user';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// Importando os novos serviços do Supabase
import { getRecruiterVacancies, getVacancies, deleteVacancy, type Vacancy } from '@/lib/supabase/vacancy-service';
import { getApplicationsByVacancy, type Application } from '@/lib/supabase/application-service';


const VACANCIES_PER_PAGE = 10;

export default function RecruiterVacanciesPage() {
  const { user } = useUser();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        let jobsToUse: Vacancy[] = [];

        const recruiterId = authUserId || user?.id || null;

        if (recruiterId) {
          // Vagas do recrutador, apenas ativas (não expiradas)
          jobsToUse = await getRecruiterVacancies(recruiterId, false);
        }

        if (!recruiterId || jobsToUse.length === 0) {
          // Fallback: listar vagas abertas (ativas) no Supabase
          jobsToUse = await getVacancies(false);
          if (recruiterId) {
            toast({
              title: 'Mostrando vagas abertas',
              description: 'Nenhuma vaga encontrada para o seu perfil. Exibindo vagas ativas.',
            });
          }
        }

        setVacancies(jobsToUse);

        // Buscar candidaturas relacionadas ao conjunto de vagas apresentado
        const allApplications: Application[] = [];
        for (const job of jobsToUse) {
          const jobApplications = await getApplicationsByVacancy(job.id);
          allApplications.push(...jobApplications);
        }
        setApplications(allApplications);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [authUserId, user]);

  const handleDelete = async (vacancyId: string) => {
    if (!confirm('Tem a certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteVacancy(vacancyId);
      
      // Atualizar a lista de vagas após a exclusão
      if (authUserId) {
        const updatedJobs = await getRecruiterVacancies(authUserId, true);
        setVacancies(updatedJobs);
      }
      
      toast({
        title: 'Vaga Excluída!',
        description: 'A sua vaga foi removida com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      toast({
        title: 'Erro!',
        description: 'Não foi possível excluir a vaga. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(vacancies.length / VACANCIES_PER_PAGE);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * VACANCIES_PER_PAGE;
    const endIndex = startIndex + VACANCIES_PER_PAGE;
    return vacancies.slice(startIndex, endIndex);
  }, [vacancies, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getApplicationCounts = (vacancyId: string) => {
    const relevantApps = applications.filter(app => app.job_posting_id === vacancyId);
    const total = relevantApps.length;
    const interesting = relevantApps.filter(app => ['Triagem', 'Teste', 'Entrevista', 'Oferta', 'Contratado'].includes(app.status)).length;
    return { total, interesting };
  }


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-1 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Vagas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as suas vagas. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      );
    }

    if (!paginatedJobs || paginatedJobs.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma vaga publicada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece por publicar uma nova vaga para atrair talentos.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/recruiter/vacancies/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Publicar Nova Vaga
            </Link>
          </Button>
        </div>
      );
    }

    return (
        <>
            <TooltipProvider>
            <div className="space-y-6">
                {paginatedJobs.map(vacancy => {
                    const { total, interesting } = getApplicationCounts(vacancy.id);
                    return (
                        <Card key={vacancy.id}>
                            <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                <CardTitle>{vacancy.title}</CardTitle>
                                <CardDescription>{vacancy.location} &middot; {vacancy.category}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="gap-2" asChild>
                                               <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/applications`}>
                                                    <Users /> {total}
                                               </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{total} candidaturas recebidas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="gap-2 text-green-600" asChild>
                                               <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/applications`}>
                                                    <ThumbsUp /> {interesting}
                                               </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{interesting} candidatos interessantes/em processo</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Badge>{vacancy.type}</Badge>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{vacancy.description}</p>
                                <div className="flex gap-2 flex-wrap shrink-0">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/recruitment/${vacancy.id}`} target="_blank"><Eye className='mr-2 h-4 w-4'/>Ver Vaga</Link>
                                    </Button>
                                     <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/triage`}><Sparkles className='mr-2 h-4 w-4'/>Triagem com IA</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/edit`}>Editar</Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(vacancy.id)}>Excluir</Button>
                                    <Button variant="secondary" size="sm" asChild>
                                        <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/applications`}>Gerir Candidatos</Link>
                                    </Button>
                                    <Button variant="default" size="sm" asChild>
                                        <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/assessment/new`}>
                                            <ClipboardCheck className='mr-2 h-4 w-4' /> Criar Teste
                                        </Link>
                                    </Button>
                                     <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/assessment`}>Gerir Testes</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            </TooltipProvider>
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
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
      </Button>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold">Minhas Vagas Publicadas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as suas oportunidades de emprego e os candidatos.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/recruiter/vacancies/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publicar Nova Vaga
          </Link>
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}
