import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { generateMedicalClinicSchema, generateMedicalWebPageSchema, generateBreadcrumbSchema } from '@/lib/schemaMarkup';

export const useSEO = ({
  titleKey,
  descriptionKey,
  keywordsKey,
  customTitle,
  customDescription,
  customKeywords,
  pageType = 'website',
  serviceId = null,
  breadcrumbs = [],
  noindex = false
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;
  const baseUrl = 'https://saraivavision.com.br';
  
  const seoData = useMemo(() => {
    // Determinar título, descrição e keywords
    const title = customTitle || (titleKey ? t(titleKey) : 'Clínica Saraiva Vision');
    const description = customDescription || (descriptionKey ? t(descriptionKey) : t('homeMeta.description'));
    const keywords = customKeywords || (keywordsKey ? t(keywordsKey) : t('homeMeta.keywords'));
    
    // URL canônica
    const canonicalUrl = `${baseUrl}${location.pathname}`;
    
    // URLs alternativas para idiomas (path-based para melhor SEO)
    const alternateUrls = {
      'pt-BR': `${baseUrl}${location.pathname}`,
      'en-US': `${baseUrl}/en${location.pathname}`,
      'x-default': `${baseUrl}${location.pathname}`
    };
    
    // Gerar structured data baseado no tipo de página
    let structuredData = [];
    
    // Sempre incluir o schema da clínica
    structuredData.push(generateMedicalClinicSchema(currentLang));
    
    // Schema da página específica
    if (pageType === 'service' && serviceId) {
      const serviceInfo = {
        id: serviceId,
        title: title,
        description: description,
        url: location.pathname
      };
      structuredData.push(generateMedicalWebPageSchema(serviceInfo, currentLang));
    } else if (pageType === 'page') {
      const pageInfo = {
        title: title,
        description: description,
        url: location.pathname
      };
      structuredData.push(generateMedicalWebPageSchema(pageInfo, currentLang));
    }
    
    // Breadcrumbs schema se fornecido
    if (breadcrumbs.length > 0) {
      structuredData.push(generateBreadcrumbSchema(breadcrumbs));
    }
    
    // Configurar como @graph para múltiplos schemas
    const finalStructuredData = {
      '@context': 'https://schema.org',
      '@graph': structuredData
    };
    
    return {
      title,
      description,
      keywords,
      canonicalUrl,
      alternateUrls,
      structuredData: finalStructuredData,
      ogImage: `${baseUrl}/og-image-${currentLang}.jpg`,
      ogType: pageType === 'service' ? 'article' : 'website',
      noindex
    };
  }, [t, i18n.language, location.pathname, titleKey, descriptionKey, keywordsKey, customTitle, customDescription, customKeywords, pageType, serviceId, breadcrumbs, noindex]);
  
  return seoData;
};

// Hook específico para páginas de serviços
export const useServiceSEO = (serviceId) => {
  const { t } = useTranslation();
  
  const breadcrumbs = [
    { name: t('navbar.home'), url: '/' },
    { name: t('navbar.services'), url: '/#services' },
    { name: t(`serviceDetail.services.${serviceId}.title`), url: `/servico/${serviceId}` }
  ];
  
  return useSEO({
    titleKey: `serviceMeta.title`,
    descriptionKey: `serviceMeta.description`,
    keywordsKey: `serviceMeta.keywords`,
    pageType: 'service',
    serviceId,
    breadcrumbs
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
  return useSEO({
    titleKey: 'homeMeta.title',
    descriptionKey: 'homeMeta.description',
    keywordsKey: 'homeMeta.keywords',
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