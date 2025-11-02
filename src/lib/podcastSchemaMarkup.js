/**
 * Podcast Schema.org Structured Data
 * SEO-optimized markup for podcast episodes and series
 */

/**
 * Generate PodcastSeries schema
 */
export function generatePodcastSeriesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'Saúde Ocular em Foco - Podcast Saraiva Vision',
    description: 'Podcast sobre saúde ocular, doenças oftalmológicas, cirurgias e tratamentos. Dr. Philipe Saraiva, oftalmologista em Caratinga, MG, compartilha conhecimento sobre cuidados com a visão.',
    url: 'https://saraivavision.com.br/podcast',
    image: 'https://saraivavision.com.br/Podcasts/podcast-cover.jpg',
    author: {
      '@type': 'Person',
      name: 'Dr. Philipe Saraiva Cruz',
      jobTitle: 'Oftalmologista',
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
      },
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'CRM-MG',
        value: '69870'
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Clínica Saraiva Vision',
      logo: {
        '@type': 'ImageObject',
        url: 'https://saraivavision.com.br/logo.png',
        width: 300,
        height: 60
      }
    },
    genre: ['Health', 'Medical', 'Ophthalmology', 'Education'],
    inLanguage: 'pt-BR'
  };
}

/**
 * Generate PodcastEpisode schema
 */
export function generatePodcastEpisodeSchema(episode) {
  if (!episode) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episode.title,
    description: episode.description,
    url: `https://saraivavision.com.br/podcast/${episode.slug}`,
    datePublished: episode.date,
    duration: episode.duration,
    image: episode.cover ? `https://saraivavision.com.br${episode.cover}` : undefined,

    // Podcast Series
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: 'Saúde Ocular em Foco - Podcast Saraiva Vision',
      url: 'https://saraivavision.com.br/podcast'
    },

    // Author
    author: {
      '@type': 'Person',
      name: 'Dr. Philipe Saraiva Cruz',
      jobTitle: 'Oftalmologista',
      url: 'https://saraivavision.com.br/equipe/dr-philipe-saraiva'
    },

    // Publisher
    publisher: {
      '@type': 'Organization',
      name: 'Clínica Saraiva Vision',
      logo: {
        '@type': 'ImageObject',
        url: 'https://saraivavision.com.br/logo.png'
      }
    },

    // Keywords from transcript
    keywords: episode.transcript?.keywords?.join(', '),

    // About (Medical topics)
    about: episode.tags.map(tag => ({
      '@type': 'Thing',
      name: tag
    })),

    // Genre
    genre: episode.category,

    // Language
    inLanguage: 'pt-BR'
  };

  // Add associatedMedia if audio file exists
  if (episode.src) {
    schema.associatedMedia = {
      '@type': 'MediaObject',
      contentUrl: `https://saraivavision.com.br${episode.src}`,
      encodingFormat: 'audio/mpeg',
      duration: episode.duration
    };
  }

  // Add Spotify external link
  if (episode.spotifyUrl) {
    schema.url = episode.spotifyUrl;
  }

  return schema;
}

/**
 * Generate WebPage schema for podcast page
 */
export function generatePodcastWebPageSchema(episode) {
  if (!episode) {
    // Podcast main page
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Podcast Saúde Ocular em Foco | Saraiva Vision',
      description: 'Podcast sobre oftalmologia, saúde ocular e tratamentos. Dr. Philipe Saraiva em Caratinga, MG.',
      url: 'https://saraivavision.com.br/podcast',
      mainEntity: generatePodcastSeriesSchema(),
      specialty: 'Ophthalmology',
      audience: {
        '@type': 'PeopleAudience',
        audienceType: 'Patients and General Public',
        geographicArea: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Caratinga',
            addressRegion: 'MG',
            addressCountry: 'BR'
          }
        }
      }
    };
  }

  // Individual episode page
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${episode.title} | Podcast Saraiva Vision`,
    description: episode.description,
    url: `https://saraivavision.com.br/podcast/${episode.slug}`,
    mainEntity: generatePodcastEpisodeSchema(episode),
    specialty: 'Ophthalmology',
    audience: {
      '@type': 'PeopleAudience',
      audienceType: 'Patients seeking ophthalmology information',
      geographicArea: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Caratinga',
          addressRegion: 'MG',
          addressCountry: 'BR'
        }
      }
    },
    // Add medical condition if applicable
    ...(episode.tags.includes('catarata') && {
      about: {
        '@type': 'MedicalCondition',
        name: 'Catarata',
        alternateName: 'Cataract',
        associatedAnatomy: {
          '@type': 'AnatomicalStructure',
          name: 'Cristalino'
        }
      }
    })
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generatePodcastBreadcrumbSchema(episode) {
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://saraivavision.com.br'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Podcast',
      item: 'https://saraivavision.com.br/podcast'
    }
  ];

  if (episode) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: episode.title,
      item: `https://saraivavision.com.br/podcast/${episode.slug}`
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
  };
}

/**
 * Generate complete schema bundle for podcast page
 */
export function generatePodcastSchemaBundle(episode = null) {
  const schemas = [
    generatePodcastWebPageSchema(episode),
    generatePodcastBreadcrumbSchema(episode)
  ];

  if (!episode) {
    // Main podcast page
    schemas.push(generatePodcastSeriesSchema());
  } else {
    // Individual episode page
    schemas.push(generatePodcastEpisodeSchema(episode));
  }

  return schemas;
}

/**
 * Generate LocalBusiness schema for podcast page footer
 */
export function generatePodcastLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Clínica Saraiva Vision',
    description: 'Clínica oftalmológica em Caratinga, MG. Cirurgias de catarata, pterígio, cirurgia refrativa e tratamentos oculares.',
    url: 'https://saraivavision.com.br',
    telephone: '+55-33-99860-1427',
    email: 'contato@saraivavision.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Catarina Maria Passos, 97',
      addressLocality: 'Caratinga',
      addressRegion: 'MG',
      postalCode: '35300-000',
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -19.7887,
      longitude: -42.1372
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    medicalSpecialty: 'Ophthalmology',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: -19.7887,
        longitude: -42.1372
      },
      geoRadius: '50000' // 50km radius
    }
  };
}

export default {
  generatePodcastSeriesSchema,
  generatePodcastEpisodeSchema,
  generatePodcastWebPageSchema,
  generatePodcastBreadcrumbSchema,
  generatePodcastSchemaBundle,
  generatePodcastLocalBusinessSchema
};
