'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCourseCategories } from '@/lib/course-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarIcon, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { getVacancy, updateVacancy, type Vacancy as VacancyRow } from '@/lib/supabase/vacancy-service';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  title: z.string().min(5, { message: 'O título da vaga deve ter pelo menos 5 caracteres.' }),
  category: z.string({ required_error: 'Selecione uma área funcional.' }),
  industry: z.string().min(3, { message: 'A indústria é obrigatória.' }),
  location: z.string().min(3, { message: 'A localização é obrigatória.' }),
  type: z.enum(['Full-time', 'Part-time', 'Remote']),
  numberOfVacancies: z.coerce.number().min(1, 'Deve haver pelo menos uma vaga.'),
  closingDate: z.date().optional(),
  salaryRange: z.string().optional(),
  showSalary: z.boolean().default(true),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  responsibilities: z.string().min(1, 'As responsabilidades são obrigatórias.'),
  requirements: z.string().min(1, 'Os requisitos são obrigatórios.'),
  screeningQuestions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditVacancyPage() {
  const router = useRouter();
  const params = useParams();
  const vacancyId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [vacancy, setVacancy] = useState<VacancyRow | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const courseCategories = getCourseCategories();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: '',
        category: undefined,
        industry: '',
        location: '',
        type: 'Full-time',
        numberOfVacancies: 1,
        showSalary: true,
        description: '',
        responsibilities: '',
        requirements: '',
        screeningQuestions: '',
        salaryRange: '',
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!vacancyId) {
        if (mounted) setVacancy(null);
        return;
      }
      try {
        const row = await getVacancy(String(vacancyId));
        if (!mounted) return;
        setVacancy(row); // row é null quando não encontrado
      } catch {
        if (mounted) setVacancy(null);
      }
    })();
    return () => { mounted = false };
  }, [vacancyId]);
  
  useEffect(() => {
    if (vacancy) {
        let closingDateValue: Date | undefined = undefined;
        if (vacancy.expires_at) {
          closingDateValue = new Date(vacancy.expires_at);
        }

        form.reset({
          title: vacancy.title ?? '',
          category: undefined,
          industry: '',
          location: vacancy.location ?? '',
          type: (vacancy.job_type ?? 'Full-time') as 'Full-time' | 'Part-time' | 'Remote',
          numberOfVacancies: 1,
          closingDate: closingDateValue,
          salaryRange: vacancy.salary_range ?? '',
          showSalary: typeof (vacancy as any).show_salary === 'boolean' ? (vacancy as any).show_salary : true,
          description: vacancy.description ?? '',
          responsibilities: Array.isArray((vacancy as any).responsibilities) ? (vacancy as any).responsibilities.join('\n') : '',
          requirements: Array.isArray(vacancy.requirements) ? vacancy.requirements.join('\n') : '',
          screeningQuestions: '',
        });
    }
  }, [vacancy, form]);

  const handleUpdateVacancy: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    if (!vacancy) {
        toast({ variant: "destructive", title: "Erro", description: "Vaga não encontrada para atualizar."});
        setIsSubmitting(false);
        return;
    }

    const updates: Partial<VacancyRow> = {
      title: data.title,
      description: data.description,
      location: data.location,
      salary_range: data.showSalary ? (data.salaryRange || undefined) : undefined,
      job_type: data.type,
      expires_at: data.closingDate ? data.closingDate.toISOString() : undefined,
      requirements: data.requirements.split('\n').filter(q => q.trim() !== ''),
      // benefits/featured permanecem inalterados
    };

    try {
        const updated = await updateVacancy(String(vacancyId), updates);
        if (!updated) {
          throw new Error('Falha ao atualizar a vaga no Supabase');
        }
        toast({ title: 'Vaga Atualizada!', description: 'As alterações na vaga foram guardadas com sucesso.' });
        router.push('/dashboard/recruiter/vacancies');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Atualizar",
            description: error instanceof Error ? error.message : "Não foi possível guardar as alterações. Tente novamente.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (vacancy === undefined) {
    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </>
    );
  }

  if (vacancy === null) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Editar Vaga</CardTitle>
          <CardDescription>
            Faça as alterações necessárias nos detalhes da vaga e guarde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateVacancy)} className="space-y-6">
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

              <div className="grid md:grid-cols-2 gap-6">
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
              </div>

              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Descrição Geral</FormLabel>
                          <FormControl>
                              <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Responsabilidades (uma por linha)</FormLabel>
                          <FormControl>
                              <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                     <FormItem>
                          <FormLabel>Requisitos (um por linha)</FormLabel>
                          <FormControl>
                              <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="screeningQuestions"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Perguntas de Triagem (uma por linha)</FormLabel>
                          <FormControl>
                              <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tipo de Contrato</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Remote">Remoto</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="numberOfVacancies" render={({ field }) => (<FormItem><FormLabel>Nº de Vagas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="salaryRange" render={({ field }) => (<FormItem><FormLabel>Salário Oferecido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="showSalary" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6"><div className="space-y-0.5"><FormLabel>Mostrar Salário</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="closingDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data Limite</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: pt }) : <span>Escolha uma data</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              
              <div className="border-t pt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
