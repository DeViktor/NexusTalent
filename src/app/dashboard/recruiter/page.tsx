
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, FileText, PlusCircle, MessageSquare, ClipboardCheck, BarChart, TrendingUp, CheckCircle, Building, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  applications: {
    label: "Candidaturas",
    color: "hsl(var(--chart-1))",
  },
  hired: {
    label: "Contratados",
    color: "hsl(var(--chart-2))",
  },
}

/*
function VacancyList({ recruiterId }: { recruiterId: string }) {
    if (!recruiterId) {
        return <p className="text-sm text-muted-foreground">Utilizador recrutador não encontrado.</p>;
    }
 
    // Simplified data fetching
    const allVacancies = getVacancies();
    const testRecruiter = users.find(u => u.email === 'recruiter@nexustalent.com.br');
    const userVacancies = allVacancies.filter(v => v.recruiterId === testRecruiter?.id);

    return (
        <ul className="space-y-2 mb-4">
            {userVacancies.length > 0 ? (
                userVacancies.slice(0, 2).map(vacancy => (
                    <li key={vacancy.id} className="flex justify-between items-center text-sm p-2 bg-secondary rounded-md">
                        <span className="font-medium">{vacancy.title}</span>
                    </li>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Ainda não publicou nenhuma vaga.</p>
            )}
        </ul>
    ); 
}*/


export default function RecruiterDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasMetrics, setHasMetrics] = useState(false);
    const [scope, setScope] = useState<'recruiter' | 'global'>('recruiter');
    const [kpis, setKpis] = useState({
        activeVacancies: 0,
        newApplications7d: 0,
        hiresThisQuarter: 0,
        hireRate: 0,
    });
    const [chartData, setChartData] = useState<{ month: string; applications: number; hired: number }[]>([]);
    const [chartRangeLabel, setChartRangeLabel] = useState<string>("—");

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setIsLoading(true);
                setHasMetrics(false);
                const res = await fetch('/api/recruiter/metrics', { credentials: 'include', cache: 'no-store' });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar métricas.');
                if (!active) return;
                setScope(json.scope);
                setChartRangeLabel(json.chart?.rangeLabel || '—');
                setChartData(Array.isArray(json.chart?.data) ? json.chart.data : []);
                setKpis({
                    activeVacancies: Number(json.kpis?.activeVacancies || 0),
                    newApplications7d: Number(json.kpis?.newApplications7d || 0),
                    hiresThisQuarter: Number(json.kpis?.hiresThisQuarter || 0),
                    hireRate: Number(json.kpis?.hireRate || 0),
                });
                setHasMetrics(true);
            } catch {
                if (!active) return;
                setHasMetrics(false);
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Painel do Recrutador</h1>
                <p className="text-muted-foreground">Encontre os melhores talentos para a sua empresa.</p>
            </div>

             <div className="mb-8">
                <h2 className="font-headline text-2xl font-bold mb-4">Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading || !hasMetrics ? "—" : kpis.activeVacancies}</div>
                            <p className="text-xs text-muted-foreground">ativas (não expiradas)</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novas Candidaturas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading || !hasMetrics ? "—" : kpis.newApplications7d}</div>
                            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Contratações</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading || !hasMetrics ? "—" : kpis.hiresThisQuarter}</div>
                            <p className="text-xs text-muted-foreground">neste trimestre</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Contratação</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading || !hasMetrics ? "—" : `${kpis.hireRate}%`}</div>
                             <p className="text-xs text-muted-foreground">neste trimestre</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Candidaturas vs. Contratações</CardTitle>
                             <CardDescription>{chartRangeLabel}{scope === 'global' ? ' · visão geral' : ''}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto justify-start">
                                <RechartsBarChart accessibilityLayer data={chartData}>
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="applications" fill="var(--color-applications)" radius={4} />
                                    <Bar dataKey="hired" fill="var(--color-hired)" radius={4} />
                                </RechartsBarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase />
                            Vagas Publicadas
                        </CardTitle>
                        <CardDescription>Crie novas vagas e gerencie as existentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/dashboard/recruiter/vacancies/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Publicar Nova Vaga
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/recruiter/vacancies">Gerir Vagas</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users />
                            Candidatos
                        </CardTitle>
                         <CardDescription>Pesquise perfis no nosso banco de talentos e encontre o candidato ideal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground mb-4">Filtre por competências, experiência e mais.</p>
                         <Button asChild variant="outline">
                            <Link href="/dashboard/recruiter/candidates">Pesquisar CVs</Link>
                         </Button>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare />
                            Conversas
                        </CardTitle>
                         <CardDescription>Veja e responda às suas mensagens com os candidatos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground mb-4">Centralize a sua comunicação.</p>
                         <Button asChild>
                            <Link href="/dashboard/recruiter/conversations">Ver Conversas</Link>
                         </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText />
                            Analisador de Currículos com IA
                        </CardTitle>
                         <CardDescription>Use nossa ferramenta de IA para analisar a compatibilidade de um currículo com uma vaga.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground mb-4">Acelere seu processo de triagem.</p>
                         <Button asChild>
                            <Link href="/dashboard/recruiter/analyzer">
                                Ir para o Analisador
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck />
                            Testes de Avaliação
                        </CardTitle>
                         <CardDescription>Crie e gira testes de conhecimento e psicotécnicos para as suas vagas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground mb-4">A IA gera testes relevantes para filtrar os melhores candidatos.</p>
                         <Button asChild variant="outline">
                            <Link href="/dashboard/recruiter/vacancies">
                                Gerir Testes por Vaga
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building />
                            Perfil da Empresa
                        </CardTitle>
                         <CardDescription>Gerencie as informações públicas da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/dashboard/recruiter/company-profile">
                                Editar Perfil
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus />
                            Gerir Equipa
                        </CardTitle>
                         <CardDescription>Adicione e gira os utilizadores da sua equipa de recrutamento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/dashboard/recruiter/users">
                                Gerir Utilizadores
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
