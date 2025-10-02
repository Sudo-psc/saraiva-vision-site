import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import {
  NAP_CANONICAL,
  generateWhatsAppURL,
  getAddressForContext,
  getPhoneDisplay,
  getBusinessName,
} from '@/lib/napCanonical';

export default function FooterNAP({ variant = 'full' }) {
  const isCompact = variant === 'compact';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-white mb-1">
            {getBusinessName('legal')}
          </h3>
          <address className="not-italic text-gray-300 text-sm leading-relaxed">
            {isCompact ? getAddressForContext('short') : getAddressForContext('long')}
          </address>
          {!isCompact && (
            <a
              href={NAP_CANONICAL.address.geo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-teal-400 hover:text-teal-300 text-sm transition-colors"
              aria-label="Ver no Google Maps"
            >
              Ver no mapa
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <a
            href={NAP_CANONICAL.phone.primary.href}
            className="text-white hover:text-teal-400 transition-colors font-medium"
            aria-label={`Ligar para ${getPhoneDisplay()}`}
          >
            {getPhoneDisplay()}
          </a>
          <a
            href={generateWhatsAppURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
            aria-label="Enviar mensagem pelo WhatsApp"
          >
            WhatsApp disponível
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" aria-hidden="true" />
        <a
          href={NAP_CANONICAL.email.href}
          className="text-white hover:text-teal-400 transition-colors"
          aria-label={`Enviar email para ${NAP_CANONICAL.email.primary}`}
        >
          {NAP_CANONICAL.email.primary}
        </a>
      </div>

      {!isCompact && (
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" aria-hidden="true" />
          <div className="text-sm text-gray-300 space-y-1">
            <p>{NAP_CANONICAL.hours.weekdays.display}</p>
            <p className="text-gray-400">{NAP_CANONICAL.hours.saturday.display}</p>
          </div>
        </div>
      )}

      {!isCompact && (
        <div className="pt-4 mt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            {NAP_CANONICAL.doctor.displayName}
          </p>
        </div>
      )}
    </div>
  );
}
