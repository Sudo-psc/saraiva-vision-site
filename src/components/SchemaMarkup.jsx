import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  generateMedicalClinicSchema,
  generateFAQSchema,
  generateMedicalWebPageSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateOrganizationSchema
} from '@/lib/schemaMarkup.js';

const SchemaMarkup = ({
  type = 'clinic',
  pageInfo = null,
  faqItems = null,
  breadcrumbs = null,
  additionalSchemas = []
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Gera schemas baseado no tipo
  const generateSchemas = () => {
    const schemas = [];

    // Schema da organização (base)
    schemas.push(generateOrganizationSchema(language, true));

    // Schema do website
    schemas.push(generateWebSiteSchema(language, true));

    // Schema principal da clínica (para @graph)
    schemas.push(generateMedicalClinicSchema(language, true));

    // Schema específico da página
    if (type === 'webpage' && pageInfo) {
      schemas.push(generateMedicalWebPageSchema(pageInfo, language, true));
    }

    // Schema FAQ se houver itens
    if (faqItems && faqItems.length > 0) {
      schemas.push(generateFAQSchema(faqItems, language, true));
    }

    // Schema de breadcrumbs se houver
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push(generateBreadcrumbSchema(breadcrumbs, true));
    }

    // Schemas adicionais
    schemas.push(...additionalSchemas);

    return schemas;
  };

  const schemas = generateSchemas();

  // Configurar como @graph para múltiplos schemas
  const finalStructuredData = {
    '@context': 'https://schema.org',
    '@graph': schemas
  };

  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData, null, 2)
        }}
      />
    </Helmet>
  );
};

export default SchemaMarkup;