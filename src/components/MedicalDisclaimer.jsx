import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Shield } from 'lucide-react';

/**
 * Medical Disclaimer Component
 * CFM-compliant disclaimer for medical content
 *
 * @param {Object} props
 * @param {'general'|'blog'|'online_consultations'} props.type - Type of disclaimer
 * @param {string} props.className - Additional CSS classes
 *
 * @author Dr. Philipe Saraiva Cruz
 */
const MedicalDisclaimer = ({ type = 'general', className = '' }) => {
  const disclaimers = {
    general: {
      title: 'Aviso Médico Importante',
      text: 'Este site contém informações médicas gerais sobre saúde ocular. As informações aqui apresentadas não substituem consulta médica presencial. Consulte sempre um oftalmologista para diagnóstico e tratamento adequados.',
      icon: AlertCircle,
      color: 'amber'
    },
    blog: {
      title: 'Conteúdo Informativo',
      text: 'Este conteúdo é exclusivamente informativo e educacional. Não substitui consulta médica presencial. Para diagnóstico preciso e tratamento personalizado, agende consulta com oftalmologista qualificado.',
      icon: AlertCircle,
      color: 'cyan'
    },
    online_consultations: {
      title: 'Consultas Online - CFM Nº 2.314/2022',
      text: 'As consultas online complementam, mas não substituem consultas presenciais quando necessário. Conforme Resolução CFM Nº 2.314/2022, alguns procedimentos exigem exame físico presencial. O médico determinará a modalidade mais apropriada.',
      icon: Shield,
      color: 'blue'
    }
  };

  const disclaimer = disclaimers[type] || disclaimers.general;
  const Icon = disclaimer.icon;

  const colorClasses = {
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600',
      subtext: 'text-amber-800'
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-900',
      icon: 'text-cyan-600',
      subtext: 'text-cyan-800'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      subtext: 'text-blue-800'
    }
  };

  const colors = colorClasses[disclaimer.color] || colorClasses.amber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`medical-disclaimer ${colors.bg} ${colors.border} border rounded-xl p-4 ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Aviso médico importante"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 ${colors.bg} rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${colors.text} text-sm mb-1`}>
            {disclaimer.title}
          </h3>

          <p className={`text-sm ${colors.subtext} leading-relaxed mb-2`}>
            {disclaimer.text}
          </p>

          <div className={`text-xs ${colors.subtext} pt-2 border-t ${colors.border} flex items-center gap-2`}>
            <Shield className="w-3 h-3" aria-hidden="true" />
            <span>
              <strong className={colors.text}>Dr. Philipe Saraiva Cruz</strong> • CRM-MG 69.870 • RQE 48.222
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicalDisclaimer;
