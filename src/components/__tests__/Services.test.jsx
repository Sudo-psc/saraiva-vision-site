import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Services from '../Services'

// Mock i18next with realistic translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'services.title': 'Nossos Serviços',
        'services.subtitle': 'Oferecemos uma gama completa de serviços oftalmológicos para cuidar da sua visão com a máxima qualidade e tecnologia.',
        'services.items.consultations.title': 'Consultas Oftalmológicas Completas',
        'services.items.consultations.description': 'Exame oftalmológico abrangente com tecnologia de ponta.',
        'services.items.refraction.title': 'Exames de Refração',
        'services.items.refraction.description': 'Determinação precisa do grau e adaptação de lentes.',
        'services.items.specialized.title': 'Tratamentos Especializados',
        'services.items.specialized.description': 'Tratamentos modernos para diversas condições oculares.',
        'services.items.surgeries.title': 'Cirurgias Oftalmológicas',
        'services.items.surgeries.description': 'Procedimentos cirúrgicos com tecnologia de última geração.',
        'services.items.pediatric.title': 'Oftalmologia Pediátrica',
        'services.items.pediatric.description': 'Cuidados especializados para a saúde ocular infantil.',
        'services.items.reports.title': 'Laudos Especializados',
        'services.items.reports.description': 'Relatórios médicos detalhados e precisos.'
      };
      return mockTranslations[key] || key;
    },
    i18n: { language: 'pt' }
  })
}))

// Mock ServiceIcons component
vi.mock('../icons/ServiceIcons', () => ({
  ConsultationIcon: () => <div data-testid="consultation-icon">Consultation Icon</div>,
  RefractionIcon: () => <div data-testid="refraction-icon">Refraction Icon</div>,
  TreatmentIcon: () => <div data-testid="treatment-icon">Treatment Icon</div>,
  SurgeryIcon: () => <div data-testid="surgery-icon">Surgery Icon</div>,
  PediatricIcon: () => <div data-testid="pediatric-icon">Pediatric Icon</div>,
  ReportsIcon: () => <div data-testid="reports-icon">Reports Icon</div>,
  getServiceIcon: (serviceId, props = {}) => {
    const iconMap = {
      'consultas-oftalmologicas': 'consultation-icon',
      'exames-de-refracao': 'refraction-icon',
      'tratamentos-especializados': 'treatment-icon',
      'cirurgias-oftalmologicas': 'surgery-icon',
      'acompanhamento-pediatrico': 'pediatric-icon',
      'laudos-especializados': 'reports-icon'
    }
    const iconId = iconMap[serviceId] || 'consultation-icon'
    return <div data-testid={iconId}>{serviceId} Icon</div>
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, initial, viewport, transition, whileHover, animate, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, whileInView, initial, viewport, transition, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, whileInView, initial, viewport, transition, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, whileInView, initial, viewport, transition, ...props }) => <p {...props}>{children}</p>,
  }
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  )
}

describe('Services Component', () => {
  it('renders services section', () => {
    renderWithRouter(<Services />)
    
    const section = screen.getByText(/Nossos Serviços/i).closest('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'services')
  })

  it('displays main title and subtitle', () => {
    renderWithRouter(<Services />)
    
    const title = screen.getByText('Nossos Serviços')
    expect(title).toBeInTheDocument()
    
    const subtitle = screen.getByText(/Oferecemos uma gama completa de serviços/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders all service cards', () => {
    renderWithRouter(<Services />)
    
    // Check for service titles
    expect(screen.getByText('Consultas Oftalmológicas Completas')).toBeInTheDocument()
    expect(screen.getByText('Exames de Refração')).toBeInTheDocument()
    expect(screen.getByText('Tratamentos Especializados')).toBeInTheDocument()
    expect(screen.getByText('Cirurgias Oftalmológicas')).toBeInTheDocument()
    expect(screen.getByText('Oftalmologia Pediátrica')).toBeInTheDocument()
    expect(screen.getByText('Laudos Especializados')).toBeInTheDocument()
  })

  it('displays service descriptions', () => {
    renderWithRouter(<Services />)
    
    expect(screen.getByText(/Exame oftalmológico abrangente/i)).toBeInTheDocument()
    expect(screen.getByText(/Determinação precisa do grau/i)).toBeInTheDocument()
    expect(screen.getByText(/Tratamentos modernos para diversas/i)).toBeInTheDocument()
    expect(screen.getByText(/Procedimentos cirúrgicos com tecnologia/i)).toBeInTheDocument()
    expect(screen.getByText(/Cuidados especializados para a saúde ocular infantil/i)).toBeInTheDocument()
    expect(screen.getByText(/Relatórios médicos detalhados/i)).toBeInTheDocument()
  })

  it('includes service icons', () => {
    renderWithRouter(<Services />)
    
    expect(screen.getByTestId('consultation-icon')).toBeInTheDocument()
    expect(screen.getByTestId('refraction-icon')).toBeInTheDocument()
    expect(screen.getByTestId('treatment-icon')).toBeInTheDocument()
    expect(screen.getByTestId('surgery-icon')).toBeInTheDocument()
    expect(screen.getByTestId('pediatric-icon')).toBeInTheDocument()
    expect(screen.getByTestId('reports-icon')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithRouter(<Services />)
    
    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 2, name: /Nossos Serviços/i })
    expect(mainHeading).toBeInTheDocument()
    
    // Check for service headings
    const serviceHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(serviceHeadings).toHaveLength(6)
  })

  it('has service links that navigate to detail pages', () => {
    renderWithRouter(<Services />)
    
    const serviceLinks = screen.getAllByRole('link')
    expect(serviceLinks.length).toBeGreaterThan(0)
    
    // Check that links have proper href attributes for navigation
    serviceLinks.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('has proper styling classes', () => {
    renderWithRouter(<Services />)
    
    const section = screen.getByText(/Nossos Serviços/i).closest('section')
    expect(section).toHaveClass('py-20')
    
    // Check for responsive grid layout
    const container = section?.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('includes call-to-action elements', () => {
    renderWithRouter(<Services />)
    
    // Look for any button or link elements that might be CTAs
    const links = screen.getAllByRole('link')

    // Services should have interactive elements
    expect(links.length).toBeGreaterThan(0)
  })

  it('has accessible markup', () => {
    renderWithRouter(<Services />)
    
    const section = screen.getByText(/Nossos Serviços/i).closest('section')
    expect(section).toBeInTheDocument()
    
    // Check for proper heading hierarchy
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    const h3Elements = screen.getAllByRole('heading', { level: 3 })
    
    expect(h2Elements.length).toBeGreaterThanOrEqual(1)
    expect(h3Elements.length).toBeGreaterThanOrEqual(6)
  })
})