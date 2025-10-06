import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, Lightbulb, FileText, CheckCircle } from 'lucide-react';

/**
 * InfoBox - Contextual information boxes
 * Types: tip, warning, summary, info, success
 */
const InfoBox = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const configs = {
    tip: {
      icon: Lightbulb,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-300',
      iconBg: 'bg-yellow-500',
      iconColor: 'text-white',
      titleColor: 'text-yellow-900',
      emoji: '💡'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
      borderColor: 'border-red-300',
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      titleColor: 'text-red-900',
      emoji: '⚠️'
    },
    summary: {
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      iconBg: 'bg-purple-500',
      iconColor: 'text-white',
      titleColor: 'text-purple-900',
      emoji: '📋'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-cyan-300',
      iconBg: 'bg-cyan-500',
      iconColor: 'text-white',
      titleColor: 'text-blue-900',
      emoji: 'ℹ️'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      iconBg: 'bg-green-500',
      iconColor: 'text-white',
      titleColor: 'text-green-900',
      emoji: '✓'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`${config.bgColor} rounded-2xl p-6 border-2 ${config.borderColor} shadow-lg my-6 ${className}`}
      role="complementary"
      aria-label={`${title || 'Informação adicional'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-3 shadow-md`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} aria-hidden="true" />
        </div>

        <div className="flex-1">
          {title && (
            <h3 className={`font-bold text-lg ${config.titleColor} mb-2 flex items-center gap-2`}>
              <span>{config.emoji}</span>
              <span>{title}</span>
            </h3>
          )}
          <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoBox;