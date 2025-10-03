'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import type { PostFAQProps, FAQSchema, FAQSchemaItem } from '@/types/blog-content';

/**
 * PostFAQ - Frequently Asked Questions section with Schema.org markup
 *
 * Client Component - Interactive accordion with animations
 *
 * Features:
 * - Accordion interface with smooth animations
 * - Schema.org FAQPage structured data for SEO
 * - Keyboard navigation (WCAG AAA)
 * - Optional CTA for patient engagement
 * - Accessibility: semantic HTML with ARIA attributes
 *
 * @example
 * ```tsx
 * <PostFAQ
 *   title="Perguntas Frequentes"
 *   questions={[
 *     {
 *       question: "O que é catarata?",
 *       answer: "Catarata é a opacificação do cristalino..."
 *     }
 *   ]}
 *   generateSchema={true}
 *   showCTA={true}
 * />
 * ```
 */
const PostFAQ: React.FC<PostFAQProps> = ({
  questions = [],
  title = 'Principais Dúvidas dos Pacientes',
  className = '',
  showCTA = true,
  ctaText = 'Fale com Especialista',
  ctaLink = 'https://wa.me/message/EHTAAAAYH7SHJ1',
  generateSchema = true,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!questions || questions.length === 0) return null;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate Schema.org FAQPage structured data
  const generateSchemaMarkup = (): FAQSchema => {
    const schemaItems: FAQSchemaItem[] = questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: schemaItems,
    };
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      {generateSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSchemaMarkup()),
          }}
        />
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 my-8 ${className}`}
        aria-labelledby="faq-title"
        data-testid="post-faq"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="bg-purple-600 rounded-full p-3 shadow-md" aria-hidden="true">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 id="faq-title" className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4" role="list">
          {questions.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
              role="listitem"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleQuestion(index);
                  }
                }}
              >
                <span className="font-semibold text-gray-900 pr-4 flex-1">{item.question}</span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                  >
                    <div className="p-5 bg-white border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        {showCTA && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas? Nossa equipe está pronta para ajudar!</p>
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={ctaText}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{ctaText}</span>
            </a>
          </div>
        )}

        {/* CFM Medical Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-600 text-center">
            ⚕️ As respostas acima são apenas informativas e educativas. Para diagnóstico preciso e tratamento adequado, consulte sempre um
            oftalmologista qualificado.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default PostFAQ;
