import { getImages } from "@/lib/site-data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Users } from "lucide-react";

export function RecruitmentSection() {
    const images = getImages();
    const recruitmentImage = images.find(p => p.id === 'recruitment-hero');

    return (
        <section className="py-16 sm:py-24 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
                            Encontre Talentos. Descubra Oportunidades.
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Nossa plataforma de recrutamento conecta as melhores empresas aos profissionais mais qualificados.
                            Potencialize sua carreira ou encontre o candidato ideal com as ferramentas inteligentes da NexusTalent.
                        </p>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold font-headline">Para Empresas</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Anuncie empregos e use nossa IA para analisar currículos e encontrar o match perfeito para sua equipe.
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold font-headline">Para Candidatos</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Candidate-se aos melhores empregos do mercado e receba recomendações de cursos para se destacar.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <Button size="lg" asChild>
                                <Link href="/recruitment">
                                    Ver Empregos Abertos
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        {recruitmentImage && (
                             <Image
                                src={recruitmentImage.imageUrl}
                                alt={recruitmentImage.description}
                                width={600}
                                height={400}
                                className="rounded-lg shadow-xl object-cover w-full h-full"
                                data-ai-hint={recruitmentImage.imageHint}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
