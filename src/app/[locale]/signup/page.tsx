
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserProfile } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';

const GoogleIcon = () => null;


const formSchema = z.object({
  userType: z.enum(['student', 'instructor', 'recruiter'], { required_error: 'Por favor, selecione um papel.' }),
  firstName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  lastName: z.string().min(2, 'O apelido deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  companyName: z.string().optional(),
  specialization: z.string().optional(),
}).refine(data => {
    if (data.userType === 'recruiter' && (!data.companyName || data.companyName.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'O nome da empresa é obrigatório para recrutadores.',
    path: ['companyName'],
}).refine(data => {
    if (data.userType === 'instructor' && (!data.specialization || data.specialization.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'A área de especialização é obrigatória para formadores.',
    path: ['specialization'],
});


type FormValues = z.infer<typeof formSchema>;


export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: 'student',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyName: '',
      specialization: '',
    }
  });

  const selectedRole = form.watch('userType');

  const createSupabaseUserRow = async (userId: string, email: string, password: string, userType: 'student' | 'instructor' | 'recruiter', additionalData?: Partial<UserProfile>) => {
    const fullName = `${additionalData?.firstName || ''} ${additionalData?.lastName || ''}`.trim();
    const passwordHash = await bcrypt.hash(password, 10);

    await supabase.from('users').upsert({
      id: userId,
      email,
      name: fullName || email,
      created_at: new Date().toISOString(),
      role: userType,
      company: userType === 'recruiter' ? additionalData?.company : undefined,
      bio: userType === 'instructor' ? additionalData?.academicTitle : undefined,
      password_hash: passwordHash,
    });
  };

  const handleSignup: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: `${data.firstName} ${data.lastName}`,
            role: data.userType,
          },
        },
      });
      if (error) throw error;
      const userId = signUpData.user?.id;
      if (userId) {
        await createSupabaseUserRow(userId, data.email, data.password, data.userType, {
          firstName: data.firstName,
          lastName: data.lastName,
          academicTitle: data.userType === 'instructor' ? data.specialization : undefined,
          company: data.userType === 'recruiter' ? data.companyName : undefined,
        });
      }
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu e-mail para confirmar a conta e faça login.',
      });
      router.push('/login');

    } catch (error: any) {
        console.error("Signup Error (Auth):", error);
        let description = 'Ocorreu um erro. Tente novamente.';
        if (String(error?.message || '').toLowerCase().includes('already')) {
          description = 'Este endereço de e-mail já está a ser utilizado por outra conta.';
        }
        toast({
            variant: 'destructive',
            title: 'Erro ao criar conta',
            description: description,
        });
        setIsLoading(false);
    } 
  };

  const handleGoogleSignUp = async () => {
    const userType = form.getValues('userType');
    // Validação manual para campos condicionais antes de abrir o popup
    if (userType === 'recruiter' && !form.getValues('companyName')) {
        form.setError('companyName', { type: 'manual', message: 'O nome da empresa é obrigatório.' });
        return;
    }
     if (userType === 'instructor' && !form.getValues('specialization')) {
        form.setError('specialization', { type: 'manual', message: 'A área de especialização é obrigatória.' });
        return;
    }

    setIsLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/login',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) throw error;
    } catch (error: any) {
        console.error("Google Sign-Up Error:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao registar com Google',
            description: error.message || 'Não foi possível registar com o Google.',
        });
        setIsLoading(false);
    }
  }


  return (
    <>
      <Header />
      <main className="flex items-center justify-center flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
              <Link href="/" className="inline-block">
                  <Logo />
              </Link>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground font-headline">
              Crie sua conta gratuita
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                Faça login
              </Link>
            </p>
          </div>
          <Card>
              <CardHeader>
                  <CardTitle>Cadastre-se</CardTitle>
                  <CardDescription>Para testar o painel de recrutador, use o email 'recruiter@nexustalent.com.br' e a senha '123456', selecionando o papel "Recrutador / Empresa" abaixo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="userType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Eu sou um...</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione o seu papel" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="student">Candidato / Formando</SelectItem>
                                            <SelectItem value="recruiter">Recrutador / Empresa</SelectItem>
                                            <SelectItem value="instructor">Formador / Instrutor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {selectedRole === 'recruiter' && (
                             <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Empresa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="O nome da sua empresa" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {selectedRole === 'instructor' && (
                             <FormField
                                control={form.control}
                                name="specialization"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área de Especialização</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Finanças, Gestão de Projetos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Ou registe-se com
                                </span>
                            </div>
                        </div>

                         <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                            Registar com Google
                        </Button>

                         <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Ou com o seu e-mail
                                </span>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="O seu nome" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apelido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="O seu apelido" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="seu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta com E-mail'}
                        </Button>
                    </form>
                </Form>
              </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
