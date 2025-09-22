import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import WhatsappWidget from '../WhatsappWidget';

// Mock the config module
vi.mock('../../config/whatsapp', () => ({
  whatsappConfig: {
    phoneNumber: "5533998601427",
    widget: {
      position: "bottom-right",
      showGreeting: true,
      greetingDelay: 1000,
      greetingAutoHide: 5000,
      pulseAnimation: true,
      showTooltip: true
    },
    greeting: {
      title: "Clínica Saraiva Vision",
      message: "Olá! 👋 Precisa de ajuda? Estamos aqui para esclarecer suas dúvidas sobre nossos serviços oftalmológicos.",
      showAvatar: true,
      avatar: "/img/drphilipe_perfil.webp",
      showOnlineStatus: true
    },
    businessHours: {
      enabled: true,
      afterHoursMessage: "Obrigado pelo contato! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h."
    },
    analytics: {
      trackClicks: true,
      eventCategory: "engagement",
      eventAction: "whatsapp_click",
      eventLabel: "whatsapp_widget"
    },
    accessibility: {
      ariaLabel: "Entrar em contato via WhatsApp",
      tooltip: "Fale conosco no WhatsApp",
      closeButtonLabel: "Fechar mensagem"
    }
  },
  getWhatsAppMessage: vi.fn((type) => `Test message for ${type}`),
  formatWhatsAppNumber: vi.fn((number) => number),
  isWithinBusinessHours: vi.fn(() => true)
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen
});

const TEST_PHONE = '5533998601427';

describe('WhatsappWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders WhatsApp widget button', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
    expect(button).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('WhatsApp');
  });

  it('opens WhatsApp when clicked', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('has proper styling for fixed positioning', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('fixed');
    expect(container).toHaveClass('z-50');
    expect(container).toHaveClass('bottom-4', 'right-4');
  });

  it('displays WhatsApp icon', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('shows greeting message after delay', async () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} showGreeting={true} greetingDelay={1000} />);

    // Initially no greeting
    expect(screen.queryByText(/clínica saraiva vision/i)).not.toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/clínica saraiva vision/i)).toBeInTheDocument();
    });
  });

  it('provides visual feedback on hover', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:');
    expect(button.className).toContain('transform');
  });
});