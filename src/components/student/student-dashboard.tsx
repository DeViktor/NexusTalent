'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, UserCircle, Download, Heart, Briefcase, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseRecommendations } from "@/components/dashboard/course-recommendations";
import { CertificateGenerator } from "@/components/student/certificate-generator";
import { WishlistCourses } from "@/components/student/wishlist-courses";
import { users } from "@/lib/users";
import { getJobs } from "@/lib/vacancy-service";
import type { JobPosting, UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Component for Job Recommendations
const JobRecommendations = ({ userProfile }: { userProfile: UserProfile | null }) => {
    const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userProfile?.functionalArea) {
            const allJobs = getJobs();
            // Simple recommendation: filter jobs where the category includes the user's functional area
            const searchTerm = userProfile.functionalArea.toLowerCase();
            const recommendations = allJobs
                .filter(v => v.category.toLowerCase().includes(searchTerm) || (v.location && userProfile.cidade && v.location.toLowerCase().includes(userProfile.cidade.toLowerCase())))
                .slice(0, 3);
            setRecommendedJobs(recommendations);
        }
        setIsLoading(false);
    }, [userProfile]);

    if (isLoading) {
        return <Skeleton className="h-24 w-full" />;
    }
    
    if (!userProfile?.functionalArea) {
         return (
            <>
                <p className="text-muted-foreground text-sm mb-4">Ainda não definiu as suas preferências de emprego.</p>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/student/profile"><Settings className="mr-2 h-4 w-4"/>Definir Preferências</Link>
                </Button>
            </>
        )
    }

    if (recommendedJobs.length === 0) {
        return <p className="text-muted-foreground text-sm">Nenhum emprego encontrado para as suas preferências no momento.</p>
    }

    return (
        <div className="space-y-2">
            {recommendedJobs.map(job => (
                <Link href={`/recruitment/${job.id}`} key={job.id} className="block p-2 border rounded-md hover:bg-secondary">
                    <p className="font-semibold text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location}</p>
                </Link>
            ))}
        </div>
    );
};


export default function StudentDashboardPage() {
    const [user, setUser] = useState<any | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        let active = true;
        const loadSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                const json = await res.json();
                if (!active) return;
                if (json?.ok && json?.user) {
                    setUser(json.user);
                    const profile = users.find(u => u.id === json.user.id);
                    setUserProfile(profile || null);
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            } catch {
                if (active) {
                    setUser(null);
                    setUserProfile(null);
                }
            } finally {
                if (active) setIsUserLoading(false);
            }
        };
        loadSession();
        return () => { active = false; };
    }, []);
    
    // Mock data for enrolled courses
    const enrolledCourses = [
        { id: 'TA-001', name: 'Técnicas de Apresentação', progress: 75, grade: null, format: 'Online' },
        { id: 'GC-002', name: 'Gestão de Conflitos', progress: 40, grade: null, format: 'Presencial' },
        { id: 'EN-427', name: 'Excel Avançado', progress: 100, grade: 95, format: 'Online' },
        { id: 'GE-003', name: 'Gestão Emocional', progress: 100, grade: 92, format: 'Presencial' },
    ];

    const activeApplications = [
        { id: 1, title: 'Desenvolvedor Frontend Sênior', status: 'Em análise' },
        { id: 2, title: 'Gestor de Projetos de TI', status: 'Entrevista agendada' },
    ];
    

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Painel do Formando & Candidato</h1>
                <p className="text-muted-foreground">Bem-vindo! A sua jornada de aprendizagem e carreira começa aqui.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase />
                                As Minhas Candidaturas Ativas
                            </CardTitle>
                             <CardDescription>Acompanhe o estado das suas candidaturas a empregos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {activeApplications.length > 0 ? (
                                <div className="space-y-3">
                                {activeApplications.map(app => (
                                    <div key={app.id} className="flex justify-between items-center p-3 border rounded-md bg-secondary/30">
                                        <div>
                                            <p className="font-semibold">{app.title}</p>
                                            <p className="text-sm text-primary">{app.status}</p>
                                        </div>
                                        <Button variant="outline" size="sm">Ver Detalhes</Button>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center p-4">Ainda não tem candidaturas ativas.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enrolled Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen />
                                Meus Cursos em Andamento
                            </CardTitle>
                            <CardDescription>Continue de onde parou e acompanhe seu progresso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {enrolledCourses.filter(c => c.progress < 100).map(course => (
                                    <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="block hover:bg-secondary/50 p-4 rounded-lg transition-colors border">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-medium">{course.name}</h4>
                                            <span className="text-sm font-semibold text-primary">{course.progress}%</span>
                                        </div>
                                        <Progress value={course.progress} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-2">Modalidade: {course.format}</p>
                                    </Link>
                                ))}
                            </div>
                             <Button asChild className="mt-6">
                                <Link href="/courses">Explorar mais cursos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <WishlistCourses />
                    
                    <CourseRecommendations />
                    
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle />
                                Meu Perfil Profissional
                            </CardTitle>
                             <CardDescription>Mantenha seu perfil atualizado para se destacar para os recrutadores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground text-sm mb-4">Um perfil completo aumenta em até 5x as suas chances de ser contactado.</p>
                             <div className="flex flex-col gap-2">
                                <Button asChild className="w-full">
                                    <Link href="/dashboard/student/profile">Gerir Meu Perfil</Link>
                                </Button>
                                 <Button asChild variant="outline" className="w-full">
                                    <Link href="/cv-builder">Construtor de CV</Link>
                                </Button>
                             </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase />
                                Oportunidades de Emprego
                            </CardTitle>
                             <CardDescription>Receba sugestões de empregos com base nas suas preferências.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <JobRecommendations userProfile={userProfile} />
                             <div className="flex flex-col gap-2 mt-4">
                                 <Button asChild className="w-full" variant="default">
                                    <Link href="/recruitment">Ver Mais Empregos</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/recruitment"><Bell className="mr-2 h-4 w-4"/>Criar Alertas</Link>
                                </Button>
                             </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award />
                                Meus Certificados
                            </CardTitle>
                            <CardDescription>Os seus certificados serão emitidos e guardados aqui.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {enrolledCourses.filter(c => c.progress === 100).length > 0 ? (
                                <div className="space-y-2">
                                  {enrolledCourses.filter(c => c.progress === 100).map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary/30">
                                        <div>
                                            <p className="font-semibold text-sm">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">Nota Final: {c.grade}%</p>
                                        </div>
                                        <CertificateGenerator courseId={c.id} grade={c.grade!} />
                                    </div>
                                  ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">Conclua cursos para ganhar certificados.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
