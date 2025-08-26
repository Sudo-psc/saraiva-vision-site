import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useSEO, useHomeSEO, useServiceSEO, useContactSEO } from '../useSEO';

// Wrapper component for tests that need Router context
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => {
      const translations = {
        'seo.home.title': 'Clínica Saraiva Vision - Oftalmologista em Caratinga/MG',
        'seo.home.description': 'Especialista em saúde ocular com tecnologia de ponta e atendimento humanizado.',
        'seo.services.title': 'Nossos Serviços - Saraiva Vision',
        'seo.services.description': 'Conheça todos os serviços oftalmológicos da Saraiva Vision.',
        'seo.contact.title': 'Contato - Saraiva Vision',
        'seo.contact.description': 'Entre em contato conosco e agende sua consulta oftalmológica.'
      };
      return translations[key] || defaultValue || key;
    },
    i18n: { language: 'pt' }
  })
}));

// Mock react-helmet
vi.mock('react-helmet', () => ({
  Helmet: ({ children }) => children
}));

// Mock clinic info
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    address: 'Rua Test, 123 - Centro - Caratinga/MG',
    phone: '+5533998601427',
    email: 'contato@saraivavision.com.br',
    description: 'Clínica oftalmológica especializada',
    establishedYear: '2020',
    services: ['Consultas', 'Exames', 'Tratamentos']
  }
}));

// Mock schema markup
vi.mock('@/lib/schemaMarkup', () => ({
  generateMedicalClinicSchema: vi.fn(() => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Clínica Saraiva Vision'
  })),
  generateServiceSchema: vi.fn(() => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalService',
    name: 'Service Name'
  }))
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'https://example.com',
    pathname: '/',
    search: '',
    hash: ''
  }
});

describe('useSEO Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates basic SEO metadata', () => {
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description',
        keywords: 'test, page'
      }), { wrapper: TestWrapper }
    );

    expect(result.current.title).toBe('Test Page');
    expect(result.current.description).toBe('Test description');
    expect(result.current.keywords).toBe('test, page');
  });

  it('includes canonical URL', () => {
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description'
      }), { wrapper: TestWrapper }
    );

    expect(result.current.canonical).toBe('https://example.com');
  });

  it('generates Open Graph metadata', () => {
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg'
      }), { wrapper: TestWrapper }
    );

    expect(result.current.ogTitle).toBe('Test Page');
    expect(result.current.ogDescription).toBe('Test description');
    expect(result.current.ogImage).toBe('https://example.com/image.jpg');
    expect(result.current.ogUrl).toBe('https://example.com');
  });

  it('generates Twitter Card metadata', () => {
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg'
      }), { wrapper: TestWrapper }
    );

    expect(result.current.twitterCard).toBe('summary_large_image');
    expect(result.current.twitterTitle).toBe('Test Page');
    expect(result.current.twitterDescription).toBe('Test description');
    expect(result.current.twitterImage).toBe('https://example.com/image.jpg');
  });

  it('includes schema markup when provided', () => {
    const schema = { '@type': 'WebPage' };
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description',
        schema
      })
    );

    expect(result.current.schema).toEqual(schema);
  });

  it('handles missing image gracefully', () => {
    const { result } = renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description'
      }), { wrapper: TestWrapper }
    );

    expect(result.current.twitterCard).toBe('summary');
    expect(result.current.ogImage).toBeUndefined();
    expect(result.current.twitterImage).toBeUndefined();
  });
});

describe('useHomeSEO Hook', () => {
  it('generates home page SEO metadata', () => {
    const { result } = renderHook(() => useHomeSEO(), { wrapper: TestWrapper });

    expect(result.current.title).toContain('Saraiva Vision');
    expect(result.current.description).toBeTruthy();
    expect(result.current.keywords).toContain('oftalmologista');
    expect(result.current.schema).toBeTruthy();
  });

  it('includes medical clinic schema', () => {
    const { result } = renderHook(() => useHomeSEO(), { wrapper: TestWrapper });

    expect(result.current.schema).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic'
      })
    );
  });

  it('sets correct page type for Open Graph', () => {
    const { result } = renderHook(() => useHomeSEO(), { wrapper: TestWrapper });

    expect(result.current.ogType).toBe('website');
  });
});

describe('useServiceSEO Hook', () => {
  const mockService = {
    title: 'Consultas Oftalmológicas',
    description: 'Exames completos de visão',
    slug: 'consultas-oftalmologicas'
  };

  it('generates service page SEO metadata', () => {
    const { result } = renderHook(() => useServiceSEO(mockService), { wrapper: TestWrapper });

    expect(result.current.title).toContain(mockService.title);
    expect(result.current.description).toContain(mockService.description);
    expect(result.current.keywords).toContain('oftalmologista');
  });

  it('includes service schema when available', () => {
    const { result } = renderHook(() => useServiceSEO(mockService), { wrapper: TestWrapper });

    expect(result.current.schema).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'MedicalService'
      })
    );
  });

  it('handles missing service gracefully', () => {
    const { result } = renderHook(() => useServiceSEO(null), { wrapper: TestWrapper });

    expect(result.current.title).toContain('Serviços');
    expect(result.current.description).toBeTruthy();
  });

  it('sets correct canonical URL for service', () => {
    window.location.pathname = `/servico/${mockService.slug}`;
    
    const { result } = renderHook(() => useServiceSEO(mockService), { wrapper: TestWrapper });

    expect(result.current.canonical).toContain(mockService.slug);
  });
});

describe('useContactSEO Hook', () => {
  it('generates contact page SEO metadata', () => {
    const { result } = renderHook(() => useContactSEO());

    expect(result.current.title).toContain('Contato');
    expect(result.current.description).toBeTruthy();
    expect(result.current.keywords).toContain('contato');
  });

  it('includes organization schema', () => {
    const { result } = renderHook(() => useContactSEO());

    expect(result.current.schema).toBeTruthy();
    expect(result.current.schema['@type']).toBe('MedicalClinic');
  });

  it('sets correct page type for Open Graph', () => {
    const { result } = renderHook(() => useContactSEO());

    expect(result.current.ogType).toBe('website');
  });
});

describe('SEO Hook Error Handling', () => {
  it('handles missing translations gracefully', () => {
    // Mock useTranslation to return undefined for some keys
    vi.mocked(require('react-i18next').useTranslation).mockReturnValue({
      t: (key) => undefined,
      i18n: { language: 'pt' }
    });

    const { result } = renderHook(() => useHomeSEO(), { wrapper: TestWrapper });

    // Should still return some metadata even if translations fail
    expect(result.current.title).toBeTruthy();
    expect(result.current.description).toBeTruthy();
  });

  it('handles schema generation errors gracefully', () => {
    // Mock schema generator to throw error
    vi.mocked(require('@/lib/schemaMarkup').generateMedicalClinicSchema).mockImplementation(() => {
      throw new Error('Schema generation error');
    });

    const { result } = renderHook(() => useHomeSEO(), { wrapper: TestWrapper });

    // Should still return metadata even if schema generation fails
    expect(result.current.title).toBeTruthy();
    expect(result.current.description).toBeTruthy();
    expect(result.current.schema).toBeUndefined();
  });
});