/**
 * Testes para o componente Footer
 * Verifica informações de contato, links, acessibilidade e funcionalidades
 */

import React from 'react'
import { render, screen, fireEvent } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Footer from '@/components/Footer'

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
        'footer.slogan': 'Cuidado oftalmológico com excelência e tecnologia',
        'footer.partner_of': 'Parceiro:',
        'footer.partner_link_aria': 'Abrir site do parceiro Amor e Saúde (nova aba)',
        'footer.amor_saude_alt': 'Logo Amor e Saúde',
        'footer.quick_links': 'Links Rápidos',
        'footer.services': 'Serviços',
        'footer.contact': 'Contato',
        'footer.address_line1': 'Rua Dr. Calixto, 123 - Centro',
        'footer.address_line2': 'Caratinga - MG, 35300-000',
        'footer.hours': 'Seg-Sex: 8h-18h | Sáb: 8h-12h',
        'contact.chatbot_title': 'Chat Assistente',
        'privacy.link_label': 'Política de Privacidade',
        'privacy.manage_cookies': 'Gerenciar Cookies',
        'recaptcha.disclosure_html': 'Este site é protegido pelo reCAPTCHA e se aplicam a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="underline">Política de Privacidade</a> e os <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" class="underline">Termos de Serviço</a> do Google.',
        'privacy.disclaimer': 'As informações fornecidas neste site são para fins educacionais e não substituem uma consulta médica.',
        'cfm.disclaimer': 'Conforme normas do CFM, este site é puramente informativo e não promove a autoprescrição.',
        'footer.copyright': '© {year} Saraiva Vision - Todos os direitos reservados',
        'footer.back_to_top': 'Voltar ao topo',
        'navbar.home': 'Início',
        'navbar.services': 'Serviços',
        'navbar.about': 'Sobre',
        'footer.service_links': JSON.stringify({
          "consultations": "Consultas",
          "refraction": "Refração",
          "treatments": "Tratamentos",
          "surgeries": "Cirurgias",
          "pediatric": "Pediatria",
          "reports": "Laudos"
        })
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

// Mock do clinicInfo
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    phone: '(33) 9999-9999',
    phoneDisplay: '(33) 9 9999-9999',
    email: 'contato@saraivavision.com.br',
    facebook: 'https://facebook.com/saraivavision',
    instagram: 'https://instagram.com/saraivavision',
    linkedin: 'https://linkedin.com/company/saraivavision',
    x: 'https://x.com/philipe_saraiva',
    chatbotUrl: 'https://chat.saraivavision.com.br',
    responsiblePhysician: 'Dr. João Silva',
    responsiblePhysicianCRM: 'CRM/MG 12345',
    responsiblePhysicianTitle: 'Oftalmologista',
    responsibleNurse: 'Maria Santos',
    responsibleNurseTitle: 'Enfermeira Chefe',
    taxId: '12.345.678/0001-90',
    dpoEmail: 'dpo@saraivavision.com.br'
  }
}))

// Mock do SocialLinks
vi.mock('@/components/ui/social-links', () => ({
  SocialLinks: ({ socials }: any) => (
    <div data-testid="social-links">
      {socials.map((social: any, index: number) => (
        <a key={index} href={social.href} data-testid={`social-${social.name}`}>
          {social.name}
        </a>
      ))}
    </div>
  )
}))

