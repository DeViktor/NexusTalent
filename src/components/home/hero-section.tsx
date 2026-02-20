import { getImages } from '@/lib/site-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const images = getImages();
  const heroImage = images.find(p => p.id === 'home-hero');

  return (
    <section className="relative w-full h-auto min-h-[70vh] flex items-center justify-center text-center py-20">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
          Conectando <span className="text-primary">Talentos</span> ao Futuro
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-xl md:text-2xl text-neutral-200">
          Sua jornada para o sucesso começa aqui. Explore cursos de ponta e encontre o emprego dos seus sonhos com a NexusTalent.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" asChild>
            <Link href="/courses">
              Explorar Cursos <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white hover:text-black w-full sm:w-auto" asChild>
            <Link href="/recruitment">
              Ver Empregos Abertos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
