/**
 * AgendamentoPage Component Tests (TDD)
 * Tests for the main Ninsaúde appointment booking page
 *
 * Expected: These tests will FAIL initially until the page is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AgendamentoPage from '@/pages/AgendamentoPage';

// Mock child components
vi.mock('@/components/ninsaude/AppointmentBookingForm', () => ({
    default: ({ onSubmit }) => (
        <div data-testid="appointment-booking-form">
            <button onClick={() => onSubmit({ test: 'data' })}>Submit Booking</button>
        </div>
    )
}));

vi.mock('@/components/ninsaude/AppointmentsList', () => ({
    default: ({ appointments }) => (
        <div data-testid="appointments-list">
            {appointments?.length || 0} appointments
        </div>
    )
}));

vi.mock('@/components/ninsaude/NinsaudeCompliance', () => ({
    default: () => <div data-testid="ninsaude-compliance">Compliance Info</div>
}));

// Mock hooks
vi.mock('@/hooks/useSEO', () => ({
    default: vi.fn()
}));

describe('AgendamentoPage', () => {
    const renderWithRouter = (component) => {
        return render(
            <BrowserRouter>
                {component}
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Main Page Routing', () => {
        it('renders at /agendamento route', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByTestId('agendamento-page')).toBeInTheDocument();
        });

        it('displays page title', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByRole('heading', { name: /agendamento online/i })).toBeInTheDocument();
        });

        it('shows clinic information', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByText(/saraiva vision/i)).toBeInTheDocument();
            expect(screen.getByText(/dr.*philipe saraiva/i)).toBeInTheDocument();
        });

        it('includes navigation back to home', () => {
            renderWithRouter(<AgendamentoPage />);

            const homeLink = screen.getByRole('link', { name: /voltar.*início/i });
            expect(homeLink).toHaveAttribute('href', '/');
        });
    });

    describe('Component Orchestration', () => {
        it('renders AppointmentBookingForm component', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByTestId('appointment-booking-form')).toBeInTheDocument();
        });

        it('renders NinsaudeCompliance component', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByTestId('ninsaude-compliance')).toBeInTheDocument();
        });

        it('shows appointments list after successful booking', async () => {
            renderWithRouter(<AgendamentoPage />);

            const submitButton = screen.getByText('Submit Booking');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
            });
        });

        it('passes correct props to child components', () => {
            renderWithRouter(<AgendamentoPage />);

            // Compliance should be visible
            expect(screen.getByTestId('ninsaude-compliance')).toBeInTheDocument();

            // Booking form should be present
            expect(screen.getByTestId('appointment-booking-form')).toBeInTheDocument();
        });

        it('coordinates data flow between components', async () => {
            renderWithRouter(<AgendamentoPage />);

            // Submit booking
            const submitButton = screen.getByText('Submit Booking');
            await userEvent.click(submitButton);

            await waitFor(() => {
                // List should update
                expect(screen.getByTestId('appointments-list')).toBeInTheDocument();
            });
        });
    });

    describe('Error Boundary', () => {
        it('catches and displays component errors', () => {
            // Mock console.error to avoid noise in test output
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const ErrorComponent = () => {
                throw new Error('Test error');
            };

            render(
                <BrowserRouter>
                    <AgendamentoPage ErrorComponent={ErrorComponent} />
                </BrowserRouter>
            );

            expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();

            consoleSpy.mockRestore();
        });

        it('provides error recovery option', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const ErrorComponent = () => {
                throw new Error('Test error');
            };

            render(
                <BrowserRouter>
                    <AgendamentoPage ErrorComponent={ErrorComponent} />
                </BrowserRouter>
            );

            expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();

            consoleSpy.mockRestore();
        });

        it('logs errors for monitoring', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const mockLogger = vi.fn();

            const ErrorComponent = () => {
                throw new Error('Test error');
            };

            render(
                <BrowserRouter>
                    <AgendamentoPage ErrorComponent={ErrorComponent} errorLogger={mockLogger} />
                </BrowserRouter>
            );

            expect(mockLogger).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(Error),
                    componentStack: expect.any(String)
                })
            );

            consoleSpy.mockRestore();
        });

        it('shows fallback UI during error state', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const ErrorComponent = () => {
                throw new Error('Test error');
            };

            render(
                <BrowserRouter>
                    <AgendamentoPage ErrorComponent={ErrorComponent} />
                </BrowserRouter>
            );

            expect(screen.getByText(/erro ao carregar página/i)).toBeInTheDocument();
            expect(screen.getByText(/contato alternativo/i)).toBeInTheDocument();

            consoleSpy.mockRestore();
        });
    });

    describe('SEO Metadata', () => {
        it('sets page title for SEO', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.stringMatching(/agendamento/i)
                })
            );
        });

        it('includes meta description', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringMatching(/agende sua consulta/i)
                })
            );
        });

        it('sets canonical URL', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    canonical: expect.stringMatching(/agendamento/i)
                })
            );
        });

        it('includes Open Graph tags', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    ogTitle: expect.any(String),
                    ogDescription: expect.any(String),
                    ogType: 'website'
                })
            );
        });

        it('sets structured data for medical appointment', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    structuredData: expect.objectContaining({
                        '@type': 'MedicalBusiness'
                    })
                })
            );
        });

        it('includes keywords for medical appointment booking', () => {
            const mockUseSEO = vi.fn();
            const useSEO = require('@/hooks/useSEO').default;
            useSEO.mockImplementation(mockUseSEO);

            renderWithRouter(<AgendamentoPage />);

            expect(mockUseSEO).toHaveBeenCalledWith(
                expect.objectContaining({
                    keywords: expect.stringMatching(/oftalmologia.*agendamento/i)
                })
            );
        });
    });

    describe('Loading States', () => {
        it('displays loading skeleton while initializing', () => {
            renderWithRouter(<AgendamentoPage initializing={true} />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByText(/carregando/i)).toBeInTheDocument();
        });

        it('shows content after loading completes', async () => {
            renderWithRouter(<AgendamentoPage />);

            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
                expect(screen.getByTestId('appointment-booking-form')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        it('adapts layout for mobile devices', () => {
            global.innerWidth = 375;
            global.dispatchEvent(new Event('resize'));

            renderWithRouter(<AgendamentoPage />);

            const container = screen.getByTestId('agendamento-page');
            expect(container).toHaveClass('mobile-layout');
        });

        it('adapts layout for tablet devices', () => {
            global.innerWidth = 768;
            global.dispatchEvent(new Event('resize'));

            renderWithRouter(<AgendamentoPage />);

            const container = screen.getByTestId('agendamento-page');
            expect(container).toHaveClass('tablet-layout');
        });

        it('adapts layout for desktop devices', () => {
            global.innerWidth = 1024;
            global.dispatchEvent(new Event('resize'));

            renderWithRouter(<AgendamentoPage />);

            const container = screen.getByTestId('agendamento-page');
            expect(container).toHaveClass('desktop-layout');
        });
    });

    describe('Accessibility', () => {
        it('has proper page heading structure', () => {
            renderWithRouter(<AgendamentoPage />);

            const mainHeading = screen.getByRole('heading', { level: 1 });
            expect(mainHeading).toHaveTextContent(/agendamento/i);
        });

        it('provides skip to content link', () => {
            renderWithRouter(<AgendamentoPage />);

            const skipLink = screen.getByRole('link', { name: /pular.*conteúdo/i });
            expect(skipLink).toHaveAttribute('href', '#main-content');
        });

        it('uses semantic HTML landmarks', () => {
            renderWithRouter(<AgendamentoPage />);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        it('announces page changes to screen readers', () => {
            renderWithRouter(<AgendamentoPage />);

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveAttribute('aria-live', 'polite');
        });

        it('supports keyboard navigation', () => {
            renderWithRouter(<AgendamentoPage />);

            const firstInteractive = screen.getAllByRole('button')[0] || screen.getAllByRole('link')[0];

            firstInteractive.focus();
            expect(document.activeElement).toBe(firstInteractive);
        });
    });

    describe('Analytics Integration', () => {
        it('tracks page view on mount', () => {
            const mockTrackPageView = vi.fn();
            global.analytics = { trackPageView: mockTrackPageView };

            renderWithRouter(<AgendamentoPage />);

            expect(mockTrackPageView).toHaveBeenCalledWith('/agendamento');

            delete global.analytics;
        });

        it('tracks appointment booking events', async () => {
            const mockTrackEvent = vi.fn();
            global.analytics = { trackEvent: mockTrackEvent };

            renderWithRouter(<AgendamentoPage />);

            const submitButton = screen.getByText('Submit Booking');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockTrackEvent).toHaveBeenCalledWith('appointment_booked', expect.any(Object));
            });

            delete global.analytics;
        });
    });
});
