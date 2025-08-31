import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { clinicInfo } from '@/lib/clinicInfo';

const SEOHead = ({
  title,
  description,
  image,
  keywords,
  ogType = 'website',
  noindex = false,
  canonicalPath = null,
  structuredData = null
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const currentLang = i18n.language || 'pt';
  const baseUrl = 'https://saraivavisao.com.br';
  const currentPath = location.pathname;

  // Generate optimized image URL for social sharing
  const getOptimizedOgImage = () => {
    if (image) return image;
    return `${baseUrl}/og-image-${currentLang}.jpg`;
  };

  // Generate site name based on language
  const siteName = currentLang === 'pt' ? 'Saraiva Vision - Oftalmologia' : 'Saraiva Vision - Ophthalmology';

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
  const ogImage = getOptimizedOgImage();

  const resolvedDescription = description || 'Clínica oftalmológica em Caratinga/MG com consultas, exames e tratamentos especializados para a saúde da visão.';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} />
      <title>{title}</title>
  <meta name="description" content={resolvedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Medical Clinic Specific Meta Tags */}
      <meta name="geo.region" content="BR-MG" />
      <meta name="geo.placename" content="Caratinga" />
      <meta name="geo.position" content="-19.7944,-42.1375" />
      <meta name="ICBM" content="-19.7944,-42.1375" />

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

      {/* Open Graph - Enhanced for Medical Clinics */}
      <meta property="og:title" content={title} />
  <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLang === 'pt' ? 'pt_BR' : 'en_US'} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
  <meta property="og:image:alt" content={`${siteName} - ${resolvedDescription.substring(0, 100)}...`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />

      {/* Medical Business Specific Open Graph */}
      <meta property="business:contact_data:street_address" content={clinicInfo.address.street} />
      <meta property="business:contact_data:locality" content={clinicInfo.address.city} />
      <meta property="business:contact_data:region" content={clinicInfo.address.state} />
      <meta property="business:contact_data:postal_code" content={clinicInfo.address.zip} />
      <meta property="business:contact_data:country_name" content="Brazil" />
      <meta property="business:contact_data:phone_number" content={clinicInfo.phone} />

      {/* Twitter Card - Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@saraivavisao" />
      <meta name="twitter:creator" content="@saraivavisao" />
      <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${siteName} - Oftalmologia em Caratinga`} />

      {/* Additional Social Media Meta Tags */}
      <meta property="fb:app_id" content="1134006230864956" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />

      {/* Robots and Search Engine Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        </>
      )}

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://connect.facebook.net" />

      {/* Hero Image Preload (Dr. Philipe) */}
      <link
        rel="preload"
        as="image"
        href="/img/drphilipe_perfil.png"
        imagesrcset="/img/drphilipe_perfil.png 800w"
        imagesizes="(min-width:1024px) 800px, 100vw"
      />
      {/* Optional future AVIF/WebP variants (placeholders if added later) */}
      {/* <link rel="preload" as="image" href="/img/drphilipe_perfil.avif" type="image/avif" /> */}
      {/* <link rel="preload" as="image" href="/img/drphilipe_perfil.webp" type="image/webp" /> */}

      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;