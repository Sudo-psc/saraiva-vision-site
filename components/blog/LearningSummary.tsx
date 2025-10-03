import React from 'react';
import { BookOpen, Check } from 'lucide-react';
import type { LearningSummaryProps } from '@/types/blog-content';

/**
 * LearningSummary - "What you'll learn" section for blog posts
 *
 * Server Component - Static content
 *
 * Features:
 * - Sets reader expectations upfront
 * - Improves content scannability
 * - Estimated reading time calculation
 * - Accessibility: WCAG AAA semantic HTML
 * - SEO-friendly structured content
 *
 * @example
 * ```tsx
 * <LearningSummary
 *   items={[
 *     "Como prevenir doenças oculares",
 *     "Principais sintomas de alerta",
 *     "Quando consultar um oftalmologista"
 *   ]}
 *   estimatedMinutes={5}
 * />
 * ```
 */
const LearningSummary: React.FC<LearningSummaryProps> = ({ items = [], title = 'O que você vai aprender?', className = '', estimatedMinutes }) => {
  if (!items || items.length === 0) return null;

  // Calculate estimated reading time if not provided (1.5 min per learning point)
  const readingTime = estimatedMinutes || Math.ceil(items.length * 1.5);

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-lg border border-blue-100 mb-8 ${className}`}
      role="complementary"
      aria-labelledby="learning-summary-title"
      data-testid="learning-summary"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 rounded-full p-3 shadow-md" aria-hidden="true">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h2 id="learning-summary-title" className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
      </div>

      <ul className="space-y-3" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-green-500 rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform" aria-hidden="true">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed flex-1">{item}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-6 border-t border-blue-200">
        <p className="text-sm text-gray-600 text-center">📚 Tempo de leitura: ~{readingTime} minutos</p>
      </div>
    </div>
  );
};

export default LearningSummary;
