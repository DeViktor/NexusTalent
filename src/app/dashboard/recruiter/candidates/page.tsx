'use client';

import { useState, useMemo, useEffect } from 'react';
import type { UserProfile, EducationLevel } from '@/lib/types';
import { getCandidates } from '@/lib/supabase/user-service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, SlidersHorizontal, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateCard } from '@/components/recruitment/candidate-card';
import { SearchFilter, type FilterOption } from '@/components/recruitment/search-filter';
import { Label } from '@/components/ui/label';

type CandidateStatus = 'interessante' | 'rejeitado' | 'neutro';

const initialCandidates: (UserProfile & { status: CandidateStatus })[] = [];

const educationLevels: EducationLevel[] = ['Ensino Primário', 'Ensino Médio', 'Frequência Universitária', 'Licenciatura', 'Mestrado', 'Doutoramento'];

const CANDIDATES_PER_PAGE = 12;

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        functionalArea: [] as string[],
        nationality: [] as string[],
        cidade: [] as string[],
        educationLevel: [] as string[],
        gender: [] as string[],
        languages: [] as string[],
        experience: [0, 50],
        age: [18, 80],
    });
    const router = useRouter();
    
    const [allCandidates, setAllCandidates] = useState<(UserProfile & { status: CandidateStatus })[]>(initialCandidates);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);


    const handleStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
        setAllCandidates(prev => 
            prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
        );
    };

    const getAge = (dateString?: string) => {
        if (!dateString) return 0;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredCandidates = useMemo(() => {
        return allCandidates.filter(c => {
            const searchMatch = searchTerm === '' ||
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.academicTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

            const areaMatch = filters.functionalArea.length === 0 || (c.functionalArea && filters.functionalArea.includes(c.functionalArea));
            const nationalityMatch = filters.nationality.length === 0 || (c.nationality && filters.nationality.includes(c.nationality));
            const cityMatch = filters.cidade.length === 0 || (c.cidade && filters.cidade.includes(c.cidade));
            const educationMatch = filters.educationLevel.length === 0 || (c.educationLevel && filters.educationLevel.includes(c.educationLevel));
            const genderMatch = filters.gender.length === 0 || (c.gender && filters.gender.includes(c.gender));
            const languageMatch = filters.languages.length === 0 || filters.languages.every(lang => c.languages?.includes(lang));

            const expMatch = (c.yearsOfExperience ?? 0) >= filters.experience[0] && (c.yearsOfExperience ?? 0) <= filters.experience[1];
            const age = getAge(c.dateOfBirth);
            const ageMatch = age >= filters.age[0] && age <= filters.age[1];

            return searchMatch && areaMatch && expMatch && nationalityMatch && educationMatch && genderMatch && languageMatch && ageMatch && cityMatch;
        });
    }, [allCandidates, searchTerm, filters]);
    
    // Pagination Logic
    const totalPages = Math.ceil(filteredCandidates.length / CANDIDATES_PER_PAGE);

    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
        const endIndex = startIndex + CANDIDATES_PER_PAGE;
        return filteredCandidates.slice(startIndex, endIndex);
    }, [filteredCandidates, currentPage]);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    // Carregar candidatos do Supabase
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoading(true);
                const rows = await getCandidates();
                if (!mounted) return;
                const withStatus = rows.map(r => ({ ...r, status: 'neutro' as CandidateStatus }));
                setAllCandidates(withStatus);
            } catch (e) {
                console.error('Erro ao carregar candidatos:', e);
                if (!mounted) setAllCandidates([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false };
    }, []);

    // Reset to page 1 quando filtros mudam
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);


    const generateFilterOptions = (key: keyof UserProfile): FilterOption[] => {
        const counts: { [key: string]: number } = {};
    
        filteredCandidates.forEach(candidate => {
            const value = candidate[key];
            if (Array.isArray(value)) {
                value.forEach(v => {
                    counts[v] = (counts[v] || 0) + 1;
                });
            } else if (value) {
                counts[String(value)] = (counts[String(value)] || 0) + 1;
            }
        });
    
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    };

    const functionalAreaOptions = useMemo(() => generateFilterOptions('functionalArea'), [filteredCandidates]);
    const nationalityOptions = useMemo(() => generateFilterOptions('nationality'), [filteredCandidates]);
    const cityOptions = useMemo(() => generateFilterOptions('cidade'), [filteredCandidates]);
    const educationLevelOptions = useMemo(() => educationLevels.map(level => {
        const count = filteredCandidates.filter(c => c.educationLevel === level).length;
        return { name: level, count };
    }).filter(opt => opt.count > 0), [filteredCandidates]);
    const genderOptions = useMemo(() => generateFilterOptions('gender'), [filteredCandidates]);
    const languageOptions = useMemo(() => generateFilterOptions('languages'), [filteredCandidates]);


    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const interestingCandidates = useMemo(() => filteredCandidates.filter(c => c.status === 'interessante'), [filteredCandidates]);
    const rejectedCandidates = useMemo(() => filteredCandidates.filter(c => c.status === 'rejeitado'), [filteredCandidates]);

    const renderCandidateList = (candidates: typeof paginatedCandidates) => {
        if (isLoading) {
            return <p>A carregar...</p>;
        }

        if (candidates.length === 0) {
            return (
                <div className="text-center py-24 border-2 border-dashed rounded-lg">
                   <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                   <h3 className="mt-4 text-lg font-medium">Nenhum candidato encontrado</h3>
                   <p className="mt-1 text-sm text-muted-foreground">
                       Não há candidatos com este status ou que correspondam à sua pesquisa.
                   </p>
               </div>
            );
        }

        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map(candidate => (
                    <CandidateCard key={candidate.id} candidate={candidate} onStatusChange={handleStatusChange} />
                ))}
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Banco de Talentos</h1>
                <p className="text-muted-foreground mt-2">
                    Encontre os candidatos ideais para as suas vagas.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><SlidersHorizontal size={18} /> Filtros</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="search" placeholder="Cargo, competência, nome..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                            
                            <SearchFilter title="Área Funcional" options={functionalAreaOptions} selected={filters.functionalArea} onChange={(v) => handleFilterChange('functionalArea', v)} />
                            <SearchFilter title="Nacionalidade" options={nationalityOptions} selected={filters.nationality} onChange={(v) => handleFilterChange('nationality', v)} />
                            <SearchFilter title="Cidade" options={cityOptions} selected={filters.cidade} onChange={(v) => handleFilterChange('cidade', v)} />
                            <SearchFilter title="Habilitações Literárias" options={educationLevelOptions} selected={filters.educationLevel} onChange={(v) => handleFilterChange('educationLevel', v)} />
                            
                            <div className="space-y-4 border-b pb-4">
                                <Label htmlFor="experience-slider">Anos de Experiência: {filters.experience[0]} - {filters.experience[1]}</Label>
                                <Slider 
                                    id="experience-slider"
                                    min={0}
                                    max={50}
                                    step={1}
                                    value={filters.experience}
                                    onValueChange={(v) => handleFilterChange('experience', v)}
                                />
                            </div>

                            <div className="space-y-4 border-b pb-4">
                                <Label htmlFor="age-slider">Idade: {filters.age[0]} - {filters.age[1]}</Label>
                                <Slider 
                                    id="age-slider"
                                    min={18}
                                    max={80}
                                    step={1}
                                    value={filters.age}
                                    onValueChange={(v) => handleFilterChange('age', v)}
                                />
                            </div>

                            <SearchFilter title="Gênero" options={genderOptions} selected={filters.gender} onChange={(v) => handleFilterChange('gender', v)} />
                            <SearchFilter title="Línguas" options={languageOptions} selected={filters.languages} onChange={(v) => handleFilterChange('languages', v)} />

                        </CardContent>
                    </Card>
                </aside>

                <div className="lg:col-span-3">
                    <p className="text-sm text-muted-foreground mb-4">A mostrar <span className="font-bold text-foreground">{paginatedCandidates.length}</span> de <span className="font-bold text-foreground">{filteredCandidates.length}</span> candidatos.</p>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto h-12 mb-8">
                            <TabsTrigger value="all" className="h-10">Todos ({filteredCandidates.length})</TabsTrigger>
                            <TabsTrigger value="interesting" className="h-10 text-green-600">Interessantes ({interestingCandidates.length})</TabsTrigger>
                            <TabsTrigger value="rejected" className="h-10 text-red-600">Rejeitados ({rejectedCandidates.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            {renderCandidateList(paginatedCandidates)}
                        </TabsContent>
                        <TabsContent value="interesting">
                            {renderCandidateList(interestingCandidates.filter(c => paginatedCandidates.some(pc => pc.id === c.id)))}
                        </TabsContent>
                        <TabsContent value="rejected">
                            {renderCandidateList(rejectedCandidates.filter(c => paginatedCandidates.some(pc => pc.id === c.id)))}
                        </TabsContent>
                    </Tabs>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12">
                            <Button onClick={handlePreviousPage} disabled={currentPage === 1} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            <span className="text-sm font-medium">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
                                Próximo <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
