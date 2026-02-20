'use client';

import { useParams, notFound, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { type JobPosting, type UserProfile, type ApplicationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileDown, GraduationCap } from "lucide-react";
import { RecruitmentPipeline } from "@/components/recruitment/recruitment-pipeline";
// adiar a importação do jsPDF/autotable para evitar erros em ambientes onde o window ainda não está disponível
import { getVacancy } from "@/lib/supabase/vacancy-service";
import { getApplicationsByVacancy } from "@/lib/supabase/application-service";

interface TriagedCandidate {
  id: string;
  userId: string;
  jobPostingId: string;
  applicationDate: Date;
  status: ApplicationStatus;
  notes?: string;
  candidate: UserProfile;
  score?: number;
}

// Extend jsPDF interface to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function VacancyApplicationsPage() {
    const params = useParams();
    const vacancyId = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [vacancy, setVacancy] = useState<JobPosting | null | undefined>(undefined);
    const [applications, setApplications] = useState<TriagedCandidate[]>([]);
    
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
            let combinedApps: TriagedCandidate[] = (apps || []).map((app: any) => {
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
                };
                return {
                    id: app.id,
                    userId: app.applicant_id,
                    jobPostingId: app.job_posting_id,
                    applicationDate: app.created_at ? new Date(app.created_at) : new Date(),
                    status: app.status as ApplicationStatus,
                    notes: app.notes,
                    candidate,
                };
            });

            const analysisParam = searchParams.get('analysis');
            if (analysisParam) {
                try {
                    const triagedData = JSON.parse(decodeURIComponent(analysisParam)) as { id: string, name: string, score: number }[];
                    triagedData.forEach(t => {
                        const idx = combinedApps.findIndex(a => `${a.candidate.firstName} ${a.candidate.lastName}`.toLowerCase() === t.name.split('.')[0].replace(/_/g, ' ').toLowerCase());
                        if (idx !== -1) {
                            combinedApps[idx] = { ...combinedApps[idx], score: t.score, status: combinedApps[idx].status === 'Recebida' ? 'Triagem' : combinedApps[idx].status };
                        } else {
                            combinedApps.push({
                                id: `${t.id}_${vacancyId}`,
                                userId: t.id,
                                jobPostingId: vacancyId,
                                applicationDate: new Date(),
                                status: 'Triagem',
                                candidate: {
                                    id: t.id,
                                    firstName: t.name.split(' ')[0],
                                    lastName: t.name.split(' ').slice(1).join(' '),
                                    email: '',
                                    userType: 'student',
                                },
                                score: t.score,
                            });
                        }
                    });
                } catch (e) {
                    console.error('Failed to parse triaged candidates from URL:', e);
                }
            }

            setApplications(combinedApps);
        };
        fetchData();
    }, [vacancyId, searchParams]);

    const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus, notes?: string) => {
        setApplications(prev => prev.map(app => 
            app.id === applicationId 
            ? { ...app, status: newStatus, notes: notes !== undefined ? notes : app.notes } 
            : app
        ));
    };

    const handleGenerateReport = async () => {
        if (!vacancy) return;

        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        // --- Header ---
        // Logo (simple text representation)
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Nexus", 14, 22);
        doc.setTextColor(33, 150, 243); // Primary color
        doc.text("Talent", 34, 22);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(`Relatório de Recrutamento: ${vacancy.title}`, 14, 40);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Vaga ID: ${vacancy.id}`, 14, 48);
        doc.text(`Total de Candidatos: ${applications.length}`, 14, 54);

        // --- Table ---
        const tableData = applications.map(app => [
            `${app.candidate.firstName} ${app.candidate.lastName}`,
            app.status,
            app.score !== undefined ? `${app.score}%` : 'N/A',
            app.candidate.academicTitle || 'N/A'
        ]);

        // @ts-expect-error autotable é adicionado via side-effect
        (doc as any).autoTable({
            startY: 65,
            head: [['Candidato', 'Status', 'Pontuação IA', 'Habilitações']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [29, 113, 184] }, // Darker primary color for header
            didDrawPage: (data) => {
                // --- Footer ---
                doc.setFontSize(8);
                doc.setTextColor(150);
                const footerText = `Gerado por NexusTalent | ${new Date().toLocaleDateString('pt-PT')}`;
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        doc.save(`Relatorio_${vacancy.title.replace(/ /g, '_')}.pdf`);
    };

    if (vacancy === undefined) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!vacancy) {
        return notFound();
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 shrink-0">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar às Minhas Vagas
                    </Button>
                     <Button variant="outline" onClick={handleGenerateReport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Gerar Relatório (PDF)
                    </Button>
                </div>
                
                <div className="mb-8">
                    <h1 className="font-headline text-3xl font-bold">Pipeline de Recrutamento</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        <span className="font-semibold">{vacancy.title}</span> - {applications.length} candidatura(s) no total.
                    </p>
                </div>
            </div>
            
            <RecruitmentPipeline 
                applications={applications}
                onStatusChange={handleStatusChange} 
            />
        </div>
    );
}
