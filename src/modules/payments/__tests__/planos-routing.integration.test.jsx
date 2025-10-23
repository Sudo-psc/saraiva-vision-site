/**
 * Integration Tests for Planos Routing
 * Tests navigation between /planos, /planosflex, and /planosonline
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

// Import actual pages
import PlansPage from '../pages/PlansPage';
import PlanosFlexPage from '../pages/PlanosFlexPage';
import PlanosOnlinePage from '../pages/PlanosOnlinePage';

// Mock heavy components
vi.mock('@/components/SEOHead', () => ({
  default: ({ title }) => <div data-testid="seo-head">{title}</div>,
}));

vi.mock('@/components/EnhancedFooter', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/JotformChatbot', () => ({
  default: () => <div data-testid="chatbot">Chatbot</div>,
}));

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/planosflex" element={<PlanosFlexPage />} />
          <Route path="/planosonline" element={<PlanosOnlinePage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Planos Routing Integration', () => {
  describe('Route: /planos (PlansPage)', () => {
    it('should render PlansPage on /planos route', () => {
      renderWithRouter('/planos');

      expect(screen.getByRole('heading', { name: /escolha o plano ideal para você/i })).toBeInTheDocument();
    });

    it('should have link to /planosflex on PlansPage', () => {
      renderWithRouter('/planos');

      const flexLink = screen.getByRole('link', { name: /ver planos sem fidelidade/i });
      expect(flexLink).toBeInTheDocument();
      expect(flexLink).toHaveAttribute('href', '/planosflex');
    });

    it('should have link to /planosonline on PlansPage', () => {
      renderWithRouter('/planos');

      const onlineLink = screen.getByRole('link', { name: /ver planos online/i });
      expect(onlineLink).toBeInTheDocument();
      expect(onlineLink).toHaveAttribute('href', '/planosonline');
    });

    it('should NOT have removed flex content from PlansPage', () => {
      renderWithRouter('/planos');

      // Verify flex CTA exists
      expect(screen.getByText(/prefere planos sem fidelidade/i)).toBeInTheDocument();
      expect(screen.getByText(/cancele quando quiser, sem multas ou burocracia/i)).toBeInTheDocument();
    });
  });

  describe('Route: /planosflex (PlanosFlexPage)', () => {
    it('should render PlanosFlexPage on /planosflex route', () => {
      renderWithRouter('/planosflex');

      expect(screen.getByRole('heading', { name: /planos presenciais flex - sem fidelidade/i })).toBeInTheDocument();
    });

    it('should have back link to /planos', () => {
      renderWithRouter('/planosflex');

      const backLink = screen.getByRole('link', { name: /voltar para planos presenciais/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/planos');
    });

    it('should have link to /planosonline', () => {
      renderWithRouter('/planosflex');

      const onlineLink = screen.getByRole('link', { name: /ver planos online/i });
      expect(onlineLink).toBeInTheDocument();
      expect(onlineLink).toHaveAttribute('href', '/planosonline');
    });

    it('should have link back to annual plans at /planos', () => {
      renderWithRouter('/planosflex');

      const annualLink = screen.getByRole('link', { name: /ver planos anuais presenciais/i });
      expect(annualLink).toBeInTheDocument();
      expect(annualLink).toHaveAttribute('href', '/planos');
    });

    it('should display "Sem Fidelidade" badge', () => {
      renderWithRouter('/planosflex');

      expect(screen.getByText('Sem Fidelidade')).toBeInTheDocument();
    });

    it('should mention flexibility and cancellation', () => {
      renderWithRouter('/planosflex');

      expect(screen.getByText(/cancele quando quiser/i)).toBeInTheDocument();
      expect(screen.getByText(/total flexibilidade/i)).toBeInTheDocument();
    });
  });

  describe('Route: /planosonline (PlanosOnlinePage)', () => {
    it('should render PlanosOnlinePage on /planosonline route', () => {
      renderWithRouter('/planosonline');

      expect(screen.getByRole('heading', { name: /planos online de lentes de contato/i })).toBeInTheDocument();
    });

    it('should have link back to /planos', () => {
      renderWithRouter('/planosonline');

      const presencialLink = screen.getByRole('link', { name: /ver planos presenciais/i });
      expect(presencialLink).toBeInTheDocument();
      expect(presencialLink).toHaveAttribute('href', '/planos');
    });

    it('should NOT have flex link anymore', () => {
      renderWithRouter('/planosonline');

      // Should not have any links to /planosflex
      const allLinks = screen.getAllByRole('link');
      const flexLinks = allLinks.filter(link =>
        link.getAttribute('href') === '/planosflex'
      );

      expect(flexLinks.length).toBe(0);
    });

    it('should display "100% Online" badge', () => {
      renderWithRouter('/planosonline');

      expect(screen.getByText('100% Online')).toBeInTheDocument();
    });

    it('should mention online consultation', () => {
      renderWithRouter('/planosonline');

      expect(screen.getByText(/atendimento 100% online/i)).toBeInTheDocument();
      expect(screen.getByText(/todo o brasil/i)).toBeInTheDocument();
    });
  });

  describe('Cross-Page Navigation Flow', () => {
    it('should allow navigation: /planos -> /planosflex -> /planos', () => {
      renderWithRouter('/planos');

      // Verify we're on PlansPage
      expect(screen.getByRole('heading', { name: /escolha o plano ideal/i })).toBeInTheDocument();

      // Now render flex page
      renderWithRouter('/planosflex');
      expect(screen.getByRole('heading', { name: /planos presenciais flex/i })).toBeInTheDocument();

      // Verify back link exists
      const backLink = screen.getByRole('link', { name: /voltar para planos presenciais/i });
      expect(backLink).toHaveAttribute('href', '/planos');
    });

    it('should allow navigation: /planos -> /planosonline', () => {
      renderWithRouter('/planos');

      const onlineLink = screen.getByRole('link', { name: /ver planos online/i });
      expect(onlineLink).toHaveAttribute('href', '/planosonline');

      // Render online page
      renderWithRouter('/planosonline');
      expect(screen.getByRole('heading', { name: /planos online/i })).toBeInTheDocument();
    });

    it('should allow navigation: /planosflex -> /planosonline', () => {
      renderWithRouter('/planosflex');

      const onlineLink = screen.getByRole('link', { name: /ver planos online/i });
      expect(onlineLink).toHaveAttribute('href', '/planosonline');
    });
  });

  describe('Link Integrity', () => {
    it('PlansPage should have exactly 1 link to /planosflex', () => {
      renderWithRouter('/planos');

      const allLinks = screen.getAllByRole('link');
      const flexLinks = allLinks.filter(link =>
        link.getAttribute('href') === '/planosflex'
      );

      expect(flexLinks.length).toBe(1);
    });

    it('PlanosFlexPage should have 2 links to /planos (back + annual)', () => {
      renderWithRouter('/planosflex');

      const allLinks = screen.getAllByRole('link');
      const planosLinks = allLinks.filter(link =>
        link.getAttribute('href') === '/planos'
      );

      expect(planosLinks.length).toBe(2);
    });

    it('PlanosOnlinePage should have 0 links to /planosflex', () => {
      renderWithRouter('/planosonline');

      const allLinks = screen.getAllByRole('link');
      const flexLinks = allLinks.filter(link =>
        link.getAttribute('href') === '/planosflex'
      );

      expect(flexLinks.length).toBe(0);
    });

    it('all pages should have valid internal links (no broken hrefs)', () => {
      const routes = ['/planos', '/planosflex', '/planosonline'];

      routes.forEach(route => {
        renderWithRouter(route);
        const allLinks = screen.getAllByRole('link');

        allLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/')) {
            // Internal links should be properly formatted
            expect(href).toMatch(/^\/[a-z]+/);
          }
        });
      });
    });
  });

  describe('Content Differentiation', () => {
    it('PlansPage should focus on annual plans with commitment', () => {
      renderWithRouter('/planos');

      expect(screen.getByText(/12x de/i)).toBeInTheDocument();
      expect(screen.getByText(/plano básico/i)).toBeInTheDocument();
    });

    it('PlanosFlexPage should emphasize no commitment', () => {
      renderWithRouter('/planosflex');

      expect(screen.getByText(/sem fidelidade/i)).toBeInTheDocument();
      expect(screen.getByText(/cancele quando quiser/i)).toBeInTheDocument();
    });

    it('PlanosOnlinePage should emphasize online nature', () => {
      renderWithRouter('/planosonline');

      expect(screen.getByText(/100% online/i)).toBeInTheDocument();
      expect(screen.getByText(/videochamada/i)).toBeInTheDocument();
    });
  });

  describe('SEO Meta Information', () => {
    it('each page should have unique SEO title', () => {
      const pages = [
        { route: '/planos', title: /escolha o plano ideal|planos de assinatura/i },
        { route: '/planosflex', title: /planos flex.*sem fidelidade/i },
        { route: '/planosonline', title: /planos online/i },
      ];

      pages.forEach(({ route, title }) => {
        renderWithRouter(route);
        const seoHead = screen.getByTestId('seo-head');
        expect(seoHead.textContent).toMatch(title);
      });
    });
  });
});
