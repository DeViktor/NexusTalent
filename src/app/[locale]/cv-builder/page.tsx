
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { users, updateUser } from '@/lib/users';
import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CvPreviewTemplate } from '@/components/cv/cv-preview-template';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CvPreviewModernTemplate } from '@/components/cv/CvPreviewModernTemplate';
import { CvPreviewClassicTemplate } from '@/components/cv/CvPreviewClassicTemplate';

const cvSchema = z.object({
  firstName: z.string().min(1, 'Primeiro nome é obrigatório.'),
  lastName: z.string().min(1, 'Último nome é obrigatório.'),
  academicTitle: z.string().min(1, 'Título é obrigatório.'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Email inválido.'),
  cidade: z.string().optional(),
  summary: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  workExperience: z.array(z.object({
    role: z.string().min(1, 'Função é obrigatória.'),
    company: z.string().min(1, 'Empresa é obrigatória.'),
    period: z.string().min(1, 'Período é obrigatória.'),
    description: z.string().optional(),
  })).optional(),
  academicHistory: z.array(z.object({
    degree: z.string().min(1, 'Curso/Grau é obrigatório.'),
    institution: z.string().min(1, 'Instituição é obrigatória.'),
    year: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({ value: z.string() })).optional(),
});

type CvFormValues = z.infer<typeof cvSchema>;
type CvTemplate = 'europass' | 'modern' | 'classic';

export default function CVBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<CvTemplate>('europass');
  const previewRef = useRef<HTMLDivElement>(null);

  const form = useForm<CvFormValues>({
    resolver: zodResolver(cvSchema),
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control, name: 'workExperience'
  });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control, name: 'academicHistory'
  });
   const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control, name: 'skills'
  });

  const watchedData = form.watch();

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (!active) return;
        if (json?.ok && json?.user) {
          setUser(json.user);
          const userProfile = users.find(u => u.id === json.user.id);
          if (userProfile) {
            setProfile(userProfile);
            form.reset({
              ...userProfile,
              profilePictureUrl: userProfile.profilePictureUrl || json.user.photoURL || '',
              skills: userProfile.skills?.map(s => ({ value: s }))
            });
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        if (active) setIsUserLoading(false);
      }
    };
    loadSession();
    return () => { active = false; };
  }, [form, router]);

  const handleSave: SubmitHandler<CvFormValues> = async (data) => {
    if (!profile) return;
    setIsSaving(true);
    const updatedProfileData = {
        ...profile,
        ...data,
        skills: data.skills?.map(s => s.value).filter(Boolean) || [],
    };
    try {
        const updated = updateUser(profile.id, updatedProfileData);
        setProfile(updated);
        toast({ title: "Perfil Salvo!", description: "As suas informações foram atualizadas." });
    } catch(e) {
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível guardar o perfil." });
    } finally {
        setIsSaving(false);
    }
  };
  
