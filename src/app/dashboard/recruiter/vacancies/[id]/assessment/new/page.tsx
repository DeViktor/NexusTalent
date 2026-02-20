'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, ArrowLeft, Save, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAssessmentTestAction } from '@/app/actions';
import type { AssessmentTest, Vacancy } from '@/lib/types';
import { useRouter, useParams, notFound } from 'next/navigation';
import { getVacancyById } from '@/lib/vacancy-service';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GenerateAssessmentTestInputSchema, GenerateAssessmentTestOutputSchema } from '@/lib/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTest } from '@/lib/test-service';


type FormValues = z.infer<typeof GenerateAssessmentTestInputSchema>;

export default function NewAssessmentPage() {
  const params = useParams();
  const vacancyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [vacancy, setVacancy] = useState<Vacancy | null | undefined>(undefined);
  const [generatedTest, setGeneratedTest] = useState<Omit<AssessmentTest, 'vacancyId'> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateAssessmentTestInputSchema),
    defaultValues: {
      jobDescription: '', // Will be populated from vacancy
      testType: 'knowledge',
      level: 'Médio',
      numMultipleChoice: 5,
      numShortAnswer: 2,
    },
  });

  useEffect(() => {
    if (vacancyId) {
      const foundVacancy = getVacancyById(vacancyId);
      setVacancy(foundVacancy);
      if (foundVacancy) {
         const fullJobDescription = `${foundVacancy.title}\n\n${foundVacancy.description}\n\nResponsabilidades:\n${foundVacancy.responsibilities.join('\n')}\n\nRequisitos:\n${foundVacancy.requirements.join('\n')}`;
         form.setValue('jobDescription', fullJobDescription);
      }
    }
  }, [vacancyId, form]);

  const handleGenerateTest: SubmitHandler<FormValues> = async (data) => {
    if (!vacancy) return;
    setIsGenerating(true);
    setGeneratedTest(null);
    try {
      const result = await generateAssessmentTestAction(data);
      
      if (!result || !result.questions) {
        throw new Error("A geração do teste não retornou um resultado válido.");
      }

      setGeneratedTest(result);
      toast({
        title: "Teste Gerado com Sucesso!",
        description: `A IA criou um teste com ${result.questions.length} perguntas.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Teste',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTest = async () => {
    if (!generatedTest || !vacancyId) return;
    setIsSaving(true);
    
    try {
      const testToSave: AssessmentTest = {
        ...generatedTest,
        vacancyId: vacancyId
      };
      addTest(testToSave);

      toast({
          title: "Teste Salvo!",
          description: "O teste foi associado a esta vaga.",
      });
      setIsSaving(false);
      router.push(`/dashboard/recruiter/vacancies`);

    } catch(error) {
       toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o teste. Tente novamente.",
        });
       setIsSaving(false);
    }
  };

  if (vacancy === undefined) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"><Skeleton className="h-96 w-full" /></div>;
  }
  if (!vacancy) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar às Vagas
      </Button>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Novo Teste de Avaliação</CardTitle>
              <CardDescription>
                Crie um teste de conhecimentos ou psicotécnico para a vaga: <strong className='text-foreground'>{vacancy.title}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateTest)} className="space-y-6">
                   <FormField
                    control={form.control}
                    name="testType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo de Teste</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="knowledge" /></FormControl>
                              <FormLabel className="font-normal">Conhecimento Técnico</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="psychometric" /></FormControl>
                              <FormLabel className="font-normal">Psicotécnico / Lógica</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Dificuldade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Fácil">Fácil</SelectItem>
                                <SelectItem value="Médio">Médio</SelectItem>
                                <SelectItem value="Difícil">Difícil</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="numMultipleChoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de Perguntas de Múltipla Escolha</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numShortAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de Perguntas de Resposta Curta</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Gerar Teste com IA
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Teste Gerado</CardTitle>
                    <CardDescription>Reveja as perguntas geradas pela IA. Se estiver satisfeito, salve o teste.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isGenerating && <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16"><Loader2 className="h-8 w-8 animate-spin mb-4" /><p>A IA está a criar o teste...</p></div>}
                    
                    {!isGenerating && !generatedTest && <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16"><Bot size={48} className="mb-4" /><p>O seu teste gerado aparecerá aqui.</p></div>}
                    
                    {generatedTest && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-xl">{generatedTest.title}</h3>
                            {generatedTest.questions.map((q, index) => (
                                <div key={q.id} className="border-b pb-4">
                                    <p className="font-semibold">{index + 1}. {q.question}</p>
                                    <Badge variant="secondary" className="mt-1">{q.type}</Badge>
                                    {q.type === 'multiple-choice' && q.options && (
                                        <div className="mt-2 space-y-1 text-sm text-muted-foreground pl-4">
                                            {q.options.map((opt, i) => <p key={i}>- {opt}</p>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                             <Button onClick={handleSaveTest} disabled={isSaving} className="w-full mt-6">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar Teste
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
