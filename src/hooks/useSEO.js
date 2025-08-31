import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import * as schemaLib from '@/lib/schemaMarkup';

export const useSEO = ({
  titleKey,
  descriptionKey,
  keywordsKey,
  // Also accept direct values used by tests
  title: directTitle,
  description: directDescription,
  keywords: directKeywords,
  image,
  customTitle,
  customDescription,
  customKeywords,
  pageType = 'website',
  serviceId = null,
  breadcrumbs = [],
  schema: providedSchema,
  noindex = false
}) => {
  const { t, i18n } = useTranslation();
  let location;
  try {
    location = useLocation();
  } catch {
    const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) || '/';
    location = { pathname };
  }
  const currentLang = i18n.language;
  const baseUrl = (() => {
    if (typeof window !== 'undefined' && window.location) {
      const loc = window.location;
      if (loc.origin) return loc.origin;
      if (loc.href) {
        try { return new URL(loc.href).origin; } catch {}
      }
    }
    return 'https://saraivavision.com.br';
  })();
  // Fallbacks for schema generators in case tests provide partial mocks
  const hasClinic = Object.prototype.hasOwnProperty.call(schemaLib, 'generateMedicalClinicSchema');
  const hasWebPage = Object.prototype.hasOwnProperty.call(schemaLib, 'generateMedicalWebPageSchema');
  const hasBreadcrumb = Object.prototype.hasOwnProperty.call(schemaLib, 'generateBreadcrumbSchema');
  const genClinic = hasClinic ? schemaLib.generateMedicalClinicSchema : (() => ({}));
  const genWebPage = hasWebPage ? schemaLib.generateMedicalWebPageSchema : (() => ({}));
  const genBreadcrumb = hasBreadcrumb ? schemaLib.generateBreadcrumbSchema : (() => ({}));
  
  const seoData = useMemo(() => {
    // Determinar título, descrição e keywords
    const title = directTitle || customTitle || (titleKey ? t(titleKey) : 'Clínica Saraiva Vision');
    const description = directDescription || customDescription || (descriptionKey ? t(descriptionKey) : t('homeMeta.description'));
    const keywords = directKeywords || customKeywords || (keywordsKey ? t(keywordsKey) : t('homeMeta.keywords'));
    
    // URL canônica
    const canonicalUrl = `${baseUrl}${location.pathname && location.pathname !== '/' ? location.pathname : ''}`;
    
    // URLs alternativas para idiomas (path-based para melhor SEO)
    const alternateUrls = {
      'pt-BR': `${baseUrl}${location.pathname}`,
      'en-US': `${baseUrl}/en${location.pathname}`,
      'x-default': `${baseUrl}${location.pathname}`
    };
    
    // Gerar structured data baseado no tipo de página
    let structuredData = [];
    
    // Sempre incluir o schema da clínica (para @graph)
    structuredData.push(genClinic(currentLang, true));
    
    // Schema da página específica
    if (pageType === 'service' && serviceId) {
      const serviceInfo = {
        id: serviceId,
        title: title,
        description: description,
        url: location.pathname
      };
      structuredData.push(genWebPage(serviceInfo, currentLang, true));
    } else if (pageType === 'page') {
      const pageInfo = {
        title: title,
        description: description,
        url: location.pathname
      };
      structuredData.push(genWebPage(pageInfo, currentLang, true));
    }
    
    // Breadcrumbs schema se fornecido (para @graph)
    if (breadcrumbs.length > 0) {
      structuredData.push(genBreadcrumb(breadcrumbs, true));
    }
    
    // Configurar como @graph para múltiplos schemas
    const finalStructuredData = {
      '@context': 'https://schema.org',
      '@graph': structuredData
    };
    const resolvedImage = image || `${baseUrl}/og-image-${currentLang}.jpg`;
    const twitterCard = image ? 'summary_large_image' : 'summary';

    const result = {
      title,
      description,
      keywords,
      canonical: canonicalUrl,
      canonicalUrl,
      alternateUrls,
      structuredData: finalStructuredData,
      schema: providedSchema,
      image: resolvedImage,
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogUrl: canonicalUrl,
      ogType: pageType === 'service' ? 'article' : pageType === 'faq' ? 'article' : 'website',
      twitterCard,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: image,
      noindex
    };
    return result;
  }, [t, i18n.language, location.pathname, titleKey, descriptionKey, keywordsKey, customTitle, customDescription, customKeywords, pageType, serviceId, breadcrumbs, noindex]);
  
  return seoData;
};

