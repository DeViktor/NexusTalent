'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { UserProfile } from '@/lib/types';

const navLinks = [
    { href: '/courses', label: 'Cursos' },
    { href: '/recruitment', label: 'Vagas' },
    { href: '/about', label: 'Sobre Nós' },
    { href: '/blog', label: 'Blog' },
];

export function DashboardHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (!active) return;
        if (json?.ok && json?.user) {
          setSessionUser(json.user);
          const name = json.user.displayName || '';
          const [firstName, ...rest] = name.split(' ');
          const lastName = rest.join(' ');
          const role = (json.user.role || 'student') as UserProfile['userType'];
          setUserProfile({
            id: json.user.id,
            firstName: firstName || name || 'Usuário',
            lastName: lastName || '',
            email: json.user.email,
            userType: role,
            profilePictureUrl: json.user.photoURL || undefined,
            summary: undefined,
            academicTitle: undefined,
            cidade: undefined,
            country: undefined,
            phoneNumber: undefined,
            company: undefined,
          });
        } else {
          setSessionUser(null);
          setUserProfile(null);
        }
      } catch {
        setSessionUser(null);
        setUserProfile(null);
      } finally {
        if (active) setIsUserLoading(false);
      }
    };
    loadSession();
    return () => { active = false; };
  }, []);

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

  const getSettingsLink = () => {
    if (!userProfile) return '/dashboard/student/profile';
    switch (userProfile.userType) {
      case 'recruiter':
        return '/dashboard/recruiter/company-profile';
      case 'student':
        return '/dashboard/student/profile';
      case 'instructor':
        return '/dashboard/instructor';
      case 'admin':
        return '/dashboard/settings';
      default:
        return '/dashboard';
    }
  }


  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-8">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "font-medium transition-colors",
                            pathname.endsWith(link.href) ? "text-primary font-semibold" : "text-foreground/80 hover:text-foreground"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

          <div className="flex items-center space-x-2">

            {isUserLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : sessionUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
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
                    <Link href={getSettingsLink()}><Settings className="mr-2 h-4 w-4"/>Configurações</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4"/>
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

             <div
                className={cn(
                'md:hidden transition-all duration-300 ease-in-out absolute top-full left-0 w-full bg-card',
                isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                )}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                    {navLinks.map((link) => (
                        <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "block px-3 py-2 rounded-md text-base font-medium",
                            pathname.endsWith(link.href) ? "bg-secondary text-primary font-semibold" : "text-foreground/80 hover:bg-secondary"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                        >
                        {link.label}
                        </Link>
                    ))}
                   <div className="pt-4 border-t">
                    {sessionUser ? (
                       <div className="space-y-2 px-3">
                         <p className="font-medium">{sessionUser.displayName || sessionUser.email}</p>
                         <Button variant="outline" className="w-full" asChild><Link href="/dashboard">Painel</Link></Button>
                         <Button variant="destructive" className="w-full" onClick={handleLogout}>Sair</Button>
                       </div>
                    ) : (
                      <div className="flex items-center px-3 space-x-2">
                         <Button variant="ghost" className="w-full" asChild>
                          <Link href="/login">Entrar</Link>
                        </Button>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                          <Link href="/signup">Cadastre-se</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}
