import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

vi.mock('@/components/ServiceDetail/ServiceHeader', () => ({
  default: ({ onScheduleClick }) => (
    <div data-testid="service-header">
      <button onClick={onScheduleClick} data-testid="schedule-btn">Agendar</button>
    </div>
  )
}));

vi.mock('@/components/ServiceDetail/ServiceMainContent', () => ({
  default: () => <div data-testid="service-content" />
}));

vi.mock('@/components/ServiceDetail/ServiceSidebar', () => ({
  default: ({ onScheduleClick }) => (
    <div data-testid="service-sidebar">
      <button onClick={onScheduleClick} data-testid="sidebar-btn">Sidebar</button>
    </div>
  )
}));

// Mock useParams from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ serviceId: 'consulta-oftalmologica' })
  };
});

const renderWithProviders = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/servico/consulta-oftalmologica']}>
        {component}
      </MemoryRouter>
    </I18nextProvider>
  );
};

describe('ServiceDetailPage GTM Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { href: 'https://saraivavision.com.br/servico/consulta-oftalmologica' },
      writable: true
    });
  });

  it('should render and track page view', () => {
    renderWithProviders(<ServiceDetailPage />);
    
    // Verify component renders
    expect(screen.getByTestId('seo-head')).toBeDefined();
    expect(screen.getByTestId('navbar')).toBeDefined();
    expect(screen.getByTestId('service-header')).toBeDefined();
    
    // Verify tracking was called
    expect(trackConversion).toHaveBeenCalledWith('service_page_view', {
      service_id: 'consulta-oftalmologica', 
      service_title: 'Consulta Oftalmológica',
      service_category: 'consultation',
      page_url: 'https://saraivavision.com.br/servico/consulta-oftalmologica'
    });
  });

  it('should handle CTA clicks', () => {
    renderWithProviders(<ServiceDetailPage />);
    
    const scheduleBtn = screen.getByTestId('schedule-btn');
    scheduleBtn.click();
    
    expect(trackConversion).toHaveBeenCalledWith('service_cta_click', {
      service_id: 'consulta-oftalmologica',
      service_title: 'Consulta Oftalmológica', 
      cta_type: 'schedule',
      source: 'service_page'
    });
  });
});