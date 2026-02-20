'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import type { JobPosting, UserProfile, ApplicationStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, FileText, MessageSquare, Briefcase, Building, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { getApplication } from '@/lib/supabase/application-service';


const statusSteps: ApplicationStatus[] = ['Recebida', 'Triagem', 'Teste', 'Entrevista', 'Oferta', 'Contratado'];

const mockMessages = [
    { sender: 'recruiter', text: 'Olá, obrigado pelo seu interesse na vaga. O seu perfil parece muito interessante.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { sender: 'candidate', text: 'Olá, muito obrigado pelo contacto. Fico contente em saber!', timestamp: new Date(Date.now() - 1000 * 60 * 50 * 24) },
    { sender: 'recruiter', text: 'Gostaríamos de agendar uma breve conversa. Teria disponibilidade amanhã à tarde?', timestamp: new Date(Date.now() - 1000 * 60 * 30)},
];

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const applicationId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const [application, setApplication] = useState<{ id: string; jobPostingId: string; status: ApplicationStatus; applicationDate: Date } | null>(null);
    const [job, setJob] = useState<JobPosting | null>(null);
    const [recruiter, setRecruiter] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!applicationId) {
                setIsLoading(false);
                return;
            }
            const app = await getApplication(applicationId);
            if (!app) {
                setIsLoading(false);
                return;
            }
            setApplication({
                id: app.id,
                jobPostingId: app.job_posting_id,
                status: app.status as ApplicationStatus,
                applicationDate: app.created_at ? new Date(app.created_at) : new Date(),
            });

            const v = app.vacancies;
            if (v) {
                const mappedJob: JobPosting = {
                    id: v.id,
                    title: v.title,
                    description: v.description,
                    employerName: v.company,
                    location: v.location,
                    type: v.job_type as JobPosting['type'],
                    salaryRange: v.salary_range ?? undefined,
                    showSalary: Boolean(v.salary_range),
                    postedDate: v.created_at ? new Date(v.created_at) : new Date(),
                    closingDate: v.expires_at ? new Date(v.expires_at) : undefined,
                    category: 'geral',
                    responsibilities: Array.isArray(v.benefits) ? v.benefits : [],
                    requirements: Array.isArray(v.requirements) ? v.requirements : [],
                    recruiterId: v.recruiter_id,
                    featured: Boolean(v.featured),
                };
                setJob(mappedJob);
                // Buscar recrutador pelo recruiter_id
                const { data: recruiterRow } = await supabase.from('users').select('*').eq('id', v.recruiter_id).single();
                if (recruiterRow) {
                    const fullName: string = recruiterRow.name || '';
                    const [firstName, ...rest] = fullName.split(' ');
                    const lastName = rest.join(' ');
                    setRecruiter({
                        id: recruiterRow.id,
                        firstName: firstName || fullName || 'Recrutador',
                        lastName: lastName || '',
                        email: recruiterRow.email,
                        userType: 'recruiter',
                        profilePictureUrl: recruiterRow.avatar_url,
                        summary: recruiterRow.bio,
                        // company em recruiterRow.company
                    });
                }
            }
            setIsLoading(false);
        };
        fetchData();
    }, [applicationId]);
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!application || !job) {
        notFound();
    }
    
    const currentStepIndex = statusSteps.indexOf(application.status);
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    const handleWithdraw = () => {
        toast({
            title: "Candidatura Retirada",
            description: "A sua candidatura foi retirada com sucesso (simulação)."
        });
        router.push('/dashboard/student');
    }
    
    const safeApplicationDate = application.applicationDate;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Application Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado da Candidatura</CardTitle>
                            <CardDescription>
                                Candidatura para <strong className="text-primary">{job.title}</strong> enviada em {safeApplicationDate ? format(safeApplicationDate, "d 'de' MMMM, yyyy", { locale: pt }) : 'data indisponível'}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="relative flex items-center justify-between">
                                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-secondary"></div>
                                <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary transition-all" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}></div>
                                {statusSteps.map((step, index) => (
                                    <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", index <= currentStepIndex ? 'bg-primary' : 'bg-secondary border-2')}>
                                            {index <= currentStepIndex && <Check className="h-4 w-4 text-primary-foreground"/>}
                                        </div>
                                        <p className={cn("text-xs mt-2 text-center", index <= currentStepIndex ? 'font-semibold text-primary' : 'text-muted-foreground')}>{step}</p>
                                    </div>
                                ))}
                            </div>
                            {application.status === 'Rejeitada' && (
                                <div className="mt-6 text-center text-destructive flex items-center justify-center gap-2">
                                    <XCircle /> Sua candidatura não foi selecionada para a próxima fase.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chat with Recruiter */}
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MessageSquare /> Conversa com o Recrutador</CardTitle>
                            {recruiter && <CardDescription>Conversa com {recruiter.firstName} {recruiter.lastName} sobre a sua candidatura.</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {mockMessages.map((msg, index) => (
                                    <div key={index} className={cn("flex gap-3", msg.sender === 'candidate' ? 'justify-end' : 'justify-start')}>
                                        {msg.sender === 'recruiter' && recruiter && (
                                            <Avatar>
                                                <AvatarImage src={recruiter.profilePictureUrl} />
                                                <AvatarFallback>{getInitials(`${recruiter.firstName} ${recruiter.lastName}`)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-md p-3 rounded-lg", msg.sender === 'candidate' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex gap-2">
                                <Textarea placeholder="Escreva a sua resposta..." />
                                <Button>Enviar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6 sticky top-24 self-start">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase /> Sobre o Emprego</CardTitle>
                            <CardDescription>Resumo dos detalhes do emprego.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                             <div className="flex items-center gap-3">
                                <Building className="w-5 h-5 text-muted-foreground" />
                                <span>{job.employerName || 'Empresa Confidencial'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-muted-foreground" />
                                <span>{job.type} &middot; {job.location}</span>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-2">
                                <a href={`/recruitment/${job.id}`} target="_blank">Ver Anúncio Original</a>
                            </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText /> Suas Ações</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Button variant="destructive" className="w-full" onClick={handleWithdraw}>
                                <XCircle className="mr-2 h-4 w-4" /> Retirar Candidatura
                             </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
    