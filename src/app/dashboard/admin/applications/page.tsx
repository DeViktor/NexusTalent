'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, Files, ArrowLeft } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/lib/types';
import { ApplicationCard } from '@/components/admin/application-card';
import { applications as mockApplications } from '@/lib/applications';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


const ApplicationList = ({
  applications,
  isLoading,
  error
}: {
  applications: Application[] | null,
  isLoading: boolean,
  error: Error | null
}) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="h-5 w-3/4 mb-2 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
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
          <AlertTitle>Erro ao Carregar Candidaturas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados. Tente novamente.
          </AlertDescription>
        </Alert>
      );
    }

    if (!applications || applications.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Files className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma candidatura encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ainda não há candidaturas com este status.
          </p>
        </div>
      );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map(app => (
                <ApplicationCard key={app.id} application={app} onStatusChange={() => {}} />
            ))}
        </div>
    );
};

// Dummy Card components for skeleton loading
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="border rounded-lg bg-card" {...props}>{children}</div>
);
const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="p-6" {...props}>{children}</div>
);

export default function ManageApplicationsPage() {
  const [allApplications, setAllApplications] = useState<Application[]>(mockApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const handleStatusUpdate = (appId: string, newStatus: ApplicationStatus) => {
    setAllApplications(prevApps => 
        prevApps.map(app => 
            app.id === appId ? { ...app, status: newStatus } : app
        )
    );
  };

  const filteredApplications = (status: ApplicationStatus | 'all') => {
    if (status === 'all') return allApplications;
    // Special case for 'Triagem' to include 'Recebida'
    if (status === 'Triagem') return allApplications?.filter(app => app.status === 'Triagem' || app.status === 'Recebida') ?? null;
    return allApplications?.filter(app => app.status === status) ?? null;
  };

  const interestingApplications = useMemo(() => filteredApplications('Triagem') ?? [], [allApplications]);
  const rejectedApplications = useMemo(() => filteredApplications('Rejeitada') ?? [], [allApplications]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
      </Button>
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Gestão de Candidaturas</h1>
        <p className="text-muted-foreground mt-2">
          Visualize e organize os candidatos para as suas vagas.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-12 mb-8">
          <TabsTrigger value="all" className="h-10">Todos os Candidatos</TabsTrigger>
          <TabsTrigger value="interesting" className="h-10">Em Análise</TabsTrigger>
          <TabsTrigger value="rejected" className="h-10">Rejeitados</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allApplications.map(app => (
                <ApplicationCard key={app.id} application={app} onStatusChange={handleStatusUpdate} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="interesting">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interestingApplications.map(app => (
                <ApplicationCard key={app.id} application={app} onStatusChange={handleStatusUpdate} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rejected">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedApplications.map(app => (
                  <ApplicationCard key={app.id} application={app} onStatusChange={handleStatusUpdate} />
              ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
