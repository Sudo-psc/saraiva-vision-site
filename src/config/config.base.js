/**
 * Configuração Centralizada - Saraiva Vision
 *
 * Sistema unificado de configuração que centraliza todas as variáveis
 * de ambiente, dados da clínica (NAP), internacionalização, tema e recursos.
 *
 * @version 1.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

// ============================================================================
// UTILITÁRIOS DE AMBIENTE
// ============================================================================

/**
 * Obtém variável de ambiente com suporte a fallback
 * @param {string} key - Nome da variável
 * @param {string} defaultValue - Valor padrão
 * @returns {string}
 */
const getEnv = (key, defaultValue = '') => {
  // Next.js usa process.env (tanto server quanto client com NEXT_PUBLIC_ prefix)
  // Tentar primeiro com NEXT_PUBLIC_ prefix para variáveis do cliente
  const nextPublicKey = `NEXT_PUBLIC_${key.replace('VITE_', '')}`;
  const value = process.env?.[nextPublicKey] || process.env?.[key];

  return value || defaultValue;
};

/**
 * Verifica se está em ambiente de produção
 * @returns {boolean}
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Verifica se está em ambiente de desenvolvimento
 * @returns {boolean}
 */
const isDevelopment = () => {
  return getEnv('NODE_ENV') === 'development' ||
         getEnv('MODE') === 'development';
};

// ============================================================================
// 1. SITE METADATA
// ============================================================================

const site = {
  name: 'Saraiva Vision',
  legalName: 'Clínica Saraiva Vision',
  domain: 'saraivavision.com.br',
  baseUrl: getEnv('VITE_BASE_URL', 'https://saraivavision.com.br'),

  // Build info
  buildVersion: '3.3.0',
  buildDate: '2025-10-18',

  // Redes sociais
  social: {
    instagram: {
      handle: '@saraiva_vision',
      url: 'https://www.instagram.com/saraiva_vision/'
    },
    facebook: {
      handle: 'philipeoftalmo',
      url: 'https://www.facebook.com/philipeoftalmo'
    },
    linkedin: {
      handle: 'dr-philipe-saraiva',
      url: 'https://www.linkedin.com/in/dr-philipe-saraiva/'
    },
    twitter: {
      handle: '@philipe_saraiva',
      url: 'https://x.com/philipe_saraiva'
    },
    spotify: {
      handle: 'Saraiva Vision Podcast',
      url: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV'
    }
  },

  // APIs externas
  apis: {
    googleMaps: {
      apiKey: getEnv('VITE_GOOGLE_MAPS_API_KEY'),
      placesApiKey: getEnv('VITE_GOOGLE_PLACES_API_KEY'),
      placeId: getEnv('VITE_GOOGLE_PLACE_ID', 'ChIJVUKww7WRugARF7u2lAe7BeE')
    },
    supabase: {
      url: getEnv('VITE_SUPABASE_URL'),
      anonKey: getEnv('VITE_SUPABASE_ANON_KEY')
    },
    gemini: {
      apiKey: getEnv('VITE_GOOGLE_GEMINI_API_KEY')
    }
  }
};

// ============================================================================
// 2. BUSINESS DATA (NAP Canônico)
// ============================================================================

