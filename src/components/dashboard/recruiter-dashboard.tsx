
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, FileText, PlusCircle, MessageSquare, ClipboardCheck, BarChart, TrendingUp, CheckCircle, Building, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { getJobs } from "@/lib/vacancy-service";
import type { JobPosting } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { users } from "@/lib/users";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", applications: 186, hired: 80 },
  { month: "Feb", applications: 305, hired: 200 },
  { month: "Mar", applications: 237, hired: 120 },
  { month: "Apr", applications: 73, hired: 190 },
  { month: "May", applications: 209, hired: 130 },
  { month: "Jun", applications: 214, hired: 140 },
]

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


function JobPostingList({ recruiterId }: { recruiterId: string }) {
    if (!recruiterId) {
        return <p className="text-sm text-muted-foreground">Utilizador recrutador não encontrado.</p>;
    }
    
    // Simplified data fetching
    const allJobs = getJobs();
    const testRecruiter = users.find(u => u.email === 'recruiter@nexustalent.com.br');
    const userJobs = allJobs.filter(v => v.recruiterId === testRecruiter?.id);

    return (
        <ul className="space-y-2 mb-4">
            {userJobs.length > 0 ? (
                userJobs.slice(0, 2).map(job => (
                    <li key={job.id} className="flex justify-between items-center text-sm p-2 bg-secondary rounded-md">
                        <span className="font-medium">{job.title}</span>
                    </li>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Ainda não publicou nenhum emprego.</p>
            )}
        </ul>
    );
}


export default function RecruiterDashboardPage() {
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null);
        });
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
                            <CardTitle className="text-sm font-medium">Empregos Ativos</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">+2 que no mês passado</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novas Candidaturas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+52</div>
                            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Contratações</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+5</div>
                            <p className="text-xs text-muted-foreground">neste trimestre</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Contratação</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12%</div>
                             <p className="text-xs text-muted-foreground">+3% que no trimestre passado</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Candidaturas vs. Contratações</CardTitle>
                             <CardDescription>Janeiro - Junho 2024</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="h-64">
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
                            Empregos Publicados
                        </CardTitle>
                        <CardDescription>Crie novos empregos e gerencie os existentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {userId && <JobPostingList recruiterId={userId} />}
                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/dashboard/recruiter/vacancies/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Publicar Novo Emprego
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/recruiter/vacancies">Gerir Empregos</Link>
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
                         <CardDescription>Use nossa ferramenta de IA para analisar a compatibilidade de um currículo com um emprego.</CardDescription>
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
                         <CardDescription>Crie e gira testes de conhecimento e psicotécnicos para os seus empregos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground mb-4">A IA gera testes relevantes para filtrar os melhores candidatos.</p>
                         <Button asChild variant="outline">
                            <Link href="/dashboard/recruiter/vacancies">
                                Gerir Testes por Emprego
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
