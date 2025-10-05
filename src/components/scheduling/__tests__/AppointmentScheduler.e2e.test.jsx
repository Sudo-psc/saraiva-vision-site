import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AppointmentScheduler from '../AppointmentScheduler';

const mockFetchSlots = vi.fn();
const mockCreateAppointment = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/useNinsaudeScheduling', () => ({
  useNinsaudeScheduling: () => ({
    loading: false,
    fetchAvailableSlots: mockFetchSlots,
    createAppointment: mockCreateAppointment,
    cancelAppointment: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AppointmentScheduler E2E Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSlots.mockResolvedValue([
      { time: '08:00', available: true },
      { time: '08:30', available: true },
      { time: '09:00', available: true },
    ]);
    mockCreateAppointment.mockResolvedValue({
      id: 'AGD-001',
      date: '2025-10-15',
      time: '08:00',
    });
  });

  it('should complete full appointment flow successfully', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'Maria Silva');
    expect(nameInput).toHaveValue('Maria Silva');

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'maria@example.com');
    expect(emailInput).toHaveValue('maria@example.com');

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '33988776655');
    expect(phoneInput).toHaveValue('(33) 98877-6655');

    const lgpdCheckbox = screen.getByRole('checkbox');
    await user.click(lgpdCheckbox);
    expect(lgpdCheckbox).toBeChecked();
  });

  it('should show validation error when submitting without required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const submitButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    
    expect(submitButton).toBeDisabled();
  });

  it('should accept valid email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'João Silva');

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'joao@valid.com');

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '33988776655');

    const lgpdCheckbox = screen.getByRole('checkbox');
    await user.click(lgpdCheckbox);
    
    expect(emailInput).toHaveValue('joao@valid.com');
  });

  it('should validate phone number length', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const phoneInput = screen.getByLabelText(/telefone/i);
    
    await user.type(phoneInput, '339887');
    expect(phoneInput.value.replace(/\D/g, '')).toHaveLength(6);
  });

  it('should require LGPD consent before submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'João Silva');

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'joao@email.com');

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '33988776655');

    const submitButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    expect(submitButton).toBeDisabled();
  });

  it('should format phone number during typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const phoneInput = screen.getByLabelText(/telefone/i);
    
    await user.type(phoneInput, '3');
    await user.type(phoneInput, '3');
    await user.type(phoneInput, '9');
    await user.type(phoneInput, '8');
    await user.type(phoneInput, '8');
    await user.type(phoneInput, '7');
    await user.type(phoneInput, '7');
    await user.type(phoneInput, '6');
    await user.type(phoneInput, '6');
    await user.type(phoneInput, '5');
    await user.type(phoneInput, '5');

    expect(phoneInput).toHaveValue('(33) 98877-6655');
  });

  it('should handle optional notes field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const notesInput = screen.getByPlaceholderText(/informações adicionais/i);
    await user.type(notesInput, 'Primeira consulta oftalmológica');
    
    expect(notesInput).toHaveValue('Primeira consulta oftalmológica');
  });

  it('should maintain form state when navigating', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'Pedro Santos');

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'pedro@email.com');

    expect(nameInput).toHaveValue('Pedro Santos');
    expect(emailInput).toHaveValue('pedro@email.com');
  });

  it('should show privacy policy link is accessible', async () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const privacyLink = screen.getByRole('link', { name: /política de privacidade/i });
    
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/politica-privacidade');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  it('should have all required aria labels for accessibility', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo da consulta/i)).toBeInTheDocument();
  });

  it('should display quick links', () => {
    renderWithRouter(<AppointmentScheduler />);
    
    const servicosLink = screen.getByRole('link', { name: /nossos serviços/i });
    const contatoLink = screen.getByRole('link', { name: /contato/i });
    const faqLink = screen.getByRole('link', { name: /perguntas frequentes/i });

    expect(servicosLink).toHaveAttribute('href', '/servicos');
    expect(contatoLink).toHaveAttribute('href', '/contato');
    expect(faqLink).toHaveAttribute('href', '/faq');
  });

  it('should prevent submission without selected date and time', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'Ana Costa');

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'ana@email.com');

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '33988776655');

    const lgpdCheckbox = screen.getByRole('checkbox');
    await user.click(lgpdCheckbox);

    const submitButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    expect(submitButton).toBeDisabled();
  });

  it('should clear phone input when all characters removed', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppointmentScheduler />);

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '33988776655');
    expect(phoneInput).toHaveValue('(33) 98877-6655');

    await user.clear(phoneInput);
    expect(phoneInput).toHaveValue('');
  });
});
