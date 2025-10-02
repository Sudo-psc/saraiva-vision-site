import { env } from '@/utils/env';
import { NAP_CANONICAL } from './napCanonical';

const FALLBACK_PLACE_ID = 'ChIJVUKww7WRugARF7u2lAe7BeE';
const PLACEHOLDER_TOKENS = ['GOOGLE_PLACE_ID_PLACEHOLDER', 'your_google_place_id_here', 'PLACEHOLDER'];

const normalizePlaceId = (value) => {
  if (!value) return null;
  const cleanedValue = String(value).trim();

  if (!cleanedValue) return null;
  if (PLACEHOLDER_TOKENS.some((token) => cleanedValue.includes(token))) return null;

  return cleanedValue;
};

const resolvePlaceId = () => {
  const candidates = [];

  if (typeof import.meta !== 'undefined' && env) {
    candidates.push(env.VITE_GOOGLE_PLACE_ID);
  }

  if (typeof process !== 'undefined' && process.env) {
    candidates.push(process.env.GOOGLE_PLACE_ID);
    candidates.push(process.env.VITE_GOOGLE_PLACE_ID);
  }

  for (const candidate of candidates) {
    const resolved = normalizePlaceId(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return FALLBACK_PLACE_ID;
};

export const CLINIC_PLACE_ID = resolvePlaceId();

export const clinicInfo = {
  name: NAP_CANONICAL.business.legalName,
  legalName: NAP_CANONICAL.business.legalName,
  streetAddress: `${NAP_CANONICAL.address.street}, ${NAP_CANONICAL.address.number}`,
  neighborhood: NAP_CANONICAL.address.neighborhood,
  city: NAP_CANONICAL.address.city,
  state: NAP_CANONICAL.address.stateCode,
  postalCode: NAP_CANONICAL.address.postalCode,
  country: NAP_CANONICAL.address.countryCode,
  address: {
    street: `${NAP_CANONICAL.address.street}, ${NAP_CANONICAL.address.number}`,
    city: NAP_CANONICAL.address.city,
    state: NAP_CANONICAL.address.stateCode,
    zip: NAP_CANONICAL.address.postalCode,
    country: NAP_CANONICAL.address.countryCode
  },
  phoneDisplay: NAP_CANONICAL.phone.primary.display,
  phone: NAP_CANONICAL.phone.primary.e164,
  whatsapp: NAP_CANONICAL.phone.whatsapp.e164,
  whatsapp24h: 'https://wa.me/message/EHTAAAAYH7SHJ1',
  email: NAP_CANONICAL.email.primary,
  instagram: 'https://www.instagram.com/saraiva_vision/',
  facebook: 'https://www.facebook.com/philipeoftalmo',
  linkedin: 'https://www.linkedin.com/in/dr-philipe-saraiva/',
  x: 'https://x.com/philipe_saraiva',
  spotify: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
  chatbotUrl: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica',
  // aiChatbotId: '68d52f7bf91669800d0923ac', // Pulse.live chatbot ID - REMOVIDO
  onlineSchedulingUrl: 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613',
  // Security validation for external integrations
  validateSchedulingUrl: () => {
    const url = 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613';
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        throw new Error('URL must use HTTPS');
      }
      if (!urlObj.hostname.includes('agendarconsulta.com')) {
        throw new Error('URL must be from agendarconsulta.com domain');
      }
      return url;
    } catch (error) {
      console.error('Invalid scheduling URL:', error);
      return null;
    }
  },
  // Responsible physician (CFM compliance)
  responsiblePhysician: 'Dr. Philipe Saraiva Cruz',
  responsiblePhysicianCRM: 'CRM-MG 69.870',
  responsiblePhysicianTitle: 'Responsável Técnico Médico',
  responsibleNurse: 'Ana Lúcia',
  responsibleNurseTitle: 'Enfermeira',
  responsibleNursePhone: '+55 33 98420-7437',
  // Data Protection Officer contact (LGPD Art.41)
  dpoEmail: 'saraivavision@gmail.com',
  taxId: '53.864.119/0001-79',
  foundingDate: '2024-02-08',
  latitude: -19.7890206,
  longitude: -42.1347583,
  servicesKeywords: [
    'Consultas oftalmológicas',
    'Exames de refração',
    'Tratamentos especializados',
    'Cirurgias oftalmológicas',
    'Oftalmologia pediátrica',
    'Laudos especializados'
  ]
};

export const googleMapsProfileUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`;
export const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${CLINIC_PLACE_ID}`;