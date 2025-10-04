import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Componentes lazy-loaded para performance
const LaasHeader = dynamic(() => import('@/components/laas/LaasHeader').then(mod => ({ default: mod.LaasHeader })));
const HeroSection = dynamic(() => import('@/components/laas/HeroSection').then(mod => ({ default: mod.HeroSection })));
const ProblemSolutionSection = dynamic(() => import('@/components/laas/ProblemSolutionSection').then(mod => ({ default: mod.ProblemSolutionSection })));
const HowItWorksSection = dynamic(() => import('@/components/laas/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })));
const PricingSection = dynamic(() => import('@/components/laas/PricingSection').then(mod => ({ default: mod.PricingSection })));
const AddonsSection = dynamic(() => import('@/components/laas/AddonsSection').then(mod => ({ default: mod.AddonsSection })));
const ReferralSection = dynamic(() => import('@/components/laas/ReferralSection').then(mod => ({ default: mod.ReferralSection })));
const FaqSection = dynamic(() => import('@/components/laas/FaqSection').then(mod => ({ default: mod.FaqSection })));
const CtaFinalSection = dynamic(() => import('@/components/laas/CtaFinalSection').then(mod => ({ default: mod.CtaFinalSection })));
const LaasFooter = dynamic(() => import('@/components/laas/LaasFooter').then(mod => ({ default: mod.LaasFooter })));
const FloatingWhatsApp = dynamic(() => import('@/components/laas/FloatingWhatsApp').then(mod => ({ default: mod.FloatingWhatsApp })));

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
