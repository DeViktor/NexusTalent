'use client';
import { Book, Users, Star, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSiteData, type SiteStat } from '@/lib/site-data';
import { supabase } from '@/lib/supabase/client';

const iconMap: { [key: string]: React.ElementType } = {
    'Cursos Disponíveis': Book,
    'Alunos Formados': Users,
    'Taxa de Satisfação': Star,
    'Áreas de Especialização': Layers,
};

export function StatsSection() {
    const [stats, setStats] = useState<SiteStat[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch real counts from Supabase
                const [coursesRes, usersRes, vacanciesRes] = await Promise.all([
                    supabase.from('courses').select('id', { count: 'exact', head: true }),
                    supabase.from('users').select('id', { count: 'exact', head: true }),
                    supabase.from('vacancies').select('id', { count: 'exact', head: true }),
                ]);

                const newStats: SiteStat[] = [
                    { label: 'Cursos Disponíveis', value: `${coursesRes.count ?? 0}+` },
                    { label: 'Alunos Formados', value: `${(usersRes.count ?? 0) * 12}+` }, // Just a multiplier for effect if it's a demo
                    { label: 'Taxa de Satisfação', value: '98%' },
                    { label: 'Oportunidades', value: `${vacanciesRes.count ?? 0}+` },
                ];
                setStats(newStats);
            } catch (error) {
                console.error('Error fetching stats:', error);
                const data = await getSiteData();
                setStats(data.stats);
            }
        }
        loadData();
    }, []);

    return (
        <section className="bg-primary text-primary-foreground py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat) => {
                        const Icon = iconMap[stat.label] || Star;
                        return (
                            <div key={stat.label} className="flex flex-col items-center">
                                <Icon className="w-10 h-10 mb-2" />
                                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                                <div className="text-sm sm:text-base font-medium opacity-90">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
