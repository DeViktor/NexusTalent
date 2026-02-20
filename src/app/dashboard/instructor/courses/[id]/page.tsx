

'use client';

import { getCourseById } from "@/lib/course-service";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle, Target, List, Video, FileText, Bot, Notebook, Save, Download, MessageSquare, VideoIcon, Calendar, Link as LinkIcon, FileUp, Presentation, Library, Inbox, Settings, ListChecks, Mail, Award, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import type { Course, CourseModule, CourseTopic, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users as mockAllUsers } from '@/lib/users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";


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

const mockStudents = mockAllUsers.slice(0, 5).map((user, index) => ({
    ...user,
    status: index < 3 ? 'Em Curso' : 'Concluído',
    quizGrade: Math.floor(Math.random() * (95 - 60 + 1)) + 60,
    finalGrade: index < 3 ? null : Math.floor(Math.random() * (98 - 75 + 1)) + 75,
}));

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
  const [students, setStudents] = useState(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const journalKey = `journal_instructor_${authUser?.id || 'anon'}_${course.id}`;
  const [journalNotes, setJournalNotes] = useLocalStorage(journalKey, '');
  
  const handleTopicClick = (module: CourseModule, topic: CourseTopic) => {
      setActiveModule(module);
      setActiveTopic(topic);
  };
  
  const handleSaveNotes = () => {
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
  };

  const handleOpenGradeDialog = (student: UserProfile) => {
    setSelectedStudent(student);
    setIsGradeDialogOpen(true);
  };
  
  const handleOpenMessageDialog = (student: UserProfile) => {
    setSelectedStudent(student);
    setIsMessageDialogOpen(true);
  };

  const handleAssignGrade = () => {
      // Logic to assign grade
      toast({ title: "Nota Atribuída!", description: `A nota para ${selectedStudent?.firstName} foi guardada (simulado).` });
      setIsGradeDialogOpen(false);
  };
  
  const handleSendMessage = () => {
      // Logic to send message
      toast({ title: "Mensagem Enviada!", description: `A sua mensagem para ${selectedStudent?.firstName} foi enviada (simulado).` });
      setIsMessageDialogOpen(false);
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
         <Link href="/dashboard/instructor" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
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
                <Tabs defaultValue="class-management" className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="class-management"><Settings className="mr-2 h-4 w-4"/>Gerir Turma</TabsTrigger>
                        <TabsTrigger value="resources"><Library className="mr-2 h-4 w-4"/>Recursos</TabsTrigger>
                        <TabsTrigger value="quiz"><Bot className="mr-2 h-4 w-4"/>Testes</TabsTrigger>
                        <TabsTrigger value="assignments"><Inbox className="mr-2 h-4 w-4"/>Trabalhos</TabsTrigger>
                        <TabsTrigger value="journal"><Notebook className="mr-2 h-4 w-4"/>Diário</TabsTrigger>
                        <TabsTrigger value="forum"><MessageSquare className="mr-2 h-4 w-4"/>Fórum</TabsTrigger>
                        <TabsTrigger value="live"><Calendar className="mr-2 h-4 w-4"/>Sessões</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="class-management">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestão da Turma: {course.name}</CardTitle>
                                <CardDescription>Visualize os alunos, atribua notas, comunique e gira a logística da turma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="students" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="students">Alunos</TabsTrigger>
                                        <TabsTrigger value="grades">Pauta de Notas</TabsTrigger>
                                        <TabsTrigger value="communication">Comunicação</TabsTrigger>
                                        <TabsTrigger value="logistics">Logística</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="students" className="mt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Aluno</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Nota (Quizzes)</TableHead>
                                                    <TableHead>Nota Final</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.map(student => (
                                                    <TableRow key={student.id}>
                                                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                                                        <TableCell>{student.email}</TableCell>
                                                        <TableCell><Badge variant={student.status === 'Concluído' ? 'default' : 'secondary'}>{student.status}</Badge></TableCell>
                                                        <TableCell>{student.quizGrade}%</TableCell>
                                                        <TableCell>{student.finalGrade || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem onSelect={() => router.push(`/dashboard/recruiter/candidates/${student.id}`)}>Ver Perfil</DropdownMenuItem>
                                                                    <DropdownMenuItem onSelect={() => handleOpenGradeDialog(student)}>Atribuir Nota Final</DropdownMenuItem>
                                                                    <DropdownMenuItem onSelect={() => handleOpenMessageDialog(student)}>Enviar Mensagem</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                    <TabsContent value="grades" className="mt-4">
                                        <p>Funcionalidade de pauta de notas em desenvolvimento.</p>
                                    </TabsContent>
                                    <TabsContent value="communication" className="mt-4">
                                         <p>Funcionalidade de comunicação em desenvolvimento.</p>
                                    </TabsContent>
                                     <TabsContent value="logistics" className="mt-4">
                                         <p>Funcionalidade de logística em desenvolvimento.</p>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="resources">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerir Materiais para Download</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                  <Button variant="outline" className="w-full justify-start gap-2"><FileUp size={16}/> Carregar PDF</Button>
                                  <Button variant="outline" className="w-full justify-start gap-2"><Video size={16}/> Carregar Vídeo</Button>
                                  <Button variant="outline" className="w-full justify-start gap-2"><LinkIcon size={16}/> Adicionar Link Externo</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="quiz">
                         <Card>
                           <CardHeader><CardTitle>Gestão de Testes</CardTitle></CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground mb-4">Crie testes, veja as submissões dos alunos e analise os resultados.</p>
                                <Button asChild>
                                  <Link href={`/dashboard/courses/edit/${course.id}`}>Gerir Testes do Módulo</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="assignments">
                         <Card>
                           <CardHeader><CardTitle>Gestão de Trabalhos (Em Breve)</CardTitle></CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground mb-4">Receba, visualize e avalie os trabalhos submetidos pelos alunos.</p>
                                <Button disabled>Ver Entregas</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="journal">
                         <Card>
                            <CardHeader><CardTitle>Anotações do Formador</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="Faça as suas anotações privadas aqui... Elas serão salvas automaticamente no seu navegador." 
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
                           <CardHeader><CardTitle>Fórum de Discussão do Módulo</CardTitle></CardHeader>
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
                               <Button variant="outline">Agendar Nova Sessão</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sidebar - Module List */}
            <div className="lg:col-span-1">
                <Card className="h-full flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Conteúdo do Curso</h2>
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/dashboard/courses/edit/${course.id}`}>Editar</Link>
                        </Button>
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
                                                className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 text-sm ${activeTopic?.title === topic.title ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary'}`}
                                            >
                                                {topic.powerpointUrl ? <Presentation size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> : topic.videoUrl ? <Video size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> : <BookOpen size={16} className={`${activeTopic?.title === topic.title ? 'text-primary' : 'text-muted-foreground'}`}/> }
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
        
        {/* Dialogs for actions */}
         <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Atribuir Nota Final</DialogTitle>
                    <DialogDescription>Atribua a nota final para {selectedStudent?.firstName} no curso.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="finalGrade">Nota Final (%)</Label>
                    <Input id="finalGrade" type="number" min="0" max="100" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAssignGrade}>Guardar Nota</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Mensagem</DialogTitle>
                    <DialogDescription>Envie uma mensagem privada para {selectedStudent?.firstName}.</DialogDescription>
                </DialogHeader>
                 <div className="space-y-2">
                    <Label htmlFor="messageContent">Mensagem</Label>
                    <Textarea id="messageContent" placeholder="Escreva a sua mensagem..." rows={5} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSendMessage}>Enviar Mensagem</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}


export default function CourseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [course, setCourse] = useState<Course | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      (async () => {
        const foundCourse = await getCourseById(id);
        setCourse(foundCourse);
      })();
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
