'use client';

import { useParams, notFound, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { type JobPosting, type UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeResumeAction } from "@/app/actions";
import { RecruiterApplicationCard } from "@/components/recruitment/recruiter-application-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getVacancy } from "@/lib/supabase/vacancy-service";
import { getApplicationsByVacancy } from "@/lib/supabase/application-service";

interface AnalyzedCandidate extends UserProfile {
    score?: number;
}

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});


export default function TriagePage() {
    const params = useParams();
    const vacancyId = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
    const { toast } = useToast();

    const [vacancy, setVacancy] = useState<JobPosting | null | undefined>(undefined);
    const [candidates, setCandidates] = useState<AnalyzedCandidate[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!vacancyId) return;
            const v = await getVacancy(vacancyId);
            if (!v) {
                setVacancy(null);
                return;
            }
            const mappedVacancy: JobPosting = {
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
                aiScreeningQuestions: [],
                screeningQuestions: [],
                recruiterId: v.recruiter_id,
                featured: Boolean(v.featured),
            };
            setVacancy(mappedVacancy);

            const apps = await getApplicationsByVacancy(vacancyId);
            const candidatesFromApps: AnalyzedCandidate[] = (apps || [])
                .map((app: any) => {
                    const fullName: string = app.users?.name || '';
                    const [firstName, ...rest] = fullName.split(' ');
                    const lastName = rest.join(' ');
                    const candidate: UserProfile = {
                        id: app.applicant_id,
                        firstName: firstName || fullName || 'Candidato',
                        lastName: lastName || '',
                        email: app.users?.email || '',
                        userType: 'student',
                        profilePictureUrl: app.users?.avatar_url,
                        summary: app.users?.bio,
                        academicTitle: undefined,
                        cidade: undefined,
                        languages: [],
                    };
                    return candidate as AnalyzedCandidate;
                });
            setCandidates(candidatesFromApps);
        };
        fetchData();
    }, [vacancyId]);


    const handleAnalyzeAll = async () => {
        if (!vacancy || candidates.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum candidato para analisar.' });
            return;
        }
        setIsAnalyzing(true);
        const jobDescription = `${vacancy.title}\n\n${vacancy.description}\n\nResponsabilidades:\n${(vacancy.responsibilities || []).join('\n')}\n\nRequisitos:\n${(vacancy.requirements || []).join('\n')}`;

        // Mock file fetching and analysis
        const updatedCandidates = await Promise.all(
            candidates.map(async (candidate) => {
                // In a real app, you'd fetch the resume file from storage (e.g., candidate.resumeUrl)
                // Here we simulate it by creating a dummy file object for the purpose of the action.
                // The actual content analysis is mocked by the AI flow. We just need the structure.
                try {
                     const resumeDataUri = "data:application/pdf;base64,JVBERi0xLjcK..."; // Dummy base64 data
                     const result = await analyzeResumeAction({ jobDescription, resumeDataUri });
                     return { ...candidate, score: result.candidateRanking };
                } catch (error) {
                    console.error(`Erro ao analisar ${candidate.firstName}:`, error);
                    return { ...candidate, score: 0 }; // Assign a score of 0 on failure
                }
            })
        );
        
        setCandidates(updatedCandidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)));
        setIsAnalyzing(false);
        toast({ title: 'Análise Concluída', description: 'Todos os candidatos foram analisados com sucesso.' });
    };

    const handleSelectCandidate = (candidateId: string, isSelected: boolean) => {
        setSelectedCandidates(prev => 
            isSelected ? [...prev, candidateId] : prev.filter(id => id !== candidateId)
        );
    };

    const handleSelectOver50 = () => {
        const over50 = candidates
            .filter(c => (c.score ?? 0) > 50)
            .map(c => c.id);
        setSelectedCandidates(over50);
    };

    const handleAddToPipeline = () => {
        if (selectedCandidates.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum candidato selecionado.' });
            return;
        }

        const candidatesWithScores = candidates
            .filter(c => selectedCandidates.includes(c.id))
            .map(c => ({ id: c.id, score: c.score, name: `${c.firstName} ${c.lastName}` }));

        const analysisParam = encodeURIComponent(JSON.stringify(candidatesWithScores));
        router.push(`/dashboard/recruiter/vacancies/${vacancyId}/applications?analysis=${analysisParam}`);
    };


    if (vacancy === undefined) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!vacancy) {
        return notFound();
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex-grow">
                     <Button variant="outline" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar às Vagas
                    </Button>
                    <h1 className="font-headline text-3xl font-bold">Triagem de IA para: <span className="text-primary">{vacancy.title}</span></h1>
                    <p className="text-muted-foreground mt-1">Analise, selecione e adicione candidatos ao seu pipeline de recrutamento.</p>
                </div>
                 <div className="flex gap-2">
                    {candidates.some(c => c.score !== undefined) && (
                        <Button variant="outline" onClick={handleSelectOver50}>
                            <Check className="mr-2 h-4 w-4" /> Selecionar &gt; 50%
                        </Button>
                    )}
                    <Button onClick={handleAnalyzeAll} disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analisar Todos com IA
                    </Button>
                    <Button onClick={handleAddToPipeline} disabled={selectedCandidates.length === 0}>
                        Adicionar ao Pipeline ({selectedCandidates.length})
                    </Button>
                </div>
            </div>

            {candidates.length > 0 ? (
                 <div className="space-y-4">
                    {candidates.map(candidate => (
                        <RecruiterApplicationCard 
                            key={candidate.id}
                            candidate={candidate}
                            score={candidate.score}
                            isSelected={selectedCandidates.includes(candidate.id)}
                            onSelect={handleSelectCandidate}
                        />
                    ))}
                </div>
            ) : (
                <Alert>
                    <Users className="h-4 w-4" />
                    <AlertTitle>Nenhum candidato!</AlertTitle>
                    <AlertDescription>
                        Ainda não há candidatos para esta vaga. Divulgue a sua vaga para começar a receber candidaturas.
                    </AlertDescription>
                </Alert>
            )}

        </div>
    );
}