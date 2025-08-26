import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title, 
  description, 
  image,
  noindex = false,
  canonicalPath = null 
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  
  const currentLang = i18n.language || 'pt';
  const baseUrl = 'https://saraivavisao.com.br'; // Replace with your domain
  const currentPath = location.pathname;
  
  // Generate hreflang URLs
  const generateHreflangs = () => {
    const hreflangs = [];
    
    // Portuguese (default)
    const ptPath = currentPath.startsWith('/en') 
      ? currentPath.replace('/en', '') || '/'
      : currentPath;
    hreflangs.push({
      hreflang: 'pt-BR',
      href: `${baseUrl}${ptPath}`
    });
    hreflangs.push({
      hreflang: 'pt',
      href: `${baseUrl}${ptPath}`
    });
    
    // English
    const enPath = currentPath.startsWith('/en') 
      ? currentPath 
      : `/en${currentPath}`;
    hreflangs.push({
      hreflang: 'en',
      href: `${baseUrl}${enPath}`
    });
    
    // Default hreflang
    hreflangs.push({
      hreflang: 'x-default',
      href: `${baseUrl}${ptPath}`
    });
    
    return hreflangs;
  };
  
  const hreflangs = generateHreflangs();
  const canonicalUrl = canonicalPath 
    ? `${baseUrl}${canonicalPath}`
    : `${baseUrl}${currentPath}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang Tags */}
      {hreflangs.map(({ hreflang, href }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={href}
        />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={currentLang === 'pt' ? 'pt_BR' : 'en_US'} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Language-specific structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          "name": currentLang === 'pt' ? "Saraiva Vision - Oftalmologia" : "Saraiva Vision - Ophthalmology",
          "description": description,
          "url": canonicalUrl,
          "inLanguage": currentLang === 'pt' ? 'pt-BR' : 'en',
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Dr. Camilo Soares, 159",
            "addressLocality": "Caratinga",
            "addressRegion": "MG",
            "postalCode": "35300-047",
            "addressCountry": "BR"
          },
          "telephone": "+55-33-99860-1427",
          "medicalSpecialty": currentLang === 'pt' ? "Oftalmologia" : "Ophthalmology"
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;