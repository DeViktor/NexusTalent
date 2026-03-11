'use client';

import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building, Save, Image as ImageIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  companyName: z.string().min(3, 'O nome da empresa é obrigatório.'),
  about: z.string().min(50, 'A descrição deve ter pelo menos 50 caracteres.'),
  culture: z.string().min(50, 'A descrição da cultura deve ter pelo menos 50 caracteres.'),
  values: z.string().describe("Valores separados por vírgula").min(5, 'Insira pelo menos um valor.'),
  benefits: z.array(z.object({ value: z.string().min(3, "Benefício inválido") })).min(1, "Insira pelo menos um benefício."),
});

type FormValues = z.infer<typeof formSchema>;


export default function CompanyProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [photos, setPhotos] = useState<string[]>([]);
    const [newPhotoUrl, setNewPhotoUrl] = useState('');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: '',
            about: '',
            culture: '',
            values: '',
            benefits: [{ value: '' }],
        }
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'benefits',
    });

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/recruiter/company-profile', { cache: 'no-store', credentials: 'include' });
                const json = await res.json();
                if (!active) return;
                if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar perfil.');
                const profile = json.profile as any;
                if (!profile) {
                    form.reset({ companyName: '', about: '', culture: '', values: '', benefits: [{ value: '' }] });
                    setPhotos([]);
                } else {
                    form.reset({
                        companyName: String(profile.companyName || ''),
                        about: String(profile.about || ''),
                        culture: String(profile.culture || ''),
                        values: String(profile.values || ''),
                        benefits: Array.isArray(profile.benefits) && profile.benefits.length > 0 ? profile.benefits : [{ value: '' }],
                    });
                    setPhotos(Array.isArray(profile.photos) ? profile.photos : []);
                }
            } catch (e: any) {
                toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao carregar perfil.' });
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, [form, toast]);

    const handleSave: SubmitHandler<FormValues> = async (data) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/recruiter/company-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...data, photos }),
            });
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao salvar perfil.');
            toast({ title: "Perfil Atualizado!", description: "As informações da sua empresa foram guardadas com sucesso." });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao salvar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddPhoto = () => {
        const url = newPhotoUrl.trim();
        if (!url) return;
        setPhotos((prev) => [...prev, url]);
        setNewPhotoUrl('');
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl flex items-center gap-3"><Building /> Perfil da Empresa</CardTitle>
                            <CardDescription>Preencha as informações que serão visíveis para os candidatos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Empresa</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sobre a Empresa</FormLabel>
                                        <FormControl><Textarea rows={5} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="culture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cultura da Empresa</FormLabel>
                                        <FormControl><Textarea rows={4} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="values"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valores</FormLabel>
                                        <FormControl><Input placeholder="Inovação, Excelência, Colaboração..." {...field} /></FormControl>
                                        <FormDescription>Separe os valores por vírgula.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <FormLabel>Benefícios</FormLabel>
                                <div className="space-y-2 mt-2">
                                    {fields.map((field, index) => (
                                         <div key={field.id} className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`benefits.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl><Input {...field} placeholder={`Benefício ${index + 1}`} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Benefício
                                </Button>
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><ImageIcon /> Galeria de Fotos</CardTitle>
                            <CardDescription>Mostre o ambiente de trabalho e a sua equipa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                                        <Image src={photo} alt={`Foto da empresa ${index + 1}`} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePhoto(index)}><Trash2 /></Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="aspect-video border border-dashed rounded-lg p-3 flex flex-col justify-center gap-2">
                                    <Input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="URL da foto" />
                                    <Button type="button" variant="outline" onClick={handleAddPhoto} disabled={newPhotoUrl.trim().length === 0}>
                                        <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Foto
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isSaving || isLoading}>
                            {isSaving ? <><Save className="mr-2 h-4 w-4 animate-spin"/> A Guardar...</> : <><Save className="mr-2 h-4 w-4"/> Guardar Alterações</>}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
