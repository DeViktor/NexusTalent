
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCourseCategories, getCourseById, updateCourse } from '@/lib/course-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Save, Trash2, PlusCircle, Link as LinkIcon, Bot, FileUp, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateModuleAssessmentAction } from '@/app/actions';
import Image from 'next/image';
import type { Course } from '@/lib/types';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ModuleAssessmentFormSchema, GenerateModuleAssessmentInputSchema, type GenerateModuleAssessmentInput } from '@/lib/schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const moduleQuestionSchema = z.object({
    question: z.string().min(1, "A pergunta não pode estar em branco."),
    type: z.enum(['multiple-choice', 'short-answer']),
    options: z.array(z.object({ value: z.string().min(1, "A opção não pode estar em branco.") })).optional(),
    correctAnswerIndex: z.coerce.number().optional(),
    shortAnswer: z.string().optional(),
});

const moduleSchema = z.object({
  title: z.string().min(1, "O título do módulo é obrigatório."),
  topics: z.array(z.object({ 
    title: z.string().min(1, "O tópico não pode estar vazio."),
    videoUrl: z.string().url("Insira um URL válido.").optional().or(z.literal('')),
    pdfUrl: z.string().optional(),
    powerpointUrl: z.string().url("Insira um URL válido.").optional().or(z.literal('')),
  })),
  videoUrl: z.string().url("Insira um URL válido.").optional().or(z.literal('')),
  assessment: z.object({ questions: z.array(moduleQuestionSchema) }).optional(),
});