const business = {
  // Nome (Name)
  name: 'Clínica Saraiva Vision',
  legalName: 'Clínica Saraiva Vision',
  displayName: 'Saraiva Vision',
  tradeName: 'Saraiva Vision',
  type: 'Ophthalmology Clinic',
  medicalSpecialty: 'Oftalmologia',
  priceRange: '$$',
  founded: '2020',
  slogan: 'Cuidando da sua visão com tecnologia e humanização',
  taxId: '53.864.119/0001-79',
  foundingDate: '2024-02-08',

  // Endereço (Address)
  address: {
    street: 'Rua Catarina Maria Passos',
    number: '97',
    neighborhood: 'Santa Zita',
    city: 'Caratinga',
    state: 'MG',
    stateCode: 'MG',
    postalCode: '35300-299',
    country: 'Brasil',
    countryCode: 'BR',

    // Coordenadas geográficas
    geo: {
      latitude: -19.7890206,
      longitude: -42.1347583
    },

    // Formatações pré-computadas
    formatted: {
      short: 'Rua Catarina Maria Passos, 97 - Caratinga/MG',
      medium: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG',
      long: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299',
      full: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299',
      singleLine: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG 35300-299'
    }
  },

  // Telefone (Phone)
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
      national: '(033) 99860-1427'
    },
    whatsapp: {
      raw: '5533998601427',
      e164: '+5533998601427',
      display: '+55 33 99860-1427',
      href: 'https://wa.me/message/2QFZJG3EDJZVF1',
      defaultMessage: 'Olá! Gostaria de agendar uma consulta.'
    }
  },

  // Email
  email: {
    primary: 'contato@saraivavision.com.br',
    contact: 'contato@saraivavision.com.br',
    support: 'contato@saraivavision.com.br',
    appointments: 'contato@saraivavision.com.br',
    href: 'mailto:contato@saraivavision.com.br'
  },

  // Horário de funcionamento
  hours: {
    weekdays: {
      display: 'Segunda a Sexta: 08:00 às 18:00',
      opens: '08:00',
      closes: '18:00'
    },
    saturday: {
      display: 'Sábado: Fechado',
      opens: null,
      closes: null
    },
    sunday: {
      display: 'Domingo: Fechado',
      opens: null,
      closes: null
    },
    formatted: {
      short: 'Seg-Sex: 08:00-18:00',
      long: 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado'
    }
  },

  // Médico responsável (CFM compliance)
  doctor: {
    name: 'Dr. Philipe Saraiva Cruz',
    crm: 'CRM-MG 69.870',
    specialty: 'Oftalmologia',
    title: 'Oftalmologista',
    displayName: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
    role: 'Responsável Técnico Médico'
  },

  // Equipe (LGPD compliance)
  team: {
    nurse: {
      name: 'Ana Lúcia',
      coren: 'COREN-MG 834184',
      role: 'Enfermeira',
      phone: '+55 33 98420-7437'
    }
  },

  // URLs importantes
  urls: {
    onlineScheduling: 'https://www.saraivavision.com.br/agendamento',
    chatbot: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica',
    googleMapsProfile: `https://www.google.com/maps/place/?q=place_id:${getEnv('VITE_GOOGLE_PLACE_ID', 'ChIJVUKww7WRugARF7u2lAe7BeE')}`,
    googleReview: `https://search.google.com/local/writereview?placeid=${getEnv('VITE_GOOGLE_PLACE_ID', 'ChIJVUKww7WRugARF7u2lAe7BeE')}`
  },

  // Palavras-chave de serviços
  servicesKeywords: [
    'Consultas oftalmológicas',
    'Exames de refração',
    'Tratamentos especializados',
    'Cirurgias oftalmológicas',
    'Oftalmologia pediátrica',
    'Laudos especializados'
  ],

  // SEO
  seo: {
    keywords: [
      'oftalmologista caratinga',
      'clínica oftalmológica caratinga mg',
      'consulta oftalmologia caratinga',
      'exame de vista caratinga',
      'saraiva vision'
    ],
    shortDescription: 'Clínica oftalmológica em Caratinga, MG',
    mediumDescription: 'Clínica Saraiva Vision - Oftalmologia em Caratinga, MG. Consultas, exames e tratamentos com tecnologia de ponta.',
    longDescription: 'Clínica Saraiva Vision oferece atendimento oftalmológico completo em Caratinga, MG. Sob a liderança do Dr. Philipe Saraiva Cruz (CRM-MG 69.870), oferecemos consultas, exames diagnósticos, adaptação de lentes de contato e tratamentos personalizados com tecnologia avançada e atendimento humanizado.'
  }
};

// ============================================================================
// 3. INTERNACIONALIZAÇÃO (i18n)
// ============================================================================

const i18n = {
  defaultLocale: getEnv('VITE_DEFAULT_LOCALE', 'pt-br'),
  supportedLocales: ['pt-br', 'en-us'],
  namespaces: ['translation', 'common'],

  // Configurações de formatação
  formats: {
    date: {
      'pt-br': 'dd/MM/yyyy',
      'en-us': 'MM/dd/yyyy'
    },
    time: {
      'pt-br': 'HH:mm',
      'en-us': 'hh:mm a'
    },
    currency: {
      'pt-br': 'BRL',
      'en-us': 'USD'
    }
  }
};

// ============================================================================
// 4. TEMA E DESIGN
// ============================================================================

