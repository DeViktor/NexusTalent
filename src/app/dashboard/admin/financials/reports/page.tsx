
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, Users, ArrowLeft, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const salesData = [
  { name: 'Jan', Receita: 4000 }, { name: 'Fev', Receita: 3000 },
  { name: 'Mar', Receita: 5000 }, { name: 'Abr', Receita: 4500 },
  { name: 'Mai', Receita: 6000 }, { name: 'Jun', Receita: 5500 },
];

const topCourses = [
    { name: 'Técnicas de Apresentação', sales: 120, revenue: '€12,000' },
    { name: 'Gestão de Projectos', sales: 98, revenue: '€19,600' },
    { name: 'Power BI Microsoft', sales: 85, revenue: '€14,875' },
    { name: 'Liderança e Motivação', sales: 70, revenue: '€10,500' },
];

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

    const handleExport = () => {
        toast({
            title: "Exportação Simulada",
            description: "O seu relatório financeiro seria descarregado como um ficheiro CSV.",
        });
    };

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
                <KpiCard title="Receita Total" value="€81,975" change="+20.1% em relação ao mês passado" icon={DollarSign} />
                <KpiCard title="Subscrições Ativas" value="+2,350" change="+180.1% em relação ao mês passado" icon={Users} />
                <KpiCard title="Vendas de Cursos" value="+1,234" change="+19% em relação ao mês passado" icon={ShoppingCart} />
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
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
