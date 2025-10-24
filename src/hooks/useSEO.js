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
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        try { return new URL(loc.href).origin; } catch { }
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
      schema: providedSchema || finalStructuredData, // Support both schema and structuredData for tests
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
  }, [
    t,
    currentLang,
    baseUrl,
    location.pathname,
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
    genClinic,
    genWebPage,
    genBreadcrumb,
    pageType,
    serviceId,
    breadcrumbs,
    noindex
  ]);

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
    { name: t('navbar.services'), url: '/servicos' },
    { name: service?.title || t('navbar.services'), url: `/servicos/${service?.slug || ''}` }
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
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const hasContactLens = Object.prototype.hasOwnProperty.call(schemaLib, 'generateContactLensProductSchema');
  const genContactLens = hasContactLens ? schemaLib.generateContactLensProductSchema : (() => ({}));

  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Lentes de Contato', url: '/lentes' }
  ];

  // Schema completo para lentes de contato
  const lensesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      genContactLens(currentLang, true),
      schemaLib.generateBreadcrumbSchema(breadcrumbs, true)
    ]
  };

  return useSEO({
    title: 'SVlentes - Assinatura de lentes de contato com acompanhamento médico em caratinga.',
    description: 'Primeiro plano de assinatura de lentes de contato com acompanhamento médico no brasil. Comodidade e segurança. Frete grátis e entrega garantida.',
    keywords: 'lentes de contato Caratinga, assinatura lentes contato MG, lentes mensais entrega domicílio, oftalmologista lentes contato, adaptação lentes Caratinga, lentes gelatinosas premium, acompanhamento médico lentes, frete grátis lentes contato, lentes ANVISA certificadas, plano assinatura lentes',
    pageType: 'website',
    breadcrumbs,
    schema: lensesSchema,
    image: 'https://opengraph.b-cdn.net/production/images/38eda430-78a4-4e66-b7e1-901ce93872f7.jpg?token=78_zZ4WsyYekqHN_aVKpQmlcAAbaRLwpey1Gqdt4nhI&height=1024&width=1024&expires=33297322567'
  });
};

// Hook para página inicial
export const useHomeSEO = () => {
  const { t } = useTranslation();
  const baseUrl = 'https://saraivavision.com.br';
  return useSEO({
    title: t('homeMeta.title'),
    description: t('homeMeta.description'),
    keywords: t('homeMeta.keywords'),
    pageType: 'website',
    image: `${baseUrl}/og-image-1200x630-optimized.jpg`
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

// Hook específico para página de planos de assinatura
export const usePlansSEO = (plans = []) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const hasOfferCatalog = Object.prototype.hasOwnProperty.call(schemaLib, 'generateOfferCatalogSchema');
  const genOfferCatalog = hasOfferCatalog ? schemaLib.generateOfferCatalogSchema : (() => ({}));

  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Lentes de Contato', url: '/lentes' },
    { name: 'Planos de Assinatura', url: '/planos' }
  ];

  // FAQ items para schema
  const faqItems = [
    {
      question: 'Como funciona a entrega das lentes de contato?',
      answer: 'As lentes são entregues mensalmente no seu endereço cadastrado, sem custo adicional de frete para Caratinga e região. Você recebe automaticamente antes de acabar suas lentes atuais.',
      dateCreated: '2024-01-15'
    },
    {
      question: 'As consultas oftalmológicas estão incluídas no plano?',
      answer: 'Sim! Todos os planos incluem consultas de acompanhamento com oftalmologista, tanto presenciais quanto online, para garantir a saúde dos seus olhos.',
      dateCreated: '2024-01-15'
    },
    {
      question: 'Qual a diferença entre os planos Básico, Padrão e Premium?',
      answer: 'A principal diferença está na quantidade de lentes (12, 13 ou 14 pares), frequência de consultas presenciais, prioridade no agendamento e benefícios adicionais como kit de higienização premium no plano Premium.',
      dateCreated: '2024-01-15'
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'O plano tem duração de 12 meses com parcelamento mensal. As condições de cancelamento antecipado variam conforme o plano escolhido. Entre em contato para mais detalhes.',
      dateCreated: '2024-01-15'
    },
    {
      question: 'As lentes são certificadas pela ANVISA?',
      answer: 'Sim, trabalhamos exclusivamente com lentes de marcas premium certificadas pela ANVISA, garantindo qualidade, segurança e procedência dos produtos.',
      dateCreated: '2024-01-15'
    }
  ];

  // Schema completo para planos
  const plansSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      genOfferCatalog(plans, currentLang, true),
      schemaLib.generateFAQSchema(faqItems, currentLang, true),
      schemaLib.generateBreadcrumbSchema(breadcrumbs, true)
    ]
  };

  return useSEO({
    title: 'Planos de Assinatura de Lentes de Contato | A partir de R$ 100/mês | Saraiva Vision',
    description: 'Compare planos de assinatura de lentes de contato: Básico (R$ 100), Padrão (R$ 149,99) e Premium (R$ 179,99). Entrega mensal grátis, consultas incluídas e lentes certificadas ANVISA. Caratinga/MG.',
    keywords: 'planos lentes contato preço, assinatura lentes valores, lentes mensais custo, quanto custa lentes contato assinatura, plano básico lentes, plano premium lentes contato, comparar planos lentes, lentes contato parcelado, consulta oftalmologista inclusa, melhor plano lentes Caratinga',
    pageType: 'page',
    breadcrumbs,
    schema: plansSchema
  });
};
