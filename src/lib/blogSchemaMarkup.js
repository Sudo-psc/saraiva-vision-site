/**
 * Blog Schema Markup Generator
 * Generates Schema.org structured data for blog posts
 */

const resolveImageUrl = (image) => {
  if (!image) return null;
  return image.startsWith('http') ? image : `https://saraivavision.com.br${image}`;
};

export function generateMedicalWebPageSchema(post, url) {
  const imageUrl = resolveImageUrl(post.image) || 'https://saraivavision.com.br/logo.png';
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': url,
    url: url,
    name: post.title,
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt,
    keywords: post.seo?.keywords || post.tags?.join(', '),
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: {
      '@type': 'Physician',
      name: post.author,
      medicalSpecialty: 'Ophthalmology',
      affiliation: {
        '@type': 'MedicalClinic',
        name: 'Clínica Saraiva Vision',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rua Catarina Maria Passos, 97',
          addressLocality: 'Caratinga',
          addressRegion: 'MG',
          postalCode: '35300-299',
          addressCountry: 'BR'
        },
        telephone: '+55-33-99860-1427',
        url: 'https://saraivavision.com.br'
      }
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'Clínica Saraiva Vision',
      logo: {
        '@type': 'ImageObject',
        url: 'https://saraivavision.com.br/logo.png'
      }
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      caption: post.title
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    about: {
      '@type': 'MedicalEntity',
      name: 'Saúde Ocular',
      medicalSpecialty: 'Ophthalmology'
    },
    audience: {
      '@type': 'PatientsAudience',
      suggestedMinAge: 0,
      geographicArea: {
        '@type': 'AdministrativeArea',
        name: 'Caratinga, Minas Gerais, Brasil'
      }
    }
  };
}

/**
 * Generate Article schema for blog posts
 * @param {Object} post - Blog post data
 * @param {string} url - Full URL of the post
 * @returns {Object} - Schema.org Article markup
 */
export function generateArticleSchema(post, url) {
  const imageUrl = resolveImageUrl(post.image) || 'https://saraivavision.com.br/logo.png';
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalScholarlyArticle',
    '@id': url,
    headline: post.title,
    alternativeHeadline: post.excerpt,
    description: post.seo?.metaDescription || post.excerpt,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: {
      '@type': 'Physician',
      name: post.author,
      medicalSpecialty: 'Ophthalmology',
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'Faculdade de Medicina'
      }
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'Clínica Saraiva Vision',
      logo: {
        '@type': 'ImageObject',
        url: 'https://saraivavision.com.br/logo.png'
      }
    },
    mainEntityOfPage: url,
    articleSection: post.category,
    keywords: post.tags?.join(', ') || post.seo?.keywords,
    articleBody: extractTextFromContent(post.content),
    about: {
      '@type': 'MedicalCondition',
      name: 'Saúde Ocular'
    }
  };
}

/**
 * Generate BreadcrumbList schema for blog navigation
 * @param {Object} post - Blog post data
 * @returns {Object} - Schema.org BreadcrumbList markup
 */
export function generateBreadcrumbSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://saraivavision.com.br'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://saraivavision.com.br/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://saraivavision.com.br/blog/${post.slug}`
      }
    ]
  };
}

/**
 * Generate FAQPage schema from post content
 * @param {Array} faqs - Array of FAQ objects {question, answer}
 * @returns {Object} - Schema.org FAQPage markup
 */
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate Physician schema for author
 * @param {string} authorName - Author name
 * @returns {Object} - Schema.org Physician markup
 */
export function generatePhysicianSchema(authorName = 'Dr. Philipe Saraiva Cruz') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: authorName,
    medicalSpecialty: 'Ophthalmology',
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'CRM-MG',
      value: '69870'
    },
    worksFor: {
      '@type': 'MedicalClinic',
      name: 'Clínica Saraiva Vision',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Catarina Maria Passos, 97',
        addressLocality: 'Caratinga',
        addressRegion: 'MG',
        postalCode: '35300-000',
        addressCountry: 'BR'
      },
      telephone: '+55-33-99860-1427',
      url: 'https://saraivavision.com.br'
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Faculdade de Medicina'
    }
  };
}

/**
 * Generate MedicalCondition schema for disease-specific posts
 * @param {Object} condition - Condition details
 * @returns {Object} - Schema.org MedicalCondition markup
 */
export function generateMedicalConditionSchema(condition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    alternateName: condition.alternateName,
    description: condition.description,
    possibleTreatment: condition.treatments?.map(treatment => ({
      '@type': 'MedicalTherapy',
      name: treatment
    })),
    riskFactor: condition.riskFactors?.map(risk => ({
      '@type': 'MedicalRiskFactor',
      name: risk
    })),
    signOrSymptom: condition.symptoms?.map(symptom => ({
      '@type': 'MedicalSymptom',
      name: symptom
    }))
  };
}