const handleDownloadPdf = async () => {
    const element = previewRef.current;
    if (!element) return;
    
    toast({ title: 'A gerar PDF...', description: 'Por favor, aguarde um momento.' });

    const canvas = await html2canvas(element, { 
      scale: 3,
      useCORS: true,
      onclone: (document) => {
        const clone = document.getElementById('cv-preview-container-for-pdf');
        if (clone) {
            clone.classList.remove('dark');
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const a4Width = 210;
    const a4Height = 297;
    const margin = 15; // 1.5 cm
    const usableWidth = a4Width - (margin * 2);
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = usableWidth / canvasWidth;
    const imgHeight = canvasHeight * ratio;

    let heightLeft = imgHeight;
    let position = margin;
    
    pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
    heightLeft -= (a4Height - margin * 2);

    while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
        heightLeft -= (a4Height - margin * 2);
    }
    
    pdf.save(`${(profile?.firstName || 'cv')}_${(profile?.lastName || 'nexustalent')}.pdf`);
};


  if (isUserLoading || !profile) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <div className='flex gap-2'>
                    <Button onClick={form.handleSubmit(handleSave)} disabled={isSaving}>
                        {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Alterações
                    </Button>
                    <Button onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar como PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* FORM COLUMN */}
                <div className="bg-card p-6 rounded-lg shadow-md">
                     <h2 className="font-headline text-2xl font-bold mb-4">Edite o seu Currículo</h2>
                     <Form {...form}>
                        <form className="space-y-4">
                            <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Dados Pessoais</AccordionTrigger>
                                    <AccordionContent className='pt-4 space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Primeiro Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                                            <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apelido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                                        </div>
                                         <FormField control={form.control} name="academicTitle" render={({ field }) => (<FormItem><FormLabel>Título Profissional</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                                         <div className='grid grid-cols-2 gap-4'>
                                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                                        </div>
                                        <FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Localização</FormLabel><FormControl><Input placeholder="Ex: Luanda, Angola" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Resumo Profissional</AccordionTrigger>
                                    <AccordionContent className='pt-4'>
                                         <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage/></FormItem>)} />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Experiência Profissional</AccordionTrigger>
                                    <AccordionContent className='pt-4 space-y-4'>
                                        {workFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeWork(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Função</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Empresa</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name={`workExperience.${index}.period`} render={({ field }) => (<FormItem><FormLabel>Período</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name={`workExperience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>)} />
                                            </div>
                                        ))}
                                        <Button type='button' variant='outline' size='sm' onClick={() => appendWork({role: '', company: '', period: ''})}><PlusCircle size={16} className='mr-2'/>Adicionar Experiência</Button>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Educação</AccordionTrigger>
                                     <AccordionContent className='pt-4 space-y-4'>
                                        {educationFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                <FormField control={form.control} name={`academicHistory.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Curso/Grau</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name={`academicHistory.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Instituição</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name={`academicHistory.${index}.year`} render={({ field }) => (<FormItem><FormLabel>Ano</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            </div>
                                        ))}
                                        <Button type='button' variant='outline' size='sm' onClick={() => appendEducation({degree: '', institution: '', year: ''})}><PlusCircle size={16} className='mr-2'/>Adicionar Educação</Button>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger>Competências</AccordionTrigger>
                                    <AccordionContent className='pt-4 space-y-4'>
                                        {skillFields.map((field, index) => (
                                             <div key={field.id} className="flex items-center gap-2">
                                                <FormField control={form.control} name={`skills.${index}.value`} render={({ field }) => (<FormItem className='flex-grow'><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type='button' variant='outline' size='sm' onClick={() => appendSkill({value: ''})}><PlusCircle size={16} className='mr-2'/>Adicionar Competência</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </form>
                     </Form>
                </div>
                {/* PREVIEW COLUMN */}
                <div className="lg:col-span-1 lg:sticky top-24">
                    <div>
                        <Label className="font-headline text-lg">Escolha um Modelo</Label>
                        <RadioGroup defaultValue={template} onValueChange={(v) => setTemplate(v as CvTemplate)} className="flex gap-2 mt-2">
                           <Label htmlFor="template-europass" className={cn("border-2 rounded-md p-2 cursor-pointer hover:border-primary", template === 'europass' ? 'border-primary' : 'border-border')}>
                                <RadioGroupItem value="europass" id="template-europass" className="sr-only"/>
                                <div className="font-semibold">Profissional</div>
                                <div className="text-xs text-muted-foreground">Recomendado</div>
                           </Label>
                           <Label htmlFor="template-modern" className={cn("border-2 rounded-md p-2 cursor-pointer hover:border-primary", template === 'modern' ? 'border-primary' : 'border-border')}>
                                <RadioGroupItem value="modern" id="template-modern" className="sr-only" />
                                <div className="font-semibold">Moderno</div>
                           </Label>
                           <Label htmlFor="template-classic" className={cn("border-2 rounded-md p-2 cursor-pointer hover:border-primary", template === 'classic' ? 'border-primary' : 'border-border')}>
                                <RadioGroupItem value="classic" id="template-classic" className="sr-only" />
                                <div className="font-semibold">Clássico</div>
                           </Label>
                        </RadioGroup>
                    </div>
                    <div className="w-full mt-4 bg-white shadow-lg rounded-lg overflow-hidden">
                       <div className="w-full overflow-hidden aspect-[210/297] relative">
                            <div id="cv-preview-container-for-pdf" ref={previewRef} className="absolute top-0 left-0 origin-top-left transform scale-[0.4] sm:scale-[0.55] md:scale-[0.6] lg:scale-100">
                                <div className="w-[210mm]">
                                    {template === 'europass' && <CvPreviewTemplate data={watchedData} />}
                                    {template === 'modern' && <CvPreviewModernTemplate data={watchedData} />}
                                    {template === 'classic' && <CvPreviewClassicTemplate data={watchedData} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
