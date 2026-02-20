
'use client';

import { notFound, useRouter, useParams } from "next/navigation";
import { users } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Briefcase, GraduationCap, Award, FileText, Download, ThumbsUp, ThumbsDown, MessageSquare, Building, MapPin, Cake, Languages, Book, ChevronRight, Phone } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

function ProfileView({ profile }: { profile: UserProfile }) {
    const router = useRouter();

    const formattedDate = profile.dateOfBirth ? format(parseISO(profile.dateOfBirth), "d 'de' MMMM 'de' yyyy", { locale: pt }) : 'Não informado';

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Banco de Talentos
            </Button>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-headline text-4xl font-bold">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-muted-foreground text-xl mt-1">{profile.academicTitle}</p>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                        <span>{profile.functionalArea}</span>
                        <span>&middot;</span>
                        <span>{profile.yearsOfExperience} anos de experiência</span>
                         {profile.professionalLevel && <><span>&middot;</span><Badge variant="secondary">{profile.professionalLevel}</Badge></>}
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button variant={'outline'} size="icon" title="Marcar como interessante">
                        <ThumbsUp className={`h-5 w-5 text-green-500`} />
                    </Button>
                    <Button variant={'outline'} size="icon" title="Rejeitar">
                        <ThumbsDown className={`h-5 w-5 text-red-500`} />
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/recruiter/conversations?start_chat_with=${profile.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Iniciar Conversa
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {profile.summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><User size={18}/> Sobre Mim</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{profile.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Briefcase size={18}/> Experiência Profissional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {profile.workExperience?.length ? profile.workExperience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold">{exp.role}</h3>
                                        <p className="text-sm text-muted-foreground">{exp.period}</p>
                                    </div>
                                    <p className="text-sm text-primary font-medium">{exp.company}</p>
                                    {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                                </div>
                            )) : <p className="text-sm text-muted-foreground">Nenhuma experiência profissional adicionada.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap size={18}/> Formação Académica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile.academicHistory?.length ? profile.academicHistory.map((edu, index) => (
                                <div key={index} className="flex justify-between items-baseline">
                                    <div>
                                        <h3 className="font-semibold">{edu.degree}</h3>
                                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                                </div>
                            )) : <p className="text-sm text-muted-foreground">Nenhuma formação académica adicionada.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Award size={18}/> Formação Adicional / Certificados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile.certifications?.length ? profile.certifications.map((cert, index) => (
                                <div key={index} className="flex justify-between items-baseline">
                                    <div>
                                        <h3 className="font-semibold">{cert.name}</h3>
                                        <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{cert.year}</p>
                                </div>
                            )) : <p className="text-sm text-muted-foreground">Nenhuma certificação adicionada.</p>}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8 lg:sticky top-24 self-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><User size={18}/> Informação Pessoal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Gênero:</span> <span className="font-medium">{profile.gender || 'Não informado'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Data de Nasc.:</span> <span className="font-medium">{formattedDate}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Nacionalidade:</span> <span className="font-medium">{profile.nationality || 'Não informado'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Reside em:</span> <span className="font-medium">{profile.cidade || 'Não informado'}</span></div>
                             <div className="mt-4 pt-4 border-t space-y-3">
                                <h4 className="font-semibold text-base mb-2">Dados de Contacto</h4>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Email:</span> <span className="font-medium text-primary">{profile.email}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{profile.phoneNumber || 'Não informado'}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Award size={18}/> Competências</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                             {profile.skills?.length ? profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            )) : <p className="text-sm text-muted-foreground">Nenhuma competência adicionada.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><FileText size={18}/> Currículo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.resumeUrl ? (
                                <Button asChild variant="outline">
                                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                        <Download size={16} className="mr-2" /> Baixar CV
                                    </a>
                                </Button>
                            ) : <p className="text-sm text-muted-foreground">Nenhum CV carregado.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


export default function CandidateProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [candidate, setCandidate] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (id) {
        const foundCandidate = users.find(u => u.id === id && u.userType === 'student');
        if (!foundCandidate) {
            notFound();
        }
        setCandidate(foundCandidate || null);
    }
  }, [id]);

  if (!candidate) {
    return null; // Or a loading skeleton
  }

  return <ProfileView profile={candidate} />;
}
