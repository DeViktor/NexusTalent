import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Target, Users, GraduationCap, Building, Eye, TrendingUp } from 'lucide-react';
import { getImages } from '@/lib/site-data';
import { LocationsSection } from '@/components/home/locations-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RunningCourses } from '@/components/home/running-courses';

const values = [
    { title: 'Conhecer', description: 'Promovemos o conhecimento e a aprendizagem contínua como base para o sucesso.', icon: GraduationCap },
    { title: 'Servir', description: 'Comprometemo-nos a servir os nossos clientes e candidatos com excelência e dedicação.', icon: Users },
    { title: 'Confiar', description: 'Construímos relações de confiança através da transparência e integridade em tudo o que fazemos.', icon: Building },
    { title: 'Procurar a perfeição', description: 'Buscamos incessantemente a melhoria e a perfeição nos nossos serviços e processos.', icon: TrendingUp },
    { title: 'Valorizar simultaneamente todos os interesses', description: 'Equilibramos as necessidades de todos os stakeholders para criar valor partilhado.', icon: Eye },
];

export default function AboutPage() {
    const images = getImages();
    const aboutHeroImage = images.find(p => p.id === 'about-hero');

    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative bg-background py-20 md:py-32">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-headline text-4xl md:text-6xl font-bold">Sobre a NexusTalent</h1>
                        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            Conectamos talentos a oportunidades e impulsionamos o crescimento profissional através de formação de excelência.
                        </p>
                    </div>
                </section>
                
                <section className="py-16 sm:py-24 bg-card">
                    <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                             <h2 className="font-headline text-3xl sm:text-4xl font-bold">Quem Somos</h2>
                             <div className="mt-4 space-y-4 text-muted-foreground">
                                <p>A NexusTalent é uma consultoria de Gestão de Capital Humano que atua em Angola, Portugal e Brasil. Somos especialistas em Recrutamento e Seleção, Formação e Desenvolvimento, Avaliação de Desempenho e Cedência de Mão de Obra.</p>
                                <p>A nossa equipa é composta por consultores experientes e uma vasta rede de parceiros, o que nos permite oferecer soluções personalizadas e de alto impacto para os nossos clientes.</p>
                             </div>
                        </div>
                         <div>
                            <h2 className="font-headline text-3xl sm:text-4xl font-bold">Nossa Missão, Visão e Valores</h2>
                             <div className="mt-4 space-y-4 text-muted-foreground">
                                <p><strong>Missão:</strong> Potenciar o sucesso dos nossos clientes através da identificação e desenvolvimento do talento certo, contribuindo para o crescimento sustentável das suas organizações.</p>
                                <p><strong>Visão:</strong> Ser a empresa de referência em Gestão de Capital Humano nos mercados onde atuamos, reconhecida pela excelência, inovação e impacto positivo.</p>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                 <section className="py-16 sm:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-headline text-3xl sm:text-4xl font-bold">Os Nossos Valores</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            {values.map((value, index) => (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                                        <value.icon size={32} />
                                    </div>
                                    <h3 className="font-headline text-xl font-bold mb-2">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <RunningCourses />

                <LocationsSection />
            </main>
            <Footer />
        </>
    );
}
