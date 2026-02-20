'use client';
import { VacancyList } from "@/components/recruitment/vacancy-list";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JobAlertSubscription } from "@/components/recruitment/job-alert-subscription";


export default function RecruitmentPage() {

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold">Empregos na NexusTalent</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
             Dê o próximo passo na sua carreira. Explore as nossas oportunidades abertas e encontre o emprego ideal para si.
            </p>
          </div>

           <div className="mt-8">
              <VacancyList />
          </div>
          
        </div>
        <JobAlertSubscription />
      </main>
      <Footer />
    </>
  );
}
