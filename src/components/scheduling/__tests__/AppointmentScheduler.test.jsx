import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentScheduler from '../AppointmentScheduler';

vi.mock('@/hooks/useNinsaudeScheduling', () => ({
  useNinsaudeScheduling: () => ({
    loading: false,
    fetchAvailableSlots: vi.fn().mockResolvedValue([
      { time: '08:00', available: true },
      { time: '08:30', available: true },
      { time: '09:00', available: true },
    ]),
    createAppointment: vi.fn().mockResolvedValue({
      id: 'AGD-001',
      date: '2025-10-15',
      time: '08:00',
    }),
    cancelAppointment: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AppointmentScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main title', () => {
    renderWithRouter(<AppointmentScheduler />);
    expect(screen.getByText('Agendamento Online')).toBeInTheDocument();
  });

  it('should render calendar component', () => {
    renderWithRouter(<AppointmentScheduler />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should render patient form fields', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo da consulta/i)).toBeInTheDocument();
  });

  it('should render LGPD consent checkbox', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(/concordo com a coleta e uso dos meus dados/i)).toBeInTheDocument();
  });

  it('should have privacy policy link', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const privacyLink = screen.getByRole('link', { name: /política de privacidade/i });
    expect(privacyLink).toHaveAttribute('href', '/politica-privacidade');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  it('should disable submit button when form is incomplete', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const submitButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    expect(submitButton).toBeDisabled();
  });

  it('should fill form fields correctly', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const phoneInput = screen.getByLabelText(/telefone/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
    fireEvent.change(phoneInput, { target: { value: '33988776655' } });

    expect(nameInput).toHaveValue('João Silva');
    expect(emailInput).toHaveValue('joao@email.com');
  });

  it('should apply phone mask correctly', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const phoneInput = screen.getByLabelText(/telefone/i);
    fireEvent.change(phoneInput, { target: { value: '33988776655' } });

    expect(phoneInput).toHaveValue('(33) 98877-6655');
  });

  it('should have quick links in footer', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    expect(screen.getByRole('link', { name: /nossos serviços/i })).toHaveAttribute('href', '/servicos');
    expect(screen.getByRole('link', { name: /contato/i })).toHaveAttribute('href', '/contato');
    expect(screen.getByRole('link', { name: /perguntas frequentes/i })).toHaveAttribute('href', '/faq');
  });

  it('should render consultation reason options', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const reasonSelect = screen.getByRole('combobox', { name: /motivo da consulta/i });
    expect(reasonSelect).toBeInTheDocument();
  });

  it('should have responsive gradient background', () => {
    const { container } = renderWithRouter(<AppointmentScheduler />);
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toHaveClass('bg-gradient-to-br');
  });

  it('should show loading state when loading', () => {
    vi.mock('@/hooks/useNinsaudeScheduling', () => ({
      useNinsaudeScheduling: () => ({
        loading: true,
        fetchAvailableSlots: vi.fn(),
        createAppointment: vi.fn(),
        cancelAppointment: vi.fn(),
      }),
    }));

    renderWithRouter(<AppointmentScheduler />);
    
    const submitButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    expect(submitButton).toBeDisabled();
  });

  it('should have accessible form labels', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const phoneInput = screen.getByLabelText(/telefone/i);
    const reasonSelect = screen.getByLabelText(/motivo da consulta/i);

    expect(nameInput).toHaveAttribute('id');
    expect(emailInput).toHaveAttribute('id');
    expect(phoneInput).toHaveAttribute('id');
    expect(reasonSelect).toBeInTheDocument();
  });

  it('should render with Saraiva Vision branding colors', () => {
    const { container } = renderWithRouter(<AppointmentScheduler />);
    
    const title = screen.getByText('Agendamento Online');
    expect(title).toHaveClass('text-primary-700');
    
    const cards = container.querySelectorAll('.shadow-glass');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have required field indicators', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    expect(screen.getByText(/nome completo \*/i)).toBeInTheDocument();
    expect(screen.getByText(/e-mail \*/i)).toBeInTheDocument();
    expect(screen.getByText(/telefone\/whatsapp \*/i)).toBeInTheDocument();
    expect(screen.getByText(/motivo da consulta \*/i)).toBeInTheDocument();
  });

  it('should render notes field as optional', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const notesLabel = screen.getByText(/observações \(opcional\)/i);
    expect(notesLabel).toBeInTheDocument();
    
    const notesInput = screen.getByPlaceholderText(/informações adicionais/i);
    expect(notesInput).not.toHaveAttribute('required');
  });
});
