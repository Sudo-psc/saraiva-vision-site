import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, Info } from 'lucide-react';

/**
 * ExpertTip - Inline tip boxes for medical advice
 * Types: tip (blue), warning (yellow), alert (red), info (purple)
 */
const ExpertTip = ({
  type = 'tip',
  title,
  children,
  className = ''
}) => {
  const configs = {
    tip: {
      icon: Stethoscope,
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-cyan-300',
      iconBg: 'bg-cyan-600',
      titleColor: 'text-blue-900',
      textColor: 'text-cyan-800',
      defaultTitle: 'Dica do Especialista'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-amber-300',
      iconBg: 'bg-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800',
      defaultTitle: 'Atenção'
    },
    alert: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-300',
      iconBg: 'bg-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
      defaultTitle: 'Quando Buscar Ajuda?'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      iconBg: 'bg-purple-600',
      titleColor: 'text-purple-900',
      textColor: 'text-purple-800',
      defaultTitle: 'Resumo Prático'
    }
  };

  const config = configs[type] || configs.tip;
  const Icon = config.icon;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`my-6 ${config.bgColor} rounded-xl p-5 md:p-6 shadow-md border-l-4 ${config.borderColor} ${className}`}
      role="complementary"
      aria-label={title || config.defaultTitle}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2.5 shadow-md`}>
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-2 ${config.titleColor}`}>
            {title || config.defaultTitle}
          </h3>
          <div className={`${config.textColor} leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default ExpertTip;