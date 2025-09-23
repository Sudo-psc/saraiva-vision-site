/**
 * Contact Form Resend Integration Tests
 * Tests for React Contact component integration with Resend API
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'
import Contact from '../../components/Contact'

// Mock external dependencies
const mockToast = vi.fn()
const mockExecuteRecaptcha = vi.fn()
const mockTrackFormView = vi.fn()
const mockTrackFormSubmit = vi.fn()
const mockTrackInteraction = vi.fn()

// Mock hooks and utilities
vi.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
}))

vi.mock('@/hooks/useRecaptcha', () => ({
    useRecaptcha: () => ({
        ready: true,
        execute: mockExecuteRecaptcha
    })
}))

vi.mock('@/hooks/useAnalytics', () => ({
    useAnalytics: () => ({
        trackFormView: mockTrackFormView,
        trackFormSubmit: mockTrackFormSubmit,
        trackInteraction: mockTrackInteraction
    })
}))

vi.mock('@/hooks/useVisibilityTracking', () => ({
    useVisibilityTracking: () => ({ current: null })
}))

// Mock API utilities
const mockSubmitContactForm = vi.fn()
const mockFallbackStrategies = {
    storeForRetry: vi.fn(),
    retryFailedSubmissions: vi.fn()
}
const mockUseConnectionStatus = vi.fn()
const mockNetworkMonitor = {
    subscribe: vi.fn(() => () => {})
}

vi.mock('@/lib/apiUtils', () => ({
    submitContactForm: mockSubmitContactForm,
    FallbackStrategies: mockFallbackStrategies,
    useConnectionStatus: mockUseConnectionStatus,
    networkMonitor: mockNetworkMonitor
}))

// Mock validation
const mockValidateField = vi.fn()
const mockValidateContactSubmission = vi.fn()

vi.mock('@/lib/validation', () => ({
    validateField: mockValidateField,
    validateContactSubmission: mockValidateContactSubmission
}))

// Mock LGPD consent manager
const mockConsentManager = {
    hasValidConsent: vi.fn(() => true)
}

vi.mock('../lib/lgpd/consentManager.js', () => ({
    consentManager: mockConsentManager
}))

// Mock ConsentBanner component
vi.mock('./lgpd/ConsentBanner.jsx', () => ({
    ConsentBanner: ({ onConsentChange }) => (
        <div data-testid="consent-banner">
            <button onClick={() => onConsentChange(true)}>Accept Consent</button>
        </div>
    )
}))

// Mock error handling utilities
vi.mock('@/lib/errorHandling', () => ({
    getUserFriendlyError: vi.fn((error) => ({
        userMessage: error?.message || 'Erro desconhecido'
    })),
    getRecoverySteps: vi.fn(() => []),
    logError: vi.fn()
}))

// Mock clinic info
vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        name: 'Saraiva Vision Test Clinic',
        address: 'Test Address, 123',
        onlineSchedulingUrl: 'https://scheduling.test.com'
    }
}))

// Test wrapper component
const TestWrapper = ({ children }) => (
    <I18nextProvider i18n={i18n}>
        {children}
    </I18nextProvider>
)

describe('Contact Form Resend Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        
        // Set up default mock responses
        mockUseConnectionStatus.mockReturnValue({ isOnline: true })
        mockExecuteRecaptcha.mockResolvedValue('mock-recaptcha-token')
        mockSubmitContactForm.mockResolvedValue({
            success: true,
            messageId: 'test-message-id'
        })
        mockValidateField.mockReturnValue({ success: true })
        mockValidateContactSubmission.mockReturnValue({ success: true })
        
        // Mock fetch for form submission
        global.fetch = vi.fn()
    })

    afterEach(() => {
        vi.resetAllMocks()
        delete global.fetch
    })

    describe('Successful Form Submission with Resend', () => {
        it('should submit contact form successfully through Resend API', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill out the form
            await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
            await user.type(screen.getByLabelText(/e-mail/i), 'joao@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Gostaria de agendar uma consulta oftalmológica')
            
            // Accept LGPD consent
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            // Submit the form
            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockExecuteRecaptcha).toHaveBeenCalledWith('contact')
            })

            await waitFor(() => {
                expect(mockSubmitContactForm).toHaveBeenCalledWith({
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999',
                    message: 'Gostaria de agendar uma consulta oftalmológica',
                    consent: true,
                    token: 'mock-recaptcha-token',
                    action: 'contact'
                })
            })

            await waitFor(() => {
                expect(mockToast).toHaveBeenCalledWith({
                    title: expect.any(String),
                    description: expect.any(String),
                    duration: 5000
                })
            })

            // Verify analytics tracking
            expect(mockTrackFormSubmit).toHaveBeenCalledWith('contact', {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta oftalmológica',
                consent: true
            })
        })

        it('should handle real-time field validation', async () => {
            const user = userEvent.setup()
            
            mockValidateField.mockReturnValue({
                success: false,
                error: 'E-mail inválido'
            })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            const emailInput = screen.getByLabelText(/e-mail/i)
            
            // Type invalid email and blur
            await user.type(emailInput, 'invalid-email')
            await user.tab() // Trigger blur event

            await waitFor(() => {
                expect(mockValidateField).toHaveBeenCalledWith('email', 'invalid-email', expect.any(Object))
            })

            await waitFor(() => {
                expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
            })
        })

        it('should show success message and reset form after submission', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Maria Santos')
            await user.type(screen.getByLabelText(/e-mail/i), 'maria@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11888888888')
            await user.type(screen.getByLabelText(/mensagem/i), 'Consulta urgente')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(screen.getByText(/mensagem enviada com sucesso/i)).toBeInTheDocument()
            })

            // Verify form is reset
            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toHaveValue('')
                expect(screen.getByLabelText(/e-mail/i)).toHaveValue('')
                expect(screen.getByLabelText(/telefone/i)).toHaveValue('')
                expect(screen.getByLabelText(/mensagem/i)).toHaveValue('')
                expect(screen.getByLabelText(/concordo com o tratamento/i)).not.toBeChecked()
            })
        })
    })

    describe('Error Handling and Fallback Strategies', () => {
        it('should handle Resend API errors gracefully', async () => {
            const user = userEvent.setup()
            
            mockSubmitContactForm.mockRejectedValue(new Error('Resend API error'))
            mockFallbackStrategies.storeForRetry.mockReturnValue(true)
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
            await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Test message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(mockFallbackStrategies.storeForRetry).toHaveBeenCalled()
            })

            await waitFor(() => {
                expect(mockToast).toHaveBeenCalledWith({
                    title: 'Mensagem salva',
                    description: 'Sua mensagem foi salva e será enviada quando a conexão for restabelecida.',
                    duration: 4000
                })
            })
        })

        it('should show alternative contact methods on critical errors', async () => {
            const user = userEvent.setup()
            
            mockSubmitContactForm.mockRejectedValue({
                status: 500,
                name: 'NetworkError',
                message: 'Server error'
            })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
            await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Test message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(screen.getByText(/contato alternativo/i)).toBeInTheDocument()
            })

            expect(screen.getByText('+55 33 99860-1427')).toBeInTheDocument()
            expect(screen.getByText('saraivavision@gmail.com')).toBeInTheDocument()
        })

        it('should handle network disconnection', async () => {
            const user = userEvent.setup()
            
            mockUseConnectionStatus.mockReturnValue({ isOnline: false })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Verify offline state is shown
            expect(screen.getByText(/sem conexão com a internet/i)).toBeInTheDocument()
            
            // Submit button should be disabled
            const submitButton = screen.getByRole('button', { name: /sem conexão com a internet/i })
            expect(submitButton).toBeDisabled()
            
            // Fill form and try to submit
            await user.type(screen.getByLabelText(/nome completo/i), 'Offline User')
            await user.type(screen.getByLabelText(/e-mail/i), 'offline@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Offline message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            // Button should remain disabled and form should not submit
            expect(submitButton).toBeDisabled()
            expect(mockSubmitContactForm).not.toHaveBeenCalled()
        })

        it('should handle reCAPTCHA failures', async () => {
            const user = userEvent.setup()
            
            mockExecuteRecaptcha.mockResolvedValue(null)
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
            await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Test message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            // Form should not submit without valid reCAPTCHA token
            await waitFor(() => {
                expect(mockSubmitContactForm).not.toHaveBeenCalled()
            })
        })
    })

    describe('Validation and Security', () => {
        it('should prevent submission without LGPD consent', async () => {
            const user = userEvent.setup()
            
            mockConsentManager.hasValidConsent.mockReturnValue(false)
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill form but don't check consent
            await user.type(screen.getByLabelText(/nome completo/i), 'No Consent User')
            await user.type(screen.getByLabelText(/e-mail/i), 'noconsent@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'No consent message')
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(screen.getByText(/é necessário aceitar os termos de privacidade/i)).toBeInTheDocument()
            })

            expect(mockSubmitContactForm).not.toHaveBeenCalled()
        })

        it('should validate form fields before submission', async () => {
            const user = userEvent.setup()
            
            mockValidateContactSubmission.mockReturnValue({
                success: false,
                errors: {
                    name: 'Nome é obrigatório',
                    email: 'E-mail inválido'
                }
            })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Submit empty form
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(screen.getByText(/por favor, corrija os seguintes erros/i)).toBeInTheDocument()
            })

            expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
            expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
            expect(mockSubmitContactForm).not.toHaveBeenCalled()
        })

        it('should handle honeypot spam protection', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill honeypot field (this should be hidden from users)
            const honeypotField = document.querySelector('input[name="honeypot"]')
            if (honeypotField) {
                fireEvent.change(honeypotField, { target: { value: 'spam-content' } })
            }

            // Fill other fields
            await user.type(screen.getByLabelText(/nome completo/i), 'Spam Bot')
            await user.type(screen.getByLabelText(/e-mail/i), 'spam@bot.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Spam message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            // Should show loading state but not actually submit
            await waitFor(() => {
                expect(screen.getByText(/enviando mensagem/i)).toBeInTheDocument()
            })

            // Should not call the actual API
            expect(mockSubmitContactForm).not.toHaveBeenCalled()
        })

        it('should implement client-side rate limiting', async () => {
            const user = userEvent.setup()
            
            // Mock localStorage for rate limiting
            const mockLocalStorage = {
                getItem: vi.fn(() => Date.now().toString()),
                setItem: vi.fn()
            }
            Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Rate Limited User')
            await user.type(screen.getByLabelText(/e-mail/i), 'ratelimited@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Rate limited message')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(screen.getByText(/muitas tentativas/i)).toBeInTheDocument()
            })

            expect(mockSubmitContactForm).not.toHaveBeenCalled()
        })
    })

    describe('Accessibility and User Experience', () => {
        it('should announce form submission status to screen readers', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Accessibility User')
            await user.type(screen.getByLabelText(/e-mail/i), 'accessibility@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Accessibility test')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            // Verify aria-live region is updated
            await waitFor(() => {
                const liveRegion = document.querySelector('[aria-live]')
                expect(liveRegion).toBeInTheDocument()
            })
        })

        it('should manage focus properly during form interactions', async () => {
            const user = userEvent.setup()
            
            mockValidateContactSubmission.mockReturnValue({
                success: false,
                errors: { name: 'Nome é obrigatório' }
            })
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Submit form with validation errors
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                // Focus should move to the error summary or first error field
                const nameField = screen.getByLabelText(/nome completo/i)
                expect(nameField).toHaveFocus()
            })
        })

        it('should handle keyboard navigation properly', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Tab through form elements
            await user.tab()
            expect(screen.getByLabelText(/nome completo/i)).toHaveFocus()
            
            await user.tab()
            expect(screen.getByLabelText(/e-mail/i)).toHaveFocus()
            
            await user.tab()
            expect(screen.getByLabelText(/telefone/i)).toHaveFocus()
        })
    })

    describe('Analytics Integration', () => {
        it('should track form view on component mount', () => {
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            expect(mockTrackFormView).toHaveBeenCalledWith('contact')
        })

        it('should track successful form submissions', async () => {
            const user = userEvent.setup()
            
            render(
                <TestWrapper>
                    <Contact />
                </TestWrapper>
            )

            // Fill and submit form
            await user.type(screen.getByLabelText(/nome completo/i), 'Analytics User')
            await user.type(screen.getByLabelText(/e-mail/i), 'analytics@example.com')
            await user.type(screen.getByLabelText(/telefone/i), '11999999999')
            await user.type(screen.getByLabelText(/mensagem/i), 'Analytics test')
            await user.click(screen.getByLabelText(/concordo com o tratamento/i))
            
            await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

            await waitFor(() => {
                expect(mockTrackFormSubmit).toHaveBeenCalledWith('contact', {
                    name: 'Analytics User',
                    email: 'analytics@example.com',
                    phone: '11999999999',
                    message: 'Analytics test',
                    consent: true
                })
            })
        })
    })
})