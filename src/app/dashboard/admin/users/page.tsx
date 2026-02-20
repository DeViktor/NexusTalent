
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, FileDown, MoreHorizontal, Loader2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';


const userSchema = z.object({
  firstName: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'O apelido deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  userType: z.enum(['student', 'instructor', 'recruiter', 'admin'], { required_error: 'Por favor, selecione uma função.' }),
  phoneNumber: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const roleMap: Record<UserProfile['userType'], string> = {
  student: 'Candidato',
  instructor: 'Formador',
  recruiter: 'Recrutador',
  admin: 'Admin',
};

const roleVariantMap: Record<UserProfile['userType'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    admin: 'destructive',
    recruiter: 'default',
    instructor: 'secondary',
    student: 'outline',
};

export default function ManageUsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const userForm = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        if (selectedUser) {
            userForm.reset({
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                userType: selectedUser.userType,
                phoneNumber: selectedUser.phoneNumber,
            });
        } else {
            userForm.reset({ firstName: '', lastName: '', email: '', userType: 'student', phoneNumber: '' });
        }
    }, [selectedUser, userForm]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase.from('users').select('*');
                if (error) throw error;
                const mapped: UserProfile[] = (data || []).map(row => {
                    const fullName = row.name || '';
                    const [firstName, ...rest] = fullName.split(' ');
                    const lastName = rest.join(' ');
                    const role = (row.role || 'student') as UserProfile['userType'];
                    return {
                        id: row.id,
                        firstName: firstName || fullName || 'Usuário',
                        lastName: lastName || '',
                        email: row.email,
                        userType: role,
                        phoneNumber: undefined,
                        profilePictureUrl: row.avatar_url,
                        summary: row.bio,
                        academicTitle: undefined,
                        cidade: undefined,
                        country: undefined,
                        company: row.company,
                    } satisfies UserProfile;
                });
                setUsers(mapped);
            } catch (e) {
                setUsers([]);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const handleOpenForm = (user: UserProfile | null) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

     const handleOpenPasswordForm = (user: UserProfile) => {
        setSelectedUser(user);
        passwordForm.reset();
        setIsPasswordFormOpen(true);
    };

    const handleOpenAlert = (user: UserProfile) => {
        setSelectedUser(user);
        setIsAlertOpen(true);
    };
    
    const onSubmit: SubmitHandler<UserFormValues> = (data) => {
        if (selectedUser) { // Editing
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
            toast({ title: "Usuário Atualizado", description: `Os dados de ${data.firstName} ${data.lastName} foram atualizados.` });
        } else { // Adding
            const newUser: UserProfile = {
                id: `user-${Date.now()}`,
                ...data,
            };
            setUsers(prev => [newUser, ...prev]);
            toast({ title: "Usuário Adicionado", description: `${data.firstName} ${data.lastName} foi adicionado.` });
        }
        setIsFormOpen(false);
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        toast({ title: "Usuário Removido", description: `${selectedUser.firstName} ${selectedUser.lastName} foi removido da plataforma.` });
        setIsAlertOpen(false);
    };

    const handlePasswordResetEmail = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            toast({ title: "Instruções Enviadas", description: `Um email de redefinição de senha foi enviado para ${email}.`});
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error?.message || "Não foi possível enviar o email." });
        }
    }

    const onPasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
        // This is a simulation. Real implementation requires backend/admin SDK.
        toast({ title: "Senha Alterada (Simulado)", description: `A senha para ${selectedUser?.email} foi alterada.`});
        setIsPasswordFormOpen(false);
    };

    const handleExport = () => {
        const dataToExport = filteredUsers.map(user => ({
            'Nome': user.firstName,
            'Apelido': user.lastName,
            'Email': user.email,
            'Telefone': user.phoneNumber || 'N/A',
            'Papel': roleMap[user.userType] || user.userType,
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "usuarios_nexustalent.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                            <CardTitle className="font-headline text-3xl">Gestão de Usuários</CardTitle>
                            <CardDescription>Visualize e gerencie todos os usuários da plataforma.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={handleExport}>
                                <FileDown className="mr-2 h-4 w-4"/>
                                Exportar (CSV)
                            </Button>
                            <Button onClick={() => handleOpenForm(null)}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Adicionar Usuário
                            </Button>
                        </div>
                    </div>
                     <div className="mt-4">
                        <Input
                            placeholder="Filtrar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Papel</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleVariantMap[user.userType] || 'default'}>
                                            {roleMap[user.userType] || user.userType}
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
                                            <DropdownMenuItem onClick={() => handleOpenForm(user)}>Editar Perfil</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handlePasswordResetEmail(user.email)}>Enviar Email de Recuperação</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenPasswordForm(user)}>Definir Nova Senha</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleOpenAlert(user)}>
                                                Excluir Usuário
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
                        <DialogTitle>{selectedUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
                        <DialogDescription>
                            {selectedUser ? 'Atualize os dados do usuário.' : 'Preencha os dados para criar um novo usuário.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={userForm.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={userForm.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apelido</FormLabel><FormControl><Input placeholder="Apelido" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={userForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={userForm.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="+244..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={userForm.control} name="userType" render={({ field }) => (<FormItem><FormLabel>Função</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma função" /></SelectTrigger></FormControl><SelectContent><SelectItem value="student">Candidato</SelectItem><SelectItem value="instructor">Formador</SelectItem><SelectItem value="recruiter">Recrutador</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={userForm.formState.isSubmitting}>
                                    {userForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {selectedUser ? 'Guardar Alterações' : 'Adicionar Usuário'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPasswordFormOpen} onOpenChange={setIsPasswordFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Definir Nova Senha</DialogTitle>
                        <DialogDescription>
                           Defina uma nova senha para <strong className="text-foreground">{selectedUser?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsPasswordFormOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                    {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Definir Senha
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
                           Esta ação removerá permanentemente o usuário <strong className='text-foreground'>{selectedUser?.firstName} {selectedUser?.lastName}</strong>. Esta ação não pode ser desfeita.
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
