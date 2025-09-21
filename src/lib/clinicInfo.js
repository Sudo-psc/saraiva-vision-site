// Centralized clinic information to keep consistency with Google Business Profile.

/**
 * The Google Place ID for the clinic.
 * Used for Google Maps and Reviews integrations.
 * @type {string}
 */
export const CLINIC_PLACE_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_PLACE_ID) || 'ChIJVUKww7WRugARF7u2lAe7BeE';

/**
 * An object containing all centralized information about the clinic.
 * This ensures consistency across the application.
 * @property {string} name - The public name of the clinic.
 * @property {string} legalName - The legal name of the clinic.
 * @property {string} streetAddress - The street address.
 * @property {string} neighborhood - The neighborhood.
 * @property {string} city - The city.
 * @property {string} state - The state (e.g., 'MG').
 * @property {string} postalCode - The postal code.
 * @property {string} country - The country code (e.g., 'BR').
 * @property {object} address - A structured address object.
 * @property {string} phoneDisplay - The phone number formatted for display.
 * @property {string} phone - The phone number in E.164 format.
 * @property {string} whatsapp - The WhatsApp number in E.164 format.
 * @property {string} email - The contact email address.
 * @property {string} instagram - The URL for the Instagram profile.
 * @property {string} facebook - The URL for the Facebook profile.
 * @property {string} linkedin - The URL for the LinkedIn profile.
 * @property {string} chatbotUrl - The URL for the clinic's chatbot.
 * @property {string} onlineSchedulingUrl - The URL for the online scheduling platform.
 * @property {function(): string | null} validateSchedulingUrl - A function to validate and return the scheduling URL.
 * @property {string} responsiblePhysician - The name of the responsible physician.
 * @property {string} responsiblePhysicianCRM - The CRM number of the responsible physician.
 * @property {string} responsibleNurse - The name of the responsible nurse.
 * @property {string} responsibleNursePhone - The phone number of the responsible nurse.
 * @property {string} dpoEmail - The email for the Data Protection Officer (DPO).
 * @property {string} taxId - The clinic's tax ID (CNPJ).
 * @property {string} foundingDate - The founding date of the clinic.
 * @property {number} latitude - The geographic latitude.
 * @property {number} longitude - The geographic longitude.
 * @property {string[]} servicesKeywords - A list of keywords for the services offered.
 */
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
  email: 'saraivavision@gmail.com',
  instagram: 'https://www.instagram.com/saraiva_vision/',
  facebook: 'https://www.facebook.com/philipeoftalmo',
  linkedin: 'https://www.linkedin.com/in/dr-philipe-saraiva/',
  chatbotUrl: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica',
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
  responsibleNurse: 'Ana Lúcia',
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

/**
 * The URL for the clinic's Google Maps profile.
 * @type {string}
 */
export const googleMapsProfileUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`;

/**
 * A direct link for users to write a Google review for the clinic.
 * @type {string}
 */
export const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${CLINIC_PLACE_ID}`;
