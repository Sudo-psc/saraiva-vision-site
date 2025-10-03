import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Componentes lazy-loaded para performance
const LaasHeader = dynamic(() => import('@/components/laas/LaasHeader'));
const HeroSection = dynamic(() => import('@/components/laas/HeroSection'));
const ProblemSolutionSection = dynamic(() => import('@/components/laas/ProblemSolutionSection'));
const HowItWorksSection = dynamic(() => import('@/components/laas/HowItWorksSection'));
const PricingSection = dynamic(() => import('@/components/laas/PricingSection'));
const AddonsSection = dynamic(() => import('@/components/laas/AddonsSection'));
const ReferralSection = dynamic(() => import('@/components/laas/ReferralSection'));
const FaqSection = dynamic(() => import('@/components/laas/FaqSection'));
const CtaFinalSection = dynamic(() => import('@/components/laas/CtaFinalSection'));
const LaasFooter = dynamic(() => import('@/components/laas/LaasFooter'));
const FloatingWhatsApp = dynamic(() => import('@/components/laas/FloatingWhatsApp'));

export const metadata: Metadata = {
  title: 'LAAS - Lentes de Contato por Assinatura | Saraiva Vision',
  description: 'Nunca mais fique sem lentes. Assinatura integrada com logística e consulta, envio semestral otimizado. Pioneiro no Brasil.',
  keywords: ['lentes de contato', 'assinatura', 'oftalmologia', 'saraiva vision'],
  openGraph: {
    title: 'LAAS - Lentes de Contato por Assinatura',
    description: 'Assinatura integrada com logística e consulta, envio semestral otimizado',
    type: 'website',
  },
};

export default function LaasPage() {
  return (
    <>
      <LaasHeader />
      <main className="relative">
        <HeroSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <PricingSection />
        <AddonsSection />
        <ReferralSection />
        <FaqSection />
        <CtaFinalSection />
        <LaasFooter />
        <FloatingWhatsApp />
      </main>
    </>
  );
}
