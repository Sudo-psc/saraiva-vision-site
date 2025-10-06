import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle } from 'lucide-react';

/**
 * QuickTakeaways - "O que você vai aprender?" summary box
 * Displays key learning points at the beginning of the article
 */
const QuickTakeaways = ({ items = [], title = 'O que você vai aprender?' }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-blue-100"
      role="complementary"
      aria-label="Resumo do que você vai aprender"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-full p-3 shadow-md">
          <Lightbulb className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
      </div>

      {/* Learning Points List */}
      <ul className="space-y-3" role="list">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 group"
          >
            <div className="flex-shrink-0 mt-1">
              <CheckCircle
                className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            </div>
            <span className="text-gray-800 leading-relaxed">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* Decorative Element */}
      <div className="mt-6 pt-6 border-t border-cyan-200">
        <p className="text-sm text-gray-600 text-center italic">
          💡 Informação clara e confiável para cuidar da sua visão
        </p>
      </div>
    </motion.aside>
  );
};

export default QuickTakeaways;