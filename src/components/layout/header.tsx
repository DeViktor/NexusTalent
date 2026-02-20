
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { Menu, X, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useEffect, useState, useTransition, type FC } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


const LocaleSwitcher: FC = () => {
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onLocaleChange(newLocale: string) {
        const newPath = pathname.startsWith('/' + locale) ? `/${newLocale}${pathname.substring(3)}` : `/${newLocale}${pathname}`;
        startTransition(() => {
            router.replace(newPath);
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onLocaleChange('pt')} disabled={isPending || locale === 'pt'}>Português</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLocaleChange('en')} disabled={isPending || locale === 'en'}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLocaleChange('fr')} disabled={isPending || locale === 'fr'}>Français</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const NavLinks = ({ closeMenu }: { closeMenu?: () => void }) => {
    const t = useTranslations('Header');
    
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/courses" className={navigationMenuTriggerStyle()}>
                {t('courses')}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('vacancies')}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/recruitment"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        NexusTalent {t('vacancies')}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Explore todos os nossos empregos e encontre a oportunidade certa para si.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/recruitment" title="Todos os Empregos">
                  Pesquise e filtre todas as oportunidades disponíveis.
                </ListItem>
                <ListItem href="/dashboard/student/profile" title="Perfil de Candidato">
                  Mantenha o seu perfil atualizado para se destacar.
                </ListItem>
                 <ListItem href="/pricing" title="Planos para Empresas">
                  Veja os nossos planos de recrutamento.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/about" className={navigationMenuTriggerStyle()}>
                {t('about')}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/blog" className={navigationMenuTriggerStyle()}>
                {t('blog')}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
}


export function Header() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (!active) return;
        if (json?.ok && json?.user) {
          setSessionUser(json.user);
        } else {
          setSessionUser(null);
        }
      } catch {
        if (active) setSessionUser(null);
      } finally {
        if (active) setIsUserLoading(false);
      }
    };
    loadSession();
    return () => { active = false; };
  }, []);

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-1">
              <NavLinks />
          </nav>

          <div className="flex items-center space-x-2">
            <LocaleSwitcher />

            {isUserLoading ? (
              <Skeleton className="h-9 w-24 hidden md:block" />
            ) : sessionUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hidden md:flex">
                     <Avatar className="h-8 w-8">
                      <AvatarImage src={sessionUser.photoURL || undefined} />
                      <AvatarFallback>{getInitials(sessionUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className='hidden sm:inline'>{sessionUser.displayName || sessionUser.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Painel</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/dashboard/student/profile">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Configurações</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2"/>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='hidden md:flex'>
                <Button variant="ghost" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link href="/signup">Cadastre-se</Link>
                </Button>
              </div>
            )}
            
             <div className="md:hidden flex items-center">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>
            
          </div>
        </div>
         <div
            className={cn(
            'md:hidden transition-all duration-300 ease-in-out absolute top-full left-0 w-full bg-card',
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            )}
        >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                {/* <NavLinks closeMenu={() => setIsMenuOpen(false)} /> */}
               <div className="pt-4 border-t">
                {isUserLoading ? <div className='px-3'><Skeleton className='h-10 w-full'/></div> : sessionUser ? (
                   <div className="space-y-2 px-3">
                     <p className="font-medium">{sessionUser.displayName || sessionUser.email}</p>
                     <Button variant="outline" className="w-full" asChild onClick={() => setIsMenuOpen(false)}><Link href="/dashboard">Painel</Link></Button>
                     <Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button>
                   </div>
                ) : (
                  <div className="flex items-center px-3 space-x-2">
                     <Button variant="ghost" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Entrar</Link>
                    </Button>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/signup">Cadastre-se</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </header>
  );
}
