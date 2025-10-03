/**
 * Medical Terms Glossary Page (WCAG 3.1.3, 3.1.4, 3.1.6)
 * Provides definitions, pronunciations, and explanations for medical terms
 * Accessible language for 60+ users
 */

import type { Metadata } from 'next';
import { medicalTermsDictionary, type MedicalTerm } from '@/lib/a11y/wcag-aaa';

export const metadata: Metadata = {
  title: 'Glossário de Termos Médicos | Saraiva Vision - Sênior',
  description:
    'Entenda os termos médicos oftalmológicos com definições simples, pronúncias e explicações. Linguagem clara para a melhor idade.'
};

// Group terms by category
const groupedTerms = medicalTermsDictionary.reduce(
  (acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  },
  {} as Record<MedicalTerm['category'], MedicalTerm[]>
);

// Category labels in Portuguese
const categoryLabels: Record<MedicalTerm['category'], string> = {
  disease: 'Doenças',
  procedure: 'Procedimentos',
  anatomy: 'Partes do Olho',
  medication: 'Medicamentos',
  symptom: 'Sintomas'
};

// Category descriptions
const categoryDescriptions: Record<MedicalTerm['category'], string> = {
  disease: 'Condições que afetam a visão',
  procedure: 'Tratamentos e cirurgias realizados',
  anatomy: 'Estruturas que formam o olho',
  medication: 'Remédios usados no tratamento',
  symptom: 'Sinais e medições importantes'
};

export default function GlossarioPage() {
  return (
    <div className="glossary-page">
      {/* Page Header */}
      <header className="glossary-header">
        <div className="section-container">
          <h1 className="glossary-title">Glossário de Termos Médicos</h1>
          <p className="glossary-intro">
            Aqui você encontra explicações simples para os termos médicos usados em oftalmologia.
            Cada palavra tem sua pronúncia e uma definição fácil de entender.
          </p>

          <div className="glossary-how-to">
            <h2 className="how-to-title">Como Usar Este Glossário</h2>
            <ul className="how-to-list">
              <li>
                <strong>Palavra:</strong> O termo médico em destaque
              </li>
              <li>
                <strong>Pronúncia:</strong> Como falar a palavra corretamente (sílabas em MAIÚSCULAS
                são mais fortes)
              </li>
              <li>
                <strong>O que significa:</strong> Explicação simples e clara
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Navigation by Category */}
      <nav className="glossary-nav" aria-label="Navegação por categorias">
        <div className="section-container">
          <h2 className="sr-only">Ir para categoria</h2>
          <div className="category-links">
            {Object.entries(categoryLabels).map(([category, label]) => (
              <a
                key={category}
                href={`#category-${category}`}
                className="category-link"
                aria-label={`Ir para ${label}: ${categoryDescriptions[category as MedicalTerm['category']]}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Terms by Category */}
      <main id="main-content" className="glossary-content">
        <div className="section-container">
          {Object.entries(groupedTerms).map(([category, terms]) => (
            <section
              key={category}
              id={`category-${category}`}
              className="glossary-category"
              aria-labelledby={`heading-${category}`}
            >
              <header className="category-header">
                <h2 id={`heading-${category}`} className="category-title">
                  {categoryLabels[category as MedicalTerm['category']]}
                </h2>
                <p className="category-description">
                  {categoryDescriptions[category as MedicalTerm['category']]}
                </p>
              </header>

              <dl className="terms-list">
                {terms.map((term) => (
                  <div key={term.term} className="term-entry" id={`term-${term.term.toLowerCase()}`}>
                    <dt className="term-word">
                      <span className="term-name">{term.term}</span>
                      <span className="term-pronunciation" aria-label={`Pronúncia: ${term.pronunciation}`}>
                        ({term.pronunciation})
                      </span>
                    </dt>
                    <dd className="term-definition">
                      <p>{term.definition}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </main>

      {/* Additional Help */}
      <aside className="glossary-help" aria-labelledby="help-heading">
        <div className="section-container">
          <h2 id="help-heading" className="help-title">
            Precisa de Mais Ajuda?
          </h2>
          <div className="help-content">
            <p className="help-text">
              Se você tiver dúvidas sobre algum termo ou quiser saber mais sobre alguma condição,
              nossa equipe está pronta para ajudar.
            </p>

            <div className="help-actions">
              <a href="tel:+553333213700" className="btn-primary btn-extra-large">
                <span className="btn-icon" aria-hidden="true">
                  ☎
                </span>
                <span className="btn-text">Ligar: (33) 3321-3700</span>
              </a>

              <a href="/senior/agendar" className="btn-primary">
                <span className="btn-icon" aria-hidden="true">
                  📅
                </span>
                <span className="btn-text">Agendar Consulta</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Print Styles Note */}
      <div className="print-note sr-only" aria-live="polite">
        Esta página pode ser impressa para consulta. Use Ctrl+P ou Cmd+P.
      </div>
    </div>
  );
}
