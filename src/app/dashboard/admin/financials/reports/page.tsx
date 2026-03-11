
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, ArrowLeft, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type ReportApiPayload = {
  currency: string;
  totalRevenueMinor: number;
  courseSalesCount: number;
  activeSubscriptionsCount: number;
  revenueByMonth: { name: string; revenueMinor: number }[];
  topCourses: { id: string; name: string; sales: number; revenueMinor: number }[];
};

const KpiCard = ({ title, value, change, icon: Icon }: { title: string, value: string, change: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{change}</p>
        </CardContent>
    </Card>
);

export default function SalesReportsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [data, setData] = useState<ReportApiPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleExport = () => {
        toast({
            title: "Exportação Simulada",
            description: "O seu relatório financeiro seria descarregado como um ficheiro CSV.",
        });
    };

    useEffect(() => {
      let active = true;
      (async () => {
        try {
          const res = await fetch('/api/admin/financials/reports?months=6', { cache: 'no-store' });
          const payload = await res.json();
          if (!active) return;
          if (!res.ok || !payload?.ok) {
            throw new Error(payload?.error || 'Falha ao carregar relatórios');
          }
          setData(payload.data as ReportApiPayload);
        } catch (e: any) {
          if (!active) return;
          toast({ variant: 'destructive', title: 'Erro ao carregar', description: e?.message || 'Não foi possível carregar relatórios.' });
          setData(null);
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [toast]);

    const money = useMemo(() => {
      const currency = (data?.currency || 'AOA').toUpperCase();
      return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, maximumFractionDigits: 0 });
    }, [data?.currency]);

    const totalRevenueLabel = data ? money.format((data.totalRevenueMinor || 0) / 100) : '—';

    const salesData = useMemo(() => {
      return (data?.revenueByMonth ?? []).map(p => ({ name: p.name, Receita: (p.revenueMinor || 0) / 100 }));
    }, [data?.revenueByMonth]);

    const topCourses = useMemo(() => {
      return (data?.topCourses ?? []).map(c => ({
        name: c.name,
        sales: c.sales,
        revenue: money.format((c.revenueMinor || 0) / 100),
      }));
    }, [data?.topCourses, money]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Painel
                </Button>
                 <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Relatório (CSV)
                </Button>
            </div>
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Relatórios de Vendas</h1>
                <p className="text-muted-foreground mt-2">
                    Analise o desempenho financeiro da plataforma.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {isLoading ? (
                  <>
                    <Skeleton className="h-[92px] w-full" />
                    <Skeleton className="h-[92px] w-full" />
                    <Skeleton className="h-[92px] w-full" />
                  </>
                ) : (
                  <>
                    <KpiCard title="Receita Total" value={totalRevenueLabel} change="Compras de cursos (Stripe)" icon={DollarSign} />
                    <KpiCard title="Subscrições Ativas" value={String(data?.activeSubscriptionsCount ?? 0)} change="Status active e período vigente" icon={Users} />
                    <KpiCard title="Vendas de Cursos" value={String(data?.courseSalesCount ?? 0)} change="Total de compras registradas" icon={ShoppingCart} />
                  </>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Receita Mensal</CardTitle>
                        <CardDescription>Visão geral da receita nos últimos 6 meses.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => money.format(Number(value))} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Cursos Mais Vendidos</CardTitle>
                        <CardDescription>Os cursos que mais geraram receita este trimestre.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Curso</TableHead>
                                        <TableHead className="text-center">Vendas</TableHead>
                                        <TableHead className="text-right">Receita</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topCourses.map((course) => (
                                    <TableRow key={course.name}>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell className="text-center"><Badge variant="secondary">{course.sales}</Badge></TableCell>
                                        <TableCell className="text-right font-bold">{course.revenue}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