const theme = {
  colors: {
    primary: '#0066CC',
    secondary: '#00A86B',
    accent: '#FF6B35',
    background: '#FFFFFF',
    text: '#333333'
  },

  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'Roboto, sans-serif',
    monospace: 'Fira Code, monospace'
  },

  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  }
};

// ============================================================================
// 5. SEO DEFAULTS
// ============================================================================

const seo = {
  defaultTitle: 'Saraiva Vision - Clínica Oftalmológica em Caratinga/MG',
  titleTemplate: '%s | Saraiva Vision',
  defaultDescription: 'Clínica oftalmológica em Caratinga, MG. Consultas, exames e tratamentos com tecnologia de ponta e atendimento humanizado.',

  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Saraiva Vision',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Saraiva Vision - Clínica Oftalmológica'
      }
    ]
  },

  twitter: {
    handle: '@philipe_saraiva',
    cardType: 'summary_large_image'
  }
};

// ============================================================================
// 6. ANALYTICS E TRACKING
// ============================================================================

const tracking = {
  googleAnalytics: {
    enabled: isProduction(),
    measurementId: getEnv('VITE_GA_ID', 'G-LXWRK8ELS6')
  },

  googleTagManager: {
    enabled: isProduction(),
    containerId: getEnv('VITE_GTM_ID', 'GTM-KF2NP85D')
  },

  postHog: {
    enabled: isProduction(),
    apiKey: getEnv('VITE_POSTHOG_KEY', 'phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp'),
    apiHost: getEnv('VITE_POSTHOG_HOST', 'https://app.posthog.com')
  },

  metaPixel: {
    enabled: false,
    pixelId: ''
  }
};

// ============================================================================
// 7. FEATURE FLAGS
// ============================================================================

const featureFlags = {
  // Widgets
  accessibilityWidget: true,
  stickyCta: true,
  ctaModal: true,
  toaster: true,
  cookieManager: true,
  serviceWorkerNotification: true,

  // Features
  lazyWidgets: true,
  blogSearch: true,
  podcastPlayer: true,
  instagramFeed: true,
  googleReviews: true,

  // Experimental
  experimentalFeatures: isDevelopment()
};

// ============================================================================
// 8. COMPLIANCE (LGPD + CFM)
// ============================================================================

const compliance = {
  lgpd: {
    enabled: true,
    dpoEmail: 'dpo@saraivavision.com.br',
    privacyPolicyUrl: '/politica-privacidade',
    termsOfServiceUrl: '/termos-uso',
    cookiePolicyUrl: '/politica-cookies',

    // Configurações de criptografia
    encryption: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2'
    }
  },

  cfm: {
    enabled: true,
    responsiblePhysician: 'Dr. Philipe Saraiva Cruz',
    crm: 'CRM-MG 69.870',

    // Validações CFM
    validations: {
      requireMedicalDisclaimer: true,
      validateMedicalContent: true,
      preventUnverifiedClaims: true
    }
  }
};

// ============================================================================
// 9. PERFORMANCE E OTIMIZAÇÃO
// ============================================================================

const performance = {
  // Code splitting
  codeSplitting: {
    enabled: true,
    chunkSizeLimit: 200 * 1024 // 200KB
  },

  // Lazy loading
  lazyLoading: {
    images: true,
    routes: true,
    components: true
  },

  // Cache
  cache: {
    staticAssets: 86400, // 24 horas
    apiResponses: 3600,  // 1 hora
    images: 604800       // 7 dias
  },

  // Prerendering
  prerendering: {
    enabled: true,
    routes: ['/', '/sobre', '/servicos', '/contato', '/blog']
  }
};

// ============================================================================
// CONFIGURAÇÃO COMPLETA EXPORTADA
// ============================================================================

export const config = {
  // Metadata de ambiente
  environment: isProduction() ? 'production' : 'development',
  version: '1.0.0',
  buildDate: new Date().toISOString(),

  // Seções principais
  site,
  business,
  i18n,
  theme,
  seo,
  tracking,
  featureFlags,
  compliance,
  performance,

  // Utilitários
  utils: {
    isProduction,
    isDevelopment,
    getEnv
  }
};

// Export default para compatibilidade
export default config;

// Exports nomeados para uso específico
export {
  site,
  business,
  i18n,
  theme,
  seo,
  tracking,
  featureFlags,
  compliance,
  performance,
  isProduction,
  isDevelopment,
  getEnv
};
