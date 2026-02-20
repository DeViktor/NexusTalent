'use client';

import type { Application, JobPosting, UserProfile, ApplicationStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Briefcase, User, Calendar, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getVacancy } from '@/lib/supabase/vacancy-service';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface ApplicationCardProps {
    application: Application;
    onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
}

const UserInfo = ({ userId, onUserLoad }: { userId: string, onUserLoad: (user: UserProfile) => void }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
                if (error) throw error;
                if (data) {
                    const mapped: UserProfile = {
                        id: String(data.id),
                        firstName: (data.name ?? '').split(' ')[0] ?? '',
                        lastName: (data.name ?? '').split(' ').slice(1).join(' ') ?? '',
                        email: data.email ?? '',
                        phoneNumber: data.phone_number ?? undefined,
                        userType: (data.role ?? 'student') as UserProfile['userType'],
                        profilePictureUrl: data.avatar_url ?? undefined,
                        summary: data.bio ?? undefined,
                        resumeUrl: data.resume_url ?? undefined,
                        academicTitle: data.academic_title ?? undefined,
                        nationality: data.nationality ?? undefined,
                        cidade: data.cidade ?? undefined,
                        dateOfBirth: data.date_of_birth ?? undefined,
                        gender: data.gender as UserProfile['gender'],
                        languages: Array.isArray(data.languages) ? data.languages : undefined,
                        educationLevel: data.education_level as any,
                        yearsOfExperience: data.years_of_experience ?? undefined,
                        functionalArea: data.functional_area ?? undefined,
                        subFunctionalArea: data.sub_functional_area ?? undefined,
                        skills: Array.isArray(data.skills) ? data.skills : undefined,
                        professionalLevel: data.professional_level as any,
                        preferredContractType: data.preferred_contract_type as any,
                        receivesNotifications: data.receives_notifications ?? undefined,
                        receivesJobAlerts: data.receives_job_alerts ?? undefined,
                    };
                    setUser(mapped);
                    onUserLoad(mapped);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [userId, onUserLoad]);


    if (isLoading) {
        return <Skeleton className="h-5 w-3/4" />;
    }

    if (!user) {
        return <p className="text-sm text-destructive">Utilizador não encontrado</p>;
    }

    return (
        <CardTitle className="font-headline text-xl">{user.firstName} {user.lastName}</CardTitle>
    );
};

export function ApplicationCard({ application, onStatusChange }: ApplicationCardProps) {
    const [job, setJob] = useState<JobPosting | null>(null);
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const v = await getVacancy(application.jobPostingId);
                if (v) {
                    const mapped: JobPosting = {
                        id: String(v.id),
                        title: v.title ?? '',
                        location: v.location ?? '—',
                        type: (v.job_type ?? 'Full-time') as JobPosting['type'],
                        category: (v as any).category ?? 'geral',
                        description: v.description ?? '',
                        recruiterId: String(v.recruiter_id ?? ''),
                        postedDate: new Date(),
                        responsibilities: Array.isArray(v.requirements) ? v.requirements : [],
                        requirements: Array.isArray(v.requirements) ? v.requirements : [],
                        industry: (v as any).industry,
                        salaryRange: v.salary_range,
                        showSalary: (v as any).show_salary,
                        employerName: v.company,
                    };
                    setJob(mapped);
                } else {
                    setJob(null);
                }
            } catch {
                setJob(null);
            }
        };
        fetchJob();
    }, [application.jobPostingId]);

    // Mock application date if it's a Timestamp object for display
    const applicationDate = application.applicationDate instanceof Date 
        ? application.applicationDate 
        : new Date(); // Fallback for mock data

    const handleStatusChange = (newStatus: ApplicationStatus) => {
        onStatusChange(application.id, newStatus);
        toast({
            title: "Status Atualizado!",
            description: `A candidatura foi movida para '${newStatus}'.`
        });
    };


    return (
        <Card className="flex flex-col">
            <CardHeader>
                 {job && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Briefcase size={14} /> 
                        <span>{job.title}</span>
                    </div>
                )}
                <UserInfo userId={application.userId} onUserLoad={setUserProfile} />
                <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar size={14} /> 
                    {applicationDate ? 
                    `candidatou-se ${formatDistanceToNow(applicationDate, { addSuffix: true, locale: pt })}` 
                    : 'Data indisponível'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div className="mb-4">
                    <Badge>{application.status}</Badge>
                </div>
                <div className="flex gap-2 justify-between">
                    {userProfile?.resumeUrl ? (
                         <Button asChild variant="outline" size="sm" className="flex-1">
                            <a href={userProfile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4"/>
                                Ver CV
                            </a>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                            <Download className="mr-2 h-4 w-4"/>
                            Sem CV
                        </Button>
                    )}
                    <div className='flex gap-1'>
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange('Triagem')} title="Marcar como interessante">
                            <ThumbsUp className="h-5 w-5 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange('Rejeitada')} title="Rejeitar">
                            <ThumbsDown className="h-5 w-5 text-red-500" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
