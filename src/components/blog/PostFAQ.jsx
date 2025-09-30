import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * PostFAQ - Frequently asked questions section for blog posts
 * Improves engagement and answers common patient questions
 */
const PostFAQ = ({ questions = [], className = '' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!questions || questions.length === 0) return null;

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 my-8 ${className}`}
      aria-labelledby="faq-title"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <div className="bg-purple-600 rounded-full p-3 shadow-md">
          <HelpCircle className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h2 id="faq-title" className="text-2xl font-bold text-gray-900">
          Principais Dúvidas dos Pacientes
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
            >
              <span className="font-semibold text-gray-900 pr-4 flex-1">
                {item.question}
              </span>
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
                >
                  <div className="p-5 bg-white border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">
          Ainda tem dúvidas? Nossa equipe está pronta para ajudar!
        </p>
        <a
          href="https://wa.me/message/EHTAAAAYH7SHJ1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Fale com Especialista</span>
        </a>
      </div>
    </motion.section>
  );
};

export default PostFAQ;