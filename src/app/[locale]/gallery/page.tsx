'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImages } from '@/lib/site-data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import type { ImagePlaceholder } from '@/lib/site-data';
import { ArrowLeft } from 'lucide-react';

export default function GalleryPage() {
  const [images, setImages] = useState<ImagePlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const galleryImages = getImages().filter(p => p.id.startsWith('gallery-'));
    setImages(galleryImages);
    setIsLoading(false);
  }, []);

  return (
    <>
      <Header />
      <main className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold">Galeria de Fotos</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore momentos e eventos da NexusTalent.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Dialog key={image.id}>
                  <DialogTrigger asChild>
                    <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] md:max-w-4xl h-[80vh] p-2">
                    <div className="relative w-full h-full">
                       <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-contain"
                       />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
