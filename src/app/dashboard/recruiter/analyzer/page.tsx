
import { ResumeAnalyzer } from '@/components/recruitment/resume-analyzer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResumeAnalyzerPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <Button variant="outline" asChild className="mb-6">
          <Link href="/dashboard/recruiter">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Link>
        </Button>
      <ResumeAnalyzer />
    </div>
  );
}
