import { clinicInfo } from './clinicInfo.js';

const DEFAULT_BASE_URL = 'https://saraivavision.com.br';

const resolveBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/?$/, '');
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_BASE_URL) {
    return import.meta.env.VITE_SITE_BASE_URL.replace(/\/?$/, '');
  }

  if (typeof process !== 'undefined' && process.env?.VITE_SITE_BASE_URL) {
    return process.env.VITE_SITE_BASE_URL.replace(/\/?$/, '');
  }

  return DEFAULT_BASE_URL;
};

const BASE_URL = resolveBaseUrl();

const withPath = (path = '') => {
  if (!path || path === '/') {
    return `${BASE_URL}/`;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${BASE_URL}${path}`;
  }

  return `${BASE_URL}/${path}`;
};

const withHash = (hash) => {
  if (!hash) return `${BASE_URL}/`;
  const normalized = hash.replace(/^#/, '');
  return `${BASE_URL}/#${normalized}`;
};

// Gera schema para LocalBusiness + MedicalBusiness (duplo tipo para SEO)
export const generateLocalBusinessSchema = (language = 'pt', forGraph = false) => {
  const baseSchema = {
    '@type': ['LocalBusiness', 'MedicalBusiness', 'MedicalClinic'],
    '@id': withHash('localbusiness'),
    name: clinicInfo.name,
    legalName: clinicInfo.legalName,
    alternateName: 'Saraiva Vision',
    description: language === 'pt'
      ? 'Clínica oftalmológica especializada em consultas, exames e procedimentos oftalmológicos com tecnologia avançada em Caratinga/MG.'
      : 'Ophthalmology clinic specialized in consultations, exams and ophthalmological procedures with advanced technology in Caratinga/MG.',
    image: [
      'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
      withPath('/img/logo-saraiva-vision.svg'),
      withPath('/fachada.webp')
    ],
    logo: {
      '@type': 'ImageObject',
      url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
      width: 300,
      height: 300
    },
    url: withPath('/'),
    telephone: clinicInfo.phoneDisplay,
    email: clinicInfo.email,
    priceRange: 'R$ 100 - R$ 500',
    currenciesAccepted: 'BRL',
    paymentAccepted: 'Cash, Credit Card, Debit Card, Bank Transfer, PIX',
    taxID: clinicInfo.taxId,
    foundingDate: clinicInfo.foundingDate,
    medicalSpecialty: ['Ophthalmology'],
    
    // Localização e endereço detalhado
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${clinicInfo.streetAddress} – ${clinicInfo.neighborhood}`,
      addressLocality: clinicInfo.city,
      addressRegion: clinicInfo.state,
      postalCode: clinicInfo.postalCode,
      addressCountry: clinicInfo.country
    },
    
    // Coordenadas geográficas
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinicInfo.latitude,
      longitude: clinicInfo.longitude
    },
    
    // Horário de funcionamento (detalhado)
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '12:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '13:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '12:00'
      }
    ],
    
    // Área atendida
    areaServed: {
      '@type': 'State',
      name: 'Minas Gerais',
      containsPlace: [
        { '@type': 'City', name: 'Caratinga' },
        { '@type': 'City', name: 'Ipanema' },
        { '@type': 'City', name: 'Ubaporanga' },
        { '@type': 'City', name: 'Entre Folhas' }
      ]
    },
    
    // Equipe médica
    employee: [
      {
        '@type': 'Physician',
        '@id': withHash('physician'),
        name: clinicInfo.responsiblePhysician,
        jobTitle: language === 'pt' ? 'Oftalmologista' : 'Ophthalmologist',
        medicalSpecialty: 'Ophthalmology',
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'CRM',
          value: clinicInfo.responsiblePhysicianCRM
        },
        knowsAbout: [
          'Ophthalmology',
          'Contact Lens Fitting',
          'Retinal Diseases',
          'Glaucoma',
          'Cataract Surgery',
          'Refractive Surgery'
        ]
      },
      {
        '@type': 'Person',
        name: clinicInfo.responsibleNurse,
        jobTitle: language === 'pt' ? 'Enfermeira responsável' : 'Responsible Nurse',
        telephone: clinicInfo.responsibleNursePhone
      }
    ],
    
    // Serviços disponíveis (detalhados)
    availableService: (clinicInfo.servicesKeywords || []).map(service => ({
      '@type': 'MedicalProcedure',
      name: service,
      category: 'Ophthalmology'
    })),
    
    // Condições tratadas
    medicalConditionTreated: [
      'Myopia',
      'Hyperopia', 
      'Astigmatism',
      'Presbyopia',
      'Glaucoma',
      'Cataract',
      'Diabetic Retinopathy',
      'Macular Degeneration',
      'Dry Eye Syndrome',
      'Strabismus'
    ],
    
    // Avaliações agregadas
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
      bestRating: '5',
      worstRating: '1'
    },
    
    // Redes sociais e links relacionados
    sameAs: [
      clinicInfo.instagram,
      clinicInfo.facebook,
      clinicInfo.linkedin,
      withPath('/'),
      clinicInfo.chatbotUrl
    ],
    
    // Formas de contato
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: clinicInfo.phoneDisplay,
        contactType: 'customer service',
        availableLanguage: ['Portuguese', 'English'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00'
        }
      },
      {
        '@type': 'ContactPoint',
        telephone: clinicInfo.whatsapp,
        contactType: 'appointment booking',
        contactOption: 'TollFree'
      }
    ],
    
    // Informações de acessibilidade
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: language === 'pt' ? 'Equipamentos médicos avançados' : 'Advanced medical equipment',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification', 
        name: language === 'pt' ? 'Atendimento multilíngue' : 'Multilingual service',
        value: true
      }
    ],
    
    // Certificações e acreditações
    accreditation: [
      {
        '@type': 'EducationalOrganization',
        name: 'Conselho Federal de Medicina',
        url: 'https://portal.cfm.org.br/'
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Conselho Brasileiro de Oftalmologia',
        url: 'https://www.cbo.com.br/'
      }
    ]
  };
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    baseSchema['@context'] = 'https://schema.org';
  }
  
  return baseSchema;
};

// Manter função legacy para compatibilidade (alias para LocalBusiness)
export const generateMedicalClinicSchema = generateLocalBusinessSchema;

// Gera schema standalone para Physician (Dr. Philipe Saraiva)
export const generatePhysicianSchema = (language = 'pt', forGraph = false) => {
  const baseSchema = {
    '@type': 'Physician',
    '@id': withHash('physician'),
    name: clinicInfo.responsiblePhysician,
    alternateName: 'Dr. Philipe Saraiva',
    jobTitle: language === 'pt' ? 'Oftalmologista' : 'Ophthalmologist',
    description: language === 'pt'
      ? 'Oftalmologista especializado em cirurgias de catarata, glaucoma, adaptação de lentes de contato e tratamentos oftalmológicos avançados.'
      : 'Ophthalmologist specialized in cataract surgery, glaucoma, contact lens fitting and advanced ophthalmological treatments.',
    image: withPath('/img/dr-philipe-saraiva.jpg'),
    url: withPath('/sobre'),

    // Especialidade médica
    medicalSpecialty: [
      'Ophthalmology',
      'Cataract Surgery',
      'Glaucoma Treatment',
      'Contact Lens Fitting',
      'Retinal Diseases',
      'Refractive Surgery'
    ],

    // Áreas de conhecimento
    knowsAbout: [
      'Ophthalmology',
      'Cataract Surgery',
      'Glaucoma',
      'Contact Lens Fitting',
      'Retinal Diseases',
      'Diabetic Retinopathy',
      'Macular Degeneration',
      'Refractive Surgery',
      'Pediatric Ophthalmology',
      'Strabismus'
    ],

    // Credenciais profissionais
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'CRM',
        value: clinicInfo.responsiblePhysicianCRM
      }
    ],

    // Qualificações
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Medical License',
        name: language === 'pt' ? 'Registro no CRM-MG' : 'Medical License CRM-MG',
        issuedBy: {
          '@type': 'Organization',
          name: 'Conselho Regional de Medicina de Minas Gerais',
          url: 'https://www.crmmg.org.br/'
        }
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Medical Specialty',
        name: language === 'pt' ? 'Especialização em Oftalmologia' : 'Ophthalmology Specialty',
        issuedBy: {
          '@type': 'Organization',
          name: 'Conselho Brasileiro de Oftalmologia',
          url: 'https://www.cbo.com.br/'
        }
      }
    ],

    // Local de trabalho
    worksFor: {
      '@id': withHash('localbusiness')
    },

    // Afiliações profissionais
    memberOf: [
      {
        '@type': 'Organization',
        name: 'Conselho Brasileiro de Oftalmologia',
        url: 'https://www.cbo.com.br/'
      },
      {
        '@type': 'Organization',
        name: 'Sociedade Brasileira de Oftalmologia',
        url: 'https://www.sboportal.org.br/'
      }
    ],

    // Formas de contato
    telephone: clinicInfo.phoneDisplay,
    email: clinicInfo.email,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: clinicInfo.phoneDisplay,
      contactType: 'appointment booking',
      availableLanguage: ['Portuguese', 'English']
    },

    // Localização
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${clinicInfo.streetAddress} – ${clinicInfo.neighborhood}`,
      addressLocality: clinicInfo.city,
      addressRegion: clinicInfo.state,
      postalCode: clinicInfo.postalCode,
      addressCountry: clinicInfo.country
    },

    // Redes sociais
    sameAs: [
      clinicInfo.instagram,
      clinicInfo.linkedin,
      withPath('/sobre')
    ]
  };

  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    baseSchema['@context'] = 'https://schema.org';
  }

  return baseSchema;
};

