
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
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Subscription = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  nextBilling: string | null;
};

export default function SubscriptionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const filteredSubscriptions = useMemo(() => {
        if (!searchTerm) return subscriptions;
        return subscriptions.filter(sub =>
            sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subscriptions, searchTerm]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/admin/financials/subscriptions?limit=200', { cache: 'no-store' });
                const payload = await res.json();
                if (!active) return;
                if (!res.ok || !payload?.ok) {
                    throw new Error(payload?.error || 'Falha ao carregar subscrições');
                }
                setSubscriptions(payload.data as Subscription[]);
            } catch (e: any) {
                if (!active) return;
                toast({ variant: 'destructive', title: 'Erro ao carregar', description: e?.message || 'Não foi possível carregar subscrições.' });
                setSubscriptions([]);
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, [toast]);
    
    const handleCancelSubscription = (subId: string) => {
        toast({ title: "Ação indisponível", description: "Cancelamento real depende do Stripe Billing (a implementar)." });
    };
    
    const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        'active': 'default',
        'trialing': 'secondary',
        'past_due': 'secondary',
        'canceled': 'destructive',
        'unpaid': 'destructive',
        'incomplete': 'secondary',
        'incomplete_expired': 'destructive',
        'paused': 'outline',
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
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
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
                                            {sub.nextBilling ? format(new Date(sub.nextBilling), 'd MMM, yyyy', { locale: pt }) : 'N/A'}
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
                                                    {sub.status === 'active' && (
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
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
