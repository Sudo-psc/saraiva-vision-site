import React from 'react';
import { useTranslation } from 'react-i18next';

// Service icons using PNG images from public/img/
export const ConsultationIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <img
      src="/img/icon_consulta.png"
      alt={t('ui.alt.consultations')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const RefractionIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_refracao.png"
    alt="Exames de Refração"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const SpecializedIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_tratamento.png"
    alt="Tratamentos Especializados"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const SurgeryIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_cirurgia.png"
    alt="Cirurgias Oftalmológicas"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const PediatricIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <img
      src="/img/Icon_pediatria.png"
      alt={t('ui.alt.pediatric')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const ReportsIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_laudos.png"
    alt="Laudos Especializados"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

// Service icon mapping
export const serviceIconMap = {
  'consultas-oftalmologicas': ConsultationIcon,
  'exames-de-refracao': RefractionIcon,
  'tratamentos-especializados': SpecializedIcon,
  'cirurgias-oftalmologicas': SurgeryIcon,
  'acompanhamento-pediatrico': PediatricIcon,
  'laudos-especializados': ReportsIcon,
};

export const getServiceIcon = (serviceId, props = {}) => {
  const IconComponent = serviceIconMap[serviceId];
  return IconComponent ? <IconComponent {...props} /> : null;
};