// Gera schema para FAQ
export const generateFAQSchema = (faqItems, language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'FAQPage',
    '@id': withHash('faq'),
    about: {
      '@type': 'MedicalBusiness',
      name: clinicInfo.name
    },
    specialty: 'Ophthalmology',
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
      healthCondition: 'Eye Health and Vision Care'
    },
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    mainEntity: faqItems.map((item, index) => ({
      '@type': 'Question',
      '@id': `${withHash('faq')}/question-${index + 1}`,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        '@id': `${withHash('faq')}/answer-${index + 1}`,
        text: item.answer,
        dateCreated: item.dateCreated || new Date().toISOString().split('T')[0],
        author: {
          '@type': 'Physician',
          '@id': withHash('physician'),
          name: clinicInfo.responsiblePhysician
        }
      }
    }))
  };

  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }

  return schema;
};

// Gera schema para páginas de serviços específicos
export const generateMedicalProcedureSchema = (service, language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'MedicalProcedure',
    '@id': `${withPath(`/servicos/${service.id}`)}#procedure`,
    name: service.title,
    description: service.description,
    category: 'Ophthalmology',
    performer: {
      '@id': withHash('physician')
    },
    location: {
      '@id': withHash('clinic')
    }
  };
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }
  
  return schema;
};

// Gera schema para WebPage médica
export const generateMedicalWebPageSchema = (pageInfo, language = 'pt', forGraph = false) => {
  const pagePath = pageInfo.url || '/';
  const fullUrl = withPath(pagePath);
  const schema = {
    '@type': 'MedicalWebPage',
    '@id': `${fullUrl}#webpage`,
    name: pageInfo.title,
    description: pageInfo.description,
    url: fullUrl,
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': withHash('website'),
      name: 'Saraiva Vision',
      url: withPath('/')
    },
    about: {
      '@id': withHash('clinic')
    },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: language === 'pt' ? 'Pacientes' : 'Patients'
    },
    medicalAudience: {
      '@type': 'Patient'
    }
  };

  if (pageInfo.lastReviewed) {
    schema.lastReviewed = pageInfo.lastReviewed;
  }

  if (pageInfo.reviewedBy) {
    schema.reviewedBy = {
      '@type': 'Physician',
      name: pageInfo.reviewedBy.name,
      identifier: pageInfo.reviewedBy.crm,
    };
  }
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }
  
  return schema;
};

