'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export interface ServiceIconProps {
  className?: string;
}

export const ConsultationIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const RefractionIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const SpecializedIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const SurgeryIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const PediatricIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const ReportsIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const GonioscopyIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const RetinaMappingIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const CornealTopographyIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const PachymetryIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const RetinographyIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export const VisualFieldIcon: React.FC<ServiceIconProps> = ({ className = "h-8 w-8" }) => {
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

export type ServiceIconType = React.FC<ServiceIconProps>;

export const serviceIconMap: Record<string, ServiceIconType> = {
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

export const getServiceIcon = (
  serviceId: string,
  props: ServiceIconProps = {}
): React.ReactElement | null => {
  const IconComponent = serviceIconMap[serviceId];
  return IconComponent ? <IconComponent {...props} /> : null;
};
