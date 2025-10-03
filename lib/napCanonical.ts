/**
 * NAP (Name, Address, Phone) Canonical Data
 * Single source of truth for business information
 */

export const NAP_CANONICAL = {
  business: {
    legalName: 'Clínica Saraiva Vision',
    displayName: 'Saraiva Vision',
    tradeName: 'Saraiva Vision',
    type: 'Ophthalmology Clinic',
    medicalSpecialty: 'Oftalmologia',
    priceRange: '$$',
    founded: '2020',
    slogan: 'Cuidando da sua visão com tecnologia e humanização',
  },

  address: {
    full: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299',
    street: 'Rua Catarina Maria Passos',
    number: '97',
    neighborhood: 'Santa Zita',
    city: 'Caratinga',
    state: 'MG',
    stateCode: 'MG',
    postalCode: '35300-299',
    country: 'Brasil',
    countryCode: 'BR',
    formatted: {
      short: 'Rua Catarina Maria Passos, 97 - Caratinga/MG',
      medium: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG',
      long: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299',
      singleLine: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG 35300-299',
    },
    geo: {
      latitude: -19.789444,
      longitude: -42.137778,
      mapUrl: 'https://maps.app.goo.gl/YOUR_GOOGLE_PLACE_ID',
    },
  },

  phone: {
    primary: {
      raw: '5533998601427',
      e164: '+5533998601427',
      display: '+55 33 99860-1427',
      displayShort: '(33) 99860-1427',
      href: 'tel:+5533998601427',
      areaCode: '33',
      number: '998601427',
      international: '+55 33 99860-1427',
      national: '(033) 99860-1427',
    },
    whatsapp: {
      raw: '5533998601427',
      e164: '+5533998601427',
      display: '+55 33 99860-1427',
      href: 'https://wa.me/5533998601427',
      defaultMessage: 'Olá! Gostaria de agendar uma consulta.',
    },
  },

  email: {
    primary: 'saraivavision@gmail.com',
    contact: 'saraivavision@gmail.com',
    support: 'saraivavision@gmail.com',
    appointments: 'saraivavision@gmail.com',
    href: 'mailto:saraivavision@gmail.com',
  },

  hours: {
    weekdays: {
      display: 'Segunda a Sexta: 08:00 às 18:00',
      opens: '08:00',
      closes: '18:00',
    },
    saturday: {
      display: 'Sábado: Fechado',
      opens: null,
      closes: null,
    },
    sunday: {
      display: 'Domingo: Fechado',
      opens: null,
      closes: null,
    },
    formatted: {
      short: 'Seg-Sex: 08:00-18:00',
      long: 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado',
    },
  },

  social: {
    instagram: {
      handle: '@saraivavision',
      url: 'https://instagram.com/saraivavision',
    },
    facebook: {
      handle: 'Saraiva Vision',
      url: 'https://facebook.com/saraivavision',
    },
    youtube: {
      handle: '@saraivavision',
      url: 'https://youtube.com/@saraivavision',
    },
  },

  doctor: {
    name: 'Dr. Philipe Saraiva Cruz',
    crm: 'CRM-MG 69.870',
    specialty: 'Oftalmologia',
    title: 'Oftalmologista',
    displayName: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
  },

  seo: {
    keywords: [
      'oftalmologista caratinga',
      'clínica oftalmológica caratinga mg',
      'consulta oftalmologia caratinga',
      'exame de vista caratinga',
      'saraiva vision',
    ],
    shortDescription: 'Clínica oftalmológica em Caratinga, MG',
    mediumDescription:
      'Clínica Saraiva Vision - Oftalmologia em Caratinga, MG. Consultas, exames e tratamentos com tecnologia de ponta.',
    longDescription:
      'Clínica Saraiva Vision oferece atendimento oftalmológico completo em Caratinga, MG. Sob a liderança do Dr. Philipe Saraiva Cruz (CRM-MG 69.870), oferecemos consultas, exames diagnósticos, adaptação de lentes de contato e tratamentos personalizados com tecnologia avançada e atendimento humanizado.',
  },
} as const;

export const generateWhatsAppURL = (message?: string | null): string => {
  const baseMessage = message || NAP_CANONICAL.phone.whatsapp.defaultMessage;
  return `${NAP_CANONICAL.phone.whatsapp.href}?text=${encodeURIComponent(baseMessage)}`;
};

export const getAddressForContext = (context: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  const formats = {
    short: NAP_CANONICAL.address.formatted.short,
    medium: NAP_CANONICAL.address.formatted.medium,
    long: NAP_CANONICAL.address.formatted.long,
    full: NAP_CANONICAL.address.full,
  };
  return formats[context] || formats.medium;
};

export const getPhoneDisplay = (format: 'display' | 'short' | 'e164' | 'raw' | 'href' = 'display'): string => {
  const formats = {
    display: NAP_CANONICAL.phone.primary.display,
    short: NAP_CANONICAL.phone.primary.displayShort,
    e164: NAP_CANONICAL.phone.primary.e164,
    raw: NAP_CANONICAL.phone.primary.raw,
    href: NAP_CANONICAL.phone.primary.href,
  };
  return formats[format] || formats.display;
};

export const getBusinessHours = (format: 'short' | 'long' = 'long'): string => {
  return format === 'short'
    ? NAP_CANONICAL.hours.formatted.short
    : NAP_CANONICAL.hours.formatted.long;
};

export const getBusinessName = (variant: 'legal' | 'display' | 'trade' = 'display'): string => {
  const names = {
    legal: NAP_CANONICAL.business.legalName,
    display: NAP_CANONICAL.business.displayName,
    trade: NAP_CANONICAL.business.tradeName,
  };
  return names[variant] || names.display;
};