// Gera schema para breadcrumbs
export const generateBreadcrumbSchema = (breadcrumbs, forGraph = false) => {
  const schema = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: withPath(crumb.url)
    }))
  };
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }
  
  return schema;
};

// Gera schema para WebSite
export const generateWebSiteSchema = (language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'WebSite',
    '@id': withHash('website'),
    name: 'Saraiva Vision - Clínica Oftalmológica',
    alternateName: 'Saraiva Vision',
    description: language === 'pt' 
      ? 'Clínica oftalmológica especializada em consultas, exames e procedimentos oftalmológicos com tecnologia avançada em Caratinga/MG.'
      : 'Ophthalmology clinic specialized in consultations, exams and ophthalmological procedures with advanced technology in Caratinga/MG.',
    url: withPath('/'),
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    publisher: {
      '@id': withHash('clinic')
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?s={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }
  
  return schema;
};

// Gera schema para Organization (parent type)
export const generateOrganizationSchema = (language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'Organization',
    '@id': withHash('organization'),
    name: clinicInfo.name,
    legalName: clinicInfo.legalName,
    url: withPath('/'),
    logo: {
      '@type': 'ImageObject',
      '@id': withHash('logo'),
      url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
      contentUrl: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
      width: 300,
      height: 300,
      caption: 'Saraiva Vision Logo'
    },
    image: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
    telephone: clinicInfo.phoneDisplay,
    email: clinicInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${clinicInfo.streetAddress} – ${clinicInfo.neighborhood}`,
      addressLocality: clinicInfo.city,
      addressRegion: clinicInfo.state,
      postalCode: clinicInfo.postalCode,
      addressCountry: clinicInfo.country
    },
    sameAs: [
      clinicInfo.instagram,
      clinicInfo.facebook,
      clinicInfo.linkedin
    ]
  };
  
  // Se não for para @graph, adicionar @context
  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }
  
  return schema;
};

// Utilitário para injetar schema no head
export const generatePodcastSchema = (podcastData, language = 'pt', forGraph = false) => {
  const { episodes = [] } = podcastData;
  
  const podcastSchema = {
    '@type': 'PodcastSeries',
    '@id': `${withPath('/podcast')}#podcast`,
    name: language === 'pt' ? 'Podcast Saraiva Vision' : 'Saraiva Vision Podcast',
    description: language === 'pt' 
      ? 'Conteúdo especializado sobre saúde ocular para manter seus olhos sempre saudáveis com o Dr. Philipe Saraiva.'
      : 'Specialized content on eye health to keep your eyes always healthy with Dr. Philipe Saraiva.',
    url: withPath('/podcast'),
    image: episodes[0]?.cover || withPath('/Podcasts/Covers/podcast.jpg'),
    author: {
      '@type': 'Person',
      name: 'Dr. Philipe Saraiva',
      sameAs: withPath('/sobre'),
      jobTitle: language === 'pt' ? 'Oftalmologista' : 'Ophthalmologist',
      worksFor: {
        '@type': 'MedicalClinic',
        name: 'Clínica Saraiva Vision',
        url: withPath('/')
      }
    },
    genre: language === 'pt' ? 'Saúde e Medicina' : 'Health & Medicine',
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Clínica Saraiva Vision',
      url: withPath('/'),
      logo: {
        '@type': 'ImageObject',
        url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png'
      }
    },
    webFeed: `${withPath('/podcast')}/rss`
  };

  // Add podcast episodes
  if (episodes.length > 0) {
    podcastSchema.episode = episodes.map((episode, index) => ({
      '@type': 'PodcastEpisode',
      '@id': `${withPath(`/podcast/${episode.slug}`)}#episode`,
      name: episode.title,
      description: episode.description,
      url: withPath(`/podcast/${episode.slug}`),
      episodeNumber: episodes.length - index, // Reverse order for latest first
      datePublished: episode.date,
      duration: episode.duration,
      image: episode.cover,
      audio: episode.src ? {
        '@type': 'AudioObject',
        contentUrl: episode.src,
        encodingFormat: 'audio/mpeg'
      } : undefined,
      partOfSeries: {
        '@id': `${withPath('/podcast')}#podcast`
      },
      keywords: episode.tags?.join(', '),
      genre: episode.category,
      transcript: episode.transcript
    }));
  }

  if (forGraph) {
    return podcastSchema;
  }

  return {
    '@context': 'https://schema.org',
    ...podcastSchema
  };
};

