import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { WishlistProvider } from '@/hooks/use-wishlist.tsx';
import { JobWishlistProvider } from '@/hooks/use-job-wishlist';
import { SupabaseProvider } from '@/lib/supabase/provider';
import { Chatbot } from '@/components/shared/chatbot';
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: 'NexusTalent - Cursos e Recrutamento',
    description: 'Plataforma de cursos online, presencial e recrutamento e seleção de pessoal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={cn('font-body antialiased bg-background min-h-screen flex flex-col')}>
                <SupabaseProvider>
                    <WishlistProvider>
                        <JobWishlistProvider>
                            {children}
                            <Chatbot />
                            <Toaster />
                        </JobWishlistProvider>
                    </WishlistProvider>
                </SupabaseProvider>
            </body>
        </html>
    );
}
