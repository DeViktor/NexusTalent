
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, FileWarning, PlusCircle, ArrowLeft, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getVacancies, deleteVacancy, type Vacancy as VacancyRow } from '@/lib/supabase/vacancy-service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GeneralReport } from "@/components/admin/general-report";

export default function ManageVacanciesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [vacancies, setVacancies] = useState<VacancyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchVacancies = async () => {
      setIsLoading(true);
      try {
        const allVacancies = await getVacancies(true);
        setVacancies(allVacancies || []);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('Falha ao carregar vagas'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const handleDelete = async (vacancyId: string) => {
    if (!confirm('Tem a certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.')) return;

    try {
        await deleteVacancy(vacancyId);
        setVacancies(prev => prev.filter(v => String(v.id) !== String(vacancyId)));
        toast({
            title: 'Vaga Excluída!',
            description: 'A vaga foi removida com sucesso.',
        });
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Erro ao Excluir',
            description: 'Não foi possível excluir a vaga.',
        });
    }
  }

  const handleExportXLS = () => {
    toast({
      title: 'Relatório Gerado (Simulação)',
      description: 'O seu relatório de vagas em formato XLS foi descarregado.',
    });
  };

  const handleGenerateReport = () => {
    const vacancyData = vacancies.reduce((acc, vacancy) => {
        const location = vacancy.location;
        const existing = acc.find(item => item.name === location);
        if (existing) {
            existing.total++;
        } else {
            acc.push({ name: location, total: 1 });
        }
        return acc;
    }, [] as { name: string, total: number }[]);

    setReportData({
      totalVacancies: vacancies.length,
      vacanciesByLocation: vacancyData,
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
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
            Não foi possível carregar os dados das vagas.
          </AlertDescription>
        </Alert>
      );
    }

    if (!vacancies || vacancies.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma vaga encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece por adicionar uma nova vaga de emprego.
          </p>
          <Button asChild className='mt-4'>
            <Link href="/dashboard/vacancies/new"><PlusCircle className='mr-2 h-4 w-4' />Adicionar Vaga</Link>
          </Button>
        </div>
      );
    }
    
    return (
        <div className="space-y-6">
            {vacancies.map(vacancy => (
                <Card key={vacancy.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{vacancy.title}</CardTitle>
                                <CardDescription>{vacancy.location} &middot; {vacancy.category}</CardDescription>
                            </div>
                            <Badge>{((vacancy.job_type || '').toLowerCase().includes('part')) ? 'Part-time' : ((vacancy.job_type || '').toLowerCase().includes('remote')) ? 'Remote' : 'Full-time'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{vacancy.description}</p>
                        <div className='mt-4 flex gap-2'>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/recruiter/vacancies/${vacancy.id}/edit`}>Editar</Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(vacancy.id)}>Excluir</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex-grow">
                <h1 className="font-headline text-4xl font-bold">Gestão de Vagas</h1>
                <p className="text-muted-foreground mt-2">
                Publique e administre as oportunidades de emprego.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportXLS}>
                    <FileDown className="mr-2 h-4 w-4"/> Exportar (XLS)
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default" onClick={handleGenerateReport}>Gerar Relatório PDF</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Relatório de Vagas</DialogTitle>
                            <DialogDescription>
                                Visão geral das vagas na plataforma.
                            </DialogDescription>
                        </DialogHeader>
                        {reportData && <GeneralReport data={reportData} reportType="vacancies" />}
                    </DialogContent>
                </Dialog>
                <Button asChild>
                    <Link href="/dashboard/vacancies/new"><PlusCircle className='mr-2 h-4 w-4' />Publicar Nova Vaga</Link>
                </Button>
            </div>
        </div>
        {renderContent()}
    </div>
  );
}
