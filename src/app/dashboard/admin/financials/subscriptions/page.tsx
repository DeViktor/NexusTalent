
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreHorizontal, Search, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Mock data for subscriptions
const mockSubscriptions = [
    { id: 'sub1', userName: 'Ana Pereira', userEmail: 'ana.pereira@email.com', plan: 'Pro Anual', status: 'Ativo', nextBilling: new Date(2025, 6, 28) },
    { id: 'sub2', userName: 'Bruno Costa', userEmail: 'bruno.costa@email.com', plan: 'Pro Mensal', status: 'Ativo', nextBilling: new Date(2024, 8, 15) },
    { id: 'sub3', userName: 'Carla Santos', userEmail: 'carla.santos@email.com', plan: 'Básico Anual', status: 'Cancelado', nextBilling: null },
    { id: 'sub4', userName: 'Diogo Alves', userEmail: 'diogo.alves@email.com', plan: 'Básico Mensal', status: 'Ativo', nextBilling: new Date(2024, 8, 22) },
    { id: 'sub5', userName: 'Elisa Fernandes', userEmail: 'elisa.f@email.com', plan: 'Pro Anual', status: 'Pendente', nextBilling: new Date(2024, 8, 1) },
];

type Subscription = typeof mockSubscriptions[0];

export default function SubscriptionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [subscriptions, setSubscriptions] = useState(mockSubscriptions);

    const filteredSubscriptions = useMemo(() => {
        if (!searchTerm) return subscriptions;
        return subscriptions.filter(sub =>
            sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subscriptions, searchTerm]);

    const handleCancelSubscription = (subId: string) => {
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status: 'Cancelado' } : s));
        toast({ title: "Subscrição Cancelada (Simulado)", description: "A subscrição do utilizador foi cancelada." });
    };
    
    const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'Ativo': 'default',
        'Cancelado': 'destructive',
        'Pendente': 'secondary',
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Button>
             <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <Repeat /> Gestão de Subscrições
                            </CardTitle>
                            <CardDescription>Visualize e gerencie os planos dos seus utilizadores.</CardDescription>
                        </div>
                    </div>
                     <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrar por nome, email ou plano..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilizador</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Próxima Faturação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="font-medium">{sub.userName}</div>
                                        <div className="text-sm text-muted-foreground">{sub.userEmail}</div>
                                    </TableCell>
                                    <TableCell>{sub.plan}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[sub.status] || 'outline'}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {sub.nextBilling ? format(sub.nextBilling, 'd MMM, yyyy', { locale: pt }) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                <DropdownMenuItem>Alterar Plano</DropdownMenuItem>
                                                {sub.status === 'Ativo' && (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleCancelSubscription(sub.id)}>
                                                        Cancelar Subscrição
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
