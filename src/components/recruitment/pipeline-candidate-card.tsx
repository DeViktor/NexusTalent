'use client';

import type { Application, UserProfile, ApplicationStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, ArrowRight, Eye, Percent, Edit2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";


interface PipelineCandidateCardProps {
    application: Application & { score?: number };
    candidate: UserProfile;
    onStatusChange: (applicationId: string, newStatus: ApplicationStatus, notes?: string) => void;
    onNotesChange: (applicationId: string, notes: string) => void;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const statusOptions: ApplicationStatus[] = ['Recebida', 'Triagem', 'Teste', 'Entrevista', 'Oferta', 'Contratado', 'Rejeitada'];

export function PipelineCandidateCard({ application, candidate, onStatusChange, onNotesChange }: PipelineCandidateCardProps) {
    const [currentNotes, setCurrentNotes] = useState(application.notes || '');

    useEffect(() => {
        setCurrentNotes(application.notes || '');
    }, [application.notes]);

    const handleStatusChange = (newStatus: ApplicationStatus) => {
        onStatusChange(application.id, newStatus, currentNotes);
        toast({
            title: "Status do Candidato Atualizado!",
            description: `${candidate.firstName} foi movido para a fase de "${newStatus}".`,
        });
    };

    const handleNotesBlur = () => {
        if (currentNotes !== application.notes) {
            onNotesChange(application.id, currentNotes);
             toast({
                title: "Anotação Salva!",
                description: `As suas anotações sobre ${candidate.firstName} foram salvas.`,
            });
        }
    };
    
    const applicationDate = application.applicationDate instanceof Date 
        ? application.applicationDate 
        : new Date();
    
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row items-start gap-3 space-y-0">
                <Avatar className="w-10 h-10 border">
                    <AvatarImage src={candidate.profilePictureUrl} />
                    <AvatarFallback>{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <h3 className="font-semibold text-sm">{candidate.firstName} {candidate.lastName}</h3>
                    <p className="text-xs text-muted-foreground">{candidate.academicTitle}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/dashboard/recruiter/candidates/${candidate.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> Ver Perfil
                            </Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         {statusOptions.filter(s => s !== application.status).map(status => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                                <ArrowRight className="mr-2 h-4 w-4" /> Mover para {status}
                            </DropdownMenuItem>
                         ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {application.score !== undefined && (
                     <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Percent size={12}/> Compatibilidade (IA)</p>
                            <span className="text-xs font-bold">{application.score}%</span>
                        </div>
                        <Progress value={application.score} className="h-1.5" />
                    </div>
                )}
                 <div className="space-y-2">
                    <label htmlFor={`notes-${application.id}`} className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Edit2 size={12} /> Anotações Privadas
                    </label>
                    <Textarea 
                        id={`notes-${application.id}`}
                        placeholder="Adicione suas notas..."
                        value={currentNotes}
                        onChange={(e) => setCurrentNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        className="text-xs h-20 resize-none"
                    />
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar size={14}/>
                    <span>
                         Candidatou-se {formatDistanceToNow(applicationDate, { addSuffix: true, locale: pt })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}