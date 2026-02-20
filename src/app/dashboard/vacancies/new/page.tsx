'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCourseCategories } from '@/lib/course-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, CalendarIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateJobContentOutput } from '@/ai/flows/generate-job-content';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { createVacancy, type VacancyInsert } from '@/lib/supabase/vacancy-service';
import type { EducationLevel } from '@/lib/types';
import { useUser } from '@/lib/auth/use-user';


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
});

type FormValues = z.infer<typeof formSchema>;

// Mock recruiter company data
const recruiterProfile = {
    companyName: 'NexusTalent Corp',
    companyDescription: 'A NexusTalent é uma empresa líder em soluções de recrutamento e formação, conectando os melhores talentos às oportunidades mais desafiadoras do mercado.'
}
const educationLevels: EducationLevel[] = ['Ensino Primário', 'Ensino Médio', 'Frequência Universitária', 'Licenciatura', 'Mestrado', 'Doutoramento'];

export default function NewVacancyPage() {
  const [generatedContent, setGeneratedContent] = useState<GenerateJobContentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const courseCategories = getCourseCategories();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      location: 'Luanda, Angola',
      type: 'Full-time',
      industry: '',
      numberOfVacancies: 1,
      requiredNationality: 'Angolana',
      employerName: recruiterProfile.companyName,
      aboutEmployer: recruiterProfile.companyDescription,
      hideEmployerData: false,
      showSalary: true,
      salaryRange: '',
      languages: '',
    },
  });

  const handleGenerateContent: SubmitHandler<FormValues> = async (data) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const { generateVacancyContentAction } = await import('@/app/actions');
      const result = await generateVacancyContentAction({ title: data.title, category: data.category, industry: data.industry, minExperience: data.minExperience, demandLevel: data.demandLevel });
      setGeneratedContent(result);
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

    const payload: VacancyInsert = {
      title: formValues.title,
      description,
      company: companyName,
      location: formValues.location,
      salary_range: formValues.showSalary ? (formValues.salaryRange || undefined) : undefined,
      job_type: formValues.type,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      recruiter_id: user.id,
      status: 'active',
      requirements: generatedContent.requirements ?? [],
      benefits: [],
      featured: false,
    };

    try {
        const created = await createVacancy(payload);
        if (!created) {
          throw new Error('Falha ao criar vaga no Supabase.');
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
            description: "Não foi possível publicar a vaga. Tente novamente.",
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível de escolaridade" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="">N/A</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <TextareaWithLabel label="Responsabilidades (separado por nova linha)" value={generatedContent.responsibilities.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, responsibilities: e.target.value.split('\n')})} rows={6} />
                    <TextareaWithLabel label="Requisitos (separado por nova linha)" value={generatedContent.requirements.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, requirements: e.target.value.split('\n')})} rows={6} />
                    {generatedContent.screeningQuestions && (
                        <TextareaWithLabel label="Perguntas de Triagem (separado por nova linha)" value={generatedContent.screeningQuestions.join('\n')} onChange={(e) => setGeneratedContent({...generatedContent, screeningQuestions: e.target.value.split('\n')})} rows={5} />
                    )}
                  </div>
                  <Button type="button" onClick={handleSaveVacancy} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Publicar Vaga'}
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
