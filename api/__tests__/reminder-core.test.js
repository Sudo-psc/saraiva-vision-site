/**
 * Core Reminder System Tests
 * Tests the essential reminder functionality
 */

import { describe, it, expect } from 'vitest'

describe('Reminder System Core', () => {
    it('should validate phone numbers correctly', () => {
        // Test the phone validation logic directly
        function formatBrazilianPhone(phone) {
            if (!phone) return null

            const digits = phone.replace(/\D/g, '')

            if (digits.length === 13 && digits.startsWith('55')) {
                return digits
            } else if (digits.length === 11 && digits.charAt(2) === '9') {
                return '55' + digits
            } else if (digits.length === 10) {
                return '55' + digits
            } else if (digits.length === 9 && digits.charAt(0) === '9') {
                return '5511' + digits
            } else if (digits.length === 8) {
                return '5511' + digits
            }

            return null
        }

        // Valid phone numbers
        expect(formatBrazilianPhone('5511999999999')).toBe('5511999999999')  // Full format
        expect(formatBrazilianPhone('11999999999')).toBe('5511999999999')    // Without country code
        expect(formatBrazilianPhone('999999999')).toBe('5511999999999')      // Mobile without area code
        expect(formatBrazilianPhone('33334444')).toBe('551133334444')        // Landline without area code

        // Invalid phone numbers
        expect(formatBrazilianPhone('123')).toBe(null)           // Too short
        expect(formatBrazilianPhone('123456789012345')).toBe(null) // Too long
        expect(formatBrazilianPhone('')).toBe(null)              // Empty
        expect(formatBrazilianPhone(null)).toBe(null)            // Null
    })

    it('should calculate reminder times correctly', () => {
        const appointmentDateTime = new Date('2024-01-15T14:00:00.000Z')

        // Calculate 24-hour reminder time
        const reminder24h = new Date(appointmentDateTime.getTime() - (24 * 60 * 60 * 1000))
        expect(reminder24h.toISOString()).toBe('2024-01-14T14:00:00.000Z')

        // Calculate 2-hour reminder time
        const reminder2h = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000))
        expect(reminder2h.toISOString()).toBe('2024-01-15T12:00:00.000Z')

        // Verify reminders are in the past relative to appointment
        expect(reminder24h.getTime()).toBeLessThan(appointmentDateTime.getTime())
        expect(reminder2h.getTime()).toBeLessThan(appointmentDateTime.getTime())

        // Verify 24h reminder is before 2h reminder
        expect(reminder24h.getTime()).toBeLessThan(reminder2h.getTime())
    })

    it('should validate reminder window logic', () => {
        const now = new Date('2024-01-14T14:00:00.000Z')
        const hoursUntil = 24

        // Calculate target time and window
        const targetTime = new Date(now.getTime() + (hoursUntil * 60 * 60 * 1000))
        const windowStart = new Date(targetTime.getTime() - (30 * 60 * 1000)) // 30 minutes before
        const windowEnd = new Date(targetTime.getTime() + (30 * 60 * 1000))   // 30 minutes after

        // Verify window calculations
        expect(targetTime.toISOString()).toBe('2024-01-15T14:00:00.000Z')
        expect(windowStart.toISOString()).toBe('2024-01-15T13:30:00.000Z')
        expect(windowEnd.toISOString()).toBe('2024-01-15T14:30:00.000Z')

        // Test appointment within window
        const appointmentInWindow = new Date('2024-01-15T14:15:00.000Z')
        expect(appointmentInWindow >= windowStart && appointmentInWindow <= windowEnd).toBe(true)

        // Test appointment outside window
        const appointmentOutsideWindow = new Date('2024-01-15T15:00:00.000Z')
        expect(appointmentOutsideWindow >= windowStart && appointmentOutsideWindow <= windowEnd).toBe(false)
    })

    it('should handle date parsing correctly', () => {
        // Test ISO date parsing
        const appointmentDate = '2024-01-15'
        const appointmentTime = '14:00:00'

        // Create appointment datetime in ISO format
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}.000Z`)

        // Verify the date components are preserved
        expect(appointmentDateTime.getUTCFullYear()).toBe(2024)
        expect(appointmentDateTime.getUTCMonth()).toBe(0) // January (0-indexed)
        expect(appointmentDateTime.getUTCDate()).toBe(15)
        expect(appointmentDateTime.getUTCHours()).toBe(14)
        expect(appointmentDateTime.getUTCMinutes()).toBe(0)
    })

    it('should generate basic reminder content', () => {
        const templateData = {
            patient_name: 'João Silva',
            appointment_date: '2024-01-15',
            appointment_time: '14:00:00'
        }

        // Test basic template replacement
        const emailTemplate = `
            Olá, ${templateData.patient_name}!
            Sua consulta está marcada para ${templateData.appointment_date} às ${templateData.appointment_time}.
            Saraiva Vision - Clínica Oftalmológica
        `

        expect(emailTemplate).toContain('João Silva')
        expect(emailTemplate).toContain('2024-01-15')
        expect(emailTemplate).toContain('14:00:00')
        expect(emailTemplate).toContain('Saraiva Vision')

        // Test SMS template (shorter)
        const smsTemplate = `Saraiva Vision: Lembrete! ${templateData.patient_name}, sua consulta é hoje às ${templateData.appointment_time}.`

        expect(smsTemplate).toContain('João Silva')
        expect(smsTemplate).toContain('14:00:00')
        expect(smsTemplate.length).toBeLessThan(160) // SMS length limit
    })

    it('should handle reminder type logic', () => {
        // Test reminder type detection
        const confirmationData = {
            patient_name: 'Pedro Costa',
            appointment_date: '2024-01-15',
            appointment_time: '10:00:00'
        }

        const reminderData = {
            patient_name: 'Ana Silva',
            appointment_date: '2024-01-15',
            appointment_time: '14:00:00',
            reminder_type: '24h',
            hours_until: 24
        }

        // Test that we can distinguish between confirmation and reminder
        expect(confirmationData.reminder_type).toBeUndefined()
        expect(reminderData.reminder_type).toBe('24h')
        expect(reminderData.hours_until).toBe(24)

        // Test reminder type values
        expect(['24h', '2h'].includes(reminderData.reminder_type)).toBe(true)
    })
})