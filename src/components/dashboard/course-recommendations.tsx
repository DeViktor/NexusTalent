
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCourseRecommendationsAction } from "@/app/actions";
import { PersonalizedCourseRecommendationsOutputSchema, type PersonalizedCourseRecommendationsOutput } from "@/lib/schemas";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  userProfile: z.string().min(30, { message: "Descreva seus interesses com pelo menos 30 caracteres." }),
});

type FormValues = z.infer<typeof formSchema>;

export function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState<PersonalizedCourseRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: "Sou um gerente de projetos júnior buscando aprimorar minhas habilidades de liderança e finanças para avançar para uma posição sênior.",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setRecommendations(null);

    try {
      const result = await getCourseRecommendationsAction({
        userProfile: data.userProfile,
      });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao Gerar Recomendações",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Recomendações de Cursos com IA
        </CardTitle>
        <CardDescription>
          Descreva seus interesses e objetivos de carreira para receber recomendações de cursos personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meus Interesses e Objetivos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Sou um desenvolvedor júnior e quero me tornar um especialista em cloud..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A analisar...
                </>
              ) : (
                'Gerar Meu Plano de Aprendizagem'
              )}
            </Button>
          </form>
        </Form>

        {isLoading && (
            <div className="mt-8 pt-6 border-t text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
                <p className="mt-2 text-muted-foreground">A nossa IA está a construir o seu plano personalizado...</p>
            </div>
        )}

        {recommendations && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-headline text-xl font-bold mb-2">{recommendations.planTitle}</h3>
            
            <div className="space-y-4 mt-4">
              {recommendations.recommendedCourses.map((rec, index) => (
                <Card key={index} className="bg-secondary/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2"><BookOpen size={16} className="text-primary"/> {rec.courseName}</h4>
                    <p className="text-sm text-muted-foreground mt-1 pl-6">{rec.reason}</p>
                    <Button variant="link" size="sm" asChild className="pl-6 mt-1 h-auto p-0">
                      <Link href="/courses">
                        Ver detalhes do curso <ArrowRight className="ml-1 h-3 w-3"/>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="my-6"/>

            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-green-500"/> Resultados Esperados</h4>
                <p className="text-sm text-muted-foreground">{recommendations.summary}</p>
            </div>
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}
