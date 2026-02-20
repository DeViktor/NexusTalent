'use client';
import { getSiteData } from "@/lib/site-data";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImagePlaceholder } from "@/lib/site-data";


export function CertificationsSection() {
    const [certifications, setCertifications] = useState<ImagePlaceholder[]>([]);

    useEffect(() => {
        async function loadData() {
            const data = await getSiteData();
            setCertifications(data.images.filter(p => p.id.startsWith('cert-')));
        }
        loadData();
    }, []);

    return (
        <section className="py-16 sm:py-24 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
                        Nossas Certificações e Acreditações
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Compromisso com a qualidade e excelência, reconhecido nacional e internacionalmente.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    {certifications.map(cert => (
                        <div key={cert.id} className="flex flex-col items-center gap-2" title={cert.description}>
                            <div className="relative w-36 h-24">
                                <Image
                                    src={cert.imageUrl}
                                    alt={cert.description}
                                    fill
                                    className="object-contain"
                                    data-ai-hint={cert.imageHint}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
