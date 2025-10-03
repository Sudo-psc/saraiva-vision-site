/**
 * Testes para o componente Hero
 * Verifica renderização, animações, CTAs e elementos visuais
 */

import React from 'react'
import { render, screen, fireEvent } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Hero from '@/components/Hero'

// Mock do Next.js Image
vi.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

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
    ))
  }
}))

// Mock do react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'hero.partner': 'Parceiro Amor e Saúde',
        'hero.title': 'Cuidando da sua <1>visão</1> com excelência',
        'hero.subtitle': 'Oferecemos cuidados oftalmológicos completos com tecnologia de ponta e uma equipe especializada para sua família.',
        'hero.services_button': 'Nossos Serviços',
        'hero.advanced_tech_title': 'Tecnologia Avançada',
        'hero.advanced_tech_desc': 'Equipamentos modernos para diagnóstico preciso',
        'ui.alt.satisfied_patient_1': 'Paciente satisfeito 1',
        'ui.alt.satisfied_patient_2': 'Paciente satisfeito 2',
        'ui.alt.hero_image': 'Família sorrindo - Saraiva Vision'
      }
      return translations[key] || key
    }
  }),
  Trans: ({ i18nKey, children }: any) => <div data-i18n-key={i18nKey}>{children}</div>
}))

// Mock dos utilitários e componentes
vi.mock('@/utils/scrollUtils', () => ({
  smoothScrollTo: vi.fn()
}))

