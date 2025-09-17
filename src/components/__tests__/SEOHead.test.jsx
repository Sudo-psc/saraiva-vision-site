import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock clinicInfo com estrutura esperada por SEOHead
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    address: { street: 'Rua Exemplo', city: 'Caratinga', state: 'MG', zip: '35300-000' },
    phone: '+5533998601427'
  }
}));

// Importar após o mock
import SEOHead from '@/components/SEOHead';

const renderWithHelmetAndRoute = (ui, path = '/') => {
  const utils = render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
  return utils;
};

describe('SEOHead', () => {
  it('injeta canonical, hreflang e metatags OG para PT', async () => {
    renderWithHelmetAndRoute(
      <SEOHead title="Serviços" description="Lista de serviços" />, 
      '/servicos'
    );

    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical).toBeTruthy();
      expect(canonical.getAttribute('href')).toContain('/servicos');

      const ogLocale = document.head.querySelector('meta[property="og:locale"]');
      expect(ogLocale?.getAttribute('content')).toBe('pt_BR');

      const hreflangs = Array.from(document.head.querySelectorAll('link[rel="alternate"]'))
        .map(l => l.getAttribute('hreflang'));
      expect(hreflangs).toEqual(expect.arrayContaining(['pt-BR', 'pt', 'en', 'x-default']));
    });
  });
});
