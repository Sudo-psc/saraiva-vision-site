import React from 'react';
import { AlertTriangle, Info, Lightbulb, FileText, CheckCircle } from 'lucide-react';
import type { InfoBoxProps, InfoBoxConfig, InfoBoxType } from '@/types/blog-content';

/**
 * InfoBox - Contextual information boxes for blog content
 *
 * Server Component - Static content only
 *
 * Features:
 * - Multiple box types (tip, warning, summary, info, success)
 * - Color-coded visual system for quick recognition
 * - Accessibility: WCAG AAA semantic HTML
 * - Responsive design with gradient backgrounds
 *
 * @example
 * ```tsx
 * <InfoBox type="tip" title="Dica Importante">
 *   <p>Informação útil para o leitor...</p>
 * </InfoBox>
 * ```
 */
const InfoBox: React.FC<InfoBoxProps> = ({ type = 'info', title, children, className = '' }) => {
  const configs: Record<InfoBoxType, InfoBoxConfig> = {
    tip: {
      icon: Lightbulb,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-300',
      iconBg: 'bg-yellow-500',
      iconColor: 'text-white',
      titleColor: 'text-yellow-900',
      emoji: '💡',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
      borderColor: 'border-red-300',
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      titleColor: 'text-red-900',
      emoji: '⚠️',
    },
    summary: {
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      iconBg: 'bg-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-purple-900',
      emoji: '📋',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-900',
      emoji: 'ℹ️',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      iconBg: 'bg-green-500',
      iconColor: 'text-white',
      titleColor: 'text-green-900',
      emoji: '✓',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} rounded-2xl p-6 border-2 ${config.borderColor} shadow-lg my-6 ${className}`}
      role="complementary"
      aria-label={title || 'Informação adicional'}
      data-testid="info-box"
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-3 shadow-md`} aria-hidden="true">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1">
          {title && (
            <h3 className={`font-bold text-lg ${config.titleColor} mb-2 flex items-center gap-2`}>
              <span>{config.emoji}</span>
              <span>{title}</span>
            </h3>
          )}
          <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
