
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, User, Briefcase, GraduationCap, Settings, Files, BarChart, Mail, AreaChart, DollarSign, Repeat, FileDown, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GeneralReport } from "@/components/admin/general-report";
import { useState } from "react";


export default function AdminDashboardPage() {
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    const res = await fetch('/api/admin/report', { cache: 'no-store', credentials: 'include' });
    const json = await res.json();
    if (!res.ok || !json?.ok) return;
    setReportData(json.data);
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
                                <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                                    <DialogHeader>
                                        <DialogTitle>Relatório Geral da Plataforma</DialogTitle>
                                        <DialogDescription>
                                            Visão geral do estado atual da plataforma NexusTalent.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 min-h-0">
                                        {reportData && <GeneralReport data={reportData} />}
                                    </div>
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
                        <CardContent className="flex flex-col gap-2">
                            <Button asChild>
                                <Link href="/dashboard/settings">Gerir Conteúdo</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/settings/ai">Definições de IA</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