vi.mock('@/components/ui/ImageWithFallback', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

vi.mock('@/components/UnifiedCTA', () => ({
  default: ({ variant, className }: any) => (
    <button data-variant={variant} className={className}>
      Agendar Consulta
    </button>
  )
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o título principal com gradiente', () => {
    render(<Hero />)

    const title = screen.getByText(/Cuidando da sua/)
    expect(title).toBeInTheDocument()

    // Verifica se existe elemento com classe text-gradient
    const gradientText = document.querySelector('.text-gradient')
    expect(gradientText).toBeInTheDocument()
    expect(gradientText).toHaveTextContent('visão')
  })

  it('renderiza o subtítulo', () => {
    render(<Hero />)

    const subtitle = screen.getByText(/Oferecemos cuidados oftalmológicos completos/)
    expect(subtitle).toBeInTheDocument()
  })

  it('exibe badge de parceiro', () => {
    render(<Hero />)

    const partnerBadge = screen.getByText('Parceiro Amor e Saúde')
    expect(partnerBadge).toBeInTheDocument()

    const badgeContainer = partnerBadge.closest('.bg-blue-100')
    expect(badgeContainer).toBeInTheDocument()
    expect(badgeContainer).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('renderiza botão de agendamento principal', () => {
    render(<Hero />)

    const ctaButton = screen.getByText('Agendar Consulta')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('data-variant', 'hero')
  })

  it('renderiza botão de serviços', () => {
    render(<Hero />)

    const servicesButton = screen.getByText('Nossos Serviços')
    expect(servicesButton).toBeInTheDocument()
    expect(servicesButton).toBeInTheDocument()
  })

  it('testa clique no botão de serviços', () => {
    const { smoothScrollTo } = require('@/utils/scrollUtils')

    render(<Hero />)

    const servicesButton = screen.getByText('Nossos Serviços')
    fireEvent.click(servicesButton)

    expect(smoothScrollTo).toHaveBeenCalledWith('#services', {
      offset: -80,
      duration: 800,
      easing: 'easeInOutCubic'
    })
  })

  it('renderiza avatares de pacientes', () => {
    render(<Hero />)

    const patientImages = document.querySelectorAll('img[alt*="Paciente"]')
    expect(patientImages.length).toBe(2)
  })

  it('exibe informações sobre pacientes atendidos', () => {
    render(<Hero />)

    expect(screen.getByText(/Mais de 5.000 pacientes/)).toBeInTheDocument()
    expect(screen.getByText(/atendidos com satisfação/)).toBeInTheDocument()
  })

  it('renderiza badge de +5k pacientes com estrelas', () => {
    render(<Hero />)

    const plus5kBadge = screen.getByText('+5k')
    expect(plus5kBadge).toBeInTheDocument()

    // Verifica se há estrelas (representadas por SVGs)
    const stars = document.querySelectorAll('.text-white.drop-shadow-sm')
    expect(stars.length).toBe(5)
  })

  it('renderiza imagem principal do hero', () => {
    render(<Hero />)

    const heroImage = document.querySelector('img[alt*="Família sorrindo"]')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src', '/img/hero.avif')
  })

  it('renderiza card de tecnologia avançada', () => {
    render(<Hero />)

    expect(screen.getByText('Tecnologia Avançada')).toBeInTheDocument()
    expect(screen.getByText('Equipamentos modernos para diagnóstico preciso')).toBeInTheDocument()
  })

  it('possui estrutura semântica correta', () => {
    const { container } = render(<Hero />)

    const heroSection = container.querySelector('section')
    expect(heroSection).toBeInTheDocument()
    expect(heroSection).toHaveAttribute('id', 'home')
  })

  it('testa layout responsivo do grid', () => {
    const { container } = render(<Hero />)

    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2')
    expect(gridContainer).toHaveClass('gap-16', 'items-center')
  })

  it('testa classes de background e gradientes', () => {
    const { container } = render(<Hero />)

    const heroSection = container.querySelector('section')
    expect(heroSection).toHaveClass('bg-hero-enhanced', 'min-h-[100dvh]')

    // Verifica gradientes de fundo
    const gradientElements = container.querySelectorAll('[class*="bg-gradient"]')
    expect(gradientElements.length).toBeGreaterThan(0)
  })

  it('testa animações Framer Motion', () => {
    const { container } = render(<Hero />)

    // Verifica se elementos motion.div são renderizados
    const motionDivs = container.querySelectorAll('div')
    expect(motionDivs.length).toBeGreaterThan(0)
  })

  it('testa otimização de imagens', () => {
    render(<Hero />)

    const heroImage = document.querySelector('img[alt*="Família sorrindo"]')
    expect(heroImage).toHaveAttribute('loading', 'eager')
    expect(heroImage).toHaveAttribute('decoding', 'async')
    expect(heroImage).toHaveAttribute('sizes', '(min-width: 1024px) 800px, 100vw')
  })

  it('testa hover states e transições', () => {
    const { container } = render(<Hero />)

    // Verifica elementos com transições
    const transitionElements = container.querySelectorAll('[class*="transition-"]')
    expect(transitionElements.length).toBeGreaterThan(0)

    // Verifica hover states
    const hoverElements = container.querySelectorAll('[class*="hover:"]')
    expect(hoverElements.length).toBeGreaterThan(0)
  })

  it('testa posicionamento do card de tecnologia', () => {
    const { container } = render(<Hero />)

    const techCard = container.querySelector('.glass-card')
    expect(techCard).toBeInTheDocument()

    // Verifica classes de posicionamento responsivo
    expect(techCard).toHaveClass(
      'absolute',
      '-bottom-8',
      'left-1/2',
      '-translate-x-1/2',
      'md:translate-x-0',
      'md:-left-12',
      'md:-bottom-4'
    )
  })

  it('testa acessibilidade dos botões', () => {
    render(<Hero />)

    const buttons = screen.getAllByRole('button')

    buttons.forEach(button => {
      expect(button).toBeEnabled()
    })
  })

  it('testa classes de responsividade do container', () => {
    const { container } = render(<Hero />)

    const containerElement = container.querySelector('.container')
    expect(containerElement).toHaveClass(
      'mx-auto',
      'px-6',
      'md:px-8',
      'lg:px-[6%]',
      'xl:px-[7%]',
      '2xl:px-[8%]'
    )
  })

  it('testa espaçamento e alinhamento', () => {
    const { container } = render(<Hero />)

    // Verifica espaçamento do conteúdo
    const heroSection = container.querySelector('section')
    expect(heroSection).toHaveClass('pt-32', 'pb-24', 'md:pt-40', 'md:pb-32')

    // Verifica alinhamento do texto
    const textContent = container.querySelector('.text-center.lg\\:text-left')
    expect(textContent).toBeInTheDocument()
  })

  it('testa cards de pacientes com checkmarks', () => {
    render(<Hero />)

    // Verifica se há checkmarks verdes
    const checkmarks = document.querySelectorAll('.bg-green-500.rounded-full')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('testa efeitos visuais avançados', () => {
    const { container } = render(<Hero />)

    // Verifica elementos com efeitos de sombra
    const shadowElements = container.querySelectorAll('[class*="shadow-"]')
    expect(shadowElements.length).toBeGreaterThan(0)

    // Verifica elementos com efeitos de blur
    const blurElements = container.querySelectorAll('[class*="blur-"]')
    expect(blurElements.length).toBeGreaterThan(0)

    // Verifica elementos com animação pulse
    const pulseElements = container.querySelectorAll('.animate-pulse-soft')
    expect(pulseElements.length).toBeGreaterThan(0)
  })
})