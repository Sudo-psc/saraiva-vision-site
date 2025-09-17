import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getServiceIcon } from '@/components/icons/ServiceIcons';
import { ANIMATION_CONFIG, STYLES } from '@/data/serviceConfig';

const ServiceHeader = ({ service, onScheduleClick }) => {
  const { t } = useTranslation();

  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-white shadow-sm">
      <div className={STYLES.CONTAINER}>
        <div className={STYLES.MAX_WIDTH}>
          <motion.div
            {...ANIMATION_CONFIG.FADE_IN}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-6">
              <div className="icon-container-large">
                {getServiceIcon(service.id, { className: "h-16 w-16 text-blue-600" })}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 sm:mb-4 px-2">
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              {service.description}
            </p>
          </motion.div>

          <motion.div
            {...ANIMATION_CONFIG.FADE_IN_DELAYED(0.2)}
            className="text-center"
          >
            <Button
              onClick={onScheduleClick}
              size="lg"
              className={STYLES.BUTTON_PRIMARY}
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t('cta.scheduleConsultation', 'Agendar Consulta')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ServiceHeader);