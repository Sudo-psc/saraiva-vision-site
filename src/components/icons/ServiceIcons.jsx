import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

// Service icons using PNG images from public/img/
export const ConsultationIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_consulta.webp"
      alt={t('ui.alt.consultations')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const RefractionIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_refracao.webp"
      alt={t('ui.alt.refraction', 'Exames de Refração')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const SpecializedIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_tratamento.webp"
      alt={t('ui.alt.specialized', 'Tratamentos Especializados')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const SurgeryIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_cirurgia.webp"
      alt={t('ui.alt.surgeries', 'Cirurgias Oftalmológicas')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const PediatricIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/Icon_pediatria.webp"
      alt={t('ui.alt.pediatric')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const ReportsIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_laudos.webp"
      alt={t('ui.alt.reports', 'Laudos Especializados')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

// Novos ícones de exames específicos (usar imagens adicionadas em /public/img/)
export const GonioscopyIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_gonioscopia.webp"
      alt={t('ui.alt.gonioscopy', 'Gonioscopia')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const RetinaMappingIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_mapeamento_retina.webp"
      alt={t('ui.alt.retina_mapping', 'Mapeamento de Retina')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const CornealTopographyIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_topografia_corneana.webp"
      alt={t('ui.alt.corneal_topography', 'Topografia Corneana')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const PachymetryIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_paquimetria.webp"
      alt={t('ui.alt.pachymetry', 'Paquimetria')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const RetinographyIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_retinografia.webp"
      alt={t('ui.alt.retinography', 'Retinografia')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const VisualFieldIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/icon_campo_visual.webp"
      alt={t('ui.alt.visual_field', 'Campo Visual')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const MeibographyIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/img/meibografia icon.png"
      alt={t('ui.alt.meibography', 'Meibografia')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

// Ícones de Procedimentos com Jato de Plasma
export const PlasmaLiftBlepharoplastyIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/icone_blefaroplastia_plasma.JPG"
      alt={t('ui.alt.plasma_blepharoplasty', 'Blefaroplastia com Jato de Plasma')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const XanthelasmaRemovalIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/icone_tx_xantelasma.png"
      alt={t('ui.alt.xanthelasma_removal', 'Remoção de Xantelasma')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

export const DpnTreatmentIcon = ({ className = "h-8 w-8" }) => {
  const { t } = useTranslation();
  return (
    <ImageWithFallback
      src="/Icone_DPN.jpg"
      alt={t('ui.alt.dpn_treatment', 'Tratamento de DPN')}
      className={className}
      loading="lazy"
      decoding="async"
      width="64"
      height="64"
    />
  );
};

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
  'meibografia': MeibographyIcon,
  'blefaroplastia-jato-plasma': PlasmaLiftBlepharoplastyIcon,
  'remocao-xantelasma': XanthelasmaRemovalIcon,
  'tratamento-dpn': DpnTreatmentIcon,
};

export const getServiceIcon = (serviceId, props = {}) => {
  const IconComponent = serviceIconMap[serviceId];
  return IconComponent ? <IconComponent {...props} /> : null;
};