const formSchema = z.object({
  courseName: z.string().min(5, { message: 'O nome do curso deve ter pelo menos 5 caracteres.' }),
  courseCategory: z.string({ required_error: 'Selecione uma categoria.' }),
  courseLevel: z.string({ required_error: 'Selecione um nível.' }),
  id: z.string(),
  format: z.enum(['Online', 'Presencial', 'Híbrido'], { required_error: 'Selecione um formato.' }),
  duration: z.string().optional(),
  generalObjective: z.string().optional(),
  whatYouWillLearn: z.string().optional(),
  imageDataUri: z.string().optional(),
  modules: z.array(moduleSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type ModuleAssessmentFormValues = z.infer<typeof ModuleAssessmentFormSchema>;


export default function EditCoursePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const courseCategories = getCourseCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { modules: [] },
  });

  useEffect(() => {
    if (courseId) {
      const foundCourse = getCourseById(courseId as string);
      setCourse(foundCourse);
    }
  }, [courseId]);

  useEffect(() => {
    if (course) {
        form.reset({
            courseName: course.name,
            courseCategory: course.category,
            courseLevel: 'Intermediário', // Mock level, as it's not in the model
            id: course.id,
            format: course.format,
            duration: course.duration,
            generalObjective: course.generalObjective,
            whatYouWillLearn: course.whatYouWillLearn.join('\n'),
            imageDataUri: course.imageDataUri,
            modules: course.modules.map(m => ({
              ...m,
              topics: m.topics.map(t => ({ title: t.title, videoUrl: t.videoUrl || '', pdfUrl: t.pdfUrl || '', powerpointUrl: t.powerpointUrl || '' }))
            }))
        });
    }
  }, [course, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modules"
  });

  const handleSaveCourse: SubmitHandler<FormValues> = async (data) => {
    setIsSaving(true);
    
    const courseData: Course = {
      id: data.id,
      name: data.courseName,
      category: data.courseCategory,
      format: data.format,
      imageId: `course-image-${data.id}`,
      imageDataUri: data.imageDataUri,
      duration: data.duration || '',
      generalObjective: data.generalObjective || '',
      whatYouWillLearn: data.whatYouWillLearn?.split('\n').filter(line => line.trim() !== '') || [],
      modules: data.modules?.map(m => ({
          title: m.title,
          topics: m.topics.map(t => ({ 
            title: t.title, 
            videoUrl: t.videoUrl, 
            pdfUrl: t.pdfUrl, 
            powerpointUrl: t.powerpointUrl 
          })),
          videoUrl: m.videoUrl,
          assessment: m.assessment,
      })) || [],
    };

    try {
      const result = updateCourse(data.id, courseData);

      if (result) {
        toast({
            title: "Curso Atualizado!",
            description: "O curso foi atualizado com sucesso.",
        });
        router.push('/dashboard/instructor');
      } else {
        throw new Error("Não foi possível encontrar o curso para atualizar.");
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar o curso',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (course === undefined) {
    return <div className="container mx-auto p-12"><Skeleton className="h-96 w-full" /></div>
  }

  if (course === null) {
      return notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Editar Curso</CardTitle>
          <CardDescription>
            Edite o conteúdo do curso <strong className="text-primary">{course.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveCourse)} className="space-y-6">
                <div className="mt-8 pt-6 space-y-6">
                  {form.watch('imageDataUri') && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
                        <Image src={form.watch('imageDataUri')!} alt="Imagem gerada para o curso" fill className="object-cover" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <FormField control={form.control} name="format" render={({ field }) => ( <FormItem><FormLabel>Formato do Curso</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o formato" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Presencial">Presencial</SelectItem><SelectItem value="Híbrido">Híbrido</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="id" render={({ field }) => ( <FormItem><FormLabel>ID do Curso</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem><FormLabel>Duração</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    <FormField control={form.control} name="generalObjective" render={({ field }) => ( <FormItem><FormLabel>Objetivo Geral</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="whatYouWillLearn" render={({ field }) => ( <FormItem><FormLabel>O que vai aprender (um por linha)</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem> )} />
    
                    <div>
                      <h4 className="font-semibold mb-4 text-lg">Módulos do Curso</h4>
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                           <ModuleField key={field.id} moduleIndex={index} form={form} onRemove={() => remove(index)} />
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', topics: [{title: '', videoUrl: '', pdfUrl: '', powerpointUrl: ''}], videoUrl: '' })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4"/>Adicionar Módulo
                      </Button>
                    </div>
                  </div>
    
                  <Button type="submit" disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700">
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                  </Button>
                </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


function ModuleField({ moduleIndex, form, onRemove }: { moduleIndex: number; form: any; onRemove: () => void; }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `modules.${moduleIndex}.topics`
  });

  const courseFormat = form.watch('format');
  const moduleTitle = form.watch(`modules.${moduleIndex}.title`);
  const moduleTopics = form.watch(`modules.${moduleIndex}.topics`);

  return (
    <div className="p-4 border rounded-lg relative bg-secondary/30">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-md">Módulo {moduleIndex + 1}</h5>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.title`}
          render={({ field }) => (
            <FormItem><FormLabel>Título do Módulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        
        <div className='space-y-2'>
            <FormLabel>Tópicos da Aula (Lições)</FormLabel>
            {fields.map((topicField, topicIndex) => (
                <div key={topicField.id} className="flex items-start gap-2 bg-background/50 p-3 rounded-md">
                    <div className="flex-grow space-y-2">
                        <FormField
                            control={form.control}
                            name={`modules.${moduleIndex}.topics.${topicIndex}.title`}
                            render={({ field }) => (
                            <FormItem className='flex-grow'><FormControl><Input {...field} placeholder={`Título do Tópico ${topicIndex + 1}`} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                            <FormField
                                control={form.control}
                                name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input placeholder="URL do Vídeo" className="pl-9 text-xs h-8" {...field} />
                                            </FormControl>
                                        </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`modules.${moduleIndex}.topics.${topicIndex}.powerpointUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="relative">
                                            <Presentation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input placeholder="URL do PowerPoint" className="pl-9 text-xs h-8" {...field} />
                                            </FormControl>
                                        </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`modules.${moduleIndex}.topics.${topicIndex}.pdfUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="relative">
                                            <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="file" accept=".pdf" className="pl-9 text-xs h-8" />
                                            </FormControl>
                                        </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(topicIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </div>
            ))}
            <div className='flex gap-2'>
                <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => append({ title: '', videoUrl: '', pdfUrl: '' })}>
                    <PlusCircle className="mr-2 h-3 w-3"/>Adicionar Tópico
                </Button>
                 <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => append({ title: 'Link Externo', videoUrl: 'https://', pdfUrl: '' })}>
                    <LinkIcon className="mr-2 h-3 w-3"/>Adicionar Link Externo
                </Button>
            </div>
        </div>
        
        {(courseFormat === 'Online' || courseFormat === 'Híbrido') && (
           <FormField
            control={form.control}
            name={`modules.${moduleIndex}.videoUrl`}
            render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Videoaula Principal do Módulo (Opcional)</FormLabel>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
            )}
           />
        )}
        <ModuleAssessmentGenerator
            moduleIndex={moduleIndex} 
            moduleTitle={moduleTitle} 
            topics={moduleTopics?.map((t: {title: string}) => t.title) || []} 
            mainForm={form}
        />
      </div>
    </div>
  );
}


function ModuleAssessmentGenerator({ moduleIndex, moduleTitle, topics, mainForm }: { moduleIndex: number, moduleTitle: string, topics: string[], mainForm: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const assessmentForm = useForm<ModuleAssessmentFormValues>({
    resolver: zodResolver(ModuleAssessmentFormSchema),
    defaultValues: {
      questions: mainForm.getValues(`modules.${moduleIndex}.assessment.questions`) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: assessmentForm.control,
    name: 'questions',
  });

  const configForm = useForm<z.infer<typeof GenerateModuleAssessmentInputSchema>>({
    resolver: zodResolver(GenerateModuleAssessmentInputSchema),
    defaultValues: {
      moduleTitle: '',
      topics: [],
      numMultipleChoice: 2,
      numShortAnswer: 1,
      level: 'Médio',
    },
  });

  const handleGenerate = async (configData: z.infer<typeof GenerateModuleAssessmentInputSchema>) => {
    if (!moduleTitle || topics.length === 0 || topics.every(t => !t)) {
        toast({
            variant: "destructive",
            title: "Faltam Dados",
            description: "O módulo precisa de um título e pelo menos um tópico para gerar um teste.",
        });
        return;
    }
    setIsGenerating(true);
    assessmentForm.reset({ questions: [] });
    try {
        const input: GenerateModuleAssessmentInput = {
            moduleTitle, 
            topics: topics.filter(t => t), 
            numMultipleChoice: Number(configData.numMultipleChoice),
            numShortAnswer: Number(configData.numShortAnswer),
            level: configData.level
        };
        const result = await generateModuleAssessmentAction(input);
        
        if (!result || !result.questions) {
            throw new Error("A resposta da IA não continha as perguntas esperadas.");
        }

        const questionsForForm = result.questions.map(q => ({
          ...q,
          options: q.options ? q.options.map(opt => ({ value: opt })) : [],
        }));

        assessmentForm.reset({ questions: questionsForForm });
        setHasGenerated(true);
        toast({
            title: "Pré-visualização do Teste Gerada!",
            description: "Pode agora rever, editar e guardar o teste."
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro ao gerar teste',
            description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        });
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleSaveTest = (data: ModuleAssessmentFormValues) => {
    mainForm.setValue(`modules.${moduleIndex}.assessment`, data);
    toast({
        title: "Teste Salvo!",
        description: `O teste para o módulo "${moduleTitle}" foi salvo no formulário principal do curso.`,
    });
    setIsOpen(false);
  }

  const addNewQuestion = (type: 'multiple-choice' | 'short-answer') => {
    append({
        question: '',
        type,
        options: type === 'multiple-choice' ? [{value: ''}, {value: ''}, {value: ''}, {value: ''}] : [],
        correctAnswerIndex: type === 'multiple-choice' ? 0 : undefined,
        shortAnswer: type === 'short-answer' ? '' : undefined,
    });
    if (!hasGenerated) setHasGenerated(true); // Garante que a área de edição apareça
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full mt-2">
              <Bot className="mr-2 h-4 w-4" /> Gerir/Criar Teste de Avaliação
          </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[70vw] h-[90vh] flex flex-col">
          <DialogHeader>
              <DialogTitle>Gerador de Teste para: {moduleTitle}</DialogTitle>
              <DialogDescription>
                  Configure, gere com IA, edite e salve o teste para este módulo.
              </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden flex-grow'>
            {/* Coluna de Configuração */}
            <div className='lg:col-span-1 border-r pr-6 flex flex-col'>
                <h4 className='font-semibold mb-4'>1. Configurar e Gerar</h4>
                 <Form {...configForm}>
                    <form onSubmit={configForm.handleSubmit(handleGenerate)} className="space-y-4">
                        <FormField control={configForm.control} name="numMultipleChoice" render={({ field }) => ( <FormItem><FormLabel>Nº de Múltipla Escolha</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl></FormItem> )} />
                        <FormField control={configForm.control} name="numShortAnswer" render={({ field }) => ( <FormItem><FormLabel>Nº de Resposta Curta</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl></FormItem> )} />
                        <FormField control={configForm.control} name="level" render={({ field }) => ( <FormItem><FormLabel>Nível</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fácil">Fácil</SelectItem><SelectItem value="Médio">Médio</SelectItem><SelectItem value="Difícil">Difícil</SelectItem></SelectContent></Select></FormItem> )} />
                         <Button type="submit" disabled={isGenerating} className="w-full">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                            {hasGenerated ? 'Gerar Novamente' : 'Gerar Teste com IA'}
                        </Button>
                    </form>
                 </Form>

                 <Separator className="my-6" />

                 <h4 className='font-semibold mb-4'>Ou Adicionar Manualmente</h4>
                 <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" onClick={() => addNewQuestion('multiple-choice')}><PlusCircle className="mr-2 h-4 w-4"/> Adicionar Múltipla Escolha</Button>
                    <Button type="button" variant="outline" onClick={() => addNewQuestion('short-answer')}><PlusCircle className="mr-2 h-4 w-4"/> Adicionar Resposta Curta</Button>
                </div>
            </div>
            
            {/* Coluna de Edição */}
            <div className='lg:col-span-2 overflow-y-auto pr-2 flex flex-col'>
              <h4 className='font-semibold mb-4'>2. Pré-visualizar e Editar Teste</h4>
              {isGenerating && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
              
              {!isGenerating && !hasGenerated && (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                    <div>
                        <Bot size={48} className="mx-auto mb-4" />
                        <p>Gere um teste com IA ou adicione perguntas manualmente para começar.</p>
                    </div>
                </div>
              )}

              {hasGenerated && (
                  <Form {...assessmentForm}>
                    <form onSubmit={assessmentForm.handleSubmit(handleSaveTest)} className="space-y-4 flex-grow flex flex-col">
                        <div className='space-y-4 overflow-y-auto flex-grow pr-2'>
                        {fields.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-md relative bg-background">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            <FormField control={assessmentForm.control} name={`questions.${index}.question`} render={({ field }) => ( <FormItem><FormLabel>Pergunta {index + 1}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem> )} />
                            
                            {item.type === 'multiple-choice' && (
                            <div className='mt-4 space-y-2'>
                                <FormLabel>Opções (Marque a correta)</FormLabel>
                                <RadioGroup
                                    onValueChange={(value) => assessmentForm.setValue(`questions.${index}.correctAnswerIndex`, parseInt(value))}
                                    value={assessmentForm.watch(`questions.${index}.correctAnswerIndex`)?.toString()}
                                    className="space-y-1"
                                >
                                    <div className='space-y-2'>
                                        {Array.from({length: 4}).map((_, optionIndex) => (
                                            <FormField
                                            key={`${item.id}-opt-${optionIndex}`}
                                            control={assessmentForm.control}
                                            name={`questions.${index}.options.${optionIndex}.value`}
                                            render={({ field }) => (
                                                <FormItem className='flex items-center gap-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value={optionIndex.toString()} />
                                                </FormControl>
                                                <Input {...field} placeholder={`Opção ${optionIndex + 1}`} className="flex-1"/>
                                                </FormItem>
                                            )}
                                            />
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                            )}

                            {item.type === 'short-answer' && (
                            <FormField control={assessmentForm.control} name={`questions.${index}.shortAnswer`} render={({ field }) => ( <FormItem className='mt-2'><FormLabel>Resposta Ideal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem> )} />
                            )}

                        </div>
                        ))}
                        </div>
                        
                        <DialogFooter className="pt-4 !justify-end sticky bottom-0 bg-background py-4">
                        <Button type="submit" disabled={fields.length === 0} size="lg">
                            <Save className="mr-2 h-4 w-4" /> Guardar Teste no Módulo
                        </Button>
                        </DialogFooter>
                    </form>
                  </Form>
                )}

            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}

    