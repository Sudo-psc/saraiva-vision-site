import React from 'react';
import { Stethoscope, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { ExpertTipProps, ExpertTipConfig, ExpertTipType } from '@/types/blog-content';

/**
 * ExpertTip - Medical advice tip boxes with CFM compliance
 *
 * Server Component - No client-side interactivity needed
 *
 * Features:
 * - Multiple tip types (tip, warning, alert, info)
 * - CFM medical disclaimers for regulatory compliance
 * - Doctor attribution with credentials
 * - Accessibility: WCAG AAA semantic markup
 * - Static content for optimal performance
 *
 * @example
 * ```tsx
 * <ExpertTip
 *   type="tip"
 *   title="Dica do Especialista"
 *   doctorName="Dr. Saraiva"
 *   doctorRole="Oftalmologista - CRM 12345"
 *   disclaimer={{
 *     required: true,
 *     level: 'educational'
 *   }}
 * >
 *   <p>Mantenha uma distância segura da tela...</p>
 * </ExpertTip>
 * ```
 */
const ExpertTip: React.FC<ExpertTipProps> = ({
  type = 'tip',
  title,
  children,
  className = '',
  disclaimer,
  doctorName,
  doctorRole,
}) => {
  const configs: Record<ExpertTipType, ExpertTipConfig> = {
    tip: {
      icon: Stethoscope,
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      iconBg: 'bg-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
      defaultTitle: 'Dica do Especialista',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-amber-300',
      iconBg: 'bg-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800',
      defaultTitle: 'Atenção',
    },
    alert: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-300',
      iconBg: 'bg-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
      defaultTitle: 'Quando Buscar Ajuda?',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      iconBg: 'bg-purple-600',
      titleColor: 'text-purple-900',
      textColor: 'text-purple-800',
      defaultTitle: 'Resumo Prático',
    },
  };

  const config = configs[type] || configs.tip;
  const Icon = config.icon;

  // CFM Disclaimer text based on medical content level
  const getDisclaimerText = (): string => {
    if (!disclaimer?.required) return '';

    const level = disclaimer.level || 'educational';

    const disclaimers: Record<string, string> = {
      educational:
        'Este conteúdo tem propósito educativo. Não substitui consulta, diagnóstico ou tratamento médico. Consulte sempre um oftalmologista.',
      diagnostic:
        'ATENÇÃO CFM: Este conteúdo é informativo e NÃO constitui diagnóstico médico. Apenas um médico qualificado pode diagnosticar condições de saúde.',
      treatment:
        'ATENÇÃO CFM: Este conteúdo é educativo e NÃO constitui prescrição médica. Nunca inicie tratamentos sem orientação de um oftalmologista.',
    };

    return disclaimer.text || disclaimers[level];
  };

  const disclaimerText = getDisclaimerText();

  return (
    <aside
      className={`my-6 ${config.bgColor} rounded-xl p-5 md:p-6 shadow-md border-l-4 ${config.borderColor} ${className}`}
      role="complementary"
      aria-label={title || config.defaultTitle}
      data-testid="expert-tip"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2.5 shadow-md`} aria-hidden="true">
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-2 ${config.titleColor}`}>{title || config.defaultTitle}</h3>

          {/* Doctor Attribution */}
          {(doctorName || doctorRole) && (
            <div className="mb-3 text-sm font-medium text-gray-700">
              {doctorName && <span className="text-blue-700">{doctorName}</span>}
              {doctorRole && <span className="text-gray-600"> - {doctorRole}</span>}
            </div>
          )}

          {/* Main Content */}
          <div className={`${config.textColor} leading-relaxed prose prose-sm max-w-none`}>{children}</div>

          {/* CFM Medical Disclaimer */}
          {disclaimerText && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong className="text-red-700">⚕️ Aviso Médico CFM:</strong> {disclaimerText}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ExpertTip;