// Gera schema para Produto de Lentes de Contato
export const generateContactLensProductSchema = (language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'Product',
    '@id': `${withPath('/lentes')}#product`,
    name: language === 'pt' ? 'Lentes de Contato com Assinatura - Saraiva Vision' : 'Contact Lens Subscription - Saraiva Vision',
    description: language === 'pt'
      ? 'Serviço de assinatura de lentes de contato com entrega regular, acompanhamento médico especializado e garantia de qualidade. Lentes premium certificadas pela ANVISA.'
      : 'Contact lens subscription service with regular delivery, specialized medical follow-up and quality guarantee. Premium lenses certified by ANVISA.',
    url: withPath('/lentes'),
    image: [
      withPath('/Videos/Hero-12.mp4'),
      withPath('/icons_social/consulta-aval.jpeg'),
      'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png'
    ],
    brand: {
      '@type': 'Brand',
      name: 'Saraiva Vision'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Saraiva Vision',
      url: withPath('/')
    },
    category: language === 'pt' ? 'Lentes de Contato / Equipamento Médico' : 'Contact Lenses / Medical Equipment',
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: 12,
      audienceType: language === 'pt' ? 'Pacientes com problemas de visão' : 'Patients with vision problems'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: '100.00',
      highPrice: '179.99',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: withPath('/planos'),
      seller: {
        '@type': 'MedicalBusiness',
        '@id': withHash('localbusiness'),
        name: clinicInfo.name
      },
      offerCount: 3
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '136',
      bestRating: '5',
      worstRating: '1'
    },
    medicalSpecialty: ['Ophthalmology'],
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Ophthalmology'
    },
    sameAs: [
      withPath('/lentes'),
      withPath('/planos')
    ]
  };

  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }

  return schema;
};

