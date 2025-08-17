// Centralized clinic information to keep consistency with Google Business Profile.
// TODO: Replace placeholder values with exact data from Google Business dashboard.

export const CLINIC_PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID || 'PLACE_ID_AQUI';

export const clinicInfo = {
  name: 'Saraiva Vision Oftalmologia',
  legalName: 'Saraiva Vision Oftalmologia',
  streetAddress: 'Av. Moacir de Matos, 150',
  neighborhood: 'Centro',
  city: 'Caratinga',
  state: 'MG',
  postalCode: '35300-048',
  country: 'BR',
  phoneDisplay: '+55 33 99860-1427',
  phone: '+5533998601427',
  whatsapp: '+5533998601427',
  email: 'drphilipe.saraiva.oftalmo@gmail.com',
  // Responsible physician (CFM compliance)
  responsiblePhysician: 'Dr. Philipe Saraiva',
  responsiblePhysicianCRM: 'CRM-MG 69.870',
  // Data Protection Officer contact (LGPD Art.41)
  dpoEmail: 'drphilipe.saraiva.oftalmo@gmail.com',
  latitude: -19.78935,
  longitude: -42.13991,
  servicesKeywords: [
    'Oftalmologista em Caratinga',
    'Clínica oftalmológica Caratinga',
    'Exame de vista Caratinga MG'
  ]
};

export const googleMapsProfileUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`;
export const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${CLINIC_PLACE_ID}`;
