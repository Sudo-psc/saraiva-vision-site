import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * FAQ Schema Component
 * Generates Schema.org FAQPage structured data for SEO
 * Enables rich snippets in Google search results
 *
 * @param {Object} props
 * @param {Array<{question: string, answer: string}>} props.faqs - FAQ items
 */
const FAQSchema = ({ faqs }) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

/**
 * FAQ Item Component
 * Visual representation of FAQ with accordion
 */
export const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 px-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 pr-4">{question}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div
            className="text-gray-700 leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * FAQ List Component
 * Complete FAQ section with schema markup
 */
export const FAQList = ({ faqs, title = 'Perguntas Frequentes' }) => {
  const [openIndex, setOpenIndex] = React.useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12" aria-labelledby="faq-title">
      <FAQSchema faqs={faqs} />

      <div className="max-w-4xl mx-auto px-4">
        <h2 id="faq-title" className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h2>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSchema;
