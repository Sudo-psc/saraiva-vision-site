/**
 * Testes para o componente Navbar
 * Verifica navegação, responsividade, acessibilidade e funcionalidades
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Navbar from '@/components/Navbar'

// Mock do Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock do Next.js Link
vi.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock do react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'navbar.home': 'Início',
        'navbar.services': 'Serviços',
        'navbar.lenses': 'Lentes',
        'navbar.blog': 'Blog',
        'navbar.podcast': 'Podcast',
        'navbar.about': 'Sobre',
        'navbar.faq': 'FAQ',
        'navbar.schedule': 'Agendar Consulta',
        'navbar.schedule_consultation': 'Agendar Consulta',
        'navbar.home_link_label': 'Página inicial',
        'navbar.primary_navigation': 'Navegação principal',
        'navbar.close_menu': 'Fechar menu',
        'navbar.open_menu': 'Abrir menu',
      }
      return translations[key] || key
    }
  })
}))

// Mock do Logo
vi.mock('@/components/Logo', () => ({
  default: ({ isWhite }: { isWhite: boolean }) => (
    <div data-testid="logo" data-white={isWhite}>
      Saraiva Vision Logo
    </div>
  )
}))

// Mock do useBodyScrollLock
vi.mock('@/hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn()
}))

// Mock do Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Limpa o DOM antes de cada teste
    document.body.innerHTML = ''
    document.documentElement.scrollTop = 0
    window.pageYOffset = 0
  })

  it('renderiza o logo da navegação', () => {
    render(<Navbar />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-white', 'true')
  })

  it('renderiza todos os links de navegação desktop', () => {
    render(<Navbar />)

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Lentes')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Podcast')).toBeInTheDocument()
    expect(screen.getByText('Sobre')).toBeInTheDocument()
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('renderiza botão de agendamento', () => {
    render(<Navbar />)

    expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
  })

  it('renderiza menu mobile em telas pequenas', () => {
    render(<Navbar />)

    // Botão de menu mobile deve estar visível
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
  })

  it('abre e fecha menu mobile ao clicar no botão', async () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button')

    // Menu deve começar fechado
    expect(screen.queryByText('Agendar Consulta')).not.toBeInTheDocument()

    // Abre o menu
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
    })

    // Fecha o menu
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.queryByText('Agendar Consulta')).not.toBeInTheDocument()
    })
  })

  it('possui atributos ARIA corretos no menu mobile', () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button')

    // Estado inicial: menu fechado
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveAttribute('aria-controls', 'mobile-primary-navigation')
    expect(menuButton).toHaveAttribute('aria-label', 'Abrir menu')
  })

  it('atualiza atributos ARIA ao abrir menu mobile', async () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button')

    // Abre o menu
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      expect(menuButton).toHaveAttribute('aria-label', 'Fechar menu')
    })
  })

  it('possui links com atributos corretos', () => {
    render(<Navbar />)

    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)

    // Verifica se os links têm href
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('fecha menu mobile ao clicar em um link', async () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button')

    // Abre o menu
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
    })

    // Clica em um link
    const homeLink = screen.getByText('Início')
    fireEvent.click(homeLink)

    // Menu deve fechar
    await waitFor(() => {
      expect(screen.queryByText('Agendar Consulta')).not.toBeInTheDocument()
    })
  })

  it('testa funcionalidade de scroll', async () => {
    render(<Navbar />)

    const header = document.querySelector('header')
    expect(header).toBeInTheDocument()

    // Simula scroll da página
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })

    fireEvent.scroll(window)

    await waitFor(() => {
      // Verifica se classes de scroll foram aplicadas
      expect(header).toHaveClass('shadow-md')
      expect(header).toHaveClass('py-2')
    })
  })

  it('testa clique no botão de agendamento', () => {
    // Mock do scrollIntoView
    const mockScrollIntoView = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView

    // Mock do getElementById
    const mockGetElementById = vi.fn(() => ({
      scrollIntoView: mockScrollIntoView
    }))
    document.getElementById = mockGetElementById

    render(<Navbar />)

    const scheduleButton = screen.getByText('Agendar Consulta')
    fireEvent.click(scheduleButton)

    expect(mockGetElementById).toHaveBeenCalledWith('contact')
  })

  it('testa navegação quando elemento de contato não existe', () => {
    // Mock quando elemento não existe
    document.getElementById = vi.fn(() => null)

    // Mock do window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    })

    render(<Navbar />)

    const scheduleButton = screen.getByText('Agendar Consulta')
    fireEvent.click(scheduleButton)

    expect(window.location.href).toBe('/sobre#contact')
  })

  it('possui estrutura semântica correta', () => {
    render(<Navbar />)

    const header = document.querySelector('header')
    const nav = document.querySelector('nav[aria-label]')

    expect(header).toBeInTheDocument()
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'Navegação principal')
  })

  it('testa responsividade das classes', () => {
    const { container } = render(<Navbar />)

    // Verifica classes responsivas
    const header = container.querySelector('header')
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50')

    // Verifica classes do container
    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'md:px-6')
  })

  it('testa ícones nos links de navegação', () => {
    render(<Navbar />)

    // Verifica se os ícones são renderizados (representados por SVGs)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('testa estados hover e interações', async () => {
    render(<Navbar />)

    const links = screen.getAllByRole('link')
    const firstLink = links[0]

    // Simula hover
    fireEvent.mouseEnter(firstLink)

    await waitFor(() => {
      expect(firstLink).toHaveClass('hover:bg-slate-100')
    })
  })

  it('testa acessibilidade do teclado', () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button')

    // Testa navegação por tab
    fireEvent.focus(menuButton)
    expect(menuButton).toHaveFocus()

    // Testa ativação por Enter
    fireEvent.keyDown(menuButton, { key: 'Enter' })
    fireEvent.keyUp(menuButton, { key: 'Enter' })

    // Menu deve abrir
    expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
  })

  it('limpa event listeners ao desmontar', () => {
    const { unmount } = render(<Navbar />)

    // Mock do removeEventListener
    const mockRemoveEventListener = vi.fn()
    window.removeEventListener = mockRemoveEventListener

    unmount()

    // Verifica se cleanup foi chamado
    expect(mockRemoveEventListener).toHaveBeenCalled()
  })
})