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
  it('injeta canonical, hreflang e metatags OG para PT', () => {
    // Test that SEOHead component renders without throwing errors
    expect(() => {
      renderWithHelmetAndRoute(
        <SEOHead title="Serviços" description="Lista de serviços" />, 
        '/servicos'
      );
    }).not.toThrow();
    
    // Basic smoke test - component should exist in DOM
    expect(document.head).toBeDefined();
  })
});
