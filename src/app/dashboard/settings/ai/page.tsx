'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/auth/use-user';

type Status = { provider: 'gemini'; userKeySet: boolean; systemKeySet: boolean; envKeySet: boolean };

export default function AiSettingsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userKey, setUserKey] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  const isAdmin = user?.role === 'admin';

  const refresh = async () => {
    setIsLoading(true);
    try {
      const { getAiSettingsAction } = await import('@/app/actions');
      const res = await getAiSettingsAction();
      setStatus(res);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao carregar definições.' });
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) {
      setIsLoading(false);
      setStatus(null);
      return;
    }
    refresh();
  }, [isAdmin, isUserLoading]);

  const saveUserKey = async () => {
    setIsSavingUser(true);
    try {
      const { setUserGeminiKeyAction } = await import('@/app/actions');
      const res = await setUserGeminiKeyAction(userKey);
      if (!res.success) throw new Error(res.message);
      toast({ title: 'OK', description: res.message });
      setUserKey('');
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao salvar key.' });
    } finally {
      setIsSavingUser(false);
    }
  };

  const clearUserKey = async () => {
    setIsSavingUser(true);
    try {
      const { clearUserGeminiKeyAction } = await import('@/app/actions');
      const res = await clearUserGeminiKeyAction();
      if (!res.success) throw new Error(res.message);
      toast({ title: 'OK', description: res.message });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao remover key.' });
    } finally {
      setIsSavingUser(false);
    }
  };

  const saveSystemKey = async () => {
    setIsSavingSystem(true);
    try {
      const { setSystemGeminiKeyAction } = await import('@/app/actions');
      const res = await setSystemGeminiKeyAction(systemKey);
      if (!res.success) throw new Error(res.message);
      toast({ title: 'OK', description: res.message });
      setSystemKey('');
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao salvar key padrão.' });
    } finally {
      setIsSavingSystem(false);
    }
  };

  const clearSystemKey = async () => {
    setIsSavingSystem(true);
    try {
      const { clearSystemGeminiKeyAction } = await import('@/app/actions');
      const res = await clearSystemGeminiKeyAction();
      if (!res.success) throw new Error(res.message);
      toast({ title: 'OK', description: res.message });
      await refresh();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao remover key padrão.' });
    } finally {
      setIsSavingSystem(false);
    }
  };

  const show = (value: boolean) => (value ? 'Configurada' : 'Não configurada');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Definições de IA</h1>
        <p className="text-muted-foreground mt-2">
          Por padrão, a plataforma usa Gemini. Se você configurar uma key pessoal, ela tem prioridade.
        </p>
      </div>

      {!isAdmin && !isUserLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
            <CardDescription>Esta página é exclusiva para administradores.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sua key (Gemini)</CardTitle>
            <CardDescription>
              Usada nas funcionalidades de IA apenas para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Status: {isLoading ? 'Carregando...' : status ? show(status.userKeySet) : '—'}
            </div>
            <Input
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="Cole sua Gemini API key"
              type="password"
              autoComplete="off"
            />
            <div className="flex gap-2">
              <Button onClick={saveUserKey} disabled={isSavingUser || userKey.trim().length === 0}>
                Salvar
              </Button>
              <Button variant="outline" onClick={clearUserKey} disabled={isSavingUser}>
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key padrão do sistema (Gemini)</CardTitle>
            <CardDescription>
              Usada quando o usuário não tiver uma key pessoal configurada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Status: {isLoading ? 'Carregando...' : status ? show(status.systemKeySet) : '—'}
            </div>
            <Input
              value={systemKey}
              onChange={(e) => setSystemKey(e.target.value)}
              placeholder={isAdmin ? 'Cole a key padrão (admin)' : 'Apenas admin pode editar'}
              type="password"
              autoComplete="off"
              disabled={!isAdmin}
            />
            <div className="flex gap-2">
              <Button onClick={saveSystemKey} disabled={!isAdmin || isSavingSystem || systemKey.trim().length === 0}>
                Salvar
              </Button>
              <Button variant="outline" onClick={clearSystemKey} disabled={!isAdmin || isSavingSystem}>
                Remover
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Fallback adicional por ambiente: {isLoading ? '…' : status ? show(status.envKeySet) : '—'} (AI_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY)
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
