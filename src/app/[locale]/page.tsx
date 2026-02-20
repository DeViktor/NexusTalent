
import { HeroSection } from '@/components/home/hero-section';
import { StatsSection } from '@/components/home/stats-section';
import { FeaturedCourses } from '@/components/home/featured-courses';
import { RecruitmentSection } from '@/components/home/recruitment-section';
import { PartnersSection } from '@/components/home/partners-section';
import { CertificationsSection } from '@/components/home/certifications-section';
import { CtaSection } from '@/components/home/cta-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RunningCourses } from '@/components/home/running-courses';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturedCourses />
        <RunningCourses />
        <RecruitmentSection />
        <PartnersSection />
        <CertificationsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
