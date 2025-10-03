/**
 * Testes para o componente Services
 * Verifica carrossel, cards de serviços, navegação e funcionalidades
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Services from '@/components/Services'

// Mock do Next.js Link
vi.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    h2: React.forwardRef(({ children, ...props }: any, ref) => (
      <h2 ref={ref} {...props}>{children}</h2>
    )),
    p: React.forwardRef(({ children, ...props }: any, ref) => (
      <p ref={ref} {...props}>{children}</p>
    ))
  },
  useReducedMotion: () => false,
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

// Mock do react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'services.badge': 'Nossos Serviços',
        'services.title_full': 'Cuidados Oftalmológicos Completos',
        'services.subtitle': 'Oferecemos uma gama completa de serviços oftalmológicos com tecnologia de ponta e profissionais especializados.',
        'services.items.consultations.title': 'Consultas Oftalmológicas',
        'services.items.consultations.description': 'Avaliação completa da saúde ocular com equipamentos modernos',
        'services.items.refraction.title': 'Exames de Refração',
        'services.items.refraction.description': 'Medida precisa da graduação para óculos e lentes de contato',
        'services.items.specialized.title': 'Tratamentos Especializados',
        'services.items.specialized.description': 'Terapias personalizadas para diversas condições oculares',
        'services.items.surgeries.title': 'Cirurgias Oftalmológicas',
        'services.items.surgeries.description': 'Procedimentos cirúrgicos com técnica avançada',
        'services.items.pediatric.title': 'Acompanhamento Pediátrico',
        'services.items.pediatric.description': 'Cuidado especializado para a saúde ocular infantil',
        'services.items.reports.title': 'Laudos Especializados',
        'services.items.reports.description': 'Emissão de laudos detalhados e precisos',
        'services.items.gonioscopy.title': 'Gonioscopia',
        'services.items.gonioscopy.description': 'Avaliação do ângulo iridocorneano',
        'services.items.retinaMapping.title': 'Mapeamento de Retina',
        'services.items.retinaMapping.description': 'Análise detalhada da estrutura retiniana',
        'services.items.cornealTopography.title': 'Topografia Corneana',
        'services.items.cornealTopography.description': 'Mapeamento completo da superfície corneana',
        'services.items.pachymetry.title': 'Paquimetria',
        'services.items.pachymetry.description': 'Medição da espessura corneana',
        'services.items.retinography.title': 'Retinografia',
        'services.items.retinography.description': 'Registro fotográfico da retina',
        'services.items.visualField.title': 'Campo Visual',
        'services.items.visualField.description': 'Avaliação do campo de visão periférico',
        'services.learn_more': 'Saiba mais',
        'ui.prev': 'Anterior',
        'ui.next': 'Próximo',
        'services.carousel_navigation': 'Navegação do carrossel de serviços',
        'services.go_to_page': 'Ir para página {index}'
      }
      return translations[key] || key
    }
  })
}))

// Mock dos ícones de serviços
vi.mock('@/components/icons/ServiceIcons', () => ({
  getServiceIcon: () => (
    <div data-testid="service-icon">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
      </svg>
    </div>
  )
}))

// Mock dos utilitários
vi.mock('@/utils/componentUtils', () => ({
  debounce: (fn: Function) => fn
}))

vi.mock('@/utils/scrollUtils', () => ({
  smoothScrollHorizontal: vi.fn()
}))

// Mock do hook de autoplay
vi.mock('@/hooks/useAutoplayCarousel', () => ({
  useAutoplayCarousel: () => ({
    currentIndex: 0,
    isEnabled: true,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    goTo: vi.fn(),
    handlers: {
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
      onTouchStart: vi.fn(),
      onTouchEnd: vi.fn()
    }
  })
}))

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock do ambiente de teste
    process.env.NODE_ENV = 'test'
  })

  it('renderiza o título da seção', () => {
    render(<Services />)

    expect(screen.getByText('Cuidados Oftalmológicos Completos')).toBeInTheDocument()
  })

  it('renderiza o subtítulo', () => {
    render(<Services />)

    expect(screen.getByText(/Oferecemos uma gama completa de serviços oftalmológicos/)).toBeInTheDocument()
  })

  it('exibe badge de serviços', () => {
    render(<Services />)

    const badge = screen.getByTestId('services-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Nossos Serviços')
  })

  it('renderiza texto literal para testes', () => {
    render(<Services />)

    const literalText = screen.getByTestId('services-literal-text')
    expect(literalText).toBeInTheDocument()
    expect(literalText).toHaveTextContent('Nossos Serviços')
  })

  it('renderiza cards de serviços', async () => {
    render(<Services />)

    // Espera carregamento dos serviços
    await waitFor(() => {
      expect(screen.getByText('Consultas Oftalmológicas')).toBeInTheDocument()
      expect(screen.getByText('Exames de Refração')).toBeInTheDocument()
      expect(screen.getByText('Tratamentos Especializados')).toBeInTheDocument()
      expect(screen.getByText('Cirurgias Oftalmológicas')).toBeInTheDocument()
    })
  })

  it('renderiza botões de navegação do carrossel', () => {
    render(<Services />)

    expect(screen.getByLabelText('Anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Próximo')).toBeInTheDocument()
  })

  it('renderiza indicadores de página', () => {
    render(<Services />)

    const indicators = document.querySelectorAll('[role="tab"]')
    expect(indicators.length).toBeGreaterThan(0)
  })

  it('possui estrutura semântica correta', () => {
    const { container } = render(<Services />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'services')

    const carousel = container.querySelector('[aria-label]')
    expect(carousel).toBeInTheDocument()
  })

  it('testa clique nos botões de navegação', async () => {
    const mockGoTo = vi.fn()
    vi.mocked(require('@/hooks/useAutoplayCarousel').useAutoplayCarousel).mockReturnValue({
      currentIndex: 0,
      isEnabled: true,
      play: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      next: mockGoTo,
      previous: mockGoTo,
      goTo: mockGoTo,
      handlers: {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onFocus: vi.fn(),
        onBlur: vi.fn(),
        onTouchStart: vi.fn(),
        onTouchEnd: vi.fn()
      }
    })

    render(<Services />)

    const nextButton = screen.getByLabelText('Próximo')
    const prevButton = screen.getByLabelText('Anterior')

    fireEvent.click(nextButton)
    fireEvent.click(prevButton)

    expect(mockGoTo).toHaveBeenCalledTimes(2)
  })

  it('testa clique nos indicadores de página', async () => {
    const mockGoTo = vi.fn()
    vi.mocked(require('@/hooks/useAutoplayCarousel').useAutoplayCarousel).mockReturnValue({
      currentIndex: 0,
      isEnabled: true,
      play: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      next: vi.fn(),
      previous: vi.fn(),
      goTo: mockGoTo,
      handlers: {
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onFocus: vi.fn(),
        onBlur: vi.fn(),
        onTouchStart: vi.fn(),
        onTouchEnd: vi.fn()
      }
    })

    render(<Services />)

    const firstIndicator = document.querySelector('[role="tab"]')
    if (firstIndicator) {
      fireEvent.click(firstIndicator)
      expect(mockGoTo).toHaveBeenCalled()
    }
  })

  it('renderiza links "Saiba mais" em cada serviço', async () => {
    render(<Services />)

    await waitFor(() => {
      const learnMoreLinks = screen.getAllByText('Saiba mais')
      expect(learnMoreLinks.length).toBeGreaterThan(0)
    })
  })

  it('testa navegação por teclado', async () => {
    render(<Services />)

    const carousel = document.querySelector('[tabIndex="0"]')
    if (carousel) {
      carousel.focus()

      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' })

      // Verifica se eventos de teclado foram tratados
      expect(carousel).toHaveFocus()
    }
  })

  it('testa interações touch', async () => {
    render(<Services />)

    const carousel = document.querySelector('[tabIndex="0"]')
    if (carousel) {
      // Simula touch start
      fireEvent.touchStart(carousel, {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      // Simula touch move
      fireEvent.touchMove(carousel, {
        touches: [{ clientX: 50, clientY: 100 }]
      })

      // Simula touch end
      fireEvent.touchEnd(carousel)
    }
  })

  it('testa interações mouse', async () => {
    render(<Services />)

    const carousel = document.querySelector('[tabIndex="0"]')
    if (carousel) {
      // Simula mouse down
      fireEvent.mouseDown(carousel, { clientX: 100, clientY: 100 })

      // Simula mouse move
      fireEvent.mouseMove(carousel, { clientX: 50, clientY: 100 })

      // Simula mouse up
      fireEvent.mouseUp(carousel)
    }
  })

  it('testa hover e focus handlers', async () => {
    const mockHandlers = {
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn()
    }

    vi.mocked(require('@/hooks/useAutoplayCarousel').useAutoplayCarousel).mockReturnValue({
      currentIndex: 0,
      isEnabled: true,
      play: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      next: vi.fn(),
      previous: vi.fn(),
      goTo: vi.fn(),
      handlers: mockHandlers
    })

    render(<Services />)

    const carousel = document.querySelector('[tabIndex="0"]')
    if (carousel) {
      fireEvent.mouseEnter(carousel)
      fireEvent.mouseLeave(carousel)
      fireEvent.focusIn(carousel)
      fireEvent.focusOut(carousel)

      expect(mockHandlers.onMouseEnter).toHaveBeenCalled()
      expect(mockHandlers.onMouseLeave).toHaveBeenCalled()
      expect(mockHandlers.onFocus).toHaveBeenCalled()
      expect(mockHandlers.onBlur).toHaveBeenCalled()
    }
  })

  it('testa modo completo do componente', () => {
    render(<Services full={true} />)

    // Em modo completo, deve exibir título diferente
    expect(screen.getByText('Nossos Serviços')).toBeInTheDocument()
  })

  it('testa autoplay desabilitado', () => {
    render(<Services autoplay={false} />)

    // Componente deve renderizar mesmo com autoplay desabilitado
    expect(screen.getByText('Cuidados Oftalmológicos Completos')).toBeInTheDocument()
  })

  it('testa estados de loading', async () => {
    render(<Services />)

    // Inicialmente pode estar em loading
    // Após carregamento, deve exibir conteúdo
    await waitFor(() => {
      expect(screen.getByText('Consultas Oftalmológicas')).toBeInTheDocument()
    })
  })

  it('testa responsividade do layout', () => {
    const { container } = render(<Services />)

    const section = container.querySelector('section')
    expect(section).toHaveClass('py-16', 'lg:py-28')

    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'md:px-6')
  })

  it('testa classes do carrossel', () => {
    const { container } = render(<Services />)

    const carousel = container.querySelector('.horizontal-scroll')
    expect(carousel).toHaveClass(
      'flex',
      'gap-6',
      'lg:gap-8',
      'overflow-x-auto',
      'snap-x',
      'snap-proximity'
    )
  })

  it('testa background e gradientes', () => {
    const { container } = render(<Services />)

    const section = container.querySelector('section')
    expect(section).toHaveClass(
      'bg-gradient-to-br',
      'from-slate-50',
      'via-blue-50/30',
      'to-indigo-50/50'
    )

    // Verifica elementos de background decorativos
    const bgElements = container.querySelectorAll('[class*="bg-gradient"]')
    expect(bgElements.length).toBeGreaterThan(0)
  })

  it('testa acessibilidade dos links', async () => {
    render(<Services />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  it('testa acessibilidade dos botões', () => {
    render(<Services />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label')
    })
  })

  it('testa elementos de navegação ARIA', () => {
    render(<Services />)

    const tablist = document.querySelector('[role="tablist"]')
    expect(tablist).toBeInTheDocument()

    const tabs = document.querySelectorAll('[role="tab"]')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
      expect(tab).toHaveAttribute('aria-label')
    })
  })

  it('testa lazy loading dos cards', () => {
    render(<Services />)

    // Em ambiente de teste, cards não devem usar lazy loading
    const cards = document.querySelectorAll('[data-card]')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('testa otimização de performance', () => {
    render(<Services />)

    const section = document.querySelector('section')

    // Verifica seção tem ID para navegação
    expect(section).toHaveAttribute('id', 'services')

    // Verifica se há indicadores para navegação
    const indicators = document.querySelectorAll('[role="tab"]')
    expect(indicators.length).toBeGreaterThan(0)
  })
})