
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, FileWarning, PlusCircle, ArrowLeft, Search, FileDown, Loader2 } from 'lucide-react';
import type { Course, CourseCategory } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getCourseCategories } from '@/lib/course-service';
import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GeneralReport } from "@/components/admin/general-report";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteCourseAction } from '@/app/actions';


export default function ManageCoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reportData, setReportData] = useState<any>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);


  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/courses?status=all', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar cursos');
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const mapped = rows.map((row: any) => ({
          id: String(row.id ?? row.code ?? crypto.randomUUID()),
          name: row.name ?? row.title ?? 'Curso',
          category: row.category ?? 'geral',
          imageId: row.image_id ?? row.imageId ?? 'course-power-bi',
          imageDataUri: row.image_data_uri ?? row.imageDataUri,
          duration: row.duration ?? '—',
          format: (row.format ?? 'Online') as Course['format'],
          generalObjective: row.general_objective ?? row.generalObjective ?? '',
          whatYouWillLearn: Array.isArray(row.what_you_will_learn)
            ? row.what_you_will_learn
            : Array.isArray(row.whatYouWillLearn)
            ? row.whatYouWillLearn
            : [],
          modules: Array.isArray(row.modules) ? row.modules : [],
          status: (row.status ?? 'Ativo') as Course['status'],
        } as Course));
        const cats = await getCourseCategories();
        if (active) {
          setCourses(mapped);
          setCategories(Array.isArray(cats) ? cats : []);
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error("An unknown error occurred."));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleExportXLS = () => {
    const header = ['ID', 'Nome', 'Categoria', 'Formato', 'Status'];
    const rows = courses.map((c) => [
      c.id,
      c.name,
      categories.find((x) => x.id === c.category)?.name || c.category,
      c.format,
      c.status,
    ]);
    const table = [header, ...rows]
      .map((r) => `<tr>${r.map((cell) => `<td>${String(cell).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</td>`).join('')}</tr>`)
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${table}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cursos-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportação concluída', description: 'Relatório de cursos exportado.' });
  }

  const handleGenerateReport = () => {
     const courseData = categories.map(category => ({
      name: category.name,
      total: courses.filter(course => course.category === category.id).length
    })).filter(c => c.total > 0);

    setReportData({
      totalCourses: courses.length,
      coursesByCategory: courseData
    });
  }

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingCourseId(courseId);
    try {
      const res = await deleteCourseAction(courseId);
      if (!res?.success) throw new Error(res?.message || 'Falha ao excluir curso.');
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast({ title: 'Sucesso', description: res.message });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e?.message || 'Falha ao excluir curso.' });
    } finally {
      setDeletingCourseId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
            <FileWarning className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Cursos</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados dos cursos.
          </AlertDescription>
        </Alert>
      );
    }

    if (filteredCourses.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhum curso encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste os seus filtros ou comece por adicionar um novo curso à plataforma.
          </p>
          <Button asChild className='mt-4'>
            <Link href="/dashboard/courses/new"><PlusCircle className='mr-2 h-4 w-4' />Adicionar Curso</Link>
          </Button>
        </div>
      );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
                <Card key={course.id}>
                    <CardHeader>
                        <CardTitle>{course.name}</CardTitle>
                        <CardDescription>{categories.find(c => c.id === course.category)?.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge>{course.format}</Badge>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.generalObjective}</p>
                        <div className='mt-4 flex gap-2'>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/courses/${course.id}`}>Ver</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/courses/edit/${course.id}`}>Editar</Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={deletingCourseId === course.id}>
                                  {deletingCourseId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir curso</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Deseja excluir o curso "{course.name}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className='flex-grow'>
                <h1 className="font-headline text-4xl font-bold">Gestão de Cursos</h1>
                <p className="text-muted-foreground mt-2">
                Visualize, adicione, edite e organize todos os cursos da plataforma.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportXLS}>
                    <FileDown className="mr-2 h-4 w-4" /> Exportar (XLS)
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default" onClick={handleGenerateReport}>Gerar Relatório PDF</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Relatório de Cursos</DialogTitle>
                            <DialogDescription>
                                Visão geral dos cursos na plataforma.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 min-h-0">
                            {reportData && <GeneralReport data={reportData} reportType="courses" />}
                        </div>
                    </DialogContent>
                </Dialog>
                <Button asChild className='w-full md:w-auto'>
                    <Link href="/dashboard/courses/new"><PlusCircle className='mr-2 h-4 w-4' />Adicionar Novo Curso</Link>
                </Button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Pesquisar por nome do curso..."
                    className="pl-10 h-11"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='md:w-1/3'>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {renderContent()}
    </div>
  );
}
