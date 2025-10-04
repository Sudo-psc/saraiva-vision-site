/**
 * SEO Hook - Next.js 15 Compatible Version
 * Simplified version without react-i18next dependencies
 */

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  canonicalUrl: string;
  alternateUrls: Record<string, string>;
  structuredData: any;
  schema: any;
  image: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
  noindex: boolean;
}

// Mock translation function for Next.js compatibility
const t = (key: string, fallback?: string): string => {
  const translations: Record<string, string> = {
    'homeMeta.title': 'Saraiva Vision - Clínica Oftalmológica em Caratinga',
    'homeMeta.description': 'Clínica oftalmológica especializada em Caratinga, MG. Tratamentos completos com tecnologia de ponta para toda a família.',
    'homeMeta.keywords': 'oftalmologia Caratinga, clínica olhos Caratinga, Saraiva Vision, Dr Philipe Saraiva, cirurgia catarata, glaucoma, lentes contato',
    'navbar.home': 'Início',
    'navbar.services': 'Serviços',
    'navbar.about': 'Sobre',
    'navbar.contact': 'Contato',
    'navbar.testimonials': 'Depoimentos',
    'navbar.podcast': 'Podcast',
    'serviceMeta.title': 'Serviços Oftalmológicos - Saraiva Vision',
    'serviceMeta.description': 'Tratamentos oftalmológicos completos em Caratinga. Cirurgia de catarata, glaucoma, retina e mais.',
    'serviceMeta.keywords': 'cirurgia catarata Caratinga, tratamento glaucoma, cirurgia refrativa, lentes contato, exames oftalmológicos',
    'testimonialsMeta.title': 'Depoimentos - Saraiva Vision',
    'testimonialsMeta.description': 'Veja o que nossos pacientes dizem sobre a Saraiva Vision. Atendimento de excelência em oftalmologia.',
    'testimonialsMeta.keywords': 'depoimentos Saraiva Vision, pacientes oftalmologia, clínicas olhos Caratinga, testimonials',
    'faqMeta.title': 'Perguntas Frequentes - Saraiva Vision',
    'faqMeta.description': 'Tire suas dúvidas sobre tratamentos oftalmológicos. FAQ completo com as perguntas mais comuns.',
    'faqMeta.keywords': 'perguntas oftalmologia, dúvidas oftalmológicas, FAQ oftalmologia, cirurgia olhos',
    'privacyMeta.title': 'Política de Privacidade - Saraiva Vision',
    'privacyMeta.description': 'Nossa política de privacidade e tratamento de dados conforme LGPD.',
    'privacyMeta.keywords': 'LGPD, privacidade, política de dados, tratamento informações',
    'podcastMeta.title': 'Podcast - Saraiva Vision',
    'podcastMeta.description': 'Acompanhe nosso podcast com informações sobre saúde ocular e oftalmologia.',
    'podcastMeta.keywords': 'podcast oftalmologia, saúde ocular, Saraiva Vision podcast',
    'lensesMeta.title': 'Lentes de Contato - Saraiva Vision',
    'lensesMeta.description': 'Encontre as melhores lentes de contato para você. Atendimento especializado em Caratinga.',
    'lensesMeta.keywords': 'lentes contato Caratinga, lentes gelatinosas, lentes rgidas, adaptação lentes',
    'faq.title': 'FAQ'
  };

  return translations[key] || fallback || key;
};

