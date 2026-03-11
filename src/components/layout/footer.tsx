'use client';

import { Logo } from '@/components/shared/logo';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  jobs: [
    { href: "/recruitment", label: "Todos os empregos" },
  ],
  paraTalentos: [
    { href: "/courses", label: "Cursos de Formação" },
    { href: "/blog", label: "Dicas de carreira" },
    { href: "/dashboard/student/profile", label: "Perfil de Candidato" },
    { href: "/cv-builder", label: "Construtor de CV" },
  ],
  paraEmpresas: [
    { href: "/recruitment", label: "Recrutamento e seleção" },
  ],
  sobreNos: [
    { href: "/about", label: "Quem somos" },
    { href: "/blog", label: "Notícias" },
  ],
  galeria: [
      { href: "/gallery", label: "Galeria de Fotos" },
  ]
};


export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-1 lg:col-span-1 space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Capacitando talentos e conectando oportunidades para um futuro brilhante.
            </p>
          </div>

          <div className='col-span-1 md:col-span-3 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8'>
            <div>
              <h3 className="font-headline text-lg font-medium">Empregos</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.jobs.map(link => (
                  <li key={`${link.href}-${link.label}`}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-headline text-lg font-medium">Para Talentos</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.paraTalentos.map(link => (
                  <li key={`${link.href}-${link.label}`}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-headline text-lg font-medium">Para Empresas</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.paraEmpresas.map(link => (
                  <li key={`${link.href}-${link.label}`}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-headline text-lg font-medium">Sobre Nós</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.sobreNos.map(link => (
                  <li key={`${link.href}-${link.label}`}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-lg font-medium">Galeria</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.galeria.map(link => (
                  <li key={`${link.href}-${link.label}`}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} NexusTalent. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
