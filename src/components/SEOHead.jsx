import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { validateMedicalSchema, logSchemaValidation } from '@/utils/schemaValidator';

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  structuredData,
  noindex = false,
  alternateUrls = {},
  author = 'Dr. Philipe Saraiva Cruz'
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const baseUrl = 'https://saraivavision.com.br';
  
  // Meta tags otimizadas para clínicas médicas
  const metaTags = [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' },
    
    // Meta tags médicas específicas
    { name: 'medical-specialty', content: 'Ophthalmology' },
    { name: 'medical-location', content: 'Caratinga, MG, Brazil' },
    { name: 'medical-certification', content: 'CRM-MG 69.870' },
    
    // Geo tags para SEO local
    { name: 'geo.region', content: 'BR-MG' },
    { name: 'geo.placename', content: 'Caratinga' },
    { name: 'geo.position', content: '-19.7868;-42.1392' },
    { name: 'ICBM', content: '-19.7868, -42.1392' },
    
    // Open Graph otimizado
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: ogType },
    { property: 'og:url', content: canonicalUrl || baseUrl },
    { property: 'og:image', content: ogImage || `${baseUrl}/og-image.jpg` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Clínica Saraiva Vision - Oftalmologia em Caratinga' },
    { property: 'og:site_name', content: 'Saraiva Vision' },
    { property: 'og:locale', content: currentLang === 'pt' ? 'pt_BR' : 'en_US' },
    
    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage || `${baseUrl}/og-image.jpg` },
    { name: 'twitter:image:alt', content: 'Clínica Saraiva Vision - Oftalmologia em Caratinga' },
    
    // Meta tags para apps
    { name: 'apple-mobile-web-app-title', content: 'Saraiva Vision' },
    { name: 'application-name', content: 'Saraiva Vision' },
    { name: 'msapplication-TileColor', content: '#0057B7' },
    { name: 'theme-color', content: '#0057B7' }
  ];
  
  // Links otimizados
  const linkTags = [
    { rel: 'canonical', href: canonicalUrl || baseUrl },
    
    // Preconnect para performance
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://www.google.com' },
    { rel: 'preconnect', href: 'https://maps.googleapis.com' },
    
    // DNS prefetch para recursos externos
    { rel: 'dns-prefetch', href: 'https://storage.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
    
    // Favicon otimizado
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ];
  
  // Adicionar links alternativos para idiomas
  Object.entries(alternateUrls).forEach(([lang, url]) => {
    linkTags.push({
      rel: 'alternate',
      hreflang: lang,
      href: url
    });
  });
  
  return (
    <Helmet>
      <html lang={currentLang === 'pt' ? 'pt-BR' : 'en-US'} />
      <title>{title}</title>
      
      {/* Meta tags */}
      {metaTags.map((tag, index) => {
        if (tag.property) {
          return <meta key={index} property={tag.property} content={tag.content} />;
        }
        return <meta key={index} name={tag.name} content={tag.content} />;
      })}
      
      {/* Link tags */}
      {linkTags.map((tag, index) => (
        <link key={index} {...tag} />
      ))}
      
      {/* Structured Data */}
      {structuredData && validateMedicalSchema(structuredData) && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData, null, 2)}
        </script>
      )}
      {process.env.NODE_ENV === 'development' && structuredData && 
        logSchemaValidation(structuredData, `SEOHead - ${title}`)}
    </Helmet>
  );
};

export default SEOHead;