// Gera schema para Plano de Assinatura Individual
export const generateSubscriptionPlanSchema = (planData, language = 'pt', forGraph = false) => {
  const {
    id,
    name,
    price,
    features = [],
    description,
    badge
  } = planData;

  const priceMatch = price.match(/R\$\s*(\d+(?:,\d{2})?)/);
  const priceValue = priceMatch ? priceMatch[1].replace(',', '.') : '100.00';

  const schema = {
    '@type': 'Offer',
    '@id': `${withPath(`/planos#${id}`)}`,
    name: name,
    description: description,
    url: withPath(`/plano${id}`),
    priceCurrency: 'BRL',
    price: priceValue,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: priceValue,
      priceCurrency: 'BRL',
      billingDuration: {
        '@type': 'QuantitativeValue',
        value: 12,
        unitCode: 'MON'
      }
    },
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString().split('T')[0],
    priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    category: language === 'pt' ? 'Assinatura de Lentes de Contato' : 'Contact Lens Subscription',
    itemOffered: {
      '@type': 'Service',
      name: name,
      description: description,
      serviceType: language === 'pt' ? 'Assinatura de Lentes de Contato com Acompanhamento Médico' : 'Contact Lens Subscription with Medical Follow-up',
      provider: {
        '@type': 'MedicalBusiness',
        '@id': withHash('localbusiness'),
        name: clinicInfo.name
      },
      areaServed: {
        '@type': 'State',
        name: 'Minas Gerais'
      },
      audience: {
        '@type': 'PeopleAudience',
        audienceType: language === 'pt' ? 'Usuários de Lentes de Contato' : 'Contact Lens Users'
      }
    },
    seller: {
      '@type': 'MedicalBusiness',
      '@id': withHash('localbusiness'),
      name: clinicInfo.name
    },
    eligibleRegion: {
      '@type': 'Country',
      name: 'Brazil'
    },
    businessFunction: 'http://purl.org/goodrelations/v1#Sell'
  };

  // Adicionar features como additionalProperty
  if (features.length > 0) {
    schema.itemOffered.additionalProperty = features.map((feature, index) => ({
      '@type': 'PropertyValue',
      propertyID: `feature-${index + 1}`,
      name: language === 'pt' ? 'Benefício' : 'Benefit',
      value: feature
    }));
  }

  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }

  return schema;
};

// Gera schema para Catálogo de Ofertas (todos os planos)
export const generateOfferCatalogSchema = (plans, language = 'pt', forGraph = false) => {
  const schema = {
    '@type': 'OfferCatalog',
    '@id': `${withPath('/planos')}#catalog`,
    name: language === 'pt' ? 'Planos de Assinatura de Lentes de Contato' : 'Contact Lens Subscription Plans',
    description: language === 'pt'
      ? 'Conheça nossos planos de assinatura de lentes de contato com entrega regular, acompanhamento médico e economia garantida.'
      : 'Discover our contact lens subscription plans with regular delivery, medical follow-up and guaranteed savings.',
    url: withPath('/planos'),
    publisher: {
      '@type': 'MedicalBusiness',
      '@id': withHash('localbusiness'),
      name: clinicInfo.name
    },
    itemListElement: plans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateSubscriptionPlanSchema(plan, language, true)
    }))
  };

  if (!forGraph) {
    schema['@context'] = 'https://schema.org';
  }

  return schema;
};

export const injectSchema = (schema) => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);

  // Remove schema anterior se existir
  const existing = document.querySelector('script[data-schema-type="dynamic"]');
  if (existing) {
    existing.remove();
  }

  script.setAttribute('data-schema-type', 'dynamic');
  document.head.appendChild(script);
};