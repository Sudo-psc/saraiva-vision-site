'use client';

/**
 * ContactLenses Component
 * Main product showcase page for contact lenses
 *
 * Migration from: src/components/ContactLenses.jsx
 * Status: Phase 2 - Specialized Product Pages
 *
 * Features:
 * - Product catalog with categories
 * - Brand showcase
 * - Fitting process steps
 * - Safety protocols
 * - FAQ section
 * - Comparison table
 * - Mobile-responsive
 * - Accessible (WCAG AA)
 * - CFM/LGPD compliant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MessageCircle, Shield, Star, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductHero from './ProductHero';
import LensCard from './LensCard';
import LensComparisonTable from './LensComparison';
import contactLensesData from '@/data/contactLensesData';
import { ContactLensProduct, LensCategory } from '@/types/products';

interface ContactLensesProps {
  /** Optional: Override default data */
  data?: typeof contactLensesData;
  /** Optional: Show comparison section */
  showComparison?: boolean;
  /** Optional: Additional CSS classes */
  className?: string;
}

export const ContactLenses: React.FC<ContactLensesProps> = ({
  data = contactLensesData,
  showComparison = true,
  className = ''
}) => {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { categories, brands, fittingProcess, safetyProtocols, faqs, trustBadges, comparisons } = data;

  // WhatsApp contact
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de agendar uma consulta para adaptação de lentes de contato.');
  const whatsappUrl = `https://wa.me/5533999887766?text=${whatsappMessage}`;

  // Handle product selection
  const handleProductSelect = (product: ContactLensProduct) => {
    // Navigate to contact page with product context
    router.push(`/contato?produto=${encodeURIComponent(product.name)}`);
  };

  // Filter products by category
  const getFilteredProducts = () => {
    if (selectedCategory === 'all') {
      return categories.flatMap(cat => cat.products);
    }
    const category = categories.find(cat => cat.type === selectedCategory);
    return category?.products || [];
  };

  return (
    <section
      id="lentes-de-contato"
      className={`relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-16 lg:py-24 overflow-hidden ${className}`}
    >
      {/* 3D Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-teal-50/20" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-blue-100/30 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-indigo-100/20 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Hero Section */}
        <ProductHero
          title="Especialistas em Adaptação de Lentes de Contato"
          subtitle="Soluções completas da prescrição ao acompanhamento personalizado. Tecnologia avançada e marcas premium para sua visão perfeita."
          badge="Lentes de Contato Premium"
          image="/img/icon_lentes.webp"
          ctaPrimary={{
            text: 'Agendar Consulta',
            onClick: () => router.push('/contato')
          }}
          ctaSecondary={{
            text: 'Falar no WhatsApp',
            href: whatsappUrl
          }}
          trustBadges={trustBadges}
          className="mb-16"
        />

        {/* Brands Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Marcas Premium Certificadas
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trabalhamos apenas com marcas aprovadas pela ANVISA e FDA, garantindo qualidade e segurança.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                  <img
                    src={brand.image}
                    alt={`${brand.name} - Lentes de contato de qualidade`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-slate-800">{brand.name}</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 mb-4 leading-relaxed">{brand.description}</p>

                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Especialidade:</h3>
                    <p className="text-sm text-blue-600 font-medium">{brand.specialty}</p>
                  </div>

                  <div className="space-y-2">
                    {brand.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lens Types Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tipos de Lentes de Contato
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Encontre a lente ideal para seu estilo de vida e necessidades visuais.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-8 h-full rounded-3xl border-2 ${category.color} backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer`}
                  onClick={() => setSelectedCategory(category.type)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver lentes ${category.title}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedCategory(category.type);
                    }
                  }}
                >
                  {/* 3D Card Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" aria-hidden="true"></div>

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-300/80">
                        <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">
                        {category.subtitle}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Eye className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="rounded-full"
            >
              Todas as Lentes
            </Button>
            {categories.map((category) => (
              <Button
                key={category.type}
                variant={selectedCategory === category.type ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.type)}
                className="rounded-full"
              >
                {category.title}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredProducts().map((product) => (
              <LensCard
                key={product.id}
                product={product}
                variant="standard"
                showPrice={false}
                showCTA={true}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        </div>

        {/* Comparison Section */}
        {showComparison && comparisons.length > 0 && (
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Compare as Lentes
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Compare características técnicas para escolher a melhor opção.
              </p>
            </motion.div>

            <LensComparisonTable
              products={comparisons}
              maxProducts={3}
              enableSelection={false}
            />
          </div>
        )}

        {/* Fitting Process */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Nosso Processo de Adaptação
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Adaptação personalizada com acompanhamento profissional em cada etapa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fittingProcess.map((step, index) => {
              const Icon = step.icon || Eye;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center relative"
                >
                  {index < fittingProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform translate-x-8 z-0" aria-hidden="true" />
                  )}

                  <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-2">
                    {step.description}
                  </p>
                  {step.duration && (
                    <p className="text-xs text-blue-600 font-medium">
                      Duração: {step.duration}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Safety Protocol */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 md:p-12 rounded-3xl border border-blue-100"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Protocolo de Segurança
                </h2>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed mb-6 text-center">
                Todas as adaptações seguem protocolos rigorosos de higiene com equipamentos esterilizados
                e avaliações completas de saúde ocular.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyProtocols.map((protocol) => {
                  const Icon = protocol.icon;
                  return (
                    <div key={protocol.id} className="flex items-start gap-3 bg-white p-4 rounded-xl">
                      <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{protocol.title}</h3>
                        <p className="text-sm text-slate-700">{protocol.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tire suas dúvidas sobre lentes de contato.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                  aria-expanded={openFaq === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform flex-shrink-0 ${
                      openFaq === faq.id ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === faq.id && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-6 py-4 bg-slate-50 border-t border-slate-200"
                  >
                    <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para experimentar lentes de contato?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Agende sua consulta de adaptação e descubra qual lente é perfeita para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => router.push('/contato')}
            >
              <Eye className="h-5 w-5" aria-hidden="true" />
              Agendar Consulta
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white hover:bg-slate-50"
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </Button>
          </div>
        </motion.div>

        {/* CFM Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            Este site é apenas informativo. Qualquer tratamento ou uso de medicação deve ser sempre indicado
            por um médico. Consulte um oftalmologista. CRM-MG 69.870 - Dr. Philipe Saraiva.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactLenses;
