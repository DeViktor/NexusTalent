
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, MoreHorizontal, FileDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const memberSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  role: z.enum(['Admin', 'Recrutador', 'Gestor de Contratação'], { required_error: 'Por favor, selecione uma função.' }),
});

type MemberFormValues = z.infer<typeof memberSchema>;

type TeamRow =
    | { kind: 'member'; id: string; userId: string; name: string; email: string; role: string; status: string }
    | { kind: 'invite'; id: string; name: string; email: string; role: string; status: string };

export default function ManageTeamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [teamMembers, setTeamMembers] = useState<TeamRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamRow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
    });

    useEffect(() => {
        if (selectedMember) {
            form.reset({
                email: selectedMember.email,
                role: selectedMember.role as 'Admin' | 'Recrutador' | 'Gestor de Contratação',
            });
        } else {
            form.reset({ email: '', role: 'Recrutador' });
        }
    }, [selectedMember, form]);

    const loadTeam = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/recruiter/team', { cache: 'no-store', credentials: 'include' });
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar equipa.');
            setTeamMembers(Array.isArray(json.team) ? json.team : []);
        } catch (e: any) {
            setTeamMembers([]);
            toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao carregar equipa.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return teamMembers;
        return teamMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teamMembers, searchTerm]);

    const handleOpenForm = (member: TeamRow | null) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    }

    const handleOpenAlert = (member: TeamRow) => {
        setSelectedMember(member);
        setIsAlertOpen(true);
    }

    const onSubmit: SubmitHandler<MemberFormValues> = async (data) => {
        if (isMutating) return;
        setIsMutating(true);
        try {
            if (selectedMember && selectedMember.kind === 'member') {
                const res = await fetch(`/api/recruiter/team/member/${selectedMember.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ role: data.role }),
                });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao atualizar membro.');
                toast({ title: "Membro Atualizado", description: `A função de ${selectedMember.name} foi atualizada.` });
            } else {
                const res = await fetch('/api/recruiter/team/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email: data.email, role: data.role }),
                });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao enviar convite.');
                toast({ title: "Convite Enviado", description: `Um convite foi enviado para ${data.email}.` });
            }
            setIsFormOpen(false);
            setSelectedMember(null);
            await loadTeam();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao salvar.' });
        } finally {
            setIsMutating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMember) return;
        if (isMutating) return;
        setIsMutating(true);
        try {
            if (selectedMember.kind === 'member') {
                const res = await fetch(`/api/recruiter/team/member/${selectedMember.id}`, { method: 'DELETE', credentials: 'include' });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao remover membro.');
                toast({ title: "Membro Removido", description: `${selectedMember.name} foi removido da equipa.` });
            } else {
                const res = await fetch(`/api/recruiter/team/invite/${selectedMember.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'revoke' }),
                });
                const json = await res.json();
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao revogar convite.');
                toast({ title: "Convite Revogado", description: `O convite de ${selectedMember.email} foi revogado.` });
            }
            setIsAlertOpen(false);
            setSelectedMember(null);
            await loadTeam();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao remover.' });
        } finally {
            setIsMutating(false);
        }
    }

    const handleResendInvite = async (inviteId: string, email: string) => {
        if (isMutating) return;
        setIsMutating(true);
        try {
            const res = await fetch(`/api/recruiter/team/invite/${inviteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'resend' }),
            });
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao reenviar convite.');
            toast({ title: "Convite Reenviado", description: `Convite reenviado para ${email}.` });
            await loadTeam();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao reenviar.' });
        } finally {
            setIsMutating(false);
        }
    };

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
                            <CardTitle className="font-headline text-3xl">Gerir Equipa de Recrutamento</CardTitle>
                            <CardDescription>Adicione, edite e gira as permissões dos membros da sua equipa.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" disabled>
                                <FileDown className="mr-2 h-4 w-4"/>
                                Exportar
                            </Button>
                            <Button onClick={() => handleOpenForm(null)}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Convidar Membro
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Input
                            placeholder="Filtrar por nome ou email..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-sm text-muted-foreground">A carregar...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-sm text-muted-foreground">Nenhum membro.</TableCell>
                                </TableRow>
                            ) : filteredUsers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === 'Admin' ? 'destructive' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={member.status === 'Ativo' ? 'default' : 'outline'}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenForm(member)}>Editar</DropdownMenuItem>
                                            {member.kind === 'invite' && member.status === 'Convidado' && (
                                                <DropdownMenuItem onClick={() => handleResendInvite(member.id, member.email)}>Reenviar Convite</DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleOpenAlert(member)}>
                                                Remover
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedMember ? 'Editar Membro' : 'Convidar Novo Membro'}</DialogTitle>
                        <DialogDescription>
                            {selectedMember ? 'Atualize os dados do membro da equipa.' : 'Preencha os dados para enviar um convite.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@empresa.com" {...field} disabled={!!selectedMember && selectedMember.kind === 'member'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Função</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma função" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Recrutador">Recrutador</SelectItem><SelectItem value="Gestor de Contratação">Gestor de Contratação</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting || isMutating}>
                                    {(form.formState.isSubmitting || isMutating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {selectedMember ? 'Guardar Alterações' : 'Enviar Convite'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta ação removerá permanentemente o membro da equipa <strong className='text-foreground'>{selectedMember?.name}</strong>. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isMutating}>
                            {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
