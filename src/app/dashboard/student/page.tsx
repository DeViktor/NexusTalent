'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, UserCircle, Download, Heart, Briefcase, Settings, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseRecommendations } from "@/components/dashboard/course-recommendations";
import { CertificateGenerator } from "@/components/student/certificate-generator";
import { WishlistCourses } from "@/components/student/wishlist-courses";
import { supabase } from "@/lib/supabase/client";
import { getVacancies } from "@/lib/supabase/vacancy-service";
import type { JobPosting, UserProfile } from "@/lib/types";
import type { Vacancy } from "@/lib/supabase/vacancy-service";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistJobs } from "@/components/student/wishlist-jobs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Component for Job Recommendations
const JobRecommendations = ({ userProfile }: { userProfile: UserProfile | null }) => {
    const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                if (userProfile?.academicTitle) {
                    const vacancies = await getVacancies(false);
                    const searchTerm = userProfile.academicTitle.toLowerCase();
                    const recommendations = (vacancies || [])
                        .map(v => ({
                            id: String(v.id),
                            title: v.title,
                            location: v.location,
                            type: v.job_type.toLowerCase().includes('part') ? 'Part-time' : v.job_type.toLowerCase().includes('remote') ? 'Remote' : 'Full-time',
                            category: 'Sem Categoria',
                            description: v.description,
                            recruiterId: String(v.recruiter_id),
                            postedDate: v.created_at ? new Date(v.created_at) : new Date(),
                            closingDate: v.expires_at ? new Date(v.expires_at) : undefined,
                            responsibilities: [],
                            requirements: Array.isArray(v.requirements) ? v.requirements : [],
                            aiScreeningQuestions: [],
                            screeningQuestions: [],
                            industry: undefined,
                            minExperience: undefined,
                            numberOfVacancies: undefined,
                            requiredNationality: undefined,
                            languages: undefined,
                            salaryRange: v.salary_range,
                            showSalary: undefined,
                            employerName: v.company,
                            aboutEmployer: undefined,
                            hideEmployerData: undefined,
                            minEducationLevel: undefined,
                        }))
                        .filter(v => v.title.toLowerCase().includes(searchTerm) || (v.location && userProfile.cidade && v.location.toLowerCase().includes(userProfile.cidade.toLowerCase())))
                        .slice(0, 3);
                    setRecommendedJobs(recommendations);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendations();
    }, [userProfile]);

    if (isLoading) {
        return <Skeleton className="h-24 w-full" />;
    }
    
    if (!userProfile?.academicTitle) {
         return (
            <div className="text-center p-4">
                <p className="text-muted-foreground text-sm mb-4">Ainda não definiu o seu título profissional para receber sugestões.</p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/student/profile"><Settings className="mr-2 h-4 w-4"/>Definir Perfil</Link>
                </Button>
            </div>
        )
    }

    if (recommendedJobs.length === 0) {
        return <p className="text-muted-foreground text-sm text-center p-4">Nenhum emprego encontrado para as suas preferências no momento.</p>
    }

    return (
        <div className="space-y-2">
            {recommendedJobs.map(job => (
                <Link href={`/recruitment/${job.id}`} key={job.id} className="block p-3 border rounded-md hover:bg-secondary">
                    <p className="font-semibold text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location}</p>
                </Link>
            ))}
        </div>
    );
};


import { getPurchasedCourses } from "@/lib/course-service";

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
                } else {
                    setUser(null);
                }
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setIsUserLoading(false);
            }
        };
        loadSession();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
                if (data) {
                    const fullName: string = data.name || '';
                    const [firstName, ...rest] = fullName.split(' ');
                    const lastName = rest.join(' ');
                    const role = (data.role || 'student') as UserProfile['userType'];
                    setUserProfile({
                        id: data.id,
                        firstName: firstName || fullName || 'Usuário',
                        lastName: lastName || '',
                        email: data.email,
                        userType: role,
                        profilePictureUrl: data.avatar_url,
                        summary: data.bio,
                        academicTitle: undefined,
                        cidade: undefined,
                        country: undefined,
                        phoneNumber: undefined,
                        company: data.company,
                    });
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
        };
        fetchProfile();
    }, [user]);
    
    // Courses
    const [enrolledCourses, setEnrolledCourses] = useState<Array<{ id: string; name: string; progress: number; grade: number | null; format: string }>>([]);
    const [activeApplications, setActiveApplications] = useState<Array<{ id: string; jobId: string; title: string; status: string }>>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            if (!user?.id) {
                if (active) {
                    setEnrolledCourses([]);
                    setActiveApplications([]);
                }
                return;
            }

            try {
                // Fetch REAL purchased courses
                try {
                    const courses = await getPurchasedCourses(user.id);
                    if (active) {
                        // For now, assume 0% progress for newly purchased courses
                        // In future, we can join with an 'enrollments' table if we track progress separately
                        const mappedCourses = courses.map(c => ({
                            id: c.id,
                            name: c.name,
                            progress: 0, // Default to 0 for now
                            grade: null,
                            format: c.format,
                        }));
                        setEnrolledCourses(mappedCourses);
                    }
                } catch (err) {
                    console.error("Failed to load purchased courses", err);
                    if (active) setEnrolledCourses([]);
                }

                // Candidaturas ativas do estudante
                const { data: apps } = await supabase
                    .from('applications')
                    .select('id, job_posting_id, status')
                    .eq('applicant_id', user.id);

                let mappedApps: Array<{ id: string; jobId: string; title: string; status: string }> = [];
                const appRows = Array.isArray(apps) ? apps : [];
                if (appRows.length > 0) {
                    const ids = Array.from(new Set(appRows.map(r => r.job_posting_id)));
                    const { data: vacancies } = await supabase
                        .from('vacancies')
                        .select('id, title')
                        .in('id', ids);
                    const titleById = new Map((vacancies || []).map((v: any) => [String(v.id), v.title ?? 'Vaga']));
                    mappedApps = appRows.map(r => ({
                        id: String(r.id),
                        jobId: String(r.job_posting_id),
                        title: titleById.get(String(r.job_posting_id)) ?? 'Vaga',
                        status: r.status ?? 'Em análise',
                    }));
                }
                if (active) setActiveApplications(mappedApps);
            } catch {
                if (active) {
                    // Keep existing state or clear if needed
                }
            }
        })();

        return () => { active = false };
    }, [user]);
    

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
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/student/applications/${app.id}`}>Ver Detalhes</Link>
                                        </Button>
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
                                <MessageSquare />
                                Mensagens com Recrutadores
                            </CardTitle>
                            <CardDescription>Veja as suas conversas com recrutadores aqui.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/student/conversations">Ver Mensagens</Link>
                            </Button>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase />
                                Oportunidades de Emprego
                            </CardTitle>
                             <CardDescription>As suas vagas guardadas e sugestões da IA num só lugar.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="recommended">
                                <TabsList className="w-full grid grid-cols-2 rounded-none">
                                    <TabsTrigger value="recommended">Recomendados</TabsTrigger>
                                    <TabsTrigger value="saved">Guardados</TabsTrigger>
                                </TabsList>
                                <TabsContent value="recommended" className="p-4">
                                     <JobRecommendations userProfile={userProfile} />
                                </TabsContent>
                                <TabsContent value="saved" className="p-4">
                                     <WishlistJobs />
                                </TabsContent>
                            </Tabs>
                             <div className="p-4 border-t flex flex-col gap-2">
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
