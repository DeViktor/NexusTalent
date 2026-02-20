'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    setIsDashboard(pathname.startsWith('/dashboard'));
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
        <header className="py-4 px-4 sm:px-6 lg:px-8">
             <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
        </header>
      <main className="flex-grow flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <p className="text-base font-semibold text-primary">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">Página não encontrada</h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground">Lamentamos, mas não conseguimos encontrar a página que procura.</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild>
              <Link href={isDashboard ? "/dashboard" : "/"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à página inicial
              </Link>
            </Button>
          </div>
        </div>
      </main>
       <footer className="py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NexusTalent. Todos os direitos reservados.</p>
        </footer>
    </div>
  );
}
