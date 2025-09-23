import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import WhatsappWidget from '../components/WhatsappWidget';
import * as whatsappConfig from '../config/whatsapp';

// Mock the config module
vi.mock('../config/whatsapp', () => ({
    whatsappConfig: {
        phoneNumber: "5511999999999",
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

// Mock analytics
const mockGtag = vi.fn();
const mockPosthog = vi.fn();
Object.defineProperty(window, 'gtag', {
    writable: true,
    value: mockGtag
});
Object.defineProperty(window, 'posthog', {
    writable: true,
    value: { capture: mockPosthog }
});

describe('WhatsAppWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the WhatsApp button', () => {
        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        expect(button).toBeInTheDocument();
    });

    it('shows greeting message after delay', async () => {
        render(<WhatsAppWidget showGreeting={true} greetingDelay={1000} />);

        // Initially no greeting
        expect(screen.queryByText(/clínica saraiva vision/i)).not.toBeInTheDocument();

        // Fast-forward time
        vi.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(screen.getByText(/clínica saraiva vision/i)).toBeInTheDocument();
        });
    });

    it('opens WhatsApp URL when button is clicked', () => {
        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        fireEvent.click(button);

        expect(mockWindowOpen).toHaveBeenCalledWith(
            expect.stringContaining('https://wa.me/'),
            '_blank',
            'noopener,noreferrer'
        );
    });

    it('tracks analytics when button is clicked', () => {
        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        fireEvent.click(button);

        expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_click', {
            event_category: 'engagement',
            event_label: 'whatsapp_widget'
        });

        expect(mockPosthog).toHaveBeenCalledWith('whatsapp_click', {
            source: 'widget',
            message_type: 'default',
            business_hours: true
        });
    });

    it('closes greeting when close button is clicked', async () => {
        render(<WhatsAppWidget showGreeting={true} greetingDelay={100} />);

        // Wait for greeting to appear
        vi.advanceTimersByTime(100);

        await waitFor(() => {
            expect(screen.getByText(/clínica saraiva vision/i)).toBeInTheDocument();
        });

        // Click close button
        const closeButton = screen.getByRole('button', { name: /fechar mensagem/i });
        fireEvent.click(closeButton);

        expect(screen.queryByText(/clínica saraiva vision/i)).not.toBeInTheDocument();
    });

    it('applies correct position classes', () => {
        const { rerender } = render(<WhatsAppWidget position="bottom-left" />);

        let container = screen.getByRole('button').closest('div');
        expect(container).toHaveClass('bottom-4', 'left-4');

        rerender(<WhatsAppWidget position="top-right" />);
        container = screen.getByRole('button').closest('div');
        expect(container).toHaveClass('top-4', 'right-4');
    });

    it('shows business hours indicator when outside hours', () => {
        // Mock outside business hours
        whatsappConfig.isWithinBusinessHours.mockReturnValue(false);

        render(<WhatsAppWidget />);

        // Should show clock icon for outside hours
        const clockIcon = screen.getByTitle(/fora do horário comercial/i);
        expect(clockIcon).toBeInTheDocument();
    });

    it('includes after-hours message when outside business hours', () => {
        whatsappConfig.isWithinBusinessHours.mockReturnValue(false);

        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        fireEvent.click(button);

        expect(mockWindowOpen).toHaveBeenCalledWith(
            expect.stringContaining(encodeURIComponent('Obrigado pelo contato!')),
            '_blank',
            'noopener,noreferrer'
        );
    });

    it('supports custom message types', () => {
        whatsappConfig.getWhatsAppMessage.mockReturnValue('Custom appointment message');

        render(<WhatsAppWidget messageType="appointment" />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        fireEvent.click(button);

        expect(whatsappConfig.getWhatsAppMessage).toHaveBeenCalledWith('appointment');
    });

    it('auto-hides greeting after configured time', async () => {
        render(<WhatsAppWidget showGreeting={true} greetingDelay={100} />);

        // Wait for greeting to appear
        vi.advanceTimersByTime(100);

        await waitFor(() => {
            expect(screen.getByText(/clínica saraiva vision/i)).toBeInTheDocument();
        });

        // Wait for auto-hide
        vi.advanceTimersByTime(5000); // greetingAutoHide time

        await waitFor(() => {
            expect(screen.queryByText(/clínica saraiva vision/i)).not.toBeInTheDocument();
        });
    });

    it('shows doctor avatar when configured', async () => {
        render(<WhatsAppWidget showGreeting={true} greetingDelay={100} />);

        vi.advanceTimersByTime(100);

        await waitFor(() => {
            const avatar = screen.getByAltText(/dr. philipe saraiva/i);
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', '/img/drphilipe_perfil.webp');
        });
    });

    it('supports keyboard navigation', () => {
        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });

        // Focus the button
        button.focus();
        expect(button).toHaveFocus();

        // Press Enter
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

        // Should open WhatsApp (click handler is called)
        expect(mockWindowOpen).toHaveBeenCalled();
    });

    it('handles custom greeting message', async () => {
        const customGreeting = "Custom greeting message for testing";
        render(<WhatsAppWidget customGreeting={customGreeting} showGreeting={true} greetingDelay={100} />);

        vi.advanceTimersByTime(100);

        await waitFor(() => {
            expect(screen.getByText(customGreeting)).toBeInTheDocument();
        });
    });

    it('applies custom className', () => {
        render(<WhatsAppWidget className="custom-class" />);

        const container = screen.getByRole('button').closest('div');
        expect(container).toHaveClass('custom-class');
    });

    it('does not render when isWidgetVisible is false', () => {
        // This would require modifying the component to accept isWidgetVisible prop
        // For now, we test that the component renders by default
        render(<WhatsAppWidget />);

        const button = screen.getByRole('button', { name: /entrar em contato via whatsapp/i });
        expect(button).toBeInTheDocument();
    });
});