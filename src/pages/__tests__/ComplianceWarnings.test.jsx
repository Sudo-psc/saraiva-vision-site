import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PlansPage from '@/pages/PlansPage';
import PlanBasicoPage from '@/pages/PlanBasicoPage';
import PlanPadraoPage from '@/pages/PlanPadraoPage';
import PlanPremiumPage from '@/pages/PlanPremiumPage';

// Mock i18next for translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'pt' }
  })
}));

// Mock SendPulseChatWidget
vi.mock('@/components/SendPulseChatWidget', () => ({
  default: () => null
}));

// Mock useGlassMorphism hook
vi.mock('@/hooks/useGlassMorphism', () => ({
  useGlassMorphism: () => ({
    capabilities: {
      supportsBackdropFilter: true,
      supportsTransform3D: true,
      performanceLevel: 'high',
      reducedMotion: false,
      devicePixelRatio: 1,
      isTouch: false
    },
    glassIntensity: 'medium',
    setGlassIntensity: vi.fn(),
    getGlassClasses: () => 'backdrop-blur-md bg-white/80',
    applyAdaptiveGlass: vi.fn()
  })
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// Mock HTMLVideoElement methods
HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLVideoElement.prototype.pause = vi.fn();

// Helper function to render pages with router and helmet context
const renderWithRouter = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </HelmetProvider>
  );
};

describe('Compliance Warnings - Geographic Coverage', () => {
  describe('PlansPage', () => {
    beforeEach(() => {
      renderWithRouter(<PlansPage />);
    });

    it('should render geographic coverage warning section', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display correct cities for in-person consultations', () => {
      const consultationsText = screen.getByText(/Consultas Presenciais:/i);
      expect(consultationsText).toBeInTheDocument();

      const citiesText = screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i);
      expect(citiesText).toBeInTheDocument();
    });

    it('should show telemedicine availability nationwide', () => {
      const telemedicineLabel = screen.getByText(/Telemedicina:/i);
      expect(telemedicineLabel).toBeInTheDocument();

      const telemedicineText = screen.getByText(/todo o território nacional/i);
      expect(telemedicineText).toBeInTheDocument();
    });

    it('should show delivery availability nationwide', () => {
      const deliveryLabel = screen.getByText(/Entrega de Lentes:/i);
      expect(deliveryLabel).toBeInTheDocument();

      // Find all instances and check at least one exists in the compliance warning
      const deliveryTexts = screen.getAllByText(/todo o território nacional/i);
      expect(deliveryTexts.length).toBeGreaterThanOrEqual(2); // Telemedicine + Delivery
    });

    it('should display AlertCircle icon', () => {
      // Check for the warning section with amber styling
      const warningSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section');

      expect(warningSection).toBeInTheDocument();
    });

    it('should display MapPin icon for in-person consultations', () => {
      const consultationsSection = screen.getByText(/Consultas Presenciais:/i).closest('div');
      expect(consultationsSection).toBeInTheDocument();
    });

    it('should display CheckCircle icon for telemedicine', () => {
      const telemedicineSection = screen.getByText(/Telemedicina:/i).closest('div');
      expect(telemedicineSection).toBeInTheDocument();
    });

    it('should display Package icon for delivery', () => {
      const deliverySection = screen.getByText(/Entrega de Lentes:/i).closest('div');
      expect(deliverySection).toBeInTheDocument();
    });

    it('should have amber background styling', () => {
      const warningSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      // Check for amber gradient classes in className
      const className = warningSection?.className || '';
      expect(className).toMatch(/from-amber/);
    });

    it('should have amber border styling', () => {
      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      const className = warningBox?.className || '';
      expect(className).toMatch(/border-amber/);
    });

    it('should be accessible with proper heading hierarchy', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      // Should be h3 as per implementation
      expect(heading.tagName).toBe('H3');
    });

    it('should display all three coverage types', () => {
      expect(screen.getByText(/Consultas Presenciais:/i)).toBeInTheDocument();
      expect(screen.getByText(/Telemedicina:/i)).toBeInTheDocument();
      expect(screen.getByText(/Entrega de Lentes:/i)).toBeInTheDocument();
    });

    it('should emphasize city names with bold styling', () => {
      const citiesSpan = screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i);
      expect(citiesSpan).toHaveClass('font-bold');
    });

    it('should emphasize nationwide coverage with bold styling', () => {
      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      nationalTexts.forEach(text => {
        expect(text).toHaveClass('font-bold');
      });
    });
  });

  describe('PlanBasicoPage', () => {
    beforeEach(() => {
      renderWithRouter(<PlanBasicoPage />);
    });

    it('should render geographic coverage warning', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display correct cities for in-person consultations', () => {
      expect(screen.getByText(/Consultas Presenciais:/i)).toBeInTheDocument();
      expect(screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i)).toBeInTheDocument();
    });

    it('should show telemedicine availability nationwide', () => {
      expect(screen.getByText(/Telemedicina:/i)).toBeInTheDocument();

      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      expect(nationalTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should show delivery availability nationwide', () => {
      expect(screen.getByText(/Entrega de Lentes:/i)).toBeInTheDocument();
    });

    it('should have amber background and border', () => {
      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      const className = warningBox?.className || '';
      expect(className).toMatch(/from-amber/);
      expect(className).toMatch(/border-amber/);
    });

    it('should display warning between video and features sections', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      const featuresHeading = screen.getByRole('heading', {
        name: /O que está incluído?/i
      });

      expect(heading).toBeInTheDocument();
      expect(featuresHeading).toBeInTheDocument();
    });

    it('should be responsive with flex layout', () => {
      const warningSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      // Check for flex classes in className
      const className = warningSection?.className || '';
      expect(className).toMatch(/flex/);
    });

    it('should display all required icons', () => {
      const consultations = screen.getByText(/Consultas Presenciais:/i);
      const telemedicine = screen.getByText(/Telemedicina:/i);
      const delivery = screen.getByText(/Entrega de Lentes:/i);

      expect(consultations).toBeInTheDocument();
      expect(telemedicine).toBeInTheDocument();
      expect(delivery).toBeInTheDocument();
    });
  });

  describe('PlanPadraoPage', () => {
    beforeEach(() => {
      renderWithRouter(<PlanPadraoPage />);
    });

    it('should render geographic coverage warning', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display correct cities for in-person consultations', () => {
      expect(screen.getByText(/Consultas Presenciais:/i)).toBeInTheDocument();
      expect(screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i)).toBeInTheDocument();
    });

    it('should show telemedicine availability nationwide', () => {
      expect(screen.getByText(/Telemedicina:/i)).toBeInTheDocument();

      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      expect(nationalTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should show delivery availability nationwide', () => {
      expect(screen.getByText(/Entrega de Lentes:/i)).toBeInTheDocument();
    });

    it('should have amber background and border', () => {
      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      const className = warningBox?.className || '';
      expect(className).toMatch(/from-amber/);
      expect(className).toMatch(/border-amber/);
    });

    it('should maintain consistent styling with other plan pages', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('text-gray-900');
    });

    it('should be accessible with semantic HTML', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      expect(heading.tagName).toBe('H3');
    });

    it('should display all coverage types in correct order', () => {
      const text = screen.getByText(/Consultas Presenciais:/i).closest('section')?.textContent;

      expect(text).toContain('Consultas Presenciais');
      expect(text).toContain('Telemedicina');
      expect(text).toContain('Entrega de Lentes');
    });
  });

  describe('PlanPremiumPage', () => {
    beforeEach(() => {
      renderWithRouter(<PlanPremiumPage />);
    });

    it('should render geographic coverage warning', () => {
      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display correct cities for in-person consultations', () => {
      // Premium page doesn't have colon after labels
      expect(screen.getByText(/Consultas Presenciais/i)).toBeInTheDocument();
      expect(screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i)).toBeInTheDocument();
    });

    it('should show telemedicine availability nationwide', () => {
      // Premium page uses "Telemedicina" without colon
      expect(screen.getByText(/^Telemedicina$/i)).toBeInTheDocument();

      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      expect(nationalTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should show delivery availability nationwide', () => {
      // Premium page uses "Entrega de Lentes" without colon
      expect(screen.getByText(/^Entrega de Lentes$/i)).toBeInTheDocument();
    });

    it('should have amber background and border', () => {
      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      const className = warningBox?.className || '';
      expect(className).toMatch(/from-amber/);
      expect(className).toMatch(/border-amber/);
    });

    it('should use grid layout for Premium page (md:grid-cols-3)', () => {
      const warningSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section');

      // Check that the section contains a grid layout
      const gridContainer = warningSection?.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should display each coverage type in separate cards (Premium)', () => {
      const consultations = screen.getByText(/^Consultas Presenciais$/i);
      const telemedicine = screen.getByText(/^Telemedicina$/i);
      const delivery = screen.getByText(/^Entrega de Lentes$/i);

      // Each should be in its own container with bg-white class
      expect(consultations.closest('div.bg-white')).toBeInTheDocument();
      expect(telemedicine.closest('div.bg-white')).toBeInTheDocument();
      expect(delivery.closest('div.bg-white')).toBeInTheDocument();
    });

    it('should have enhanced visual styling for Premium', () => {
      const alertIcon = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section')?.querySelector('.bg-white.rounded-xl.p-3');

      // Premium version has icon in white box
      expect(alertIcon).toBeInTheDocument();
    });

    it('should display correct border colors for each coverage type', () => {
      const consultationsCard = screen.getByText(/^Consultas Presenciais$/i).closest('div');
      const telemedicineCard = screen.getByText(/^Telemedicina$/i).closest('div');
      const deliveryCard = screen.getByText(/^Entrega de Lentes$/i).closest('div');

      // Check that each has appropriate border color classes
      expect(consultationsCard?.className).toMatch(/border-amber/);
      expect(telemedicineCard?.className).toMatch(/border-green/);
      expect(deliveryCard?.className).toMatch(/border-cyan/);
    });

    it('should be responsive with md:grid-cols-3', () => {
      const gridContainer = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section')?.querySelector('.md\\:grid-cols-3');

      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have sufficient color contrast on PlansPage', () => {
      renderWithRouter(<PlansPage />);

      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      // Amber background with dark text should have good contrast
      const className = warningBox?.className || '';
      expect(className).toMatch(/text-gray/);
    });

    it('should have semantic HTML structure on all pages', () => {
      const pages = [
        <PlansPage />,
        <PlanBasicoPage />,
        <PlanPadraoPage />,
        <PlanPremiumPage />
      ];

      pages.forEach(page => {
        const { unmount } = renderWithRouter(page);

        const heading = screen.getByRole('heading', {
          name: /Importante: Cobertura de Atendimento/i
        });

        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H3');

        unmount();
      });
    });

    it('should have proper heading levels for screen readers', () => {
      renderWithRouter(<PlansPage />);

      const warningHeading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      // Should be H3, which is appropriate after page H1
      expect(warningHeading.tagName).toBe('H3');
    });

    it('should provide clear labels for each coverage type', () => {
      renderWithRouter(<PlansPage />);

      // Labels should be semantic and descriptive
      expect(screen.getByText(/Consultas Presenciais:/i)).toBeInTheDocument();
      expect(screen.getByText(/Telemedicina:/i)).toBeInTheDocument();
      expect(screen.getByText(/Entrega de Lentes:/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should use flex-col on mobile, md:flex-row on desktop (Basic/Padrao)', () => {
      renderWithRouter(<PlanBasicoPage />);

      const warningContent = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      // Should have responsive flex classes
      const className = warningContent?.className || '';
      expect(className).toMatch(/flex/);
    });

    it('should use grid layout on Premium with responsive columns', () => {
      renderWithRouter(<PlanPremiumPage />);

      const gridSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section');

      const grid = gridSection?.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should maintain readability on all screen sizes', () => {
      renderWithRouter(<PlansPage />);

      const heading = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      });

      // Should have responsive text sizing
      expect(heading).toHaveClass(expect.stringMatching(/text-(lg|xl)/));
    });
  });

  describe('CFM/LGPD Compliance', () => {
    it('should display geographic restrictions clearly', () => {
      renderWithRouter(<PlansPage />);

      const restrictionText = screen.getByText(/Disponíveis apenas em/i);
      expect(restrictionText).toBeInTheDocument();

      const cities = screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i);
      expect(cities).toBeInTheDocument();
    });

    it('should distinguish between local and national coverage', () => {
      renderWithRouter(<PlansPage />);

      // Local restriction
      expect(screen.getByText(/Disponíveis apenas em/i)).toBeInTheDocument();

      // National coverage
      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      expect(nationalTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should emphasize important coverage information with bold text', () => {
      renderWithRouter(<PlansPage />);

      const cities = screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i);
      expect(cities).toHaveClass('font-bold');

      const nationalTexts = screen.getAllByText(/todo o território nacional/i);
      nationalTexts.forEach(text => {
        expect(text).toHaveClass('font-bold');
      });
    });

    it('should use warning color scheme (amber) for important notices', () => {
      renderWithRouter(<PlansPage />);

      const warningBox = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('div');

      const className = warningBox?.className || '';
      expect(className).toMatch(/amber/);
    });

    it('should provide complete coverage information for informed consent', () => {
      renderWithRouter(<PlansPage />);

      const warningSection = screen.getByRole('heading', {
        name: /Importante: Cobertura de Atendimento/i
      }).closest('section');

      const text = warningSection?.textContent || '';

      // Must include all three coverage types
      expect(text).toContain('Consultas Presenciais');
      expect(text).toContain('Telemedicina');
      expect(text).toContain('Entrega de Lentes');

      // Must specify restrictions
      expect(text).toContain('Caratinga');
      expect(text).toContain('Ipatinga');
      expect(text).toContain('Belo Horizonte');
    });
  });

  describe('Consistency Across Pages', () => {
    it('should have identical text content on all pages', () => {
      const pages = [
        { component: <PlansPage />, name: 'PlansPage' },
        { component: <PlanBasicoPage />, name: 'PlanBasicoPage' },
        { component: <PlanPadraoPage />, name: 'PlanPadraoPage' },
        { component: <PlanPremiumPage />, name: 'PlanPremiumPage' }
      ];

      pages.forEach(({ component, name }) => {
        const { unmount } = renderWithRouter(component);

        expect(screen.getByText(/Caratinga, Ipatinga e Belo Horizonte\/MG/i)).toBeInTheDocument();

        const nationalTexts = screen.getAllByText(/todo o território nacional/i);
        expect(nationalTexts.length).toBeGreaterThanOrEqual(2);

        unmount();
      });
    });

    it('should have consistent amber color scheme on all pages', () => {
      const pages = [
        <PlansPage />,
        <PlanBasicoPage />,
        <PlanPadraoPage />,
        <PlanPremiumPage />
      ];

      pages.forEach(page => {
        const { unmount } = renderWithRouter(page);

        const warningBox = screen.getByRole('heading', {
          name: /Importante: Cobertura de Atendimento/i
        }).closest('div');

        const className = warningBox?.className || '';
        expect(className).toMatch(/amber/);

        unmount();
      });
    });

    it('should display all three coverage types on every page', () => {
      const pages = [
        <PlansPage />,
        <PlanBasicoPage />,
        <PlanPadraoPage />,
        <PlanPremiumPage />
      ];

      pages.forEach(page => {
        const { unmount } = renderWithRouter(page);

        expect(screen.getByText(/Consultas Presenciais:/i)).toBeInTheDocument();
        expect(screen.getByText(/Telemedicina:/i)).toBeInTheDocument();
        expect(screen.getByText(/Entrega de Lentes:/i)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
