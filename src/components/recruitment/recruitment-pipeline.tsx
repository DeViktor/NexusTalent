'use client';

import { type Application, type UserProfile, type ApplicationStatus } from "@/lib/types";
import { PipelineCandidateCard } from "./pipeline-candidate-card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useState } from "react";

interface RecruitmentPipelineProps {
    applications: (Application & { candidate: UserProfile; score?: number })[];
    onStatusChange: (applicationId: string, newStatus: ApplicationStatus, notes?: string) => void;
}

const pipelineStages: { title: string, statuses: ApplicationStatus[], description: string }[] = [
    { title: 'Candidaturas', statuses: ['Recebida'], description: 'Novas candidaturas para triagem inicial.' },
    { title: 'Triagem', statuses: ['Triagem'], description: 'Candidatos iniciais para análise.' },
    { title: 'Teste', statuses: ['Teste'], description: 'Candidatos em fase de testes técnicos ou psicotécnicos.' },
    { title: 'Entrevista', statuses: ['Entrevista'], description: 'Candidatos selecionados para entrevista.' },
    { title: 'Oferta', statuses: ['Oferta'], description: 'Candidatos que receberam uma oferta de emprego.' },
    { title: 'Contratado', statuses: ['Contratado'], description: 'Candidatos que aceitaram a oferta.' },
    { title: 'Rejeitado', statuses: ['Rejeitada'], description: 'Candidatos não selecionados.' },
];

export function RecruitmentPipeline({ applications, onStatusChange }: RecruitmentPipelineProps) {
    
    const handleNotesChange = (applicationId: string, notes: string) => {
        // Find the current status to pass it along, as notes change doesn't change status
        const app = applications.find(a => a.id === applicationId);
        if (app) {
            onStatusChange(applicationId, app.status, notes);
        }
    };
    
    return (
        <ScrollArea className="flex-grow w-full">
            <div className="flex gap-6 p-4 sm:p-6 lg:p-8 pt-0">
                {pipelineStages.map((stage) => {
                    const stageApplications = applications.filter(app => {
                         return stage.statuses.includes(app.status);
                    }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                    
                    return (
                        <div key={stage.title} className="w-full sm:w-80 flex-shrink-0">
                            <div className="flex items-baseline gap-2 mb-4">
                                <h2 className="text-lg font-semibold font-headline">{stage.title}</h2>
                                <span className="text-sm font-medium text-muted-foreground">({stageApplications.length})</span>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-2 h-full min-h-[500px]">
                                <div className="space-y-4">
                                    {stageApplications.map(app => (
                                        <PipelineCandidateCard 
                                            key={app.id} 
                                            application={app} 
                                            candidate={app.candidate} 
                                            onStatusChange={onStatusChange}
                                            onNotesChange={handleNotesChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
