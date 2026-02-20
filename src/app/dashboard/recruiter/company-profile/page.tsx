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
import { useState } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  companyName: z.string().min(3, 'O nome da empresa é obrigatório.'),
  about: z.string().min(50, 'A descrição deve ter pelo menos 50 caracteres.'),
  culture: z.string().min(50, 'A descrição da cultura deve ter pelo menos 50 caracteres.'),
  values: z.string().describe("Valores separados por vírgula").min(5, 'Insira pelo menos um valor.'),
  benefits: z.array(z.object({ value: z.string().min(3, "Benefício inválido") })).min(1, "Insira pelo menos um benefício."),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data, in a real app this would come from an API/DB
const companyProfileData = {
    companyName: "NexusTalent Corp",
    about: "A NexusTalent é uma empresa líder em soluções de recrutamento e formação, conectando os melhores talentos às oportunidades mais desafiadoras do mercado. Com uma abordagem inovadora e tecnológica, ajudamos empresas a construir equipas de alta performance.",
    culture: "A nossa cultura é baseada na colaboração, inovação e desenvolvimento contínuo. Valorizamos a transparência e um ambiente de trabalho que promove o crescimento pessoal e profissional de cada colaborador.",
    values: "Inovação, Excelência, Colaboração, Integridade",
    benefits: [
        {value: "Plano de Saúde"},
        {value: "Vale Refeição"},
        {value: "Trabalho Híbrido"},
        {value: "Formação Contínua"},
        {value: "Bónus Anual"}
    ],
    photos: [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    ]
}


export default function CompanyProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: companyProfileData
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'benefits',
    });


    const handleSave: SubmitHandler<FormValues> = async (data) => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Saving company profile:", data);
        toast({
            title: "Perfil Atualizado!",
            description: "As informações da sua empresa foram guardadas com sucesso.",
        });
        setIsSaving(false);
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
                                {companyProfileData.photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                                        <Image src={photo} alt={`Foto da empresa ${index + 1}`} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="destructive" size="icon"><Trash2 /></Button>
                                        </div>
                                    </div>
                                ))}
                                 <Button variant="outline" className="aspect-video flex-col border-dashed h-full">
                                    <PlusCircle className="h-8 w-8 text-muted-foreground mb-2"/>
                                    Adicionar Foto
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isSaving}>
                            {isSaving ? <><Save className="mr-2 h-4 w-4 animate-spin"/> A Guardar...</> : <><Save className="mr-2 h-4 w-4"/> Guardar Alterações</>}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
