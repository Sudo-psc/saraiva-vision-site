import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { 
  generateMedicalClinicSchema, 
  generateFAQSchema, 
  generateMedicalWebPageSchema,
  generateBreadcrumbSchema
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
    
    // Schema principal da clínica (sempre incluído)
    schemas.push(generateMedicalClinicSchema(language));
    
    // Schema específico da página
    if (type === 'webpage' && pageInfo) {
      schemas.push(generateMedicalWebPageSchema(pageInfo, language));
    }
    
    // Schema FAQ se houver itens
    if (faqItems && faqItems.length > 0) {
      schemas.push(generateFAQSchema(faqItems, language));
    }
    
    // Schema de breadcrumbs se houver
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push(generateBreadcrumbSchema(breadcrumbs));
    }
    
    // Schemas adicionais
    schemas.push(...additionalSchemas);
    
    return schemas;
  };
  
  const schemas = generateSchemas();
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
    </Helmet>
  );
};

export default SchemaMarkup;