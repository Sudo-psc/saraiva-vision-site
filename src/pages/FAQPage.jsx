import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import { useFAQSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { HelpCircle } from 'lucide-react';

function FAQPage() {
  const { t } = useTranslation();
  const seoData = useFAQSEO();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...seoData} />
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-slate-50 pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <HelpCircle size={16} className="mr-2" />
                Perguntas Frequentes
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t('faq.page.title', 'Tire suas dúvidas')}
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                {t('faq.page.subtitle', 'Encontre respostas para as principais dúvidas sobre oftalmologia, tratamentos e nossa clínica.')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Component */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default FAQPage;