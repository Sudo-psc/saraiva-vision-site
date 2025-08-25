import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Services from '../Services'

// Mock i18next with realistic translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'services.badge': 'Nossos Serviços',
        'services.title': 'Cuidados Oftalmológicos Completos',
        'services.subtitle': 'Oferecemos uma gama abrangente de serviços especializados em saúde ocular, utilizando tecnologia de ponta e expertise médica.',
        'services.consultation.title': 'Consultas Especializadas',
        'services.consultation.description': 'Avaliação completa da saúde ocular com equipamentos modernos.',
        'services.exams.title': 'Exames Diagnósticos',
        'services.exams.description': 'Exames precisos para diagnóstico precoce de doenças oculares.',
        'services.treatments.title': 'Tratamentos Avançados',
        'services.treatments.description': 'Tratamentos modernos e eficazes para diversas condições oculares.',
        'services.surgery.title': 'Cirurgias Especializadas',
        'services.surgery.description': 'Procedimentos cirúrgicos com tecnologia de última geração.',
        'services.pediatric.title': 'Oftalmologia Pediátrica',
        'services.pediatric.description': 'Cuidados especializados para a saúde ocular infantil.',
        'services.reports.title': 'Laudos Especializados',
        'services.reports.description': 'Relatórios médicos detalhados e precisos.'
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
      'exames-diagnosticos': 'refraction-icon',
      'tratamentos-avancados': 'treatment-icon',
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
    
    const title = screen.getByText('Cuidados Oftalmológicos Completos')
    expect(title).toBeInTheDocument()
    
    const subtitle = screen.getByText(/Oferecemos uma gama abrangente de serviços/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders all service cards', () => {
    renderWithRouter(<Services />)
    
    // Check for service titles
    expect(screen.getByText('Consultas Especializadas')).toBeInTheDocument()
    expect(screen.getByText('Exames Diagnósticos')).toBeInTheDocument()
    expect(screen.getByText('Tratamentos Avançados')).toBeInTheDocument()
    expect(screen.getByText('Cirurgias Especializadas')).toBeInTheDocument()
    expect(screen.getByText('Oftalmologia Pediátrica')).toBeInTheDocument()
    expect(screen.getByText('Laudos Especializados')).toBeInTheDocument()
  })

  it('displays service descriptions', () => {
    renderWithRouter(<Services />)
    
    expect(screen.getByText(/Avaliação completa da saúde ocular/i)).toBeInTheDocument()
    expect(screen.getByText(/Exames precisos para diagnóstico precoce/i)).toBeInTheDocument()
    expect(screen.getByText(/Tratamentos modernos e eficazes/i)).toBeInTheDocument()
    expect(screen.getByText(/Procedimentos cirúrgicos com tecnologia/i)).toBeInTheDocument()
    expect(screen.getByText(/Cuidados especializados para a saúde ocular infantil/i)).toBeInTheDocument()
    expect(screen.getByText(/Relatórios médicos detalhados/i)).toBeInTheDocument()
  })

  it('includes service icons', () => {
    renderWithRouter(<Services />)
    
    expect(screen.getByTestId('consultation-icon')).toBeInTheDocument()
    expect(screen.getByTestId('exam-icon')).toBeInTheDocument()
    expect(screen.getByTestId('treatment-icon')).toBeInTheDocument()
    expect(screen.getByTestId('surgery-icon')).toBeInTheDocument()
    expect(screen.getByTestId('pediatric-icon')).toBeInTheDocument()
    expect(screen.getByTestId('report-icon')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithRouter(<Services />)
    
    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 2, name: /Cuidados Oftalmológicos Completos/i })
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
    expect(section).toHaveClass('py-16')
    
    // Check for responsive grid layout
    const container = section?.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('includes call-to-action elements', () => {
    renderWithRouter(<Services />)
    
    // Look for any button or link elements that might be CTAs
    const buttons = screen.queryAllByRole('button')
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