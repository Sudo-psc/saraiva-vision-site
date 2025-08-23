import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Hero from '../Hero'

// Mock i18next with realistic translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'hero.partner': 'Parceiro Oficial Amor e Saúde',
        'hero.title': 'Cuidando da sua visão com excelência',
        'hero.subtitle': 'Na Saraiva Vision, combinamos tecnologia de ponta com um atendimento humanizado para oferecer o melhor em saúde ocular. Sua visão é a nossa prioridade.',
        'hero.schedule_button': 'Agendar Consulta',
        'hero.services_button': 'Nossos Serviços',
        'hero.advanced_tech_title': 'Tecnologia Avançada',
        'hero.advanced_tech_desc': 'Equipamentos de última geração para diagnósticos precisos.'
      };
      return mockTranslations[key] || key;
    },
    i18n: { language: 'pt' }
  }),
  Trans: ({ children, i18nKey }) => {
    if (i18nKey === 'hero.title') {
      return 'Cuidando da sua visão com excelência';
    }
    if (i18nKey === 'hero.patients_served') {
      return 'Mais de 5.000 pacientes atendidos com satisfação';
    }
    return children || i18nKey;
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  }
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Hero Component', () => {
  it('renders hero section', () => {
    renderWithRouter(<Hero />)
    
    const heroSection = screen.getByText(/Cuidando da sua/i).closest('section')
    expect(heroSection).toBeInTheDocument()
  })

  it('displays main heading', () => {
    renderWithRouter(<Hero />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Cuidando da sua visão com excelência')
  })

  it('displays subtitle', () => {
    renderWithRouter(<Hero />)
    
    const subtitle = screen.getByText(/Na Saraiva Vision, combinamos tecnologia/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('includes call-to-action buttons', () => {
    renderWithRouter(<Hero />)
    
    const scheduleButton = screen.getByText(/Agendar Consulta/i)
    expect(scheduleButton).toBeInTheDocument()
    
    const servicesButton = screen.getByText(/Nossos Serviços/i)
    expect(servicesButton).toBeInTheDocument()
  })

  it('contains contact information', () => {
    renderWithRouter(<Hero />)
    
    const contactButton = screen.getByText(/Outras formas de contato/i)
    expect(contactButton).toBeInTheDocument()
    
    const patientsServedText = screen.getByText(/Mais de 5.000 pacientes/i)
    expect(patientsServedText).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithRouter(<Hero />)
    
    const section = screen.getByText(/Cuidando da sua/i).closest('section')
    expect(section).toBeInTheDocument()
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})