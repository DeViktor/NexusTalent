'use client';

import React, { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { getSiteData } from "@/lib/site-data";
import Image from "next/image";
import type { ImagePlaceholder } from "@/lib/site-data";

export function PartnersSection() {
    const [partners, setPartners] = useState<ImagePlaceholder[]>([]);
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    useEffect(() => {
        async function loadData() {
            const data = await getSiteData();
            setPartners(data.images.filter(p => p.id.startsWith('partner-')));
        }
        loadData();
    }, []);

    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
                        Nossos Clientes e Parceiros
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Construímos relações de confiança com empresas líderes em diversos setores.
                    </p>
                </div>
                <Carousel
                    plugins={[plugin.current]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {partners.map((partner, index) => (
                            <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="p-4 bg-card rounded-lg flex items-center justify-center h-32">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={partner.imageUrl}
                                            alt={partner.description}
                                            fill
                                            className="object-contain"
                                            data-ai-hint={partner.imageHint}
                                        />
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
        </section>
    );
}
