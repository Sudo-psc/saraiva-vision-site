'use client';

import React from 'react';
import { Calendar, Phone, MessageCircle, MapPin } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { NAP_CANONICAL, generateWhatsAppURL, getPhoneDisplay } from '@/lib/napCanonical';
import { safeOpenUrl } from '@/utils/safeNavigation';

type CTAVariant = 'hero' | 'sticky' | 'default';

interface UnifiedCTAProps {
  variant?: CTAVariant;
  className?: string;
}

const UnifiedCTA: React.FC<UnifiedCTAProps> = ({ variant = 'hero', className = '' }) => {
  const handleAgendarClick = () => {
    const validUrl = clinicInfo.validateSchedulingUrl();
    if (validUrl) {
      safeOpenUrl(validUrl);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-cta-modal'));
    }
  };

  const whatsappUrl = generateWhatsAppURL();
  const phoneHref = NAP_CANONICAL.phone.primary.href;
  const phoneDisplay = getPhoneDisplay();

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <button
          type="button"
          onClick={handleAgendarClick}
          className="cta-primary group"
          aria-label="Agendar consulta oftalmológica online com Dr. Philipe Saraiva"
        >
          <span className="inline-flex items-center gap-3">
            <Calendar className="w-5 h-5" aria-hidden="true" />
            Agendar Consulta Online
          </span>
        </button>

        <div className="quick-actions-container" role="group" aria-label="Contatos rápidos">
          <a
            href={phoneHref}
            className="quick-action-btn"
            aria-label={`Ligar para clínica - telefone ${phoneDisplay}`}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>Ligar</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-action-btn"
            aria-label={`Enviar mensagem via WhatsApp para ${phoneDisplay}`}
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>

        <a
          href={NAP_CANONICAL.address.geo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="maps-link"
          aria-label="Ver localização da clínica no Google Maps (abre em nova aba)"
        >
          <MapPin className="w-4 h-4" aria-hidden="true" />
          Como chegar
        </a>
      </div>
    );
  }

  if (variant === 'sticky') {
    return (
      <div className="sticky-cta-mobile">
        <button
          type="button"
          onClick={handleAgendarClick}
          className="sticky-cta-button"
          aria-label="Agendar consulta oftalmológica"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold">Agendar Consulta</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAgendarClick}
      className="cta-primary"
      aria-label="Agendar consulta oftalmológica online"
    >
      <span className="inline-flex items-center gap-3">
        <Calendar className="w-5 h-5" aria-hidden="true" />
        Agendar Consulta
      </span>
    </button>
  );
};

export default UnifiedCTA;
