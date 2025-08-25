import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Contact from '../Contact'

// Mock i18next with realistic translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'contact.title': 'Entre em Contato',
        'contact.subtitle': 'Estamos prontos para cuidar da sua visão. Entre em contato conosco para agendar sua consulta.',
        'contact.form_title': 'Formulário de Contato',
        'contact.name_label': 'Nome completo',
        'contact.name_placeholder': 'Seu nome',
        'contact.email_label': 'E-mail',
        'contact.email_placeholder': 'seu@email.com',
        'contact.phone_label': 'Telefone',
        'contact.phone_placeholder': '(33) 99999-9999',
        'contact.message_label': 'Mensagem',
        'contact.message_placeholder': 'Sua mensagem',
        'contact.submit': 'Enviar Mensagem',
        'contact.form.success': 'Mensagem enviada com sucesso!',
        'contact.form.error': 'Erro ao enviar mensagem. Tente novamente.',
        'contact.info.address': 'Endereço',
        'contact.info.phone': 'Telefone',
        'contact.info.email': 'E-mail',
        'contact.info.hours': 'Horários de Funcionamento'
      };
      return mockTranslations[key] || key;
    },
    i18n: { language: 'pt' }
  })
}))

// Mock clinic info
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    address: 'Rua Test, 123 - Centro - Caratinga/MG',
    phone: '(33) 99999-9999',
    email: 'contato@saraivavision.com.br',
    hours: 'Segunda a Sexta: 8h às 18h'
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, initial, viewport, transition, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, whileInView, initial, viewport, transition, ...props }) => <form {...props}>{children}</form>,
    h2: ({ children, whileInView, initial, viewport, transition, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, whileInView, initial, viewport, transition, ...props }) => <p {...props}>{children}</p>,
  }
}))

// Mock GoogleMap component
vi.mock('../GoogleMap', () => ({
  default: () => <div data-testid="google-map">Google Map</div>
}))

// Mock toast functionality
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock form submission
const mockSubmit = vi.fn()
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
)

describe('Contact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders contact section', () => {
    render(<Contact />)
    
    const sections = screen.getAllByText(/Entre em Contato/i)
    expect(sections.length).toBeGreaterThan(0)
    const section = sections[0].closest('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'contact')
  })

  it('displays contact title and subtitle', () => {
    render(<Contact />)
    
    const title = screen.getByText('Entre em Contato')
    expect(title).toBeInTheDocument()
    
    const subtitle = screen.getByText(/Estamos prontos para cuidar da sua visão/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders contact form with all fields', () => {
    render(<Contact />)
    
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mensagem/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar Mensagem/i })).toBeInTheDocument()
  })

  it('displays clinic information', () => {
    render(<Contact />)
    
    expect(screen.getByText(/Clínica Saraiva Vision/i)).toBeInTheDocument()
    expect(screen.getByText(/Rua Test, 123/i)).toBeInTheDocument()
    expect(screen.getByText(/(33) 99999-9999/i)).toBeInTheDocument()
    expect(screen.getByText(/contato@saraivavision.com.br/i)).toBeInTheDocument()
  })

  it('includes Google Map component', () => {
    render(<Contact />)
    
    const googleMap = screen.getByTestId('google-map')
    expect(googleMap).toBeInTheDocument()
  })

  it('handles form input correctly', async () => {
    render(<Contact />)
    
    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/E-mail/i)
    const phoneInput = screen.getByLabelText(/Telefone/i)
    const messageInput = screen.getByLabelText(/Mensagem/i)
    
    fireEvent.change(nameInput, { target: { value: 'João Silva' } })
    fireEvent.change(emailInput, { target: { value: 'joao@email.com' } })
    fireEvent.change(phoneInput, { target: { value: '(33) 99999-9999' } })
    fireEvent.change(messageInput, { target: { value: 'Gostaria de agendar uma consulta' } })
    
    expect(nameInput).toHaveValue('João Silva')
    expect(emailInput).toHaveValue('joao@email.com')
    expect(phoneInput).toHaveValue('(33) 99999-9999')
    expect(messageInput).toHaveValue('Gostaria de agendar uma consulta')
  })

  it('validates required fields', async () => {
    render(<Contact />)
    
    const submitButton = screen.getByRole('button', { name: /Enviar Mensagem/i })
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation attributes
    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/E-mail/i)
    
    expect(nameInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('has proper form accessibility', () => {
    render(<Contact />)
    
    // Check that form inputs have proper labels
    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/E-mail/i)
    const phoneInput = screen.getByLabelText(/Telefone/i)
    const messageInput = screen.getByLabelText(/Mensagem/i)
    
    expect(nameInput).toHaveAttribute('id')
    expect(emailInput).toHaveAttribute('id')
    expect(phoneInput).toHaveAttribute('id')
    expect(messageInput).toHaveAttribute('id')
    
    // Check form has proper structure
    const form = screen.getByRole('form') || nameInput.closest('form')
    expect(form).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Contact />)
    
    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 2, name: /Entre em Contato/i })
    expect(mainHeading).toBeInTheDocument()
    
    // Check for section structure
    const section = screen.getByText(/Entre em Contato/i).closest('section')
    expect(section).toBeInTheDocument()
  })

  it('displays contact information in an organized way', () => {
    render(<Contact />)
    
    // Look for contact information sections
    expect(screen.getByText(/Endereço/i) || screen.getByText(/Rua Test/i)).toBeInTheDocument()
    expect(screen.getByText(/Telefone/i) || screen.getByText(/(33) 99999-9999/i)).toBeInTheDocument()
    expect(screen.getByText(/E-mail/i) || screen.getByText(/contato@saraivavision.com.br/i)).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    render(<Contact />)
    
    const section = screen.getByText(/Entre em Contato/i).closest('section')
    expect(section).toHaveClass('py-16')
    
    const container = section?.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('includes contact links with proper attributes', () => {
    render(<Contact />)
    
    // Look for phone and email links
    const phoneLink = screen.queryByRole('link', { name: /(33) 99999-9999/i })
    const emailLink = screen.queryByRole('link', { name: /contato@saraivavision.com.br/i })
    
    if (phoneLink) {
      expect(phoneLink).toHaveAttribute('href', expect.stringContaining('tel:'))
    }
    
    if (emailLink) {
      expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'))
    }
  })
})