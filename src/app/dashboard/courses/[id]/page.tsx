

'use client';

import { getCourseById } from "@/lib/course-service";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle, Target, List, Video, FileText, Bot, Notebook, Save, Download, MessageSquare, VideoIcon, Calendar, Link as LinkIcon, FileUp, Presentation } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import type { Course, CourseModule, CourseTopic } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper hook for using localStorage
function useLocalStorage(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: string | ((val: string) => string)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}


function CoursePlayerPage({ course }: { course: Course }) {
  const [activeModule, setActiveModule] = useState<CourseModule | null>(course.modules[0] || null);
  const [activeTopic, setActiveTopic] = useState<CourseTopic | null>(course.modules[0]?.topics[0] || null);
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; user_metadata?: any } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ? { id: data.user.id, email: data.user.email || '', user_metadata: data.user.user_metadata } : null);
    });
  }, []);
  const { toast } = useToast();

  // Create a unique key for localStorage based on user and course
  const journalKey = `journal_${authUser?.id || 'anon'}_${course.id}`;
  const [journalNotes, setJournalNotes] = useLocalStorage(journalKey, '');
  
  const handleTopicClick = (module: CourseModule, topic: CourseTopic) => {
      setActiveModule(module);
      setActiveTopic(topic);
  };
  
  const handleSaveNotes = () => {
    // The useLocalStorage hook already saves on change, but we can use this for explicit feedback
    toast({
      title: "Diário Salvo!",
      description: "As suas anotações foram guardadas no seu navegador.",
    });
  };

  const handleDownload = (resourceName: string, url: string) => {
    toast({
      title: 'Download Iniciado (Simulado)',
      description: `O download de "${resourceName}" foi iniciado.`,
    });
    // In a real app, you would use the URL: window.open(url, '_blank');
  };
  
  const renderMedia = () => {
    if (activeTopic?.powerpointUrl) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(activeTopic.powerpointUrl)}`;
      return (
        <iframe
          src={officeViewerUrl}
          className="w-full h-full border-0"
          title="PowerPoint Viewer"
          allowFullScreen
        ></iframe>
      );
    }

    if (activeTopic?.videoUrl) {
       if (activeTopic.videoUrl.includes('youtube.com')) {
            const videoId = new URL(activeTopic.videoUrl).searchParams.get('v');
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
             return (
                <iframe 
                    src={embedUrl}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            );
        }

      return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white text-center">
            <VideoIcon size={64} />
            <p className="ml-4 text-xl mt-4">Simulação do Media Player de Vídeo</p>
            <p className="text-muted-foreground text-sm mt-2">A mostrar vídeo para: <strong className="text-white">{activeTopic?.title}</strong></p>
        </div>
      )
    }

    return (
        <div className="w-full h-full bg-secondary flex flex-col items-center justify-center text-center p-4">
            <BookOpen size={64} className="text-muted-foreground" />
            <p className="text-xl mt-4 text-foreground">Conteúdo da Aula</p>
            <p className="text-muted-foreground text-sm mt-2">Nenhum conteúdo multimédia para este tópico. Consulte os recursos abaixo.</p>
        </div>
    );
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
       <div className="mb-6">
         <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} /> Voltar ao Painel
          </Link>
         <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{course.name}</h1>
       </div>

        <div className="grid lg:grid-cols-3 gap-8 flex-grow">
            {/* Main Content - Video Player and Tabs */}
            <div className="lg:col-span-2 flex flex-col">
                {/* Media Player Placeholder */}
                <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center mb-6 overflow-hidden">
                    {renderMedia()}
                </div>
                
                {/* Tabs for Resources, Quizzes, Notes */}
                <Tabs defaultValue="resources" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="resources"><FileText className="mr-2 h-4 w-4"/>Recursos</TabsTrigger>
                        <TabsTrigger value="quiz"><Bot className="mr-2 h-4 w-4"/>Teste Rápido</TabsTrigger>
                        <TabsTrigger value="journal"><Notebook className="mr-2 h-4 w-4"/>Diário</TabsTrigger>
                        <TabsTrigger value="forum"><MessageSquare className="mr-2 h-4 w-4"/>Fórum</TabsTrigger>
                        <TabsTrigger value="live"><Calendar className="mr-2 h-4 w-4"/>Sessões</TabsTrigger>
                    </TabsList>
                    <TabsContent value="resources">
                        <Card>
                            <CardHeader><CardTitle>Materiais para Download</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                  {activeModule?.topics.map((topic, index) => (
                                    topic.pdfUrl ? (
                                      <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                          <p className="flex items-center gap-2"><FileText size={16}/> {topic.title}.pdf</p>
                                          <Button variant="outline" size="sm" onClick={() => handleDownload(`${topic.title}.pdf`, topic.pdfUrl!)}>
                                              <Download className="mr-2 h-4 w-4" /> Download
                                          </Button>
                                      </li>
                                    ) : null
                                  ))}
                                  {activeModule?.topics.every(t => !t.pdfUrl) && (
                                    <p className="text-sm text-muted-foreground text-center p-4">Nenhum material para este módulo.</p>
                                  )}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="quiz">
                         <Card>
                           <CardHeader><CardTitle>Quiz Interativo (Simulação)</CardTitle></CardHeader>
                            <CardContent className="text-center">
                                {activeModule?.assessment && activeModule.assessment.questions.length > 0 ? (
                                    <>
                                        <p className="text-muted-foreground mb-4">Teste os seus conhecimentos sobre o módulo "{activeModule.title}".</p>
                                        <Button>Iniciar Quiz de {activeModule.assessment.questions.length} perguntas</Button>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center p-4">Nenhum teste disponível para este módulo.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="journal">
                         <Card>
                            <CardHeader><CardTitle>Minhas Anotações</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="Faça as suas anotações aqui... Elas serão salvas automaticamente no seu navegador." 
                                    className="h-32 mb-4"
                                    value={journalNotes}
                                    onChange={(e) => setJournalNotes(e.target.value)}
                                />
                                <Button onClick={handleSaveNotes}>
                                  <Save className="mr-2 h-4 w-4"/> Guardar Anotações
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="forum">
                         <Card>
                           <CardHeader><CardTitle>Fórum de Discussão</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={''} />
                            <AvatarFallback>{(authUser?.user_metadata?.name as string)?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                                  <Textarea placeholder="Comece uma nova discussão ou coloque uma dúvida..." />
                                </div>
                                <Button>Publicar</Button>
                                <div className="border-t pt-4 space-y-4">
                                  <p className="text-sm text-muted-foreground text-center">Simulação de um fórum.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="live">
                         <Card>
                           <CardHeader><CardTitle>Sessões de Dúvidas ao Vivo (Q&A)</CardTitle></CardHeader>
                            <CardContent className="text-center">
                               <p className="text-muted-foreground mb-4">Nenhuma sessão agendada para este módulo.</p>
                               <Button variant="outline">Sugerir um Tópico</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="library">
                        <Card>
                            <CardHeader>
                                <CardTitle>Biblioteca de Conteúdo</CardTitle>
                                <CardDescription>Adicione materiais complementares para os seus formandos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-start gap-2"><FileUp size={16}/> Fazer Upload de PDF</Button>
                                <Button variant="outline" className="w-full justify-start gap-2"><Video size={16}/> Fazer Upload de Vídeo</Button>
                                <Button variant="outline" className="w-full justify-start gap-2"><LinkIcon size={16}/> Adicionar Link Externo</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sidebar - Module List */}
            <div className="lg:col-span-1">
                <Card className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-lg">Conteúdo do Curso</h2>
                    </div>
                    <ScrollArea className="flex-grow">
                        <div className="p-2">
                            {course.modules.map((module, index) => (
                                <div key={index} className='py-2'>
                                    <h3 className='font-semibold px-3 py-2 text-primary/80'>{module.title}</h3>
                                    <div className='space-y-1'>
                                        {module.topics.map((topic, topicIndex) => (
                                            <button 
                                                key={topicIndex} 
                                                onClick={() => handleTopicClick(module, topic)}
                                                className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 text-sm ${activeTopic?.title === topic.title && activeModule?.title === module.title ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary'}`}
                                            >
                                                {topic.videoUrl ? <VideoIcon size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> : topic.powerpointUrl ? <Presentation size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> : <BookOpen size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> }
                                                <span className="flex-grow">{topic.title}</span>
                                                {topic.pdfUrl && <FileText size={16} className="text-muted-foreground"/>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    </div>
  );
}


export default function CourseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [course, setCourse] = useState<Course | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
        const foundCourse = getCourseById(id);
        setCourse(foundCourse);
    }
  }, [id]);

  if (course === undefined) {
    return <div>A carregar...</div>
  }
  
  if (!course) {
    return notFound();
  }
  
  return <CoursePlayerPage course={course} />;
}
