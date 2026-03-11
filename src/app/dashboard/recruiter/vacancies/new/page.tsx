'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCourseCategories } from '@/lib/course-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, CalendarIcon, ArrowLeft, Save, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateJobContentOutput } from '@/ai/flows/generate-job-content';
import { useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { createVacancyAction } from '@/app/actions';
import type { JobPosting, EducationLevel, ScreeningQuestion, CourseCategory } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser } from '@/lib/auth/use-user';


const screeningQuestionSchema = z.object({
  question: z.string().min(1, "A pergunta é obrigatória."),
  requiredAnswer: z.enum(['sim', 'nao']),
});

const formSchema = z.object({
  title: z.string().min(5, { message: 'O título da vaga deve ter pelo menos 5 caracteres.' }),
  category: z.string({ required_error: 'Selecione uma área funcional.' }),
  industry: z.string().min(3, { message: 'A indústria é obrigatória.' }),
  minExperience: z.string({ required_error: 'Selecione a experiência mínima.' }),
  demandLevel: z.string({ required_error: 'Selecione o grau de exigência.' }),
  location: z.string().min(3, { message: 'A localização é obrigatória.' }),
  type: z.enum(['Full-time', 'Part-time', 'Remote']),
  numberOfVacancies: z.coerce.number().min(1, 'Deve haver pelo menos uma vaga.'),
  closingDate: z.date().optional(),
  salaryRange: z.string().optional(),
  showSalary: z.boolean().default(true),
  languages: z.string().optional(),
  requiredNationality: z.string().optional(),
  employerName: z.string().min(1, 'O nome do empregador é obrigatório.'),
  aboutEmployer: z.string().min(10, 'A descrição sobre o empregador é obrigatória.'),
  hideEmployerData: z.boolean().default(false),
  minEducationLevel: z.string().optional(),
  screeningQuestions: z.array(screeningQuestionSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const educationLevels: EducationLevel[] = ['Ensino Primário', 'Ensino Médio', 'Frequência Universitária', 'Licenciatura', 'Mestrado', 'Doutoramento'];

type GenerateVacancyContentOutput = GenerateJobContentOutput;

export default function NewVacancyPage() {
  const [generatedContent, setGeneratedContent] = useState<GenerateVacancyContentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const categories = await getCourseCategories();
        if (active) setCourseCategories(Array.isArray(categories) ? categories : []);
      } catch {
        if (active) setCourseCategories([]);
      }
    })();
    return () => { active = false };
  }, []);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      location: 'Luanda, Angola',
      type: 'Full-time',
      industry: '',
      numberOfVacancies: 1,
      requiredNationality: 'Angolana',
      employerName: '',
      aboutEmployer: '',
      hideEmployerData: false,
      showSalary: true,
      salaryRange: '',
      languages: '',
      screeningQuestions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "screeningQuestions",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/company-profile', { cache: 'no-store', credentials: 'include' });
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json?.ok) return;
        const profile = json.profile;
        if (!profile) return;
        if (!form.getValues('employerName')) form.setValue('employerName', String(profile.companyName || ''));
        if (!form.getValues('aboutEmployer')) form.setValue('aboutEmployer', String(profile.about || ''));
      } catch {
      }
    })();
    return () => { active = false; };
  }, [form]);


  useEffect(() => {
    const vacancyData = searchParams.get('data');
    if (vacancyData) {
      try {
        const decodedData = decodeURIComponent(vacancyData);
        const parsedVacancy = JSON.parse(decodedData) as Partial<JobPosting> & {minExperience?: string; demandLevel?: string;};
        
        form.reset({
          title: parsedVacancy.title || '',
          category: parsedVacancy.category || '',
          industry: parsedVacancy.industry || '',
          minExperience: parsedVacancy.minExperience || '', 
          demandLevel: parsedVacancy.demandLevel || '',
          location: parsedVacancy.location || 'Luanda, Angola',
          type: parsedVacancy.type || 'Full-time',
          numberOfVacancies: parsedVacancy.numberOfVacancies || 1,
          closingDate: parsedVacancy.closingDate ? new Date(parsedVacancy.closingDate as string | Date) : undefined,
          salaryRange: parsedVacancy.salaryRange || '',
          showSalary: parsedVacancy.showSalary === undefined ? true : parsedVacancy.showSalary,
          languages: Array.isArray(parsedVacancy.languages) ? parsedVacancy.languages.join(', ') : '',
          requiredNationality: parsedVacancy.requiredNationality || 'Angolana',
          employerName: parsedVacancy.employerName || recruiterProfile.companyName,
          aboutEmployer: parsedVacancy.aboutEmployer || recruiterProfile.companyDescription,
          hideEmployerData: parsedVacancy.hideEmployerData || false,
          minEducationLevel: parsedVacancy.minEducationLevel || undefined,
          screeningQuestions: parsedVacancy.screeningQuestions || []
        });
        
        if (parsedVacancy.description && parsedVacancy.responsibilities && parsedVacancy.requirements) {
            setGeneratedContent({
              description: parsedVacancy.description,
              responsibilities: parsedVacancy.responsibilities,
              requirements: parsedVacancy.requirements,
              aiScreeningQuestions: parsedVacancy.aiScreeningQuestions || [],
            });
        }

      } catch (error) {
        console.error("Failed to parse vacancy data from URL", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da vaga para duplicar.",
        });
      }
    }
  }, [searchParams, form, toast]);


  const handleGenerateContent: SubmitHandler<FormValues> = async (data) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const { generateVacancyContentAction } = await import('@/app/actions');
      const result = await generateVacancyContentAction({ title: data.title, category: data.category, industry: data.industry, minExperience: data.minExperience, demandLevel: data.demandLevel });
      setGeneratedContent(result);
      toast({
        title: "Conteúdo Gerado!",
        description: "A descrição da vaga foi gerada pela IA. Reveja e publique.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar conteúdo',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveVacancy = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Campos em falta',
        description: 'Por favor, preencha todos os campos obrigatórios do formulário.',
      });
      return;
    }

    if (!generatedContent) {
      toast({
        variant: 'destructive',
        title: 'Faltam dados',
        description: 'Gere a descrição da vaga com a IA antes de tentar publicar.',
      });
      return;
    }

    if (!user?.id) {
        toast({ variant: "destructive", title: "Erro", description: "Utilizador recrutador não encontrado." });
        return;
    }

    setIsSaving(true);
    const formValues = form.getValues();
    
    let minEducationLevelValue: EducationLevel | undefined = formValues.minEducationLevel as EducationLevel;
    if (formValues.minEducationLevel === 'none') {
        minEducationLevelValue = undefined;
    }

    const descriptionParts: string[] = [];
    if (generatedContent.description) {
      descriptionParts.push(generatedContent.description);
    }
    if (generatedContent.responsibilities && generatedContent.responsibilities.length > 0) {
      descriptionParts.push('');
      descriptionParts.push('Responsabilidades principais:');
      for (const item of generatedContent.responsibilities) {
        descriptionParts.push(`- ${item}`);
      }
    }
    const description = descriptionParts.join('\n');

    const companyName = formValues.employerName || recruiterProfile.companyName;
    const expiresAt = formValues.closingDate ? formValues.closingDate.toISOString() : undefined;

    const payload = {
      title: formValues.title,
      description,
      company: companyName,
      location: formValues.location,
      salary_range: formValues.showSalary ? (formValues.salaryRange || undefined) : undefined,
      job_type: formValues.type,
      expires_at: expiresAt,
      status: 'active',
      requirements: generatedContent.requirements ?? [],
      benefits: [],
      featured: false,
    };

    try {
        const result = await createVacancyAction(payload as any);
        if (!result.success) {
          throw new Error(result.message || 'Falha ao criar vaga no Supabase.');
        }
        toast({
          title: "Vaga publicada!",
          description: "A sua vaga foi publicada e já está visível para os candidatos.",
        });
        router.push('/dashboard/recruiter/vacancies');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Publicar",
            description: error instanceof Error ? error.message : "Não foi possível publicar a vaga. Tente novamente.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Publicar Nova Vaga</CardTitle>
          <CardDescription>
            Preencha as informações básicas e deixe a IA gerar a descrição completa da vaga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateContent)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Vaga</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Desenvolvedor Frontend Sênior" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Funcional (Categoria)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                      control={form.control}
                      name="minExperience"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Experiência Mínima</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione os anos" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="0-1 ano">0-1 ano</SelectItem>
                                  <SelectItem value="1-3 anos">1-3 anos</SelectItem>
                                  <SelectItem value="3-5 anos">3-5 anos</SelectItem>
                                  <SelectItem value="5+ anos">5+ anos</SelectItem>
                                  <SelectItem value="10+ anos">10+ anos</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="demandLevel"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Grau de Exigência</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="Estagiário / Júnior">Estagiário / Júnior</SelectItem>
                                  <SelectItem value="Pleno">Pleno</SelectItem>
                                  <SelectItem value="Sénior">Sénior</SelectItem>
                                  <SelectItem value="Especialista / Liderança">Especialista / Liderança</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Indústria</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Tecnologia, Petróleo e Gás, Banca" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="minEducationLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Habilitações Literárias Mínimas</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível de escolaridade" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">N/A</SelectItem>
                                {educationLevels.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Luanda, Angola" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Remote">Remoto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="numberOfVacancies"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nº de Vagas</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="requiredNationality"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nacionalidade Requerida</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Angolana" {...field} />
                        </FormControl>
                         <FormDescription>Deixe em branco se não houver preferência.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Línguas Requeridas</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Português, Inglês" {...field} />
                        </FormControl>
                         <FormDescription>Separe as línguas por vírgulas.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

               <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="salaryRange"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Salário Oferecido</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 500.000 AOA - 700.000 AOA" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="showSalary"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6">
                            <div className="space-y-0.5">
                                <FormLabel>Mostrar Salário</FormLabel>
                                <FormDescription>
                                Exibir publicamente o salário na vaga.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="closingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Limite para Candidaturas</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: pt })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-lg">Perguntas de Triagem (Sim/Não)</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione perguntas de resposta "Sim" ou "Não" para filtrar candidatos automaticamente.
                  Defina qual a resposta que o candidato deve dar para ser considerado.
                </p>
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-secondary/50 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`screeningQuestions.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pergunta {index + 1}</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Tem mais de 5 anos de experiência com React?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`screeningQuestions.${index}.requiredAnswer`}
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>Resposta Eliminatória</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center gap-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="sim" /></FormControl>
                                <FormLabel className="font-normal">Sim</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="nao" /></FormControl>
                                <FormLabel className="font-normal">Não</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ question: '', requiredAnswer: 'sim' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pergunta
                </Button>
              </div>


              <div className="border-t pt-6 space-y-6">
                <FormField
                    control={form.control}
                    name="employerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome do Empregador</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="aboutEmployer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sobre a Empresa</FormLabel>
                        <FormControl>
                            <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="hideEmployerData"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Confidencial</FormLabel>
                                <FormDescription>
                                Ocultar dados da empresa recrutadora na publicação da vaga.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
              </div>


              <Button type="submit" disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando Descrição...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Gerar Descrição com IA</>
                )}
              </Button>

              {generatedContent && (
                <div className="mt-8 pt-6 border-t space-y-6">
                  <h3 className="font-headline text-2xl">Conteúdo Gerado</h3>
                  <div className="space-y-4">
                    <TextareaWithLabel label="Descrição Geral" value={generatedContent.description} onChange={(e) => setGeneratedContent({...generatedContent, description: e.target.value})} rows={4} />
                    <TextareaWithLabel label="Responsabilidades (uma por linha)" value={generatedContent.responsibilities.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, responsibilities: e.target.value.split('\n')})} rows={6} />
                    <TextareaWithLabel label="Requisitos (uma por linha)" value={generatedContent.requirements.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, requirements: e.target.value.split('\n')})} rows={6} />
                    {generatedContent.aiScreeningQuestions && (
                        <TextareaWithLabel label="Perguntas de Triagem (sugestões da IA)" value={generatedContent.aiScreeningQuestions.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, aiScreeningQuestions: e.target.value.split('\n')})} rows={5} />
                    )}
                  </div>
                  <Button type="button" onClick={handleSaveVacancy} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700">
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4"/> Publicar Vaga </>}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component
const TextareaWithLabel = ({ label, ...props }: React.ComponentProps<typeof Textarea> & { label: string }) => (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <Textarea {...props} />
    </div>
  );
