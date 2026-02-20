'use client';

import { useState, useMemo, useEffect } from 'react';
import { getVacancies } from '@/lib/supabase/vacancy-service';
import { getCourseCategories } from '@/lib/course-service';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, List, LayoutGrid, Bell, Heart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import type { JobPosting, CourseCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JobAlertSubscription } from './job-alert-subscription';
import { useJobWishlist } from '@/hooks/use-job-wishlist';


const toDate = (date: Date | undefined): Date | null => {
    if (!date) return null;
    return date;
}

type ViewMode = 'list' | 'grid';

export function VacancyList() {
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [distance, setDistance] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');


  useEffect(() => {
    // Busca as vagas do Supabase (incluindo expiradas). Em caso de erro, mantém lista vazia.
    const fetchJobs = async () => {
      try {
        const vacancies = await getVacancies(true);
        const mapType = (t?: string): JobPosting['type'] => {
          const val = (t || '').toLowerCase();
          if (val.includes('part')) return 'Part-time';
          if (val.includes('remote')) return 'Remote';
          return 'Full-time';
        };

        const mapped: JobPosting[] = (vacancies || []).map(v => ({
          id: String(v.id),
          title: v.title,
          location: v.location,
          type: mapType(v.job_type),
          category: 'Sem Categoria',
          description: v.description,
          recruiterId: String(v.recruiter_id),
          postedDate: v.created_at ? new Date(v.created_at) : new Date(),
          closingDate: v.expires_at ? new Date(v.expires_at) : undefined,
          responsibilities: [],
          requirements: Array.isArray(v.requirements) ? v.requirements : [],
          aiScreeningQuestions: [],
          screeningQuestions: [],
          industry: undefined,
          minExperience: undefined,
          numberOfVacancies: undefined,
          requiredNationality: undefined,
          languages: undefined,
          salaryRange: v.salary_range,
          showSalary: undefined,
          employerName: v.company,
          aboutEmployer: undefined,
          hideEmployerData: undefined,
          minEducationLevel: undefined,
        }));
        setAllJobs(mapped);
      } catch (e) {
        setAllJobs([]);
      }
    };

    fetchJobs();
    setCourseCategories(getCourseCategories());
    const storedView = localStorage.getItem('job-view-mode') as ViewMode;
    if (storedView) {
        setViewMode(storedView);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('job-view-mode', viewMode);
  }, [viewMode]);

  const locations = useMemo(() => ['all', ...new Set(allJobs.map(v => v.location))], [allJobs]);
  const contractTypes = useMemo(() => ['all', 'Full-time', 'Part-time', 'Remote'], []);
  const distances = useMemo(() => ['all', '5', '10', '20', '50', '100'], []);


  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
      // Distance filter is visual only for now
      return matchesCategory && matchesSearch && matchesLocation && matchesType;
    });
  }, [allJobs, searchTerm, selectedCategory, selectedLocation, selectedType]);

  const JobCard = ({ job }: { job: JobPosting }) => {
    const category = courseCategories.find(c => c.name === job.category);
    const closingDate = toDate(job.closingDate);
    const isExpired = closingDate ? closingDate < new Date() : false;
    const { wishlist, toggleWishlist } = useJobWishlist();
    const isInWishlist = wishlist.includes(job.id);

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(job.id);
    }

    if (viewMode === 'grid') {
      return (
        <Card className={cn("transition-shadow hover:shadow-md h-full flex flex-col group relative", isExpired && "bg-muted/50")}>
            <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-3 right-3 z-10 rounded-full h-8 w-8"
                onClick={handleWishlistClick}
            >
                <Heart className={cn("h-4 w-4", isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
            </Button>
            <CardHeader>
                {category && <Badge variant="secondary" className='mb-2 self-start'>{category.name}</Badge>}
                <CardTitle className="font-headline text-xl flex-grow"><Link href={`/recruitment/${job.id}`} className="hover:text-primary">{job.title}</Link></CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between flex-grow">
                <div className='space-y-2 mb-4'>
                    <span className='flex items-center gap-2 text-sm'><MapPin size={14}/> {job.location}</span>
                    <span className='flex items-center gap-2 text-sm'><Briefcase size={14}/> {job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isExpired && <Badge variant="destructive">Expirado</Badge>}
                    <Button asChild disabled={isExpired} className="w-full">
                        <Link href={`/recruitment/${job.id}`}>Ver Detalhes</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      );
    }
    
    // List view card
    return (
      <Card className={cn("transition-shadow hover:shadow-md", isExpired && "bg-muted/50")}>
          <div className="p-6 grid md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                  {category && <Badge variant="secondary" className='mb-2'>{category.name}</Badge>}
                  <h3 className="font-headline text-xl font-semibold"><Link href={`/recruitment/${job.id}`} className="hover:text-primary">{job.title}</Link></h3>
                  <div className='flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-2'><MapPin size={14}/> {job.location}</span>
                      <span className='flex items-center gap-2'><Briefcase size={14}/> {job.type}</span>
                  </div>
              </div>
              <div className="flex md:flex-col md:items-end md:justify-center gap-2">
                   {isExpired && <Badge variant="destructive">Expirado</Badge>}
                   <Button asChild disabled={isExpired}>
                      <Link href={`/recruitment/${job.id}`}>Ver Detalhes</Link>
                   </Button>
              </div>
          </div>
      </Card>
    )
  };


  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-background/95 py-4 z-10 backdrop-blur-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cargo, palavra-chave..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='md:w-1/4'>
         <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {courseCategories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                    {category.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
         <div className='md:w-1/4'>
         <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Tipo de contrato" />
            </SelectTrigger>
            <SelectContent>
                {contractTypes.map(type => (
                <SelectItem key={type} value={type}>
                    {type === 'all' ? 'Todos os Contratos' : type}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className='md:w-1/4'>
         <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecionar localidade" />
            </SelectTrigger>
            <SelectContent>
                {locations.map(location => (
                <SelectItem key={location} value={location}>
                    {location === 'all' ? 'Todas as Localidades' : location}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
         <div className='md:w-1/4'>
         <Select value={distance} onValueChange={setDistance}>
            <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Raio de distância" />
            </SelectTrigger>
            <SelectContent>
                {distances.map(d => (
                <SelectItem key={d} value={d}>
                    {d === 'all' ? 'Qualquer distância' : `+ ${d} km`}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>
      
       <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">{filteredJobs.length} empregos encontrados</p>
            <div className="flex items-center gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Bell className="mr-2 h-4 w-4" />
                            Criar Alerta de Emprego
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Criar Alerta de Emprego</DialogTitle>
                            <DialogDescription>
                                Para criares um alerta por e-mail, faz a tua pesquisa de emprego através do nosso motor de busca. Podes aperfeiçoá-lo com os critérios à tua escolha. Uma vez seleccionados os teus critérios, clica em "criar um alerta de e-mail". Um pop-up irá então permitir-te guardar a tua pesquisa como um alerta por e-mail.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                           <JobAlertSubscription />
                        </div>
                    </DialogContent>
                </Dialog>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="h-5 w-5" />
                </Button>
                 <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-5 w-5" />
                </Button>
            </div>
        </div>


      {filteredJobs.length > 0 ? (
        <div className={cn(viewMode === 'list' ? "space-y-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6")}>
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-semibold">Nenhum emprego encontrado.</p>
          <p className="text-muted-foreground mt-2">Tente ajustar a sua busca ou filtros.</p>
        </div>
      )}
    </div>
  );
}
