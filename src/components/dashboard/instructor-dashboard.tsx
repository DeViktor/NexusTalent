
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart3, MessageSquare, Library, AlertTriangle, MessageCircle, ListChecks, Mail, Award, User, Edit, FileUp, Calendar, Video, Link as LinkIcon, Download, Send, Percent, Star, FileDown, Activity, UserCheck, UserX, Loader2, Settings, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GeneralReport } from "@/components/admin/general-report";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { CourseStatus } from "@/lib/types";
import { getImages, type ImagePlaceholder } from '@/lib/site-data';
import Image from "next/image";


const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const chartConfig = {
  engaged: {
    label: "Alunos Engajados",
    color: "hsl(var(--chart-1))",
  },
}

const statusVariantMap: Record<CourseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Ativo': 'default',
  'Pendente': 'secondary',
  'Rejeitado': 'destructive',
  'Rascunho': 'outline',
};

export function InstructorDashboard() {
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [kpis, setKpis] = useState<{ activeStudents: number; publishedCourses: number; pendingCourses: number; avgCompletionRate: number | null; avgRating: number | null }>({
        activeStudents: 0,
        publishedCourses: 0,
        pendingCourses: 0,
        avgCompletionRate: null,
        avgRating: null,
    });
    const [managedCourses, setManagedCourses] = useState<Array<{ id: string; name: string; status: CourseStatus; imageId?: string | null; imageDataUri?: string | null }>>([]);
    const [courseSummary, setCourseSummary] = useState<Array<{ courseId: string; students: number; averageGrade: number | null; engagement: number }>>([]);
    const [engagementByCourse, setEngagementByCourse] = useState<Array<{ name: string; engaged: number }>>([]);
    const [activity, setActivity] = useState<Array<{ id: string; type: string; text: string; time: string }>>([]);
    const [topStudents, setTopStudents] = useState<Array<{ id: string; name: string; course: string; grade: number }>>([]);
    const [atRiskStudents, setAtRiskStudents] = useState<Array<{ id: string; name: string; course: string; engagement: string }>>([]);
    const [allImages, setAllImages] = useState<ImagePlaceholder[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/instructor/dashboard', { cache: 'no-store', credentials: 'include' });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar painel.');
                if (!active) return;
                setKpis({
                    activeStudents: Number(json.kpis?.activeStudents || 0),
                    publishedCourses: Number(json.kpis?.publishedCourses || 0),
                    pendingCourses: Number(json.kpis?.pendingCourses || 0),
                    avgCompletionRate: json.kpis?.avgCompletionRate !== null && json.kpis?.avgCompletionRate !== undefined ? Number(json.kpis.avgCompletionRate) : null,
                    avgRating: json.kpis?.avgRating !== null && json.kpis?.avgRating !== undefined ? Number(json.kpis.avgRating) : null,
                });
                setManagedCourses(Array.isArray(json.managedCourses) ? json.managedCourses : []);
                setCourseSummary(Array.isArray(json.courseSummary) ? json.courseSummary : []);
                setEngagementByCourse(Array.isArray(json.engagementByCourse) ? json.engagementByCourse : []);
                setActivity(Array.isArray(json.activity) ? json.activity : []);
                setTopStudents(Array.isArray(json.topStudents) ? json.topStudents : []);
                setAtRiskStudents(Array.isArray(json.atRiskStudents) ? json.atRiskStudents : []);
            } catch (e: any) {
                if (!active) return;
                toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao carregar painel.' });
                setKpis({ activeStudents: 0, publishedCourses: 0, pendingCourses: 0, avgCompletionRate: null, avgRating: null });
                setManagedCourses([]);
                setCourseSummary([]);
                setEngagementByCourse([]);
                setActivity([]);
                setTopStudents([]);
                setAtRiskStudents([]);
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false };
    }, []);

    const handleGenerateReport = () => {
        setReportData({
            instructorKpis: {
                activeStudents: kpis.activeStudents,
                publishedCourses: kpis.publishedCourses,
                avgCompletionRate: kpis.avgCompletionRate ?? 0,
                avgRating: kpis.avgRating ?? 0,
            },
            studentEngagementByCourse: engagementByCourse,
        });
    }
    
    const activityIcon = (type: string) => {
        switch (type) {
            case 'enrollment': return <UserCheck className="h-4 w-4 text-blue-500" />;
            case 'progress': return <Activity className="h-4 w-4 text-green-500" />;
            case 'grade': return <Award className="h-4 w-4 text-orange-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    }
    
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const images = await getImages();
                if (active) setAllImages(images);
            } catch {
                if (active) setAllImages([]);
            }
        })();
        return () => { active = false; };
    }, []);
    const summaryById = new Map(courseSummary.map((c) => [c.courseId, c]));


    return (
        <div>
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Painel do Formador</h1>
                <p className="text-muted-foreground">Crie, gira e avalie os seus cursos e formandos de forma eficiente.</p>
            </div>

            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Alunos Ativos" value={isLoading ? '—' : String(kpis.activeStudents)} icon={Users} />
                    <KpiCard title="Cursos Publicados" value={isLoading ? '—' : String(kpis.publishedCourses)} icon={BookOpen} />
                    <KpiCard title="Cursos Pendentes" value={isLoading ? '—' : String(kpis.pendingCourses)} icon={Activity} />
                    <KpiCard title="Avaliação Média" value={isLoading ? '—' : (kpis.avgRating === null ? '—' : String(kpis.avgRating))} icon={Star} />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Engajamento dos Alunos por Curso</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-64">
                                    <BarChart accessibilityLayer data={engagementByCourse}>
                                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} interval={0} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="engaged" fill="var(--color-engaged)" radius={4} name="Engajamento"/>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen />
                                        Meus Cursos
                                    </CardTitle>
                                    <Button asChild>
                                        <Link href="/dashboard/courses/new">Criar Novo Curso</Link>
                                    </Button>
                                </div>
                                <CardDescription>Crie novos cursos e gira o conteúdo e as turmas dos existentes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {managedCourses.map(course => {
                                        const image = allImages.find(p => p.id === course.imageId);
                                        const imageSrc = course.imageDataUri || image?.imageUrl;
                                        const s = summaryById.get(course.id);

                                        return (
                                            <Card key={course.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/50 transition-colors">
                                                <div className="flex-grow flex items-center gap-4">
                                                    {imageSrc && (
                                                        <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                            <Image src={imageSrc} alt={course.name} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-semibold">{course.name} <Badge variant={statusVariantMap[course.status]}>{course.status}</Badge></h4>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                            <span className="flex items-center gap-1"><Users size={14} /> {s?.students ?? 0} alunos</span>
                                                            {s?.averageGrade !== null && s?.averageGrade !== undefined && <span className="flex items-center gap-1"><Award size={14} /> Média de {s.averageGrade}%</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                                    <Button asChild variant="secondary">
                                                         <Link href={`/dashboard/instructor/courses/${course.id}`}>Gerir Curso</Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity />
                                    Atividade Recente
                                </CardTitle>
                                <CardDescription>Últimas ações nos seus cursos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activity.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">Sem atividade recente.</div>
                                    ) : activity.map(item => (
                                        <div key={item.id} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">{activityIcon(item.type)}</div>
                                            <div>
                                                <p className="text-sm">{item.text}</p>
                                                <p className="text-xs text-muted-foreground">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users />
                                    Alunos em Destaque
                                </CardTitle>
                                <CardDescription>Acompanhe o desempenho dos seus formandos.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><UserCheck className="text-green-500" /> Melhor Desempenho</h4>
                                    <div className="space-y-2">
                                        {topStudents.length === 0 ? (
                                            <div className="text-xs text-muted-foreground">Sem dados suficientes.</div>
                                        ) : topStudents.map(student => (
                                            <div key={student.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-secondary">
                                                <span>{student.name}</span>
                                                <span className="font-bold">{student.grade}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-4"/>
                                 <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><UserX className="text-red-500" /> Em Risco</h4>
                                    <div className="space-y-2">
                                        {atRiskStudents.length === 0 ? (
                                            <div className="text-xs text-muted-foreground">Sem alunos em risco.</div>
                                        ) : atRiskStudents.map(student => (
                                            <div key={student.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-secondary">
                                                <span>{student.name}</span>
                                                <Badge variant="destructive">{student.engagement}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 />
                                    Relatórios e Análises
                                </CardTitle>
                                <CardDescription>Obtenha uma visão detalhada do desempenho.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">Exporte relatórios completos em PDF.</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="default" onClick={handleGenerateReport}>
                                            <FileDown className="mr-2 h-4 w-4" /> Gerar Relatório
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                                        <DialogHeader>
                                            <DialogTitle>Relatório de Desempenho do Formador</DialogTitle>
                                            <DialogDescription>
                                                Visão geral da sua atividade na plataforma NexusTalent.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex-1 min-h-0">
                                            {reportData && <GeneralReport data={reportData} reportType="instructor" />}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