// Mock do scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock da data atual para testes consistentes
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza o logo no footer', () => {
    render(<Footer />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-white', 'true')
  })

  it('exibe o slogan da clínica', () => {
    render(<Footer />)

    expect(screen.getByText('Cuidado oftalmológico com excelência e tecnologia')).toBeInTheDocument()
  })

  it('renderiza links rápidos de navegação', () => {
    render(<Footer />)

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Sobre')).toBeInTheDocument()
  })

  it('renderiza links de serviços', () => {
    render(<Footer />)

    expect(screen.getByText('Consultas')).toBeInTheDocument()
    expect(screen.getByText('Refração')).toBeInTheDocument()
    expect(screen.getByText('Tratamentos')).toBeInTheDocument()
    expect(screen.getByText('Cirurgias')).toBeInTheDocument()
    expect(screen.getByText('Pediatria')).toBeInTheDocument()
    expect(screen.getByText('Laudos')).toBeInTheDocument()
  })

  it('exibe informações de contato', () => {
    render(<Footer />)

    expect(screen.getByText('Rua Dr. Calixto, 123 - Centro')).toBeInTheDocument()
    expect(screen.getByText('Caratinga - MG, 35300-000')).toBeInTheDocument()
    expect(screen.getByText('contato@saraivavision.com.br')).toBeInTheDocument()
    expect(screen.getByText('(33) 9 9999-9999')).toBeInTheDocument()
    expect(screen.getByText('Seg-Sex: 8h-18h | Sáb: 8h-12h')).toBeInTheDocument()
  })

  it('renderiza link do WhatsApp', () => {
    render(<Footer />)

    const whatsappLink = screen.getByText('(33) 9 9999-9999').closest('a')
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/3399999999')
    expect(whatsappLink).toHaveAttribute('target', '_blank')
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renderiza link do chatbot', () => {
    render(<Footer />)

    const chatbotLink = screen.getByText('Chat Assistente')
    expect(chatbotLink).toBeInTheDocument()

    const chatbotLinkElement = chatbotLink.closest('a')
    expect(chatbotLinkElement).toHaveAttribute('href', 'https://chat.saraivavision.com.br')
    expect(chatbotLinkElement).toHaveAttribute('target', '_blank')
  })

  it('exibe informações legais e profissionais', () => {
    render(<Footer />)

    expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
    expect(screen.getByText('CRM/MG 12345')).toBeInTheDocument()
    expect(screen.getByText('Oftalmologista')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Enfermeira Chefe')).toBeInTheDocument()
    expect(screen.getByText('CNPJ: 12.345.678/0001-90')).toBeInTheDocument()
  })

  it('renderiza links de privacidade', () => {
    render(<Footer />)

    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument()
    expect(screen.getByText('Gerenciar Cookies')).toBeInTheDocument()
  })

  it('renderiza disclaimer do reCAPTCHA', () => {
    render(<Footer />)

    const recaptchaElement = screen.getByText(/Este site é protegido pelo reCAPTCHA/)
    expect(recaptchaElement).toBeInTheDocument()
    expect(recaptchaElement.innerHTML).toContain('Política de Privacidade')
    expect(recaptchaElement.innerHTML).toContain('Termos de Serviço')
  })

  it('renderiza disclaimers médicos', () => {
    render(<Footer />)

    expect(screen.getByText('As informações fornecidas neste site são para fins educacionais')).toBeInTheDocument()
    expect(screen.getByText('Conforme normas do CFM, este site é puramente informativo')).toBeInTheDocument()
  })

  it('exibe copyright com ano atual', () => {
    render(<Footer />)

    expect(screen.getByText('© 2024 Saraiva Vision - Todos os direitos reservados')).toBeInTheDocument()
  })

  it('renderiza links sociais', () => {
    render(<Footer />)

    const socialLinks = screen.getByTestId('social-links')
    expect(socialLinks).toBeInTheDocument()

    // Verifica se todos os links sociais estão presentes
    expect(screen.getByTestId('social-Facebook')).toBeInTheDocument()
    expect(screen.getByTestId('social-Instagram')).toBeInTheDocument()
    expect(screen.getByTestId('social-LinkedIn')).toBeInTheDocument()
    expect(screen.getByTestId('social-X')).toBeInTheDocument()
    expect(screen.getByTestId('social-TikTok')).toBeInTheDocument()
  })

  it('renderiza logo do parceiro', () => {
    render(<Footer />)

    const partnerLogo = document.querySelector('img[alt*="Amor e Saúde"]')
    expect(partnerLogo).toBeInTheDocument()
    expect(partnerLogo).toHaveAttribute('src', '/img/partner-amor-saude.svg')
  })

  it('testa funcionalidade do botão voltar ao topo', () => {
    render(<Footer />)

    const backToTopButton = screen.getByLabelText('Voltar ao topo')
    expect(backToTopButton).toBeInTheDocument()

    fireEvent.click(backToTopButton)

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    })
  })

  it('testa clique no botão gerenciar cookies', () => {
    render(<Footer />)

    const mockDispatchEvent = vi.fn()
    window.dispatchEvent = mockDispatchEvent

    const cookiesButton = screen.getByText('Gerenciar Cookies')
    fireEvent.click(cookiesButton)

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'open-privacy-settings' })
    )
  })

  it('possui estrutura semântica correta', () => {
    const { container } = render(<Footer />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()

    // Verifica seções
    const sections = footer.querySelectorAll('h3')
    expect(sections.length).toBeGreaterThan(0)

    // Verifica listas
    const lists = footer.querySelectorAll('ul')
    expect(lists.length).toBeGreaterThan(0)
  })

  it('possui atributos ARIA corretos', () => {
    render(<Footer />)

    // Botão voltar ao topo
    const backToTopButton = screen.getByLabelText('Voltar ao topo')
    expect(backToTopButton).toHaveAttribute('aria-label', 'Voltar ao topo')
    expect(backToTopButton).toHaveAttribute('title', 'Voltar ao topo')

    // Link do parceiro
    const partnerLink = document.querySelector('a[aria-label*="Abrir site do parceiro"]')
    expect(partnerLink).toBeInTheDocument()
    expect(partnerLink).toHaveAttribute('target', '_blank')
    expect(partnerLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('testa responsividade do layout', () => {
    const { container } = render(<Footer />)

    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')

    const footerContainer = container.querySelector('.max-w-7xl')
    expect(footerContainer).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8')
  })

  it('testa otimização de imagens', () => {
    render(<Footer />)

    const partnerLogo = document.querySelector('img[alt*="Amor e Saúde"]')
    expect(partnerLogo).toHaveAttribute('loading', 'lazy')
    expect(partnerLogo).toHaveAttribute('decoding', 'async')
    expect(partnerLogo).toHaveAttribute('width', '160')
    expect(partnerLogo).toHaveAttribute('height', '64')
    expect(partnerLogo).toHaveAttribute('sizes', '(min-width: 768px) 144px, 128px')
  })

  it('testa acessibilidade dos links', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')

    // Verifica se todos os links têm href
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })

    // Links externos devem ter atributos corretos
    const externalLinks = links.filter(link =>
      link.getAttribute('target') === '_blank'
    )

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('testa memoização do componente', () => {
    const { rerender } = render(<Footer />)

    const initialFooter = screen.getByRole('contentinfo')

    rerender(<Footer />)

    const rerenderedFooter = screen.getByRole('contentinfo')
    expect(rerenderedFooter).toBe(initialFooter)
  })

  it('testa hover states e transições', () => {
    const { container } = render(<Footer />)

    const interactiveElements = container.querySelectorAll('a, button')
    interactiveElements.forEach(element => {
      expect(element).toHaveClass(/transition-/)
    })
  })
})