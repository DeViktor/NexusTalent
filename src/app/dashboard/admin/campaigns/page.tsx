'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Percent, MousePointerClick, Eye, BarChart, Loader2, FileDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid, Legend } from 'recharts';
import { users as allUsers } from '@/lib/users';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extend jsPDF interface
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Mock data
const mockCampaigns = [
    {
        id: 'camp1',
        subject: '🚀 Novo Curso de Liderança Disponível!',
        sentDate: new Date(2024, 6, 28),
        recipients: 1250,
        openRate: 28.5,
        clickRate: 4.2
    },
    {
        id: 'camp2',
        subject: 'Vaga Urgente: Desenvolvedor Frontend Sênior',
        sentDate: new Date(2024, 7, 1),
        recipients: 320,
        openRate: 45.2,
        clickRate: 12.8
    },
    {
        id: 'camp3',
        subject: 'Não perca as nossas promoções de Verão!',
        sentDate: new Date(2024, 7, 5),
        recipients: 2500,
        openRate: 19.8,
        clickRate: 2.1
    }
];

// Mock detailed activity
const mockActivity = allUsers.slice(0, 30).map((user, index) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    action: index % 4 === 0 ? 'Clique' : 'Abertura',
    timestamp: new Date(Date.now() - (index * 1000 * 60 * 45))
}));


const ReportDialog = ({ campaign }: { campaign: typeof mockCampaigns[0] }) => {
    const reportData = [
        { name: 'Aberturas', value: campaign.openRate, fill: 'hsl(var(--chart-1))' },
        { name: 'Cliques', value: campaign.clickRate, fill: 'hsl(var(--chart-2))' },
    ];
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Relatório da Campanha: ${campaign.subject}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Enviada em: ${format(campaign.sentDate, "d MMM, yyyy", { locale: pt })}`, 14, 30);
        
        const tableColumn = ["Nome", "Email", "Ação", "Data"];
        const tableRows: any[][] = [];

        mockActivity.forEach(activity => {
            const activityData = [
                activity.name,
                activity.email,
                activity.action,
                format(activity.timestamp, "d MMM, yyyy HH:mm", { locale: pt }),
            ];
            tableRows.push(activityData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`relatorio_${campaign.id}.pdf`);
    };

    return (
        <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
                <DialogTitle>Relatório da Campanha</DialogTitle>
                <DialogDescription>{campaign.subject}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col h-full overflow-hidden">
                <Tabs defaultValue="overview" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className='shrink-0'>
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="activity">Atividade dos Destinatários</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4 flex-grow">
                        <div className="grid md:grid-cols-2 gap-6 h-full">
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-sm text-muted-foreground">Destinatários</p><p className="text-2xl font-bold">{campaign.recipients}</p></div>
                                    <div><p className="text-sm text-muted-foreground">Taxa de Abertura</p><p className="text-2xl font-bold text-blue-600">{campaign.openRate}%</p></div>
                                    <div><p className="text-sm text-muted-foreground">Taxa de Cliques</p><p className="text-2xl font-bold text-green-600">{campaign.clickRate}%</p></div>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart data={reportData} layout="vertical" barSize={30}>
                                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                            <YAxis type="category" dataKey="name" width={80} />
                                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => `${value}%`} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="var(--color-fill, #8884d8)" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className='bg-muted/50 p-4 rounded-lg'>
                                <h4 className='font-semibold'>Estatísticas Adicionais</h4>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="activity" className="mt-4 flex-grow overflow-y-auto">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockActivity.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell>{activity.name}</TableCell>
                                        <TableCell>{activity.email}</TableCell>
                                        <TableCell><Badge variant={activity.action === 'Clique' ? 'default' : 'secondary'}>{activity.action}</Badge></TableCell>
                                        <TableCell>{format(activity.timestamp, "d MMM, yyyy HH:mm", { locale: pt })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="pt-4 shrink-0">
                    <Button onClick={handleDownloadPdf}>
                        <FileDown className="mr-2 h-4 w-4" /> Exportar Relatório (PDF)
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    )
}


export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns] = useState(mockCampaigns);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <Mail /> Campanhas de E-mail
                            </CardTitle>
                            <CardDescription>Visualize o desempenho das suas campanhas de e-mail marketing.</CardDescription>
                        </div>
                        <Button asChild>
                           <Link href="/dashboard/admin/email-marketing">
                             Criar Nova Campanha
                           </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assunto</TableHead>
                                <TableHead>Data de Envio</TableHead>
                                <TableHead>Destinatários</TableHead>
                                <TableHead className='flex items-center gap-1'><Eye size={14}/> Aberturas</TableHead>
                                <TableHead className='flex items-center gap-1'><MousePointerClick size={14}/> Cliques</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.subject}</TableCell>
                                    <TableCell>{format(campaign.sentDate, "d MMM, yyyy", { locale: pt })}</TableCell>
                                    <TableCell>{campaign.recipients}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{campaign.openRate}%</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{campaign.clickRate}%</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <BarChart className="mr-2 h-4 w-4" /> Ver Relatório
                                                </Button>
                                            </DialogTrigger>
                                            <ReportDialog campaign={campaign} />
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
