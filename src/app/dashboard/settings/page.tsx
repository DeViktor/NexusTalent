'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Building, Award, ArrowLeft, Loader2, Save, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { EditableImageGrid } from "@/components/dashboard/settings/editable-image-grid";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { getSiteData, updateSiteData } from "@/app/actions";
import type { SiteData, ImagePlaceholder } from "@/lib/site-data";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/lib/supabase/client';
import { getUserById, mapUserRowToUserProfile, type UserRow } from '@/lib/supabase/user-service';
import type { UserProfile } from '@/lib/types';


const statSchema = z.object({
  value: z.string().min(1, "O valor é obrigatório."),
  label: z.string().min(1, "O rótulo é obrigatório."),
});

const siteDataSchema = z.object({
  stats: z.array(statSchema),
});

type FormValues = z.infer<typeof siteDataSchema>;

function SettingsForm({ siteData, onFormSubmit, isSaving }: { siteData: SiteData, onFormSubmit: SubmitHandler<FormValues>, isSaving: boolean }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(siteDataSchema),
        defaultValues: {
            stats: siteData.stats || [],
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "stats",
    });

    useEffect(() => {
        form.reset({ stats: siteData.stats });
    }, [siteData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star />
                            Estatísticas da Home
                        </CardTitle>
                        <CardDescription className="mt-2">Edite os números de destaque exibidos na página inicial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="p-4">
                                    <FormField
                                        control={form.control}
                                        name={`stats.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`stats.${index}.label`}
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Rótulo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Alterações</>}
                    </Button>
                </div>
            </form>
        </Form>
    );
}


export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) {
          setAuthUser(null);
          setUserProfile(null);
        } else {
          const payload = await res.json();
          if (payload?.ok && payload?.user) {
            const u = payload.user;
            setAuthUser({ id: u.id, email: u.email || '' });
            const role = (u.role || 'student') as UserProfile['userType'];
            setUserProfile({ id: u.id, firstName: u.displayName || 'Usuário', lastName: '', email: u.email, userType: role });
            if (role === 'admin') {
              const dataSite = await getSiteData();
              setSiteData(dataSite);
            }
          } else {
            setAuthUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível carregar as configurações do site.'});
      } finally {
        setIsLoading(false);
        setIsUserLoading(false);
      }
    };
    bootstrap();
  }, [toast]);
  

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!siteData) return;
    setIsSaving(true);
    
    const updatedData = { ...siteData, stats: data.stats };

    try {
        const result = await updateSiteData(updatedData);
        if (result.success) {
            toast({ title: "Sucesso!", description: "Configurações de estatísticas atualizadas."});
            setSiteData(updatedData); // Optimistically update UI
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao guardar', description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.'});
    } finally {
        setIsSaving(false);
    }
  };

  const handleImageGridUpdate = async (updatedImages: ImagePlaceholder[]) => {
      if (!siteData) return;

      const newSiteData = { ...siteData, images: updatedImages };
      
      // No need to call the server action here, as the child components do it.
      // We just update the local state to reflect the change.
      setSiteData(newSiteData);
  }

  if (isLoading || isUserLoading) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  if (!userProfile || userProfile.userType !== 'admin') {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h1 className="font-headline text-2xl font-bold">Acesso Negado</h1>
            <p className="text-muted-foreground mt-2">Você não tem permissão para aceder a esta página.</p>
             <Button onClick={() => router.push('/dashboard')} className="mt-6">Voltar ao Painel</Button>
        </div>
    )
  }
  
  if (!siteData) {
      return <div>Erro ao carregar os dados do site.</div>
  }


  const partners = siteData.images.filter(p => p.id.startsWith('partner-'));
  const certifications = siteData.images.filter(p => p.id.startsWith('cert-'));
  const galleryImages = siteData.images.filter(p => p.id.startsWith('gallery-'));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Configurações do Site</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e edite os dados do site. As alterações serão refletidas em tempo real.
          </p>
        </div>
        <div className="space-y-8">
            <SettingsForm siteData={siteData} onFormSubmit={handleFormSubmit} isSaving={isSaving} />
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon />
                        Galeria de Fotos
                    </CardTitle>
                    <CardDescription className="mt-2">Gerencie as imagens exibidas na página da galeria.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditableImageGrid 
                        items={galleryImages} 
                        itemType="galeria" 
                        idPrefix="gallery-" 
                        onUpdate={(updatedGallery) => handleImageGridUpdate([...partners, ...certifications, ...updatedGallery])}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building />
                        Parceiros
                    </CardTitle>
                    <CardDescription className="mt-2">Os logótipos de parceiros exibidos no carrossel da página inicial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditableImageGrid 
                        items={partners} 
                        itemType="parceiro" 
                        idPrefix="partner-" 
                        onUpdate={(updatedPartners) => handleImageGridUpdate([...certifications, ...galleryImages, ...updatedPartners])}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award />
                        Certificações
                    </CardTitle>
                    <CardDescription className="mt-2">As certificações e acreditações exibidas na página inicial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditableImageGrid 
                        items={certifications} 
                        itemType="certificação" 
                        idPrefix="cert-"
                        onUpdate={(updatedCerts) => handleImageGridUpdate([...partners, ...galleryImages, ...updatedCerts])}
                    />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
