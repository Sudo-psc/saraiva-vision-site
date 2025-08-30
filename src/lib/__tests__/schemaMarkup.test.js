import { describe, it, expect } from 'vitest';
import {
  generateMedicalClinicSchema,
  generateFAQSchema,
  generateMedicalWebPageSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateOrganizationSchema
} from '@/lib/schemaMarkup.js';

describe('lib/schemaMarkup JSON-LD generators', () => {
  it('gera MedicalClinic, WebSite e Organization básicos', () => {
    const clinic = generateMedicalClinicSchema('pt', true);
    const site = generateWebSiteSchema('pt', true);
    const org = generateOrganizationSchema('pt', true);

    expect(clinic['@type']).toBe('MedicalClinic');
    expect(site['@type']).toBe('WebSite');
    expect(org['@type']).toBe('Organization');
  });

  it('gera FAQPage e BreadcrumbList quando fornecidos', () => {
    const faq = generateFAQSchema([{ question: 'Q1', answer: 'A1' }], 'pt', true);
    const crumbs = generateBreadcrumbSchema([{ name: 'Início', url: '/' }], true);

    expect(faq['@type']).toBe('FAQPage');
    expect(Array.isArray(faq.mainEntity)).toBe(true);
    expect(crumbs['@type']).toBe('BreadcrumbList');
    expect(Array.isArray(crumbs.itemListElement)).toBe(true);
  });

  it('gera MedicalWebPage com url e título', () => {
    const page = generateMedicalWebPageSchema({ url: '/servicos', title: 'Serviços', description: 'Lista' }, 'pt', true);
    expect(page['@type']).toBe('MedicalWebPage');
    expect(page.url).toContain('/servicos');
    expect(page.name).toBe('Serviços');
  });
});

