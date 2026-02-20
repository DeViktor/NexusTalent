
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

const initialTeamMembers = [
    {
        id: 'rec1',
        name: 'Ana Silva',
        email: 'ana.silva@empresa.com',
        role: 'Admin',
        status: 'Ativo'
    },
    {
        id: 'rec2',
        name: 'Carlos Martins',
        email: 'carlos.martins@empresa.com',
        role: 'Recrutador',
        status: 'Ativo'
    },
     {
        id: 'rec3',
        name: 'Beatriz Costa',
        email: 'beatriz.costa@empresa.com',
        role: 'Gestor de Contratação',
        status: 'Convidado'
    }
];

type TeamMember = typeof initialTeamMembers[0];

const memberSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  role: z.enum(['Admin', 'Recrutador', 'Gestor de Contratação'], { required_error: 'Por favor, selecione uma função.' }),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function ManageTeamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
    });

    useEffect(() => {
        if (selectedMember) {
            form.reset({
                name: selectedMember.name,
                email: selectedMember.email,
                role: selectedMember.role as 'Admin' | 'Recrutador' | 'Gestor de Contratação',
            });
        } else {
            form.reset({ name: '', email: '', role: 'Recrutador' });
        }
    }, [selectedMember, form]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return teamMembers;
        return teamMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teamMembers, searchTerm]);

    const handleOpenForm = (member: TeamMember | null) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    }

    const handleOpenAlert = (member: TeamMember) => {
        setSelectedMember(member);
        setIsAlertOpen(true);
    }

    const onSubmit: SubmitHandler<MemberFormValues> = (data) => {
        if (selectedMember) { // Editing
            setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...selectedMember, ...data } : m));
            toast({ title: "Membro Atualizado", description: `Os dados de ${data.name} foram atualizados.` });
        } else { // Adding
            const newMember: TeamMember = {
                id: `rec${Date.now()}`,
                ...data,
                status: 'Convidado'
            };
            setTeamMembers(prev => [newMember, ...prev]);
            toast({ title: "Convite Enviado", description: `Um convite foi enviado para ${data.name}.` });
        }
        setIsFormOpen(false);
    };

    const handleDelete = () => {
        if (!selectedMember) return;
        setTeamMembers(prev => prev.filter(m => m.id !== selectedMember.id));
        toast({ title: "Membro Removido", description: `${selectedMember.name} foi removido da equipa.` });
        setIsAlertOpen(false);
    }

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
                            {filteredUsers.map((member) => (
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
                                            {member.status === 'Convidado' && <DropdownMenuItem>Reenviar Convite</DropdownMenuItem>}
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
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome do membro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Função</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma função" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Recrutador">Recrutador</SelectItem><SelectItem value="Gestor de Contratação">Gestor de Contratação</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
