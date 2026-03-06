'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ENROLLMENT_STORAGE_KEY = 'nexus-enrollment-data';

const enrollmentSchema = z.object({
  // Personal Info
  fullName: z.string().min(1, 'O nome completo é obrigatório.'),
  dob: z.string().optional(),
  nationality: z.string().optional(),
  idCard: z.string().optional(),
  taxpayerId: z.string().optional(),
  profession: z.string().optional(),
  address: z.string().optional(),
  municipality: z.string().optional(),
  zipCode: z.string().optional(),
  birthplace: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().min(1, 'O telemóvel é obrigatório.'),
  fax: z.string().optional(),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  
  // Professional Info
  companyName: z.string().optional(),
  companyActivity: z.string().optional(),
  companyPhone: z.string().optional(),
  companyFax: z.string().optional(),
  jobTitle: z.string().optional(),
  timeInRole: z.string().optional(),
  activityArea: z.string().optional(),
  companyAddress: z.string().optional(),
  companyLocation: z.string().optional(),
  companyZipCode: z.string().optional(),
  companyRegion: z.string().optional(),
  companyCountry: z.string().optional(),
  companyWebsite: z.string().optional(),

  // Course Knowledge
  hasKnowledge: z.enum(['Sim', 'Nao']).optional(),
  knowledgeLevel: z.enum(['Nenhum', 'Básico', 'Intermédio', 'Avançado']).optional(),
  courseReason: z.array(z.string()).optional(),

  // Agreement
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos e condições para se inscrever.',
  }),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export default function EnrollPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; displayName?: string; role?: string } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      courseReason: [],
    }
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!id) {
          if (active) setCourse(null);
          return;
        }
        const res = await fetch(`/api/courses/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          if (active) setCourse(null);
        } else {
          const json = await res.json();
          if (active) setCourse(json?.data ?? null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (!active) return;
        if (!res.ok) {
          setAuthUser(null);
        } else {
          const json = await res.json();
          setAuthUser(json?.user ?? null);
        }
      } finally {
        if (active) setIsUserLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isUserLoading) {
      try {
        const storedData = typeof window !== 'undefined'
          ? localStorage.getItem(ENROLLMENT_STORAGE_KEY)
          : null;
        let dataToSet: Partial<EnrollmentFormValues> = {};

        if (storedData) {
          dataToSet = JSON.parse(storedData);
        }

        if (authUser) {
          const fullName = (authUser.displayName as string) || '';
          dataToSet.fullName = fullName || dataToSet.fullName || '';
          dataToSet.email = authUser.email || dataToSet.email || '';
        }

        form.reset(dataToSet);
      } catch (error) {
        console.error("Failed to load or parse enrollment data:", error);
      }
    }
  }, [authUser, isUserLoading, form]);

  useEffect(() => {
    if (!isUserLoading && !authUser && id) {
      router.push(`/login?redirectTo=/courses/${id}/enroll`);
    }
  }, [authUser, isUserLoading, id, router]);


  const onSubmit: SubmitHandler<EnrollmentFormValues> = (data) => {
    if (!course) return;

    try {
        localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(data));
        toast({
            title: "Inscrição Enviada!",
            description: "Os seus dados foram confirmados. A redirecionar para o passo final de pagamento.",
        });
        router.push(`/courses/${course.id}/checkout`);
    } catch (error) {
        console.error("Failed to save enrollment data:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Guardar",
            description: "Não foi possível guardar os seus dados para futuras inscrições."
        });
    }
  };

  if (isLoading || isUserLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!course) {
    return <div className="flex h-screen items-center justify-center">Curso não encontrado</div>;
  }
  if (!authUser) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="py-12 bg-secondary">
        <div className="container mx-auto max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Formulário de Inscrição</CardTitle>
              <CardDescription>Inscreva-se no curso <strong className="text-primary">{course.name}</strong>. Por favor, preencha com letras legíveis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="font-headline text-xl border-b pb-2">Informação Pessoal</h3>
                    <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="dob" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="idCard" render={({ field }) => (<FormItem><FormLabel>Bilhete de Identidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="taxpayerId" render={({ field }) => (<FormItem><FormLabel>Contribuinte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="profession" render={({ field }) => (<FormItem><FormLabel>Profissão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Morada</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>Telemóvel</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h3 className="font-headline text-xl border-b pb-2">Informação Profissional (Opcional)</h3>
                     <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Nome da Instituição/Empresa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="jobTitle" render={({ field }) => (<FormItem><FormLabel>Cargo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  {/* Course Knowledge */}
                  <div className="space-y-4">
                    <h3 className="font-headline text-xl border-b pb-2">Nível de Conhecimento</h3>
                     <FormField control={form.control} name="hasKnowledge" render={({ field }) => (
                        <FormItem><FormLabel>Tem algum conhecimento sobre o curso?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sim" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Nao" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="knowledgeLevel" render={({ field }) => (
                        <FormItem><FormLabel>Nível de conhecimento</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Nenhum" /></FormControl><FormLabel className="font-normal">Nenhum</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Básico" /></FormControl><FormLabel className="font-normal">Básico</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Intermédio" /></FormControl><FormLabel className="font-normal">Intermédio</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Avançado" /></FormControl><FormLabel className="font-normal">Avançado</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                      control={form.control}
                      name="courseReason"
                      render={() => (
                        <FormItem>
                          <FormLabel>Porquê pretende fazer este curso?</FormLabel>
                          <div className="space-y-2">
                            {['Para fins Laborais', 'Para fins acadêmicos', 'Para obter apenas conhecimentos'].map(reason => (
                              <FormField
                                key={reason}
                                control={form.control}
                                name="courseReason"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(reason)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), reason])
                                            : field.onChange(field.value?.filter(value => value !== reason))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{reason}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment & Terms */}
                  <div className="space-y-4">
                     <h3 className="font-headline text-xl border-b pb-2">Pagamento e Termos</h3>
                     <div className="text-sm space-y-2 p-4 border rounded-md bg-secondary/50">
                        <h4 className="font-semibold">Formas de Pagamento</h4>
                        <p>O pagamento pode ser efetuado através de referência para caixas automáticas ou transferência/depósito. Mais detalhes serão fornecidos no próximo passo.</p>
                     </div>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-base">Ler Termos e Condições</AccordionTrigger>
                            <AccordionContent className="text-xs text-muted-foreground space-y-2 max-h-60 overflow-y-auto pr-4">
                                <p><strong>EFETIVAÇÃO DA INSCRIÇÃO:</strong> A confirmação da inscrição só será efetivada mediante o preenchimento da ficha e confirmação do pagamento.</p>
                                <p><strong>SUBSTITUIÇÕES:</strong> Serão aceitas substituições de participantes com no mínimo 2 (dois) dias úteis de antecedência.</p>
                                <p><strong>CANCELAMENTO PELO ADQUIRENTE:</strong> Pode optar por crédito (100% do valor, válido por 12 meses, pedido com 15 dias de antecedência) ou reembolso (80% do valor, pedido com 10 dias de antecedência). Não há reembolso se o curso já tiver iniciado e o aluno acessado 20% das aulas.</p>
                                <p><strong>CERTIFICADOS:</strong> Fornecidos com frequência mínima de 75%. Certificação por outras entidades pode ter taxa adicional.</p>
                                <p><strong>NÃO COMPARECIMENTO:</strong> Se não notificar a ausência, o valor não será reembolsado nem o crédito transferido.</p>
                                <p><strong>ALTERAÇÃO/CANCELAMENTO PELA C.A:</strong> A C.A reserva o direito de alterar data/local com 7 dias de antecedência. Em caso de cancelamento, o adquirente pode optar por crédito de 100% ou reembolso integral.</p>
                            </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                       <FormField
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Li e aceito os Termos e Condições
                                </FormLabel>
                                <FormMessage />
                            </div>
                            </FormItem>
                        )}
                        />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Confirmar e Prosseguir para Pagamento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
