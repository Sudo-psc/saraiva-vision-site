import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    generateWhatsAppUrl,
    openWhatsApp,
    trackWhatsAppInteraction,
    getContextualGreeting,
    isMobileDevice,
    getOptimizedWhatsAppUrl,
    validateWhatsAppNumber
} from '../utils/whatsappUtils';

// Mock the config module
vi.mock('../config/whatsapp', () => ({
    whatsappConfig: {
        phoneNumber: "5511999999999",
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
        greeting: {
            message: "Olá! 👋 Precisa de ajuda? Estamos aqui para esclarecer suas dúvidas sobre nossos serviços oftalmológicos."
        }
    },
    formatWhatsAppNumber: vi.fn((number) => number.replace(/\D/g, '')),
    getWhatsAppMessage: vi.fn((type) => `Message for ${type}`),
    isWithinBusinessHours: vi.fn(() => true)
}));

// Mock window object
const mockWindowOpen = vi.fn();
const mockGtag = vi.fn();
const mockPosthog = vi.fn();

Object.defineProperty(window, 'open', {
    writable: true,
    value: mockWindowOpen
});

Object.defineProperty(window, 'gtag', {
    writable: true,
    value: mockGtag
});

Object.defineProperty(window, 'posthog', {
    writable: true,
    value: { capture: mockPosthog }
});

describe('WhatsApp Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateWhatsAppUrl', () => {
        it('generates correct WhatsApp URL with default parameters', () => {
            const url = generateWhatsAppUrl();

            expect(url).toContain('https://wa.me/5511999999999');
            expect(url).toContain('text=');
        });

        it('generates URL with custom phone number and message', () => {
            const url = generateWhatsAppUrl({
                phoneNumber: '5511888888888',
                message: 'Custom test message'
            });

            expect(url).toContain('https://wa.me/5511888888888');
            expect(url).toContain(encodeURIComponent('Custom test message'));
        });

        it('includes after-hours message when outside business hours', async () => {
            // Import the module and mock the function
            const whatsappModule = await import('../config/whatsapp');
            vi.mocked(whatsappModule.isWithinBusinessHours).mockReturnValue(false);

            const url = generateWhatsAppUrl({ message: 'Test message' });

            expect(url).toContain(encodeURIComponent('Obrigado pelo contato!'));
        });
    });

    describe('openWhatsApp', () => {
        it('opens WhatsApp URL in new window', () => {
            openWhatsApp({ message: 'Test message' });

            expect(mockWindowOpen).toHaveBeenCalledWith(
                expect.stringContaining('https://wa.me/'),
                '_blank',
                'noopener,noreferrer'
            );
        });

        it('tracks analytics when opening WhatsApp', () => {
            openWhatsApp({ messageType: 'appointment' });

            expect(mockGtag).toHaveBeenCalled();
            expect(mockPosthog).toHaveBeenCalled();
        });
    });

    describe('trackWhatsAppInteraction', () => {
        it('tracks interaction with Google Analytics', () => {
            trackWhatsAppInteraction('appointment');

            expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_click', {
                event_category: 'engagement',
                event_label: 'whatsapp_widget_appointment',
                custom_parameters: expect.objectContaining({
                    message_type: 'appointment',
                    business_hours: expect.any(Boolean)
                })
            });
        });

        it('tracks interaction with PostHog', () => {
            trackWhatsAppInteraction('contact', { source: 'button' });

            expect(mockPosthog).toHaveBeenCalledWith('whatsapp_interaction',
                expect.objectContaining({
                    message_type: 'contact',
                    business_hours: expect.any(Boolean),
                    source: 'button'
                })
            );
        });
    });

    describe('getContextualGreeting', () => {
        it('returns time-based greeting in the morning', () => {
            // Mock morning time (9 AM)
            vi.setSystemTime(new Date('2024-01-01 09:00:00'));

            const greeting = getContextualGreeting({ page: 'home' });
            expect(greeting).toContain('Bom dia!');
        });

        it('returns time-based greeting in the afternoon', () => {
            // Mock afternoon time (3 PM)
            vi.setSystemTime(new Date('2024-01-01 15:00:00'));

            const greeting = getContextualGreeting({ page: 'home' });
            expect(greeting).toContain('Boa tarde!');
        });

        it('returns time-based greeting in the evening', () => {
            // Mock evening time (8 PM)
            vi.setSystemTime(new Date('2024-01-01 20:00:00'));

            const greeting = getContextualGreeting({ page: 'home' });
            expect(greeting).toContain('Boa noite!');
        });

        it('returns page-specific greeting', () => {
            const greeting = getContextualGreeting({ page: 'services' });
            expect(greeting).toContain('Interessado em nossos serviços?');
        });

        it('returns action-specific greeting', () => {
            const greeting = getContextualGreeting({ userAction: 'form_error' });
            expect(greeting).toContain('Teve problemas com o formulário?');
        });
    });

    describe('isMobileDevice', () => {
        it('detects mobile device from user agent', () => {
            // Mock mobile user agent
            Object.defineProperty(navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
            });

            expect(isMobileDevice()).toBe(true);
        });

        it('detects desktop device from user agent', () => {
            // Mock desktop user agent
            Object.defineProperty(navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });

            expect(isMobileDevice()).toBe(false);
        });
    });

    describe('getOptimizedWhatsAppUrl', () => {
        it('returns app URL for mobile devices', () => {
            // Mock mobile device
            Object.defineProperty(navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
            });

            const url = getOptimizedWhatsAppUrl();
            expect(url).toContain('whatsapp://send?phone=');
        });

        it('returns web URL for desktop devices', () => {
            // Mock desktop device
            Object.defineProperty(navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });

            const url = getOptimizedWhatsAppUrl();
            expect(url).toContain('https://wa.me/');
        });
    });

    describe('validateWhatsAppNumber', () => {
        it('validates correct Brazilian phone number', () => {
            const result = validateWhatsAppNumber('5511999999999');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('5511999999999');
        });

        it('rejects empty phone number', () => {
            const result = validateWhatsAppNumber('');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Phone number is required');
        });

        it('rejects too short phone number', () => {
            const result = validateWhatsAppNumber('123');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Phone number too short');
        });

        it('rejects too long phone number', () => {
            const result = validateWhatsAppNumber('12345678901234567890');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Phone number too long');
        });

        it('validates international phone number', () => {
            const result = validateWhatsAppNumber('1234567890');
            expect(result.isValid).toBe(true);
        });

        it('handles phone number with formatting', () => {
            const result = validateWhatsAppNumber('+55 (11) 99999-9999');
            expect(result.isValid).toBe(true);
        });
    });
});