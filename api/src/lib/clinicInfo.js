// Centralized clinic information to keep consistency with Google Business Profile.

const FALLBACK_PLACE_ID = 'ChIJVUKww7WRugARF7u2lAe7BeE';
const PLACEHOLDER_TOKENS = ['GOOGLE_PLACE_ID_PLACEHOLDER', 'your_google_place_id_here', 'PLACEHOLDER'];

/**
 * Normalizes a Google Place ID by trimming whitespace and checking for placeholder values.
 *
 * @param {string} value The Place ID to normalize.
 * @returns {string|null} The normalized Place ID, or `null` if the value is invalid.
 * @private
 */
const normalizePlaceId = (value) => {
  if (!value) return null;
  const cleanedValue = String(value).trim();

  if (!cleanedValue) return null;
  if (PLACEHOLDER_TOKENS.some((token) => cleanedValue.includes(token))) return null;

  return cleanedValue;
};

/**
 * Resolves the Google Place ID to use by checking environment variables and falling back to a default value.
 *
 * @returns {string} The resolved Google Place ID.
 * @private
 */
const resolvePlaceId = () => {
  const candidates = [];

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
  name: 'Clínica Saraiva Vision',
  legalName: 'Saraiva Vision Care LTDA',
  streetAddress: 'Rua Catarina Maria Passos, 97',
  neighborhood: 'Santa Zita',
  city: 'Caratinga',
  state: 'MG',
  postalCode: '35300-299',
  country: 'BR',
  // Structured address for easy access in components
  address: {
    street: 'Rua Catarina Maria Passos, 97',
    city: 'Caratinga',
    state: 'MG',
    zip: '35300-299',
    country: 'BR'
  },
  phoneDisplay: '+55 33 99860-1427',
  phone: '+5533998601427',
  whatsapp: '+5533998601427',
  email: 'contato@saraivavision.com.br',
  instagram: 'https://www.instagram.com/saraiva_vision/',
  facebook: 'https://www.facebook.com/philipeoftalmo',
  linkedin: 'https://www.linkedin.com/in/dr-philipe-saraiva/',
  x: 'https://x.com/philipe_saraiva',
  spotify: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
  chatbotUrl: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica',
  onlineSchedulingUrl: 'https://apolo.ninsaude.com/a/saraivavision/',
  validateSchedulingUrl: () => {
    const url = 'https://apolo.ninsaude.com/a/saraivavision/';
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        throw new Error('URL must use HTTPS');
      }
      if (!urlObj.hostname.includes('ninsaude.com')) {
        throw new Error('URL must be from ninsaude.com domain');
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
  dpoEmail: 'dpo@saraivavision.com.br',
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
