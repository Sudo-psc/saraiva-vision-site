import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from '@/utils/router';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import ServiceDetailPage from '../ServiceDetailPage';
import { trackConversion } from '@/utils/analytics';

// Mock the analytics module
vi.mock('@/utils/analytics', () => ({
  trackConversion: vi.fn()
}));

// Mock all dependencies to create isolated test
vi.mock('@/data/serviceConfig', () => ({
  createServiceConfig: () => ({
    'consulta-oftalmologica': {
      id: 'consulta-oftalmologica',
      title: 'Consulta Oftalmológica',
      description: 'Consulta completa',
      category: 'consultation'
    }
  }),
  STYLES: {
    CONTAINER: 'container',
    MAX_WIDTH: 'max-w-7xl',
    GRID_RESPONSIVE: 'grid'
  }
}));

vi.mock('@/components/SEOHead', () => ({ default: () => <div data-testid="seo-head" /> }));
vi.mock('@/components/Navbar', () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

// Os componentes internos foram refatorados; o teste deve focar no CTA real renderizado

// Mock useParams e useNavigate do react-router-dom
const mockNavigate = vi.fn();
vi.mock('@/utils/router', async () => {
  const actual = await vi.importActual('@/utils/router');
  return {
    ...actual,
    useParams: () => ({ serviceId: 'consulta-oftalmologica' }),
    useNavigate: () => mockNavigate
  };
});

const renderWithProviders = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/servicos/consulta-oftalmologica']}>
        {component}
      </MemoryRouter>
    </I18nextProvider>
  );
};

describe('ServiceDetailPage GTM Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { href: 'https://saraivavision.com.br/servicos/consulta-oftalmologica' },
      writable: true
    });
  });

  it('should render service page with correct content', () => {
    renderWithProviders(<ServiceDetailPage />);

    // Verify component renders
    expect(screen.getByTestId('seo-head')).toBeDefined();
    expect(screen.getByTestId('navbar')).toBeDefined();
    // Verifica elementos essenciais renderizados (heading principal)
    expect(screen.getByRole('heading', { level: 1, name: 'Consulta Oftalmológica' })).toBeInTheDocument();
    // Verifica breadcrumb "Serviços / <título>"
    expect(screen.getByText('Serviços')).toBeInTheDocument();
  });

  it('should handle CTA clicks', () => {
    renderWithProviders(<ServiceDetailPage />);

    const scheduleBtn = screen.getByRole('button', { name: /Agendar Agora/i });
    scheduleBtn.click();

    expect(mockNavigate).toHaveBeenCalledWith('/contato');
  });
});
