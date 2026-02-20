'use client';

import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, ThumbsUp, ThumbsDown, User, Percent } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";


interface RecruiterApplicationCardProps {
    candidate: UserProfile;
    score?: number;
    isSelected: boolean;
    onSelect: (candidateId: string, isSelected: boolean) => void;
}

export const RecruiterApplicationCard = ({ candidate, score, isSelected, onSelect }: RecruiterApplicationCardProps) => {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    return (
        <Card className={`transition-shadow hover:shadow-md ${isSelected ? 'border-primary' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4">
                 <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(candidate.id, !!checked)}
                    className="h-6 w-6"
                />
                <Avatar className="w-12 h-12 border">
                    <AvatarImage src={candidate.profilePictureUrl} />
                    <AvatarFallback>{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <CardTitle className="font-headline text-lg">{candidate.firstName} {candidate.lastName}</CardTitle>
                    <CardDescription>{candidate.academicTitle}</CardDescription>
                </div>
                <div className="flex flex-col items-end w-48">
                    {score !== undefined ? (
                        <>
                           <div className="flex items-center gap-2 w-full">
                                <Progress value={score} className="h-2" />
                                <span className="font-bold text-lg text-primary">{score}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Compatibilidade</p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Não analisado</p>
                    )}
                </div>
                 <Button asChild variant="outline">
                    <Link href={`/dashboard/recruiter/candidates/${candidate.id}`}>Ver Perfil</Link>
                </Button>
            </CardHeader>
        </Card>
    );
}
