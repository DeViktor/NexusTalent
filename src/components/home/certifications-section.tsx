'use client';
import { getSiteData } from "@/lib/site-data";
import { useEffect, useState } from "react";


export function CertificationsSection() {
    const [certifications, setCertifications] = useState<Array<{ id: string; name: string; description: string }>>([]);

    useEffect(() => {
        async function loadData() {
            const data = await getSiteData();
            setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
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
                        <div key={cert.id} className="flex flex-col items-center gap-1 text-center">
                            <div className="font-semibold">{cert.name}</div>
                            <div className="text-sm text-muted-foreground">{cert.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
