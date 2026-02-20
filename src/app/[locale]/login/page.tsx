'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";
// Login customizado via API local usando tabela `users` do Supabase
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56,12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26,1.37-.97,2.53-2.09,3.31v2.77h3.57c2.08-1.92,3.28-4.74,3.28-8.09Z"/>
    <path fill="#34A853" d="M12,23c2.97,0,5.46-.98,7.28-2.66l-3.57-2.77c-.98,.66-2.23,1.06-3.71,1.06-2.86,0-5.29-1.93-6.16-4.53H2.18v2.84C3.99,20.53,7.7,23,12,23Z"/>
    <path fill="#FBBC05" d="M5.84,14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43,.35-2.09V7.07H2.18C1.43,8.55,1,10.22,1,12s.43,3.45,1.18,4.93l3.66-2.84Z"/>
    <path fill="#EA4335" d="M12,5.16c1.58,0,2.99,.54,4.1,1.62l3.15-3.15C17.46,1.99,14.97,1,12,1,7.7,1,3.99,3.47,2.18,7.07l3.66,2.84C6.71,7.09,9.14,5.16,12,5.16Z"/>
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (Array.isArray(params?.locale) ? params?.locale[0] : params?.locale) || '';
  const rawRedirect = searchParams?.get('redirectTo') || '/dashboard';
  
  // Build redirect target carefully to avoid double locale prefixes
  let redirectTarget = rawRedirect;
  const isDashboardPath = rawRedirect.startsWith('/dashboard');
  if (!isDashboardPath) {
    if (locale) {
      const prefix = `/${locale}`;
      if (!rawRedirect.startsWith(prefix + '/') && rawRedirect !== prefix) {
        redirectTarget = rawRedirect.startsWith('/') 
          ? `${prefix}${rawRedirect}` 
          : `${prefix}/${rawRedirect}`;
      }
    } else if (!rawRedirect.startsWith('/')) {
      redirectTarget = `/${rawRedirect}`;
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const message = payload?.error || 'Email ou senha inválidos';
        toast({ variant: 'destructive', title: 'Falha no login', description: message });
        return;
      }

      router.push(redirectTarget);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Falha no login', description: 'Não foi possível autenticar.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Informe seu e-mail', description: 'Digite seu e-mail para redefinir a senha.' });
      return;
    }
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao enviar e-mail', description: error.message });
      } else {
        toast({ title: 'Verifique seu e-mail', description: 'Enviamos um link para redefinição de senha.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectTo = window.location.origin;
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao autenticar com Google', description: 'Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

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
              Acesse sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Ou{' '}
              <Link href="/signup" className="font-medium text-primary hover:text-primary/90">
                crie uma conta agora
              </Link>
            </p>
          </div>
          <Card>
              <CardHeader>
                  <CardTitle>Entrar</CardTitle>
                  <CardDescription>Use as credenciais da conta que você criou na página de registo.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                          <Label htmlFor="password">Senha</Label>
                          <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-primary hover:underline">
                            Esqueceu sua senha?
                          </button>
                      </div>
                      <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                  </Button>
                </form>
                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Ou continue com
                        </span>
                    </div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Entrar com Google
                </Button>
              </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
