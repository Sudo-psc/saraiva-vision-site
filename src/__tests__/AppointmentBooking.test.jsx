/**
 * Appointment Booking Component Tests
 * Tests for the appointment booking interface and functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import AppointmentBooking from '../components/AppointmentBooking.jsx'

// Mock fetch globally
global.fetch = vi.fn()

describe('AppointmentBooking', () => {
    beforeEach(() => {
        fetch.mockClear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders appointment booking form', () => {
        // Mock availability API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    availability: {
                        '2024-01-15': [
                            { slot_time: '09:00', is_available: true },
                            { slot_time: '09:30', is_available: true }
                        ]
                    }
                }
            })
        })

        render(<AppointmentBooking />)

        expect(screen.getByText('Agendar Consulta')).toBeInTheDocument()
        expect(screen.getByText('Dr. Philipe Saraiva - Oftalmologista')).toBeInTheDocument()
    })

    it('loads and displays available time slots', async () => {
        const mockAvailability = {
            '2024-01-15': [
                { slot_time: '09:00', is_available: true },
                { slot_time: '09:30', is_available: true },
                { slot_time: '10:00', is_available: true }
            ],
            '2024-01-16': [
                { slot_time: '14:00', is_available: true },
                { slot_time: '14:30', is_available: true }
            ]
        }

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: { availability: mockAvailability }
            })
        })

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('Escolha a data e horário')).toBeInTheDocument()
        })

        // Check if time slots are displayed
        expect(screen.getByText('09:00')).toBeInTheDocument()
        expect(screen.getByText('09:30')).toBeInTheDocument()
        expect(screen.getByText('14:00')).toBeInTheDocument()
    })

    it('progresses to patient info step when time slot is selected', async () => {
        const mockAvailability = {
            '2024-01-15': [
                { slot_time: '09:00', is_available: true }
            ]
        }

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: { availability: mockAvailability }
            })
        })

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        // Click on time slot
        fireEvent.click(screen.getByText('09:00'))

        // Should progress to step 2
        expect(screen.getByText('Dados pessoais')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
    })

    it('validates patient data before submission', async () => {
        const mockAvailability = {
            '2024-01-15': [{ slot_time: '09:00', is_available: true }]
        }

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: { availability: mockAvailability }
            })
        })

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        // Select time slot
        fireEvent.click(screen.getByText('09:00'))

        // Try to submit without filling required fields
        fireEvent.click(screen.getByText('Agendar Consulta'))

        await waitFor(() => {
            expect(screen.getByText(/Nome deve ter pelo menos 2 caracteres/)).toBeInTheDocument()
        })
    })

    it('submits appointment with valid data', async () => {
        const mockAvailability = {
            '2024-01-15': [{ slot_time: '09:00', is_available: true }]
        }

        const mockAppointmentResponse = {
            success: true,
            data: {
                appointment: {
                    id: 'test-id',
                    patient_name: 'João Silva',
                    appointment_date: '2024-01-15',
                    appointment_time: '09:00',
                    status: 'pending'
                }
            }
        }

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: mockAvailability }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockAppointmentResponse
            })

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        // Select time slot
        fireEvent.click(screen.getByText('09:00'))

        // Fill patient data
        fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
            target: { value: 'João Silva' }
        })
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
            target: { value: 'joao@email.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
            target: { value: '(11) 99999-9999' }
        })

        // Submit appointment
        fireEvent.click(screen.getByText('Agendar Consulta'))

        await waitFor(() => {
            expect(screen.getByText('Consulta agendada com sucesso!')).toBeInTheDocument()
        })

        // Verify API call
        expect(fetch).toHaveBeenCalledWith('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                patient_phone: '(11) 99999-9999',
                notes: '',
                appointment_date: '2024-01-15',
                appointment_time: '09:00'
            })
        })
    })

    it('handles slot unavailable error', async () => {
        const mockAvailability = {
            '2024-01-15': [{ slot_time: '09:00', is_available: true }]
        }

        const mockErrorResponse = {
            success: false,
            error: {
                code: 'SLOT_UNAVAILABLE',
                message: 'The selected time slot is no longer available'
            }
        }

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: mockAvailability }
                })
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => mockErrorResponse
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: {} }
                })
            })

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        // Select time slot and fill data
        fireEvent.click(screen.getByText('09:00'))

        fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
            target: { value: 'João Silva' }
        })
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
            target: { value: 'joao@email.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
            target: { value: '(11) 99999-9999' }
        })

        // Submit appointment
        fireEvent.click(screen.getByText('Agendar Consulta'))

        await waitFor(() => {
            expect(screen.getByText(/Este horário não está mais disponível/)).toBeInTheDocument()
        })

        // Should go back to step 1
        expect(screen.getByText('Escolha a data e horário')).toBeInTheDocument()
    })

    it('displays loading state while booking appointment', async () => {
        const mockAvailability = {
            '2024-01-15': [{ slot_time: '09:00', is_available: true }]
        }

        let resolveAppointment
        const appointmentPromise = new Promise(resolve => {
            resolveAppointment = resolve
        })

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: mockAvailability }
                })
            })
            .mockReturnValueOnce(appointmentPromise)

        render(<AppointmentBooking />)

        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        // Select time slot and fill data
        fireEvent.click(screen.getByText('09:00'))

        fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
            target: { value: 'João Silva' }
        })
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
            target: { value: 'joao@email.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
            target: { value: '(11) 99999-9999' }
        })

        // Submit appointment
        fireEvent.click(screen.getByText('Agendar Consulta'))

        // Should show loading state
        expect(screen.getByText('Agendando...')).toBeInTheDocument()
        expect(screen.getByText('Agendando...')).toBeDisabled()

        // Resolve the promise
        resolveAppointment({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    appointment: {
                        id: 'test-id',
                        patient_name: 'João Silva',
                        appointment_date: '2024-01-15',
                        appointment_time: '09:00',
                        status: 'pending'
                    }
                }
            })
        })

        await waitFor(() => {
            expect(screen.getByText('Consulta agendada com sucesso!')).toBeInTheDocument()
        })
    })

    it('allows resetting the booking form', async () => {
        const mockAvailability = {
            '2024-01-15': [{ slot_time: '09:00', is_available: true }]
        }

        const mockAppointmentResponse = {
            success: true,
            data: {
                appointment: {
                    id: 'test-id',
                    patient_name: 'João Silva',
                    appointment_date: '2024-01-15',
                    appointment_time: '09:00',
                    status: 'pending'
                }
            }
        }

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: mockAvailability }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockAppointmentResponse
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { availability: mockAvailability }
                })
            })

        render(<AppointmentBooking />)

        // Complete booking flow
        await waitFor(() => {
            expect(screen.getByText('09:00')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('09:00'))

        fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
            target: { value: 'João Silva' }
        })
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
            target: { value: 'joao@email.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
            target: { value: '(11) 99999-9999' }
        })

        fireEvent.click(screen.getByText('Agendar Consulta'))

        await waitFor(() => {
            expect(screen.getByText('Consulta agendada com sucesso!')).toBeInTheDocument()
        })

        // Reset booking
        fireEvent.click(screen.getByText('Agendar Nova Consulta'))

        await waitFor(() => {
            expect(screen.getByText('Escolha a data e horário')).toBeInTheDocument()
        })
    })
})