'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@/lib/auth/use-user';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  FileText,
  Mail,
  BarChart3,
  Settings,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  activeMatch?: 'exact' | 'prefix';
};

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.activeMatch === 'exact') return pathname === item.href;
    if (item.activeMatch === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item)}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebarNav() {
  const { user } = useUser();
  const role = user?.role;

  const homeHref =
    role === 'admin' || role === 'recruiter' || role === 'instructor' || role === 'student'
      ? `/dashboard/${role}`
      : '/dashboard/student';

  const general: NavItem[] = [
    { href: homeHref, label: 'Painel', icon: LayoutDashboard, activeMatch: 'prefix' },
  ];

  if (role === 'student') {
    general.push(
      { href: '/dashboard/student/conversations', label: 'Conversas', icon: MessageSquare, activeMatch: 'prefix' },
      { href: '/dashboard/student/profile', label: 'Perfil', icon: Settings, activeMatch: 'prefix' }
    );
  }

  if (role === 'recruiter') {
    general.push(
      { href: '/dashboard/recruiter/vacancies', label: 'Vagas', icon: Briefcase, activeMatch: 'prefix' },
      { href: '/dashboard/recruiter/candidates', label: 'Candidatos', icon: Users, activeMatch: 'prefix' },
      { href: '/dashboard/recruiter/analyzer', label: 'Analisador', icon: BarChart3, activeMatch: 'prefix' },
      { href: '/dashboard/recruiter/conversations', label: 'Conversas', icon: MessageSquare, activeMatch: 'prefix' },
      { href: '/dashboard/recruiter/company-profile', label: 'Empresa', icon: Building2, activeMatch: 'prefix' }
    );
  }

  if (role === 'admin') {
    general.push(
      { href: '/dashboard/settings/ai', label: 'IA', icon: Sparkles, activeMatch: 'prefix' },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: Users, activeMatch: 'prefix' },
      { href: '/dashboard/admin/vacancies', label: 'Vagas', icon: Briefcase, activeMatch: 'prefix' },
      { href: '/dashboard/admin/courses', label: 'Cursos', icon: GraduationCap, activeMatch: 'prefix' },
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: FileText, activeMatch: 'prefix' },
      { href: '/dashboard/admin/email-marketing', label: 'Email', icon: Mail, activeMatch: 'prefix' },
      { href: '/dashboard/admin/financials/reports', label: 'Relatórios', icon: BarChart3, activeMatch: 'prefix' },
      { href: '/dashboard/settings', label: 'Definições', icon: Settings, activeMatch: 'prefix' }
    );
  }

  const courses: NavItem[] = [];
  if (role === 'admin') {
    courses.push(
      { href: '/dashboard/courses/new', label: 'Adicionar Curso', icon: GraduationCap, activeMatch: 'exact' },
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: FileText, activeMatch: 'prefix' }
    );
  } else if (role === 'instructor') {
    courses.push(
      { href: '/dashboard/courses/new', label: 'Novo Curso', icon: GraduationCap, activeMatch: 'exact' },
      { href: '/dashboard/instructor', label: 'Meus Cursos', icon: FileText, activeMatch: 'prefix' }
    );
  }

  return (
    <>
      <NavGroup label="Menu" items={general} />
      <NavGroup label="Cursos" items={courses} />
    </>
  );
}