export const useSEO = ({
  titleKey,
  descriptionKey,
  keywordsKey,
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
}: {
  titleKey?: string;
  descriptionKey?: string;
  keywordsKey?: string;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  pageType?: string;
  serviceId?: string | null;
  breadcrumbs?: Array<{ name: string; url: string }>;
  schema?: any;
  noindex?: boolean;
} = {}): SEOData => {
  const pathname = usePathname();
  const currentLang = 'pt-BR';
  const baseUrl = typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'https://saraivavision.com.br';

  const seoData = useMemo(() => {
    // Determinar título, descrição e keywords
    const title = directTitle || customTitle || (titleKey ? t(titleKey) : 'Clínica Saraiva Vision');
    const description = directDescription || customDescription || (descriptionKey ? t(descriptionKey) : t('homeMeta.description'));
    const keywords = directKeywords || customKeywords || (keywordsKey ? t(keywordsKey) : t('homeMeta.keywords'));

    // URL canônica
    const canonicalUrl = `${baseUrl}${pathname && pathname !== '/' ? pathname : ''}`;

    // URLs alternativas para idiomas
    const alternateUrls = {
      'pt-BR': `${baseUrl}${pathname}`,
      'en-US': `${baseUrl}/en${pathname}`,
      'x-default': `${baseUrl}${pathname}`
    };

    // Gerar structured data básico
    const clinicSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: 'Saraiva Vision - Clínica Oftalmológica',
      description: 'Clínica oftalmológica especializada em Caratinga, MG',
      url: baseUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Capitão Domingos de Almeida, 123',
        addressLocality: 'Caratinga',
        addressRegion: 'MG',
        postalCode: '35300-000',
        addressCountry: 'BR'
      },
      telephone: '+55-33-99860-1427',
      email: 'contato@saraivavision.com.br',
      openingHours: 'Mo-Fr 08:00-18:00, Sa 08:00-12:00',
      priceRange: '$$'
    };

    const webpageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Saraiva Vision',
        url: baseUrl
      }
    };

    // Breadcrumbs schema se fornecido
    const breadcrumbSchema = breadcrumbs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    } : null;

    // Configurar como @graph para múltiplos schemas
    const structuredDataArray = [clinicSchema, webpageSchema];
    if (breadcrumbSchema) structuredDataArray.push(breadcrumbSchema);

    const finalStructuredData = {
      '@context': 'https://schema.org',
      '@graph': structuredDataArray
    };

    const resolvedImage = image || `${baseUrl}/og-image-1200x630-optimized.jpg`;
    const twitterCard = image ? 'summary_large_image' : 'summary';

    return {
      title,
      description,
      keywords,
      canonical: canonicalUrl,
      canonicalUrl,
      alternateUrls,
      structuredData: finalStructuredData,
      schema: providedSchema || finalStructuredData,
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
  }, [
    pathname,
    titleKey,
    descriptionKey,
    keywordsKey,
    customTitle,
    customDescription,
    customKeywords,
    directTitle,
    directDescription,
    directKeywords,
    image,
    providedSchema,
    pageType,
    serviceId,
    breadcrumbs,
    noindex,
    baseUrl
  ]);

  return seoData;
};

// Hook específico para página inicial
export const useHomeSEO = (): SEOData => {
  const baseUrl = 'https://saraivavision.com.br';

  return useSEO({
    title: 'Saraiva Vision - Clínica Oftalmológica em Caratinga',
    description: 'Clínica oftalmológica especializada em Caratinga, MG. Tratamentos completos com tecnologia de ponta para toda a família.',
    keywords: 'oftalmologia Caratinga, clínica olhos Caratinga, Saraiva Vision, Dr Philipe Saraiva, cirurgia catarata, glaucoma, lentes contato',
    pageType: 'website',
    image: `${baseUrl}/og-image-1200x630-optimized.jpg`
  });
};

// Hook específico para página de serviços
export const useServiceSEO = (service: any): SEOData => {
  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Serviços', url: '/servicos' },
    { name: service?.title || 'Serviços', url: `/servicos/${service?.slug || ''}` }
  ];

  return useSEO({
    title: service?.title || 'Serviços Oftalmológicos',
    description: service?.description || 'Tratamentos oftalmológicos completos em Caratinga',
    keywords: 'cirurgia catarata Caratinga, tratamento glaucoma, cirurgia refrativa, lentes contato',
    pageType: 'service',
    serviceId: service?.slug || null,
    breadcrumbs
  });
};

// Hook específico para página de contato
export const useContactSEO = (): SEOData => {
  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Contato', url: '/contato' }
  ];

  return useSEO({
    title: 'Contato | Clínica Saraiva Vision',
    description: 'Entre em contato com a Clínica Saraiva Vision em Caratinga/MG. Agende sua consulta oftalmológica pelo WhatsApp, telefone ou presencialmente.',
    keywords: 'contato Saraiva Vision, agendar consulta oftalmologista Caratinga, telefone clínica olhos, WhatsApp oftalmologia',
    pageType: 'page',
    breadcrumbs
  });
};

// Hook específico para página sobre
export const useAboutSEO = (): SEOData => {
  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Sobre', url: '/sobre' }
  ];

  return useSEO({
    title: 'Sobre | Dr. Philipe Saraiva | CRM-MG 69.870',
    description: 'Conheça o Dr. Philipe Saraiva (CRM-MG 69.870) e a Clínica Saraiva Vision. Oftalmologista especializado em Caratinga/MG com tecnologia avançada.',
    keywords: 'Dr Philipe Saraiva, CRM-MG 69870, oftalmologista Caratinga, sobre Saraiva Vision, médico oftalmologista especialista',
    pageType: 'page',
    breadcrumbs
  });
};

export default useSEO;