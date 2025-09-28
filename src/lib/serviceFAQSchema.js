// FAQ Schema markup for services - SEO structured data
import { clinicInfo } from './clinicInfo';

export const generateServiceFAQSchema = (serviceId, faqs, serviceTitle) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `${window.location.origin}/servicos/${serviceId}#faq-${index}`,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "author": {
          "@type": "Person",
          "name": clinicInfo.responsiblePhysician,
          "jobTitle": "Médico Oftalmologista",
          "worksFor": {
            "@type": "MedicalClinic",
            "name": clinicInfo.name,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": clinicInfo.address.street,
              "addressLocality": clinicInfo.address.city,
              "addressRegion": clinicInfo.address.state,
              "postalCode": clinicInfo.address.zip,
              "addressCountry": clinicInfo.address.country
            },
            "telephone": clinicInfo.phone,
            "url": window.location.origin
          }
        }
      }
    })),
    "about": {
      "@type": "MedicalProcedure",
      "name": serviceTitle,
      "description": `Informações sobre ${serviceTitle.toLowerCase()} na ${clinicInfo.name}`,
      "provider": {
        "@type": "MedicalClinic",
        "name": clinicInfo.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": clinicInfo.address.street,
          "addressLocality": clinicInfo.address.city,
          "addressRegion": clinicInfo.address.state,
          "postalCode": clinicInfo.address.zip,
          "addressCountry": clinicInfo.address.country
        },
        "telephone": clinicInfo.phone,
        "email": clinicInfo.email,
        "url": window.location.origin,
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Credit Card", "Insurance"],
        "currenciesAccepted": "BRL"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Serviços",
          "item": `${window.location.origin}/servicos`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": serviceTitle,
          "item": `${window.location.origin}/servicos/${serviceId}`
        }
      ]
    },
    "publisher": {
      "@type": "MedicalOrganization",
      "name": clinicInfo.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/img/logo-saraiva-vision.svg`,
        "width": 300,
        "height": 100
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": clinicInfo.phone,
        "contactType": "Customer Service",
        "areaServed": "BR",
        "availableLanguage": "Portuguese"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinicInfo.address.street,
        "addressLocality": clinicInfo.address.city,
        "addressRegion": clinicInfo.address.state,
        "postalCode": clinicInfo.address.zip,
        "addressCountry": clinicInfo.address.country
      },
      "sameAs": [
        clinicInfo.instagram,
        clinicInfo.facebook,
        clinicInfo.linkedin
      ]
    },
    "dateCreated": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "inLanguage": "pt-BR",
    "audience": {
      "@type": "PeopleAudience",
      "geographicArea": {
        "@type": "Place",
        "name": "Caratinga, Minas Gerais, Brasil"
      }
    }
  };

  return schema;
};

export default generateServiceFAQSchema;