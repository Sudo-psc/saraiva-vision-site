import { clinicInfo } from './clinicInfo.js';

// Gera schema markup para MedicalClinic seguindo as melhores práticas
export const generateMedicalClinicSchema = (language = 'pt') => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': 'https://saraivavision.com.br/#clinic',
    name: clinicInfo.name,
    legalName: clinicInfo.legalName,
    description: language === 'pt' 
      ? 'Clínica oftalmológica especializada em consultas, exames e procedimentos oftalmológicos com tecnologia avançada em Caratinga/MG.'
      : 'Ophthalmology clinic specialized in consultations, exams and ophthalmological procedures with advanced technology in Caratinga/MG.',
    image: [
      'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png'
    ],
    logo: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png',
    url: 'https://saraivavision.com.br/',
    telephone: clinicInfo.phoneDisplay,
    email: clinicInfo.email,
    priceRange: 'R$',
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
    
    // Horário de funcionamento
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00'
    }],
    
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
        '@id': 'https://saraivavision.com.br/#physician',
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
    availableService: clinicInfo.servicesKeywords.map(service => ({
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
  
  return baseSchema;
};

// Gera schema para FAQ
export const generateFAQSchema = (faqItems, language = 'pt') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://saraivavision.com.br/#faq',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
};

// Gera schema para páginas de serviços específicos
export const generateMedicalProcedureSchema = (service, language = 'pt') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `https://saraivavision.com.br/servico/${service.id}#procedure`,
    name: service.title,
    description: service.description,
    category: 'Ophthalmology',
    performer: {
      '@id': 'https://saraivavision.com.br/#physician'
    },
    location: {
      '@id': 'https://saraivavision.com.br/#clinic'
    }
  };
};

// Gera schema para WebPage médica
export const generateMedicalWebPageSchema = (pageInfo, language = 'pt') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `https://saraivavision.com.br${pageInfo.url}#webpage`,
    name: pageInfo.title,
    description: pageInfo.description,
    url: `https://saraivavision.com.br${pageInfo.url}`,
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://saraivavision.com.br/#website',
      name: 'Saraiva Vision',
      url: 'https://saraivavision.com.br/'
    },
    about: {
      '@id': 'https://saraivavision.com.br/#clinic'
    },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: language === 'pt' ? 'Pacientes' : 'Patients'
    },
    medicalAudience: {
      '@type': 'Patient'
    }
  };
};

// Gera schema para breadcrumbs
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://saraivavision.com.br${crumb.url}`
    }))
  };
};

// Utilitário para injetar schema no head
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