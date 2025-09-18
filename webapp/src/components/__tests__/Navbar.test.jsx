import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Navbar'

// Mock i18next with realistic translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'navbar.home': 'Início',
        'navbar.services': 'Serviços',
        'navbar.about': 'Sobre Nós',
        'navbar.contact': 'Contato',
        'navbar.open_menu': 'Abrir Menu',
        'navbar.close_menu': 'Fechar Menu',
        'navbar.schedule': 'Agendar',
        'navbar.brand': 'Saraiva Vision'
      };
      return mockTranslations[key] || key;
    },
    i18n: { language: 'pt' }
  })
}))

// Mock Logo component
vi.mock('../Logo', () => ({
  default: () => <div>Saraiva Vision</div>
}))

// Mock LanguageSwitcher component
vi.mock('../LanguageSwitcher', () => ({
  default: () => <button role="button" aria-label="language">Language</button>
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  )
}

describe('Navbar Component', () => {
  it('renders navigation bar', () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('displays logo', () => {
    renderWithRouter(<Navbar />)
    
    const logo = screen.getByText('Saraiva Vision')
    expect(logo).toBeInTheDocument()
  })

  it('shows navigation links', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Sobre Nós')).toBeInTheDocument()
    expect(screen.getByText('Contato')).toBeInTheDocument()
  })

  it('includes mobile menu toggle', () => {
    renderWithRouter(<Navbar />)
    
    const menuButton = screen.getByLabelText(/Abrir Menu/i)
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu on button click', () => {
    renderWithRouter(<Navbar />)
    
    const menuButton = screen.getByLabelText(/Abrir Menu/i)
    fireEvent.click(menuButton)
    
    // Check if mobile menu becomes visible
    const mobileMenu = screen.getByRole('navigation')
    expect(mobileMenu).toBeInTheDocument()
  })

  it('includes language switcher', () => {
    renderWithRouter(<Navbar />)
    
    const languageSwitchers = screen.getAllByRole('button', { name: /language/i })
    expect(languageSwitchers.length).toBeGreaterThan(0)
    expect(languageSwitchers[0]).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    const menuButton = screen.getByLabelText(/Abrir Menu/i)
    expect(menuButton).toHaveAttribute('aria-label')
  })
})