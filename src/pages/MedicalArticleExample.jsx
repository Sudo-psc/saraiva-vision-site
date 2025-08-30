import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function MedicalArticleExample() {
  const title = 'Catarata: sintomas, diagnóstico e tratamento';
  const summary = 'Entenda o que é catarata, como é diagnosticada e quais as opções de tratamento mais indicadas.';
  const lastReviewed = '2025-01-15';
  const physician = {
    name: 'Dr. Philipe Saraiva Cruz',
    crm: 'CRM-MG 69.870'
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    about: {
      '@type': 'MedicalCondition',
      name: 'Catarata'
    },
    lastReviewed: lastReviewed,
    reviewedBy: {
      '@type': 'Physician',
      name: physician.name,
      identifier: physician.crm
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{title} | Saraiva Vision</title>
        <meta name="description" content={summary} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="py-section lg:py-section-xl">
        <div className="container mx-auto px-4 md:px-6">
          <article className="max-w-prose-wide mx-auto">
            <header className="mb-6 md:mb-8">
              <h1 className="text-display-sm md:text-display-md text-soft-gray-900">{title}</h1>
              <p className="mt-3 text-body-lg text-soft-gray-700">{summary}</p>
            </header>

            <section className="space-y-4 md:space-y-5">
              <h2 className="text-heading-xl text-soft-gray-900">O que é catarata?</h2>
              <p className="text-body-lg text-soft-gray-800">
                Catarata é a opacificação do cristalino, lente natural dentro do olho responsável por focar a luz na
                retina. Essa opacidade reduz a nitidez da visão e costuma evoluir lentamente, especialmente com o
                envelhecimento.
              </p>
            </section>

            <section className="mt-8 space-y-4 md:space-y-5">
              <h2 className="text-heading-xl text-soft-gray-900">Sintomas e sinais</h2>
              <ul className="list-disc pl-6 text-body-lg text-soft-gray-800 space-y-2">
                <li>Visão embaçada ou "nebulosa"</li>
                <li>Sensibilidade à luz e ofuscamento</li>
                <li>Halos em torno de luzes</li>
                <li>Mudanças frequentes no grau dos óculos</li>
              </ul>
            </section>

            <section className="mt-8 space-y-4 md:space-y-5">
              <h2 className="text-heading-xl text-soft-gray-900">Diagnóstico e exames</h2>
              <p className="text-body-lg text-soft-gray-800">
                O diagnóstico é feito pelo oftalmologista por meio de exame clínico completo com lâmpada de fenda, 
                avaliação de acuidade visual e, quando necessário, exames complementares para planejamento cirúrgico.
              </p>
            </section>

            <section className="mt-8 space-y-4 md:space-y-5">
              <h2 className="text-heading-xl text-soft-gray-900">Tratamento</h2>
              <p className="text-body-lg text-soft-gray-800">
                O tratamento definitivo é cirúrgico, com remoção do cristalino opacificado e implante de lente 
                intraocular. A indicação é individualizada, considerando impacto funcional e avaliação clínica.
              </p>
            </section>

            <div className="mt-10">
              <a href="/contato" className="inline-flex px-5 py-3 rounded-md bg-brand-blue-600 hover:bg-brand-blue-700 text-white ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand-blue-500">
                Agendar consulta
              </a>
            </div>

            <p className="mt-6 text-caption text-soft-gray-600">
              Este conteúdo tem caráter informativo e não substitui consulta médica. Última revisão: {lastReviewed}. Revisado por {physician.name} ({physician.crm}).
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MedicalArticleExample;

