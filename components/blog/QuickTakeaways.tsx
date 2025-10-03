import React from 'react';
import { Lightbulb, CheckCircle } from 'lucide-react';
import type { QuickTakeawaysProps } from '@/types/blog-content';

/**
 * QuickTakeaways - Key learning points summary at article beginning
 *
 * Server Component - Static content
 *
 * Features:
 * - Displays key takeaways before main content
 * - Improves content scannability for readers
 * - Accessibility: WCAG AAA semantic HTML
 * - SEO-friendly structured markup
 * - Encourages reader engagement
 *
 * @example
 * ```tsx
 * <QuickTakeaways
 *   items={[
 *     "Exames regulares previnem doenças",
 *     "Sintomas iniciais são silenciosos",
 *     "Tratamento precoce é essencial"
 *   ]}
 * />
 * ```
 */
const QuickTakeaways: React.FC<QuickTakeawaysProps> = ({ items = [], title = 'O que você vai aprender?', className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <aside
      className={`my-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-blue-100 ${className}`}
      role="complementary"
      aria-label="Resumo do que você vai aprender"
      data-testid="quick-takeaways"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-3 shadow-md" aria-hidden="true">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Learning Points List */}
      <ul className="space-y-3" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
            </div>
            <span className="text-gray-800 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      {/* Decorative Element */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <p className="text-sm text-gray-600 text-center italic">💡 Informação clara e confiável para cuidar da sua visão</p>
      </div>
    </aside>
  );
};

export default QuickTakeaways;
