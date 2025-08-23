// Centralized clinic information to keep consistency with Google Business Profile.
// TODO: Replace placeholder values with exact data from Google Business dashboard.

export const CLINIC_PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJVUKww7WRugARF7u2lAe7BeE';

export const clinicInfo = {
  name: 'Clínica Saraiva Vision',
  legalName: 'Saraiva Vision Care LTDA',
  streetAddress: 'Rua Catarina Maria Passos, 97',
  neighborhood: 'Santa Zita',
  city: 'Caratinga',
  state: 'MG',
  postalCode: '35300-299',
  country: 'BR',
  phoneDisplay: '+55 33 99860-1427',
  phone: '+5533998601427',
  whatsapp: '+5533998601427',
  email: 'saraivavision@gmail.com',
  instagram: 'https://www.instagram.com/saraiva_vision/',
  chatbotUrl: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica',
  onlineSchedulingUrl: 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613',
  // Responsible physician (CFM compliance)
  responsiblePhysician: 'Dr. Philipe Saraiva Cruz',
  responsiblePhysicianCRM: 'CRM-MG 69.870',
  responsibleNurse: 'Ana Lúcia',
  responsibleNursePhone: '+55 33 98420-7437',
  // Data Protection Officer contact (LGPD Art.41)
  dpoEmail: 'saraivavision@gmail.com',
  taxId: '53.864.119/0001-79',
  foundingDate: '2024-02-08',
  latitude: -19.7868,
  longitude: -42.1392,
  servicesKeywords: [
    // Services list has been cleared as requested
  ]
};

export const googleMapsProfileUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`;
export const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${CLINIC_PLACE_ID}`;
