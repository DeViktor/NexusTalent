'use client';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, PlusCircle, Trash2, Edit, User, Briefcase, GraduationCap, Award, Link as LinkIcon, FileText, Download, ArrowLeft, Save, KeyRound, Camera } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { extractProfileFromResumeAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { getUserById, upsertUser, updateUserRow, mapUserRowToUserProfile } from '@/lib/supabase/user-service';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const profileSchema = z.object({
    firstName: z.string().min(1, 'O nome é obrigatório.'),
    lastName: z.string().min(1, 'O apelido é obrigatório.'),
    academicTitle: z.string().min(3, 'O título académico é obrigatório.'),
    nationality: z.string().min(3, 'A nacionalidade é obrigatória.'),
    cidade: z.string().optional(),
    phoneNumber: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    yearsOfExperience: z.coerce.number().min(0, 'Os anos de experiência devem ser um número positivo.'),
    functionalArea: z.string().min(3, 'A área funcional é obrigatória.'),
    skills: z.string().describe("Competências separadas por vírgula").optional(),
    resumeUrl: z.string().url('Por favor, insira um URL válido para o seu CV.').optional().or(z.literal('')),
    academicHistory: z.array(z.object({
        institution: z.string().min(1, "Instituição é obrigatória"),
        degree: z.string().min(1, "Curso/Grau é obrigatória"),
        year: z.string().min(4, "Ano é obrigatório"),
    })).optional(),
    workExperience: z.array(z.object({
        company: z.string().min(1, "Empresa é obrigatória"),
        role: z.string().min(1, "Função é obrigatória"),
        period: z.string().min(1, "Período é obrigatória"),
        description: z.string().optional(),
    })).optional(),
    // Job Preferences
    preferredContractType: z.string().optional(),
    // Communication Preferences
    receivesNotifications: z.boolean().optional(),
    receivesJobAlerts: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const [authUser, setAuthUser] = useState<{ id: string; email: string; user_metadata?: any } | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '', lastName: '', academicTitle: '', nationality: '', phoneNumber: '',
            yearsOfExperience: 0, functionalArea: '', skills: '', resumeUrl: '',
            academicHistory: [], workExperience: [],
            receivesNotifications: true, receivesJobAlerts: true,
        }
    });

    useEffect(() => {
        const loadAuthUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const u = data.user;
                if (!u) {
                    router.replace('/login');
                    return;
                }
                setAuthUser({ id: u.id, email: u.email || '', user_metadata: u.user_metadata });
            } finally {
                setIsUserLoading(false);
            }
        };
        loadAuthUser();
    }, [router]);

    useEffect(() => {
        const bootstrapProfile = async () => {
            if (!isUserLoading && authUser) {
                const existing = await getUserById(authUser.id);
                if (existing) {
                    const profile = mapUserRowToUserProfile(existing);
                    setUserProfile(profile);
                    if (profile.userType !== 'student') {
                        const targetDashboard = profile.userType === 'recruiter' ? '/dashboard/recruiter/company-profile' : `/dashboard/${profile.userType}`;
                        router.replace(targetDashboard);
                        return;
                    }
                } else {
                    const fullName = (authUser.user_metadata?.name as string) || '';
                    await upsertUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        name: fullName || 'Usuário',
                        role: 'student',
                        avatar_url: undefined,
                        created_at: new Date().toISOString(),
                    });
                    const profile: UserProfile = {
                        id: authUser.id,
                        email: authUser.email || '',
                        firstName: fullName.split(' ')[0] || fullName || 'Usuário',
                        lastName: fullName.split(' ').slice(1).join(' ') || '',
                        userType: 'student',
                        profilePictureUrl: '',
                    };
                    setUserProfile(profile);
                    setIsEditing(true);
                }
            } else if (!isUserLoading && !authUser) {
                router.replace('/login');
            }
            setIsProfileLoading(false);
        };
        bootstrapProfile();
    }, [authUser, isUserLoading, router]);

    useEffect(() => {
        if (userProfile) {
            const [firstName, ...lastNameParts] = ((authUser?.user_metadata?.name as string) || '').split(' ') || ['', ''];
            form.reset({
                firstName: userProfile.firstName || firstName || '',
                lastName: userProfile.lastName || lastNameParts.join(' ') || '',
                academicTitle: userProfile.academicTitle || '',
                nationality: userProfile.nationality || '',
                cidade: userProfile.cidade || '',
                phoneNumber: userProfile.phoneNumber || '',
                profilePictureUrl: userProfile.profilePictureUrl || '',
                yearsOfExperience: userProfile.yearsOfExperience || 0,
                functionalArea: userProfile.functionalArea || '',
                skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : '',
                resumeUrl: userProfile.resumeUrl || '',
                academicHistory: userProfile.academicHistory || [],
                workExperience: userProfile.workExperience || [],
                preferredContractType: userProfile.preferredContractType || 'any',
                receivesNotifications: userProfile.receivesNotifications !== false,
                receivesJobAlerts: userProfile.receivesJobAlerts !== false,
            });
        }
    }, [userProfile, form, authUser]);

    const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        if (!authUser || !userProfile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Utilizador não autenticado ou perfil não encontrado.' });
            return;
        }

        const finalData = {
            ...data,
            skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        };

        const profileToSave: UserProfile = {
            ...userProfile, 
            ...finalData,   
            id: userProfile.id,
            email: userProfile.email,
            userType: userProfile.userType || 'student',
        };

        try {
            const fullName = `${finalData.firstName} ${finalData.lastName}`.trim();
            const updatedRow = await updateUserRow(profileToSave.id, {
                name: fullName,
                role: 'student',
                email: profileToSave.email,
                avatar_url: profileToSave.profilePictureUrl,
                // Nota: Campos adicionais (skills, experiências) não existem na tabela atual
            });

            if (updatedRow) {
                setUserProfile(profileToSave);
                toast({ title: 'Sucesso!', description: 'O seu perfil foi atualizado.' });
                setIsEditing(false);
            } else {
                throw new Error('Não foi possível atualizar o perfil no Supabase.');
            }
        } catch (error) {
            toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Falha ao salvar o perfil.' });
        }
    };
    
    if (isUserLoading || isProfileLoading || !userProfile) {
        return <ProfileSkeleton />;
    }
    
    if (!isEditing) {
        return <ProfileView profile={userProfile} onEdit={() => setIsEditing(true)} />;
    }

    return <ProfileForm form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} onCancel={() => setIsEditing(false)} />;
}

