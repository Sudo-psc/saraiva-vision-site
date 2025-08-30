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

// Novos ícones de exames específicos (usar imagens adicionadas em /public/img/)
export const GonioscopyIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_gonioscopia.png"
    alt="Gonioscopia"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const RetinaMappingIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_mapeamento_retina.png"
    alt="Mapeamento de Retina"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const CornealTopographyIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_topografia_corneana.png"
    alt="Topografia Corneana"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const PachymetryIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_paquimetria.png"
    alt="Paquimetria"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const RetinographyIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_retinografia.png"
    alt="Retinografia"
    className={className}
    loading="lazy"
    decoding="async"
    width="64"
    height="64"
  />
);

export const VisualFieldIcon = ({ className = "h-8 w-8" }) => (
  <img
    src="/img/icon_campo_visual.png"
    alt="Campo Visual"
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
  'gonioscopia': GonioscopyIcon,
  'mapeamento-de-retina': RetinaMappingIcon,
  'topografia-corneana': CornealTopographyIcon,
  'paquimetria': PachymetryIcon,
  'retinografia': RetinographyIcon,
  'campo-visual': VisualFieldIcon,
};

export const getServiceIcon = (serviceId, props = {}) => {
  const IconComponent = serviceIconMap[serviceId];
  return IconComponent ? <IconComponent {...props} /> : null;
};
