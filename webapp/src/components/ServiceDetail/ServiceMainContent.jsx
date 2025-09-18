import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ANIMATION_CONFIG, STYLES } from '@/data/serviceConfig';

const ServiceMainContent = ({ service }) => {
  const { t } = useTranslation();

  return (
    <div className={`lg:col-span-2 ${STYLES.SPACE_Y_RESPONSIVE}`}>
      {/* Full Description */}
      <motion.div
        {...ANIMATION_CONFIG.FADE_IN_DELAYED(0.3)}
        className={STYLES.CARD}
      >
        <h2 className={STYLES.HEADING_XL}>{t('service.about', 'Sobre o Serviço')}</h2>
        <p className="text-slate-600 leading-relaxed">
          {service.fullDescription}
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div
        {...ANIMATION_CONFIG.FADE_IN_DELAYED(0.4)}
        className={STYLES.CARD}
      >
        <h2 className={`${STYLES.HEADING_XL} mb-4 sm:mb-6`}>{t('service.benefits', 'Principais Benefícios')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {service.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600">{benefit}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* What's Included */}
      <motion.div
        {...ANIMATION_CONFIG.FADE_IN_DELAYED(0.5)}
        className={STYLES.CARD}
      >
        <h2 className={`${STYLES.HEADING_XL} mb-4 sm:mb-6`}>{t('service.included', 'O que está incluído')}</h2>
        <div className="space-y-3">
          {service.included.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 flex-shrink-0"></div>
              <span className="text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(ServiceMainContent);