// Hook específico para páginas de serviços
export const useServiceSEO = (service) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Schema generators with fallbacks
  const hasClinic = Object.prototype.hasOwnProperty.call(schemaLib, 'generateMedicalClinicSchema');
  const genClinic = hasClinic ? schemaLib.generateMedicalClinicSchema : (() => ({}));
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.services'), url: '/#services' },
    { name: service?.title || t('navbar.services'), url: `/servico/${service?.slug || ''}` }
  ];
  const schema = hasClinic ? genClinic(currentLang, true) : undefined;
  return useSEO({
    title: service?.title || t('serviceMeta.title'),
    description: service?.description || t('serviceMeta.description'),
    keywords: t('serviceMeta.keywords'),
    pageType: 'service',
    serviceId: service?.slug || null,
    breadcrumbs,
    schema
  });
};

// Hook específico para a página de lentes
export const useLensesSEO = () => {
  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Lentes de Contato', url: '/lentes' }
  ];
  
  return useSEO({
    titleKey: 'lensesMeta.title',
    descriptionKey: 'lensesMeta.description', 
    keywordsKey: 'lensesMeta.keywords',
    pageType: 'page',
    breadcrumbs
  });
};

// Hook para página inicial
export const useHomeSEO = () => {
  const { t } = useTranslation();
  return useSEO({
    title: t('homeMeta.title'),
    description: t('homeMeta.description'),
    keywords: t('homeMeta.keywords'),
    pageType: 'website'
  });
};

// Hook específico para página de depoimentos
export const useTestimonialsSEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.testimonials'), url: '/depoimentos' }
  ];
  
  return useSEO({
    titleKey: 'testimonialsMeta.title',
    descriptionKey: 'testimonialsMeta.description',
    keywordsKey: 'testimonialsMeta.keywords',
    pageType: 'page',
    breadcrumbs
  });
};

// Hook específico para página FAQ
export const useFAQSEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('faq.title'), url: '/faq' }
  ];
  
  return useSEO({
    titleKey: 'faqMeta.title',
    descriptionKey: 'faqMeta.description', 
    keywordsKey: 'faqMeta.keywords',
    pageType: 'faq',
    breadcrumbs
  });
};

// Hook específico para página de contato
export const useContactSEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.contact'), url: '/contato' }
  ];
  
  return useSEO({
    title: t('navbar.contact') + ' | Clínica Saraiva Vision',
    description: 'Entre em contato com a Clínica Saraiva Vision em Caratinga/MG. Agende sua consulta oftalmológica pelo WhatsApp, telefone ou presencialmente.',
    keywords: 'contato Saraiva Vision, agendar consulta oftalmologista Caratinga, telefone clínica olhos, WhatsApp oftalmologia, endereço Saraiva Vision',
    pageType: 'page',
    breadcrumbs,
    schema: { '@context': 'https://schema.org', '@type': 'MedicalClinic' }
  });
};

// Hook específico para página sobre
export const useAboutSEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.about'), url: '/sobre' }
  ];
  
  return useSEO({
    customTitle: t('navbar.about') + ' | Dr. Philipe Saraiva | CRM-MG 69.870',
    customDescription: 'Conheça o Dr. Philipe Saraiva (CRM-MG 69.870) e a Clínica Saraiva Vision. Oftalmologista especializado em Caratinga/MG com tecnologia avançada e atendimento humanizado.',
    customKeywords: 'Dr Philipe Saraiva, CRM-MG 69870, oftalmologista Caratinga, sobre Saraiva Vision, médico oftalmologista especialista, clínica oftalmológica histórico',
    pageType: 'page',
    breadcrumbs
  });
};

// Hook específico para página de política de privacidade
export const usePrivacyPolicySEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('privacy.title'), url: '/privacy' }
  ];
  
  return useSEO({
    titleKey: 'privacyMeta.title',
    descriptionKey: 'privacyMeta.description',
    keywordsKey: 'privacyMeta.keywords',
    pageType: 'page',
    breadcrumbs,
    noindex: true // Política de privacidade não deve ser indexada
  });
};

// Hook específico para página de podcast
export const usePodcastSEO = () => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.podcast'), url: '/podcast' }
  ];
  
  return useSEO({
    titleKey: 'podcastMeta.title',
    descriptionKey: 'podcastMeta.description',
    keywordsKey: 'podcastMeta.keywords',
    pageType: 'podcast',
    breadcrumbs
  });
};
