
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, User, Briefcase, GraduationCap, Settings, Files, BarChart, Mail, AreaChart, DollarSign, Repeat, FileDown, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GeneralReport } from "@/components/admin/general-report";
import { supabase } from "@/lib/supabase/client";
import { getVacancies } from "@/lib/supabase/vacancy-service";
import { useState } from "react";


export default function AdminDashboardPage() {
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    // Buscar cursos do Supabase
    const { data: courseRows } = await supabase.from('courses').select('*');
    const courses = (courseRows || []).map((row: any) => ({
      id: String(row.id ?? row.code ?? crypto.randomUUID()),
      name: row.name ?? row.title ?? 'Curso',
      category: row.category ?? 'geral',
    }));

    // Derivar categorias a partir dos cursos (remove dependência de mocks)
    const categorySet = new Set<string>(courses.map((c: any) => c.category));
    const courseData = Array.from(categorySet).map(name => ({
      name,
      total: courses.filter((c: any) => c.category === name).length,
    })).filter(c => c.total > 0);

    // Buscar vagas do Supabase
    const vacancies = await getVacancies(true);
    const vacancyData = (vacancies || []).reduce((acc, vacancy) => {
      const location = vacancy.location;
      const existing = acc.find(item => item.name === location);
      if (existing) {
        existing.total++;
      } else {
        acc.push({ name: location, total: 1 });
      }
      return acc;
    }, [] as { name: string, total: number }[]);

    // Total de usuários do Supabase
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

    // Mock data for new charts and KPIs
    const weeklyEngagementData = [
      { day: 'Seg', users: 120 },
      { day: 'Ter', users: 150 },
      { day: 'Qua', users: 170 },
      { day: 'Qui', users: 140 },
      { day: 'Sex', users: 200 },
      { day: 'Sáb', users: 90 },
      { day: 'Dom', users: 70 },
    ];

    const recruitmentFunnelData = [
        { stage: 'Candidaturas', count: 1200 },
        { stage: 'Triagem', count: 400 },
        { stage: 'Entrevista', count: 150 },
        { stage: 'Oferta', count: 50 },
        { stage: 'Contratado', count: 25 },
    ];

    setReportData({
      totalCourses: courses.length,
      totalVacancies: vacancies.length,
      totalUsers: totalUsers || 0,
      coursesByCategory: courseData,
      vacanciesByLocation: vacancyData,
      weeklyEngagement: weeklyEngagementData,
      recruitmentFunnel: recruitmentFunnelData,
      lmsKpis: {
        completionRate: 78,
        averageRating: 4.6,
        firstAttemptSuccessRate: 85,
      },
      atsKpis: {
        applicationsPerVacancy: 45.2,
        timeToHire: 28,
        profileCompletionRate: 65,
      }
    });
  }

  return (
    <div>
        <div className="flex items-center gap-4 mb-8">
            <User className="w-10 h-10 text-primary" />
            <div>
            <h1 className="font-headline text-4xl font-bold">Painel do Administrador</h1>
            <p className="text-muted-foreground">Gestão total da plataforma NexusTalent.</p>
            </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 grid gap-8 auto-rows-min">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap />
                                Gestão de Cursos
                            </CardTitle>
                            <CardDescription>Adicione, edite e organize todos os cursos da plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/dashboard/courses/new">Adicionar Curso</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/admin/courses">Gerir Cursos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck />
                                Aprovações de Cursos
                            </CardTitle>
                            <CardDescription>Reveja e aprove os cursos submetidos pelos formadores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button asChild>
                                <Link href="/dashboard/admin/approvals">Gerir Aprovações</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase />
                                Gestão de Vagas
                            </CardTitle>
                            <CardDescription>Publique e administre as oportunidades de emprego.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/dashboard/recruiter/vacancies/new">Adicionar Vaga</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/admin/vacancies">Gerir Vagas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Files />
                                Gestão de Candidaturas
                            </CardTitle>
                            <CardDescription>Visualize e gerencie todos os candidatos às vagas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/dashboard/admin/applications">Gerir Candidaturas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User />
                                Gestão de Usuários
                            </CardTitle>
                            <CardDescription>Gerencie todos os usuários, papéis e permissões.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/admin/users">Gerir Usuários</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail />
                                E-mail Marketing
                            </CardTitle>
                            <CardDescription>Crie e envie campanhas de e-mail com IA.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/dashboard/admin/campaigns">Gerir Campanhas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign />
                                Financeiro e Vendas
                            </CardTitle>
                            <CardDescription>Gira subscrições, veja relatórios de vendas e integre com a contabilidade.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button asChild variant="outline">
                                <Link href="/dashboard/admin/financials/reports"><BarChart className="mr-2 h-4 w-4" />Relatórios de Vendas</Link>
                            </Button>
                             <Button asChild variant="outline">
                                <Link href="/dashboard/admin/financials/subscriptions"><Repeat className="mr-2 h-4 w-4" />Gerir Subscrições</Link>
                            </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart />
                                Relatórios Gerais
                            </CardTitle>
                            <CardDescription>Visão geral do desempenho da plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="default" onClick={handleGenerateReport}>
                                        Gerar Relatório
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh]">
                                    <DialogHeader>
                                        <DialogTitle>Relatório Geral da Plataforma</DialogTitle>
                                        <DialogDescription>
                                            Visão geral do estado atual da plataforma NexusTalent.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {reportData && <GeneralReport data={reportData} />}
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings />
                                Configurações do Site
                            </CardTitle>
                            <CardDescription>Edite o conteúdo estático do site, como parceiros e estatísticas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/dashboard/settings">Gerir Conteúdo</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