/**
 * Generate MedicalProcedure schema for surgical posts
 * @param {Object} procedure - Procedure details
 * @returns {Object} - Schema.org MedicalProcedure markup
 */
export function generateMedicalProcedureSchema(procedure) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: procedure.name,
    alternateName: procedure.alternateName,
    description: procedure.description,
    procedureType: 'Surgical',
    bodyLocation: {
      '@type': 'BodyPart',
      name: 'Olho'
    },
    preparation: procedure.preparation,
    followup: procedure.followup,
    howPerformed: procedure.howPerformed
  };
}

/**
 * Extract plain text from HTML content (simplified)
 * @param {string} htmlContent - HTML content
 * @returns {string} - Plain text
 */
function extractTextFromContent(content) {
  if (!content) return '';
  if (Array.isArray(content)) {
    const text = content
      .filter(block => block?._type === 'block')
      .map(block => Array.isArray(block.children) ? block.children.map(child => child.text).join(' ') : '')
      .join(' ');
    return text.replace(/\s+/g, ' ').trim().substring(0, 1000);
  }

  return content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1000);
}

/**
 * Generate complete schema bundle for a blog post
 * @param {Object} post - Blog post data
 * @param {Array} faqs - Optional FAQs from post
 * @returns {Array} - Array of schema objects
 */
export function generateCompleteSchemaBundle(post, faqs = null) {
  const url = `https://saraivavision.com.br/blog/${post.slug}`;
  const schemas = [
    generateMedicalWebPageSchema(post, url),
    generateArticleSchema(post, url),
    generateBreadcrumbSchema(post)
  ];

  // Add FAQ schema if FAQs provided
  if (faqs && faqs.length > 0) {
    const faqSchema = generateFAQSchema(faqs);
    if (faqSchema) schemas.push(faqSchema);
  }

  return schemas;
}

/**
 * Map specific posts to condition/procedure schemas
 * @param {number} postId - Post ID
 * @returns {Object|null} - Additional schema or null
 */
export function getPostSpecificSchema(postId) {
  const schemaMap = {
    // Catarata posts
    8: generateMedicalConditionSchema({
      name: 'Catarata',
      alternateName: 'Opacificação do Cristalino',
      description: 'Opacificação progressiva do cristalino que compromete a visão',
      treatments: ['Cirurgia de Facoemulsificação', 'Implante de Lente Intraocular'],
      symptoms: ['Visão embaçada', 'Sensibilidade à luz', 'Dificuldade de enxergar à noite'],
      riskFactors: ['Idade avançada', 'Diabetes', 'Exposição solar excessiva']
    }),

    7: generateMedicalProcedureSchema({
      name: 'Cirurgia de Catarata com Lentes Premium',
      alternateName: 'Facoemulsificação com IOL Premium',
      description: 'Procedimento cirúrgico para remoção de catarata com implante de lentes intraoculares multifocais ou tóricas',
      preparation: 'Exames pré-operatórios, jejum de 8 horas',
      followup: 'Acompanhamento nos primeiros 30 dias',
      howPerformed: 'Técnica de facoemulsificação com incisão mínima'
    }),

    // Glaucoma
    12: generateMedicalConditionSchema({
      name: 'Glaucoma',
      description: 'Doença que danifica o nervo óptico, geralmente causada por pressão intraocular elevada',
      treatments: ['Colírios hipotensores', 'Laser trabeculoplastia', 'Cirurgia de drenagem'],
      symptoms: ['Perda visual periférica', 'Dor ocular', 'Visão embaçada'],
      riskFactors: ['Histórico familiar', 'Idade acima de 60 anos', 'Miopia alta']
    }),

    // Retinoblastoma
    22: generateMedicalConditionSchema({
      name: 'Retinoblastoma',
      alternateName: 'Tumor Ocular Infantil',
      description: 'Câncer ocular maligno mais comum na infância, originado nas células da retina',
      treatments: ['Quimioterapia', 'Radioterapia', 'Fotocoagulação a laser', 'Enucleação'],
      symptoms: ['Leucocoria (reflexo branco da pupila)', 'Estrabismo', 'Vermelhidão ocular'],
      riskFactors: ['Mutação genética no gene RB1', 'Histórico familiar']
    }),

    // Cirurgia Refrativa
    5: generateMedicalProcedureSchema({
      name: 'Cirurgia Refrativa a Laser',
      alternateName: 'LASIK, PRK, SMILE',
      description: 'Procedimento para correção de miopia, hipermetropia e astigmatismo através de remodelagem da córnea',
      preparation: 'Suspensão de lentes de contato, exames de topografia corneana',
      followup: 'Retornos frequentes no primeiro mês',
      howPerformed: 'Ablação a laser da córnea com femtossegundo'
    })
  };

  return schemaMap[postId] || null;
}

export default {
  generateMedicalWebPageSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePhysicianSchema,
  generateMedicalConditionSchema,
  generateMedicalProcedureSchema,
  generateCompleteSchemaBundle,
  getPostSpecificSchema
};
