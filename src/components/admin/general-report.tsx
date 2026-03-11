'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Button } from "../ui/button";
import { FileDown, Users, BookOpen, Briefcase, TrendingUp, Star, Percent, Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { addDays, format } from "date-fns";
import { pt } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";

interface ReportData {
    totalCourses?: number;
    totalVacancies?: number;
    totalUsers?: number;
    coursesByCategory?: { name: string, total: number }[];
    vacanciesByLocation?: { name: string, total: number }[];
    weeklyEngagement?: { day: string, users: number }[];
    recruitmentFunnel?: { stage: string, count: number }[];
    lmsKpis?: {
        completionRate: number;
        averageRating: number;
        firstAttemptSuccessRate: number;
    };
    atsKpis?: {
        applicationsPerVacancy: number;
        timeToHire: number;
        profileCompletionRate: number;
    };
    // Instructor specific data
    instructorKpis?: {
        activeStudents: number;
        publishedCourses: number;
        avgCompletionRate: number;
        avgRating: number;
    };
    studentEngagementByCourse?: { name: string; engaged: number }[];
}

interface GeneralReportProps {
    data: ReportData;
    reportType?: 'all' | 'courses' | 'vacancies' | 'instructor';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Icon size={14}/> {title}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
        </CardContent>
    </Card>
);

export function GeneralReport({ data, reportType = 'all' }: GeneralReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -29),
        to: new Date(),
    });

    const handleExportPDF = () => {
        const input = reportRef.current;
        if (input) {
            const originalBg = input.style.backgroundColor;
            input.style.backgroundColor = 'white'; // Ensure background is white for canvas

            html2canvas(input, { 
                scale: 2,
                useCORS: true,
                onclone: (document) => {
                    // This is needed to ensure tailwind dark mode classes are not applied
                    document.documentElement.classList.remove('dark');
                }
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = pdfWidth / imgWidth;
                const finalHeight = imgHeight * ratio;

                let heightLeft = finalHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = heightLeft - finalHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save(`relatorio_nexustalent_${new Date().toLocaleDateString('pt-PT')}.pdf`);
                
                input.style.backgroundColor = originalBg; // Restore original background
            });
        }
    };
    
    return (
        <div className="flex flex-col h-full">
             <ScrollArea className="flex-grow min-h-0">
                <div id="report-content" ref={reportRef} className="p-6 bg-white text-black">
                    <div className="space-y-10">
                        <div className="text-center mb-8">
                            <h1 className="font-headline text-3xl font-bold">Relatório de Desempenho</h1>
                             <div className="flex items-center justify-center gap-2 mt-2">
                                <p className="text-gray-500">Período:</p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                        date.to ? (
                                            <>
                                            {format(date.from, "LLL dd, y", { locale: pt })} -{" "}
                                            {format(date.to, "LLL dd, y", { locale: pt })}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y", { locale: pt })
                                        )
                                        ) : (
                                        <span>Escolha um período</span>
                                        )}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="center">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        locale={pt}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {reportType === 'all' && data.totalUsers && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <KpiCard title="Utilizadores Totais" value={data.totalUsers.toString()} icon={Users} />
                                <KpiCard title="Cursos Ativos" value={data.totalCourses!.toString()} icon={BookOpen} />
                                <KpiCard title="Vagas Ativas" value={data.totalVacancies!.toString()} icon={Briefcase} />
                            </div>
                        )}

                        {reportType === 'instructor' && data.instructorKpis && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <KpiCard title="Alunos Ativos" value={data.instructorKpis.activeStudents.toString()} icon={Users} />
                                <KpiCard title="Cursos Publicados" value={data.instructorKpis.publishedCourses.toString()} icon={BookOpen} />
                                <KpiCard title="Taxa de Conclusão Média" value={`${data.instructorKpis.avgCompletionRate}%`} icon={Percent} />
                                <KpiCard title="Avaliação Média" value={`${data.instructorKpis.avgRating.toFixed(1)} / 5.0`} icon={Star} />
                            </div>
                        )}
                        
                        {reportType === 'instructor' && data.studentEngagementByCourse && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Engajamento de Alunos por Curso</CardTitle>
                                </CardHeader>
                                <CardContent className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.studentEngagementByCourse}>
                                            <XAxis dataKey="name" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="engaged" name="Alunos Engajados" fill="#1d71b8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}


                        {reportType === 'vacancies' && (data.totalVacancies || data.vacanciesByLocation) && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <KpiCard
                                        title="Total de Vagas"
                                        value={(data.totalVacancies ?? 0).toString()}
                                        icon={Briefcase}
                                    />
                                    {data.vacanciesByLocation && (
                                        <KpiCard
                                            title="Locais com Vagas"
                                            value={data.vacanciesByLocation.length.toString()}
                                            icon={TrendingUp}
                                        />
                                    )}
                                </div>
                                {data.vacanciesByLocation && data.vacanciesByLocation.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Vagas por Localização</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.vacanciesByLocation}>
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="total" name="Vagas" fill="#1d71b8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {reportType === 'all' && data.lmsKpis && (
                            <div className="space-y-6">
                                <h2 className="font-headline text-2xl font-bold border-b pb-2">Engajamento & Qualidade (LMS)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <KpiCard title="Taxa de Conclusão de Curso" value={`${data.lmsKpis.completionRate}%`} icon={Percent} />
                                    <KpiCard title="Avaliação Média dos Cursos" value={`${data.lmsKpis.averageRating.toFixed(1)} / 5.0`} icon={Star} />
                                    <KpiCard title="Sucesso na 1ª Tentativa" value={`${data.lmsKpis.firstAttemptSuccessRate}%`} icon={CheckCircle} />
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Engajamento Semanal (Utilizadores Ativos)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.weeklyEngagement} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Line type="monotone" dataKey="users" name="Utilizadores Ativos" stroke="#1d71b8" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
             </ScrollArea>
             <div className="p-4 border-t bg-background flex justify-end">
                <Button onClick={handleExportPDF}>
                    <FileDown className="mr-2 h-4 w-4" /> Exportar para PDF
                </Button>
            </div>
        </div>
    );
}
