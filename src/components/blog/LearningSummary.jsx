import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';

/**
 * LearningSummary - "What you'll learn" section
 * Sets expectations and improves content scannability
 */
const LearningSummary = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-lg border border-blue-100 mb-8 ${className}`}
      role="complementary"
      aria-labelledby="learning-summary-title"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-600 rounded-full p-3 shadow-md">
          <BookOpen className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h2 id="learning-summary-title" className="text-2xl font-bold text-gray-900">
          O que você vai aprender?
        </h2>
      </div>

      <ul className="space-y-3" role="list">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-3 group"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="bg-green-500 rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
                <Check className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed flex-1">
              {item}
            </p>
          </motion.li>
        ))}
      </ul>

      <div className="mt-6 pt-6 border-t border-cyan-200">
        <p className="text-sm text-gray-600 text-center">
          📚 Tempo de leitura: ~{Math.ceil(items.length * 1.5)} minutos
        </p>
      </div>
    </motion.div>
  );
};

export default LearningSummary;