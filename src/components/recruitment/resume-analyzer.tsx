"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeResumeAction } from '@/app/actions';
import { getVacancies } from '@/lib/supabase/vacancy-service';
import type { Vacancy } from '@/lib/supabase/vacancy-service';
import type { AIResumeAnalysisOutput } from '@/lib/schemas';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileUp, ListChecks, Target, Check, Trash2, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { useRouter } from 'next/navigation';


const formSchema = z.object({
  descriptionType: z.enum(['manual', 'select'], { required_error: 'Por favor, selecione um tipo de descrição.'}),
  manualDescription: z.string().optional(),
  selectedVacancyId: z.string().optional(),
  resumes: z.custom<FileList>().refine(files => files?.length > 0, "É necessário enviar pelo menos um currículo.").refine(files => files?.length <= 20, "Pode analisar no máximo 20 CVs de cada vez."),
}).refine(data => {
    if (data.descriptionType === 'manual') return !!data.manualDescription && data.manualDescription.length >= 50;
    if (data.descriptionType === 'select') return !!data.selectedVacancyId;
    return false;
}, {
    message: "Por favor, forneça uma descrição manual ou selecione uma vaga.",
    path: ['manualDescription'],
});


type FormValues = z.infer<typeof formSchema>;
type AnalysisResult = AIResumeAnalysisOutput & { fileName: string; id: string };

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export function ResumeAnalyzer() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Carregar vagas ativas do Supabase
        const rows = await getVacancies(false);
        if (mounted) setVacancies(rows);
      } catch (e) {
        console.error('Erro ao carregar vagas para o analisador:', e);
        if (mounted) setVacancies([]);
      }
    })();
    return () => { mounted = false };
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptionType: 'manual',
      manualDescription: "",
    },
  });

  const descriptionType = form.watch('descriptionType');
  const selectedVacancyId = form.watch('selectedVacancyId');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResults([]);
    setSelectedCandidates([]);

    let jobDescription = data.manualDescription;
    if (data.descriptionType === 'select' && data.selectedVacancyId) {
      const selectedVacancy = vacancies.find(v => v.id === data.selectedVacancyId);
      if (selectedVacancy) {
        const parts: string[] = [];
        parts.push(selectedVacancy.title);
        if (selectedVacancy.description) parts.push('', selectedVacancy.description);
        if (Array.isArray((selectedVacancy as any).responsibilities) && (selectedVacancy as any).responsibilities.length > 0) {
          parts.push('', 'Responsabilidades:', (selectedVacancy as any).responsibilities.join('\n'));
        }
        if (Array.isArray((selectedVacancy as any).requirements) && (selectedVacancy as any).requirements.length > 0) {
          parts.push('', 'Requisitos:', (selectedVacancy as any).requirements.join('\n'));
        }
        jobDescription = parts.join('\n');
      }
    }
    
    if (!jobDescription) {
        toast({
            variant: "destructive",
            title: "Descrição da Vaga em falta",
            description: "Não foi possível encontrar a descrição para a análise.",
        });
        setIsLoading(false);
        return;
    }

    if (!data.resumes || data.resumes.length === 0) {
      toast({
          variant: "destructive",
          title: "Nenhum currículo foi enviado.",
          description: "É necessário enviar pelo menos um currículo.",
      });
      setIsLoading(false);
      return;
    }
    
    const files = Array.from(data.resumes);
    
    const results = await Promise.all(
      files.map(async (resumeFile, index) => {
        try {
          const resumeDataUri = await fileToDataUri(resumeFile);
          const result = await analyzeResumeAction({
            jobDescription: jobDescription!,
            resumeDataUri: resumeDataUri,
          });
          return { ...result, fileName: resumeFile.name, id: `analyzed-${index}` };
        } catch (error) {
           console.error(`Erro ao analisar ${resumeFile.name}:`, error);
           // Return a result indicating failure for this specific file
           return { 
              fileName: resumeFile.name, 
              id: `analyzed-${index}`,
              candidateRanking: 0, 
              candidateSummary: "Falha na análise. O ficheiro pode estar corrompido ou num formato não suportado.", 
              keySkillsMatch: "N/A", 
              areasForImprovement: "N/A" 
          };
        }
      })
    );
    
    setAnalysisResults(results.sort((a, b) => b.candidateRanking - a.candidateRanking));
    setIsLoading(false);
  };

  const handleSelectCandidate = (fileName: string, isSelected: boolean) => {
    setSelectedCandidates(prev => 
        isSelected ? [...prev, fileName] : prev.filter(name => name !== fileName)
    );
  };

  const handleSelectOver50 = () => {
    const over50 = analysisResults
        .filter(result => result.candidateRanking > 50)
        .map(result => result.fileName);
    setSelectedCandidates(over50);
  };
  
  const handleAddToVacancy = () => {
    if (selectedCandidates.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum candidato selecionado.'});
        return;
    }
    if (descriptionType === 'manual' || !selectedVacancyId) {
        toast({ variant: 'destructive', title: 'Ação Inválida', description: 'Selecione uma vaga da lista para adicionar os candidatos.'});
        return;
    }
    
    // Simulate adding candidates and prepare data for redirection
    const triagedCandidates = analysisResults
        .filter(r => selectedCandidates.includes(r.fileName))
        .map(r => ({ id: r.id, score: r.candidateRanking, name: r.fileName, summary: r.candidateSummary, skills: r.keySkillsMatch }));

    const analysisParam = encodeURIComponent(JSON.stringify(triagedCandidates));

    toast({
        title: 'Candidatos Adicionados (Simulado)',
        description: `${selectedCandidates.length} candidatos foram associados à vaga. A redirecionar...`
    });

    router.push(`/dashboard/recruiter/vacancies/${selectedVacancyId}/applications?tab=triaged&analysis=${analysisParam}`);
  }
  
  const resumesRef = form.register("resumes");

  return (
    <Card className="w-full bg-background/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Sparkles className="text-primary" />
          Analisador de Currículos por IA
        </CardTitle>
        <CardDescription>
          Selecione uma vaga ou cole a descrição, faça upload de até 20 CVs e obtenha uma análise de compatibilidade instantânea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="descriptionType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Fonte da Descrição da Vaga</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                    >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="manual" /></FormControl>
                        <FormLabel className="font-normal">Inserir Manualmente</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="select" /></FormControl>
                        <FormLabel className="font-normal">Selecionar Vaga Existente</FormLabel>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {descriptionType === 'manual' && (
                <FormField
                    control={form.control}
                    name="manualDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição da Vaga</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Cole a descrição completa da vaga aqui..."
                            className="min-h-[150px] resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {descriptionType === 'select' && (
                 <FormField
                    control={form.control}
                    name="selectedVacancyId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Vagas Publicadas</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma vaga..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {vacancies.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            <FormField
              control={form.control}
              name="resumes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currículos dos Candidatos (Até 20 ficheiros)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="file" accept=".pdf,.doc,.docx" className="pl-10 h-12" {...resumesRef} multiple />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Currículos'
              )}
            </Button>
          </form>
        </Form>

        {isLoading && (
            <div className='text-center mt-8'>
                <Loader2 className="mr-2 h-8 w-8 animate-spin inline-block" />
                <p className='text-muted-foreground'>A IA está a analisar os currículos. Isto pode demorar alguns momentos...</p>
            </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline text-xl font-bold">Resultado da Análise ({analysisResults.length} CVs)</h3>
                <div className="flex gap-2">
                    {selectedCandidates.length > 0 ? (
                        <Button size="sm" onClick={handleAddToVacancy} disabled={descriptionType === 'manual' || !selectedVacancyId} title={descriptionType === 'manual' ? 'Selecione uma vaga para usar esta ação' : ''}>
                            <Check className="mr-2 h-4 w-4" /> Adicionar à Vaga ({selectedCandidates.length})
                       </Button>
                    ) : (
                        <Button size="sm" variant="outline" onClick={handleSelectOver50}>
                            <Check className="mr-2 h-4 w-4" /> Selecionar &gt;50%
                        </Button>
                    )}
                </div>
            </div>
            <Accordion type="multiple" className="w-full space-y-4">
                {analysisResults.map((result, index) => (
                    <Card key={result.id} className={selectedCandidates.includes(result.fileName) ? 'border-primary' : ''}>
                        <div className="flex items-center p-4">
                            <Checkbox 
                                id={`select-${index}`}
                                checked={selectedCandidates.includes(result.fileName)}
                                onCheckedChange={(checked) => handleSelectCandidate(result.fileName, !!checked)}
                                className="mr-4"
                            />
                            <AccordionItem value={result.id} className="border-0 w-full">
                                <AccordionTrigger className="p-0 hover:no-underline">
                                    <div className='flex items-center gap-4 w-full pr-4'>
                                        <span className="text-lg font-bold text-primary w-12 text-center">{result.candidateRanking}%</span>
                                        <div className='flex-grow text-left'>
                                            <p className="font-semibold">{result.fileName}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{result.candidateSummary}</p>
                                        </div>
                                        <Progress value={result.candidateRanking} className="w-32 h-2" />
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-4">
                                   <div className="space-y-4">
                                         <div className='border-t pt-4'>
                                            <h4 className="text-base font-medium flex items-center gap-2 mb-2">
                                                <ListChecks size={18} /> Resumo do Candidato
                                            </h4>
                                            <p className="text-sm">{result.candidateSummary}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-base font-medium flex items-center gap-2 mb-2">
                                                    <Sparkles size={18}/> Habilidades Chave
                                                </h4>
                                                <p className="text-sm">{result.keySkillsMatch}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium flex items-center gap-2 mb-2">
                                                    <Target size={18} /> Áreas para Melhoria
                                                </h4>
                                                <p className="text-sm">{result.areasForImprovement}</p>
                                            </div>
                                        </div>
                                   </div>
                                </AccordionContent>
                            </AccordionItem>
                        </div>
                    </Card>
                ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
