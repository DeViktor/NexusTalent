'use client';

import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';

type CandidateStatus = 'interessante' | 'rejeitado' | 'neutro';

interface CandidateCardProps {
    candidate: UserProfile & { status: CandidateStatus };
    onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
}


export const CandidateCard = ({ candidate, onStatusChange }: CandidateCardProps) => {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const handleStatusChange = (e: React.MouseEvent, newStatus: CandidateStatus) => {
        e.preventDefault(); // Impede a navegação ao clicar nos botões de status
        e.stopPropagation();
        onStatusChange(candidate.id, newStatus);
    }
    
    const statusClasses = {
        interessante: 'border-green-500',
        rejeitado: 'border-red-500',
        neutro: ''
    }

    return (
        <Card className={`hover:shadow-lg transition-shadow border-2 ${statusClasses[candidate.status]}`}>
            <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={candidate.profilePictureUrl} />
                    <AvatarFallback>{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-xl">{candidate.firstName} {candidate.lastName}</CardTitle>
                    <CardDescription>{candidate.academicTitle}</CardDescription>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 flex-wrap">
                        {candidate.functionalArea && <span className='flex items-center gap-1'><Briefcase size={14}/>{candidate.functionalArea}</span>}
                        {candidate.yearsOfExperience !== undefined && <span>&middot; {candidate.yearsOfExperience} anos</span>}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.skills?.slice(0, 5).map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
                <div className="flex gap-2">
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/recruiter/candidates/${candidate.id}`}>Ver Perfil Completo</Link>
                    </Button>
                    <div className='flex gap-1'>
                        <Button variant={candidate.status === 'interessante' ? 'default' : 'outline'} size="icon" onClick={(e) => handleStatusChange(e, 'interessante')} title="Marcar como interessante">
                            <ThumbsUp className={`h-5 w-5 ${candidate.status === 'interessante' ? '' : 'text-green-500'}`} />
                        </Button>
                        <Button variant={candidate.status === 'rejeitado' ? 'destructive' : 'outline'} size="icon" onClick={(e) => handleStatusChange(e, 'rejeitado')} title="Rejeitar">
                            <ThumbsDown className={`h-5 w-5 ${candidate.status === 'rejeitado' ? '' : 'text-red-500'}`} />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}