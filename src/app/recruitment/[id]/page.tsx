'use client';

import { getCourseCategories } from "@/lib/course-service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Clock, MapPin, Share2, Loader2, HelpCircle, GraduationCap, Calendar, Award, Mail, Printer } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import type { JobPosting } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { SimilarVacancies } from "@/components/recruitment/similar-vacancies";
import { JobAlertSubscription } from "@/components/recruitment/job-alert-subscription";

// The vacancy prop here receives serializable data (dates as strings)
export function VacancyClientPage({ vacancy: job }: { vacancy: JobPosting }) {
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const category = getCourseCategories().find(c => c.name === job.category) || null;

  React.useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json?.ok && json?.user) {
            setUser({ email: json.user.email });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsUserLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleApply = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Você precisa fazer login para se candidatar a uma vaga.",
      });
      router.push('/login');
      return;
    }
    
    setIsApplying(true);
    setTimeout(() => {
        toast({
            title: "Candidatura Simulada!",
            description: `A sua candidatura para ${job.title} foi enviada com sucesso (simulação).`,
        });
        setIsApplying(false);
    }, 1500);
  };

  // Helper to safely create Date objects from strings
  const toDate = (date: string | Date | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') {
        return new Date(date);
    }
    return date;
  }

  const closingDate = toDate(job.closingDate);

  const handleShare = () => {
      if(navigator.share) {
          navigator.share({
              title: job.title,
              text: `Confira este emprego na NexusTalent: ${job.title}`,
              url: window.location.href,
          })
      } else {
          toast({ description: "Funcionalidade de partilha não suportada neste navegador."})
      }
  }

  const handlePrint = () => {
      window.print();
  }


  return (
    <>
      <Header />
      <main className="bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/recruitment" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft size={16} /> Voltar para os empregos
          </Link>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              {category && <Badge className="mb-2">{category.name}</Badge>}
              <h1 className="font-headline text-3xl md:text-4xl font-bold">{job.title}</h1>
              
              <div className="mt-6 prose prose-lg max-w-none text-foreground/90">
                  <p>{job.description}</p>
                  
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <>
                      <h3 className="font-headline">Responsabilidades:</h3>
                      <ul>
                        {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </>
                  )}

                  {job.requirements && job.requirements.length > 0 && (
                    <>
                      <h3 className="font-headline">Requisitos:</h3>
                      <ul>
                        {job.requirements.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </>
                  )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                  <Card>
                      <CardHeader>
                          <CardTitle>Resumo do Emprego</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="space-y-4 text-sm">
                              <div className="flex items-center gap-3">
                                  <MapPin className="w-5 h-5 text-muted-foreground" />
                                  <span><strong>Localização:</strong> {job.location}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                                  <span><strong>Tipo de Contrato:</strong> {job.type}</span>
                              </div>
                              {job.salaryRange && job.showSalary && (
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                                    <span><strong>Salário:</strong> {job.salaryRange}</span>
                                </div>
                              )}
                               {job.minExperience && (
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-muted-foreground" />
                                    <span><strong>Experiência Mínima:</strong> {job.minExperience}</span>
                                </div>
                              )}
                              {job.minEducationLevel && (
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                    <span><strong>Habilitações Mínimas:</strong> {job.minEducationLevel}</span>
                                </div>
                              )}
                              {closingDate && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <span><strong>Prazo de Candidatura:</strong> {format(closingDate, "d 'de' MMMM, yyyy", { locale: pt })}</span>
                                </div>
                              )}
                          </div>
                          
                          {job.screeningQuestions && job.screeningQuestions.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-4 flex items-center gap-2"><HelpCircle size={18}/> Perguntas de Triagem</h4>
                                <div className="space-y-4">
                                {job.screeningQuestions.map((q, index) => (
                                    <div key={index} className="space-y-2">
                                        <Label htmlFor={`question-${index}`}>{q.question}</Label>
                                        <Textarea id={`question-${index}`} placeholder="Sua resposta..." rows={3} />
                                    </div>
                                ))}
                                </div>
                            </div>
                          )}

                          <Button 
                            size="lg" 
                            className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={handleApply}
                            disabled={isUserLoading || isApplying}
                          >
                            {isApplying ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>A processar...</>
                            ) : (
                                "Candidatar-se"
                            )}
                          </Button>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="lg" variant="outline" className="w-full" onClick={handleShare}>
                                <Share2 size={16} className="mr-2"/>
                                Partilhar
                            </Button>
                             <Button size="lg" variant="outline" className="w-full" onClick={handlePrint}>
                                <Printer size={16} className="mr-2"/>
                                Imprimir
                            </Button>
                          </div>
                      </CardContent>
                  </Card>
              </div>
            </div>
          </div>
        </div>
        <SimilarVacancies currentJob={job} />
        <JobAlertSubscription />
      </main>
      <Footer />
    </>
  );
}