function ProfileView({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
    const router = useRouter();
    const getInitials = (firstName: string, lastName: string) => `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                     <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={profile.profilePictureUrl} />
                        <AvatarFallback>{getInitials(profile.firstName, profile.lastName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-headline text-4xl font-bold">{profile.firstName} {profile.lastName}</h1>
                        <p className="text-muted-foreground text-xl mt-1">{profile.academicTitle}</p>
                        <p className="text-muted-foreground text-sm mt-2">{profile.functionalArea}  &middot; {profile.yearsOfExperience} anos de experiência</p>
                    </div>
                </div>
                <Button onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Editar Perfil</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase /> Experiência Profissional</CardTitle>
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
                            <CardTitle className="flex items-center gap-2"><GraduationCap /> Formação Académica</CardTitle>
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
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Award /> Competências</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                             {profile.skills?.length ? profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            )) : <p className="text-sm text-muted-foreground">Nenhuma competência adicionada.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText /> Currículo</CardTitle>
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

function ProfileForm({ form, onSubmit, isSubmitting, onCancel }: { form: any; onSubmit: SubmitHandler<ProfileFormValues>, isSubmitting: boolean, onCancel: () => void }) {
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (firstName: string, lastName: string) => `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    
    const { fields: academicFields, append: appendAcademic, remove: removeAcademic } = useFieldArray({
        control: form.control, name: "academicHistory"
    });

    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
        control: form.control, name: "workExperience"
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setCvFile(file);
        }
    };
    
    const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUri = await fileToDataUri(file);
                form.setValue('profilePictureUrl', dataUri, { shouldDirty: true });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a imagem.' });
            }
        }
    };

    const handleAnalyzeAndFill = async () => {
         if (!cvFile) {
            toast({ variant: 'destructive', title: 'Nenhum ficheiro selecionado', description: 'Por favor, carregue o seu CV em formato PDF ou DOCX.' });
            return;
        }
        setIsAnalyzing(true);
        try {
            const resumeDataUri = await fileToDataUri(cvFile);
            const result = await extractProfileFromResumeAction({ resumeDataUri });
            form.reset({ ...form.getValues(), ...result, skills: result.skills?.join(', ') || '' });
            toast({ title: 'Perfil preenchido!', description: 'Os dados do seu CV foram preenchidos. Por favor, reveja e salve as alterações.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro na Análise', description: error instanceof Error ? error.message : 'Não foi possível analisar o CV.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePasswordReset = async () => {
        try {
            const { data } = await supabase.auth.getUser();
            const email = data.user?.email;
            if (!email) {
                toast({ variant: 'destructive', title: 'Erro', description: 'E-mail do utilizador não encontrado.' });
                return;
            }
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) {
                throw error;
            }
            toast({ title: 'E-mail Enviado', description: 'Verifique a sua caixa de entrada para redefinir a palavra-passe.' });
        } catch {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar o e-mail de redefinição.' });
        }
    };
    
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Editar Perfil Profissional</CardTitle>
                <CardDescription>
                    Mantenha suas informações atualizadas. Um perfil completo aumenta suas chances de ser encontrado por recrutadores.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-8 p-6 border rounded-lg bg-secondary/50">
                    <h4 className="font-semibold text-lg">Preenchimento Automático com IA</h4>
                    <p className="text-sm text-muted-foreground">
                        Poupe tempo! Carregue o seu CV e deixe a nossa IA preencher os campos do seu perfil.
                    </p>
                    <div className="flex gap-4 items-center">
                        <Input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="max-w-xs" onChange={handleFileChange} />
                        <Button variant="outline" onClick={handleAnalyzeAndFill} disabled={isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Filtrar Dados e Preencher
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <div>
                            <h3 className="font-headline text-xl mb-4">Informação Pessoal e de Contacto</h3>
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="profilePictureUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Foto de Perfil</FormLabel>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-24 w-24">
                                                    <AvatarImage src={field.value} />
                                                    <AvatarFallback>{getInitials(form.getValues('firstName'), form.getValues('lastName'))}</AvatarFallback>
                                                </Avatar>
                                                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                                                    <Camera className="mr-2 h-4 w-4" /> Alterar Foto
                                                </Button>
                                                <FormControl>
                                                    <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleProfilePicChange} />
                                                </FormControl>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <div className="grid md:grid-cols-2 gap-6"><FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apelido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                                <div className="grid md:grid-cols-2 gap-6"><FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidade</FormLabel><FormControl><Input placeholder="Ex: Angolana" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="+244..." {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                            </div>
                        </div>
                        <Separator />
                         <div>
                             <h3 className="font-headline text-xl mb-4">Formação Académica</h3>
                             <div className="space-y-6">
                                {academicFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-md relative space-y-4"><FormField control={form.control} name={`academicHistory.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Instituição de Ensino</FormLabel><FormControl><Input placeholder="Ex: Universidade Agostinho Neto" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid md:grid-cols-2 gap-6"><FormField control={form.control} name={`academicHistory.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Curso/Grau</FormLabel><FormControl><Input placeholder="Ex: Licenciatura em Engenharia Informática" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name={`academicHistory.${index}.year`} render={({ field }) => (<FormItem><FormLabel>Ano de Conclusão</FormLabel><FormControl><Input placeholder="Ex: 2015" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeAcademic(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                                ))}<Button type="button" variant="outline" size="sm" onClick={() => appendAcademic({ institution: '', degree: '', year: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Formação</Button>
                             </div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-headline text-xl mb-4">Experiência Profissional</h3>
                            <div className="space-y-6">
                                <FormField control={form.control} name="academicTitle" render={({ field }) => (<FormItem><FormLabel>Título Profissional Principal</FormLabel><FormControl><Input placeholder="Ex: Engenheiro de Software Sénior" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid md:grid-cols-2 gap-6"><FormField control={form.control} name="yearsOfExperience" render={({ field }) => (<FormItem><FormLabel>Anos de Experiência</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="functionalArea" render={({ field }) => (<FormItem><FormLabel>Área Funcional Principal</FormLabel><FormControl><Input placeholder="Ex: Tecnologia da Informação" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                                {workFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md relative space-y-4 pt-6"><h4 className="font-semibold absolute -top-3 bg-background px-2">Experiência {index + 1}</h4><div className="grid md:grid-cols-2 gap-6"><FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Empresa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Função</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div><FormField control={form.control} name={`workExperience.${index}.period`} render={({ field }) => (<FormItem><FormLabel>Período</FormLabel><FormControl><Input placeholder="Ex: Jan 2020 - Presente" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name={`workExperience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Descrição das Responsabilidades</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeWork(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                                ))} <Button type="button" variant="outline" size="sm" onClick={() => appendWork({ company: '', role: '', period: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Experiência</Button>
                            </div>
                        </div>
                        <Separator />
                         <div>
                            <h3 className="font-headline text-xl mb-4">Currículo e Competências</h3>
                            <div className="space-y-6">
                                <FormField control={form.control} name="resumeUrl" render={({ field }) => (<FormItem><FormLabel>URL do Currículo (opcional)</FormLabel><FormControl><Input placeholder="https://exemplo.com/meu-cv.pdf" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="skills" render={({ field }) => (<FormItem><FormLabel>Principais Competências</FormLabel><FormControl><Textarea placeholder="Ex: React, Gestão de Projetos, Liderança,..." rows={3} {...field} /></FormControl><FormDescription>Separe as competências por vírgulas.</FormDescription><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                        <Separator />
                         <div>
                            <h3 className="font-headline text-xl mb-4">Preferências de Emprego</h3>
                             <p className="text-sm text-muted-foreground mb-4">Todas as tuas preferências em relação ao teu próximo emprego, numa visão geral.</p>
                            <div className="space-y-6">
                                 <FormField control={form.control} name="functionalArea" render={({ field }) => ( <FormItem><FormLabel>Indústrias Preferenciais</FormLabel><FormControl><Input placeholder="Ex: Administrativa e Secretariado, Trabalho, etc" {...field} /></FormControl><FormDescription>Separe as indústrias por vírgulas.</FormDescription><FormMessage /></FormItem>)} />
                                <div className="grid md:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="preferredContractType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Contrato</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Qualquer tipo"/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="any">Qualquer tipo</SelectItem>
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Remote">Remoto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                     <FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Região Preferencial</FormLabel><FormControl><Input placeholder="Ex: Aveiro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        </div>
                        <Separator />
                         <div>
                            <h3 className="font-headline text-xl mb-4">Acesso e Segurança</h3>
                            <Card className="p-4 bg-secondary/50">
                                 <FormLabel>Palavra-passe</FormLabel>
                                 <p className="text-sm text-muted-foreground mt-2 mb-4">
                                     Para sua segurança, não guardamos a sua palavra-passe. Se precisar de a alterar, enviaremos um link seguro para o seu e-mail.
                                 </p>
                                 <Button type="button" variant="outline" onClick={handlePasswordReset}>
                                    <KeyRound className="mr-2 h-4 w-4" /> Enviar E-mail de Redefinição
                                 </Button>
                            </Card>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-headline text-xl mb-4">Preferências de Comunicação</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="receivesNotifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Notificações Gerais</FormLabel>
                                                <FormDescription>Receber notificações sobre atividades, cursos e novidades da plataforma.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="receivesJobAlerts"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Alertas de Empregos</FormLabel>
                                                <FormDescription>Receber e-mails sobre novos empregos que correspondem ao seu perfil.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function ProfileSkeleton() {
    return (
         <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                </div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-11 w-full" />
            </CardContent>
        </Card>
    );
}
