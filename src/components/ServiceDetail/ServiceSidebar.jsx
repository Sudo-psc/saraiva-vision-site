import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ANIMATION_CONFIG, STYLES } from '@/data/serviceConfig';

const ServiceSidebar = ({ service, onScheduleClick }) => {
  const { t } = useTranslation();

  return (
    <div className={STYLES.SPACE_Y_SIDEBAR}>
      {/* Quick Info */}
      <motion.div
        {...ANIMATION_CONFIG.SLIDE_IN_RIGHT_DELAYED(0.3)}
        className={STYLES.CARD_SIDEBAR}
      >
        <h3 className={STYLES.HEADING_LG}>{t('service.quickInfo', 'Informações Rápidas')}</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-slate-800">{t('service.duration', 'Duração')}</div>
              <div className="text-sm text-slate-600">{service.duration}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-slate-800">{t('service.location', 'Local')}</div>
              <div className="text-sm text-slate-600">{t('clinic.name', 'Clínica Saraiva Vision')}<br />{t('clinic.location', 'Caratinga/MG')}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preparation */}
      <motion.div
        {...ANIMATION_CONFIG.SLIDE_IN_RIGHT_DELAYED(0.4)}
        className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200"
      >
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">{t('service.preparation', 'Preparação')}</h3>
        <p className="text-slate-600 text-sm sm:text-base">{service.preparation}</p>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        {...ANIMATION_CONFIG.SLIDE_IN_RIGHT_DELAYED(0.5)}
        className={STYLES.CARD_SIDEBAR}
      >
        <h3 className={STYLES.HEADING_LG}>{t('service.directContact', 'Contato Direto')}</h3>
        <div className="space-y-3">
          <a
            href="tel:+5533998601427"
            className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">+55 33 99860-1427</span>
          </a>
        </div>
        <Button
          onClick={onScheduleClick}
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t('cta.scheduleNow', 'Agendar Agora')}
        </Button>
      </motion.div>
    </div>
  );
};

export default React.memo(ServiceSidebar);