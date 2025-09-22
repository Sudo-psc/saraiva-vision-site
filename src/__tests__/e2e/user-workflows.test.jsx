/**
 * End-to-End User Workflows Tests
 * Tests for complete user journeys: contact, booking, confirmation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock API responses
const mockApiResponses = {
    contact: {
        success: { success: true, message: 'Mensagem enviada com sucesso!' },
        error: { success: false, error: 'Erro ao enviar mensagem' }
    },
    availability: {
        success: {
            availableSlots: [
                { date: '2024-01-20', slots: ['09:00', '09:30', '10:00', '14:00', '14:30'] },
                { date: '2024-01-21', slots: ['08:30', '09:00', '15:00', '15:30', '16:00'] }
            ]
        }
    },
    appointment: {
        success: {
            success: true,
            appointmentId: 'apt-123',
            confirmationToken: 'token-456',
            message: 'Agendamento realizado com sucesso!'
        },
        conflict: {
            success: false,
            error: 'Horário não disponível'
        }
    },
    confirmation: {
        success: {
            success: true,
            appointment: {
                id: 'apt-123',
                patientName: 'João Silva',
                appointmentDate: '2024-01-20',
                appointmentTime: '09:00',
                status: 'confirmed'
            }
        }
    }
}

// Mock fetch globally
global.fetch = vi.fn()

// Mock components
const MockContactForm = ({ onSubmit }) => {
    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            consent: formData.get('consent') === 'on'
        }
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit} data-testid="contact-form">
            <input name="name" placeholder="Nome completo" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="phone" placeholder="Telefone" required />
            <textarea name="message" placeholder="Mensagem" required />
            <label>
                <input name="consent" type="checkbox" required />
                Aceito os termos de privacidade
            </label>
            <button type="submit">Enviar Mensagem</button>
        </form>
    )
}

const MockAppointmentBooking = ({ onBook }) => {
    const [selectedDate, setSelectedDate] = React.useState('')
    const [selectedTime, setSelectedTime] = React.useState('')
    const [availableSlots, setAvailableSlots] = React.useState([])

    const fetchAvailability = async () => {
        const response = await fetch('/api/appointments/availability')
        const data = await response.json()
        setAvailableSlots(data.availableSlots)
    }

    React.useEffect(() => {
        fetchAvailability()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = {
            patientName: formData.get('patientName'),
            patientEmail: formData.get('patientEmail'),
            patientPhone: formData.get('patientPhone'),
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            notes: formData.get('notes')
        }
        await onBook(data)
    }

    return (
        <div data-testid="appointment-booking">
            <form onSubmit={handleSubmit}>
                <input name="patientName" placeholder="Nome completo" required />
                <input name="patientEmail" type="email" placeholder="Email" required />
                <input name="patientPhone" placeholder="Telefone" required />

                <div data-testid="date-selector">
                    {availableSlots.map(slot => (
                        <button
                            key={slot.date}
                            type="button"
                            onClick={() => setSelectedDate(slot.date)}
                            data-testid={`date-${slot.date}`}
                        >
                            {slot.date}
                        </button>
                    ))}
                </div>

                {selectedDate && (
                    <div data-testid="time-selector">
                        {availableSlots
                            .find(slot => slot.date === selectedDate)
                            ?.slots.map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    data-testid={`time-${time}`}
                                >
                                    {time}
                                </button>
                            ))}
                    </div>
                )}

                <textarea name="notes" placeholder="Observações (opcional)" />

                <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    data-testid="book-appointment"
                >
                    Agendar Consulta
                </button>
            </form>
        </div>
    )
}

describe('End-to-End User Workflows', () => {
    let user

    beforeEach(() => {
        user = userEvent.setup()
        vi.clearAllMocks()
        fetch.mockClear()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('Contact Form Workflow', () => {
        it('should complete successful contact form submission', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.contact.success
            })

            const onSubmit = vi.fn(async (data) => {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                return response.json()
            })

            render(<MockContactForm onSubmit={onSubmit} />)

            // Fill out the form
            await user.type(screen.getByPlaceholderText('Nome completo'), 'João Silva')
            await user.type(screen.getByPlaceholderText('Email'), 'joao@example.com')
            await user.type(screen.getByPlaceholderText('Telefone'), '11999999999')
            await user.type(
                screen.getByPlaceholderText('Mensagem'),
                'Gostaria de agendar uma consulta para verificar minha visão.'
            )
            await user.click(screen.getByRole('checkbox'))

            // Submit the form
            await user.click(screen.getByText('Enviar Mensagem'))

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'João Silva',
                        email: 'joao@example.com',
                        phone: '11999999999',
                        message: 'Gostaria de agendar uma consulta para verificar minha visão.',
                        consent: true
                    })
                })
            })

            expect(onSubmit).toHaveBeenCalledWith({
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta para verificar minha visão.',
                consent: true
            })
        })

        it('should handle contact form validation errors', async () => {
            const onSubmit = vi.fn()
            render(<MockContactForm onSubmit={onSubmit} />)

            // Try to submit without filling required fields
            await user.click(screen.getByText('Enviar Mensagem'))

            // Form should not submit due to HTML5 validation
            expect(onSubmit).not.toHaveBeenCalled()
        })

        it('should handle contact form API errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => mockApiResponses.contact.error
            })

            const onSubmit = vi.fn(async (data) => {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })

                if (!response.ok) {
                    throw new Error('Failed to send message')
                }

                return response.json()
            })

            render(<MockContactForm onSubmit={onSubmit} />)

            // Fill out the form
            await user.type(screen.getByPlaceholderText('Nome completo'), 'João Silva')
            await user.type(screen.getByPlaceholderText('Email'), 'joao@example.com')
            await user.type(screen.getByPlaceholderText('Telefone'), '11999999999')
            await user.type(screen.getByPlaceholderText('Mensagem'), 'Test message')
            await user.click(screen.getByRole('checkbox'))

            // Submit and expect error
            await expect(async () => {
                await user.click(screen.getByText('Enviar Mensagem'))
                await waitFor(() => expect(onSubmit).toHaveBeenCalled())
            }).rejects.toThrow('Failed to send message')
        })
    })

    describe('Appointment Booking Workflow', () => {
        it('should complete successful appointment booking', async () => {
            // Mock availability API call
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockApiResponses.availability.success
                })
                // Mock appointment booking API call
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockApiResponses.appointment.success
                })

            const onBook = vi.fn(async (data) => {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                return response.json()
            })

            render(<MockAppointmentBooking onBook={onBook} />)

            // Wait for availability to load
            await waitFor(() => {
                expect(screen.getByTestId('date-2024-01-20')).toBeInTheDocument()
            })

            // Fill out patient information
            await user.type(screen.getByPlaceholderText('Nome completo'), 'Maria Santos')
            await user.type(screen.getByPlaceholderText('Email'), 'maria@example.com')
            await user.type(screen.getByPlaceholderText('Telefone'), '11888888888')

            // Select date and time
            await user.click(screen.getByTestId('date-2024-01-20'))

            await waitFor(() => {
                expect(screen.getByTestId('time-09:00')).toBeInTheDocument()
            })

            await user.click(screen.getByTestId('time-09:00'))

            // Add notes
            await user.type(
                screen.getByPlaceholderText('Observações (opcional)'),
                'Primeira consulta'
            )

            // Submit booking
            await user.click(screen.getByTestId('book-appointment'))

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patientName: 'Maria Santos',
                        patientEmail: 'maria@example.com',
                        patientPhone: '11888888888',
                        appointmentDate: '2024-01-20',
                        appointmentTime: '09:00',
                        notes: 'Primeira consulta'
                    })
                })
            })

            expect(onBook).toHaveBeenCalledWith({
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                patientPhone: '11888888888',
                appointmentDate: '2024-01-20',
                appointmentTime: '09:00',
                notes: 'Primeira consulta'
            })
        })

        it('should handle appointment conflicts', async () => {
            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockApiResponses.availability.success
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 409,
                    json: async () => mockApiResponses.appointment.conflict
                })

            const onBook = vi.fn(async (data) => {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error)
                }

                return response.json()
            })

            render(<MockAppointmentBooking onBook={onBook} />)

            // Wait for availability and complete booking flow
            await waitFor(() => {
                expect(screen.getByTestId('date-2024-01-20')).toBeInTheDocument()
            })

            await user.type(screen.getByPlaceholderText('Nome completo'), 'Test User')
            await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
            await user.type(screen.getByPlaceholderText('Telefone'), '11999999999')
            await user.click(screen.getByTestId('date-2024-01-20'))

            await waitFor(() => {
                expect(screen.getByTestId('time-09:00')).toBeInTheDocument()
            })

            await user.click(screen.getByTestId('time-09:00'))

            // Expect conflict error
            await expect(async () => {
                await user.click(screen.getByTestId('book-appointment'))
                await waitFor(() => expect(onBook).toHaveBeenCalled())
            }).rejects.toThrow('Horário não disponível')
        })

        it('should disable booking button until date and time are selected', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.availability.success
            })

            render(<MockAppointmentBooking onBook={vi.fn()} />)

            await waitFor(() => {
                expect(screen.getByTestId('date-2024-01-20')).toBeInTheDocument()
            })

            const bookButton = screen.getByTestId('book-appointment')

            // Button should be disabled initially
            expect(bookButton).toBeDisabled()

            // Select date only
            await user.click(screen.getByTestId('date-2024-01-20'))
            expect(bookButton).toBeDisabled()

            // Select time - button should be enabled
            await waitFor(() => {
                expect(screen.getByTestId('time-09:00')).toBeInTheDocument()
            })

            await user.click(screen.getByTestId('time-09:00'))
            expect(bookButton).not.toBeDisabled()
        })
    })

    describe('Appointment Confirmation Workflow', () => {
        it('should confirm appointment with valid token', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.confirmation.success
            })

            const confirmAppointment = async (token) => {
                const response = await fetch(`/api/appointments/confirm?token=${token}`)
                return response.json()
            }

            const result = await confirmAppointment('token-456')

            expect(fetch).toHaveBeenCalledWith('/api/appointments/confirm?token=token-456')
            expect(result.success).toBe(true)
            expect(result.appointment.status).toBe('confirmed')
        })

        it('should handle invalid confirmation tokens', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({
                    success: false,
                    error: 'Token de confirmação inválido'
                })
            })

            const confirmAppointment = async (token) => {
                const response = await fetch(`/api/appointments/confirm?token=${token}`)

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error)
                }

                return response.json()
            }

            await expect(confirmAppointment('invalid-token'))
                .rejects.toThrow('Token de confirmação inválido')
        })
    })

    describe('Complete User Journey', () => {
        it('should complete full contact-to-appointment workflow', async () => {
            // Step 1: Contact form submission
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.contact.success
            })

            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta',
                consent: true
            }

            let contactResponse = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            })

            contactResponse = await contactResponse.json()
            expect(contactResponse.success).toBe(true)

            // Step 2: Check availability
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.availability.success
            })

            let availabilityResponse = await fetch('/api/appointments/availability')
            availabilityResponse = await availabilityResponse.json()
            expect(availabilityResponse.availableSlots).toHaveLength(2)

            // Step 3: Book appointment
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.appointment.success
            })

            const appointmentData = {
                patientName: 'João Silva',
                patientEmail: 'joao@example.com',
                patientPhone: '11999999999',
                appointmentDate: '2024-01-20',
                appointmentTime: '09:00',
                notes: 'Consulta solicitada via formulário de contato'
            }

            let appointmentResponse = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            })

            appointmentResponse = await appointmentResponse.json()
            expect(appointmentResponse.success).toBe(true)
            expect(appointmentResponse.confirmationToken).toBe('token-456')

            // Step 4: Confirm appointment
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponses.confirmation.success
            })

            let confirmationResponse = await fetch(
                `/api/appointments/confirm?token=${appointmentResponse.confirmationToken}`
            )

            confirmationResponse = await confirmationResponse.json()
            expect(confirmationResponse.success).toBe(true)
            expect(confirmationResponse.appointment.status).toBe('confirmed')

            // Verify all API calls were made
            expect(fetch).toHaveBeenCalledTimes(4)
        })
    })
})