import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const FAQPreview = () => {
  const { t } = useTranslation();

  const faqs = [
    t('faq.questions.lenses_cost', { returnObjects: true }) || {},
    t('faq.questions.pediatric_age', { returnObjects: true }) || {},
    t('faq.questions.medical_report', { returnObjects: true }) || {},
    t('faq.questions.glaucoma_treatment', { returnObjects: true }) || {},
    t('faq.questions.insurance', { returnObjects: true }) || {}
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50/30 to-blue-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-cyan-700 text-sm font-medium mb-4">
            <HelpCircle size={16} className="mr-2" />
            {t('faqPreview.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            {t('faqPreview.title')}
          </h2>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory" aria-label={t('faqPreview.title')}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="w-80 flex-shrink-0 p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/20 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:rotate-1 snap-center"
            >
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-slate-700 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/faq" className="text-cyan-600 font-medium hover:underline">
            {t('faqPreview.link')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;
