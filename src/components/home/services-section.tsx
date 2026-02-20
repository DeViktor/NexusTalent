'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, GraduationCap, Handshake } from "lucide-react";
import Link from "next/link";

const services = [
    {
        title: "Recrutamento & Seleção",
        description: "Utilizamos tecnologia e expertise para encontrar os talentos certos para a sua empresa, otimizando o seu processo de contratação.",
        icon: Briefcase,
        link: "/recruitment"
    },
    {
        title: "Formação & Desenvolvimento",
        description: "Oferecemos um vasto catálogo de cursos para capacitar os seus colaboradores e impulsionar o crescimento profissional contínuo.",
        icon: GraduationCap,
        link: "/courses"
    },
    {
        title: "Cedência de Mão de Obra / Outsourcing",
        description: "Fornecemos equipas especializadas e flexíveis para apoiar os seus projetos, garantindo eficiência e qualidade sem sobrecarregar a sua estrutura interna.",
        icon: Handshake,
        link: "/about"
    }
];

export function ServicesSection() {
    return (
        <section className="py-16 sm:py-24 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
                        Nossas Soluções para a sua Empresa
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Soluções integradas de capital humano para impulsionar o sucesso do seu negócio.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <Link href={service.link} key={index} className="group">
                             <Card className="text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <CardHeader className="items-center">
                                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <service.icon className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="font-headline text-xl pt-4">{service.title}</CardTitle>
                                    <CardDescription className="pt-2">{service.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
