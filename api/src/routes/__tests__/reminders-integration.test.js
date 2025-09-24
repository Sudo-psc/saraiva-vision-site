/**
 * Integration Tests for Appointment Reminder System
 * Tests the complete reminder workflow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Reminder System Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create reminder system components without errors', async () => {
        // Test that all reminder system files can be imported
        const remindersModule = await import('../appointments/reminders.js')
        const notificationsModule = await import('../appointments/notifications.js')
        const smsModule = await import('../contact/smsService.js')
        const outboxModule = await import('../contact/outboxService.js')

        expect(remindersModule.findDueReminders).toBeDefined()
        expect(remindersModule.sendReminderNotifications).toBeDefined()
        expect(remindersModule.markReminderSent).toBeDefined()

        expect(notificationsModule.addToOutbox).toBeDefined()
        expect(notificationsModule.scheduleReminderNotifications).toBeDefined()
        expect(notificationsModule.generateReminderEmailContent).toBeDefined()
        expect(notificationsModule.generateReminderSMSContent).toBeDefined()

        expect(smsModule.sendSMS).toBeDefined()
        expect(smsModule.validateBrazilianPhone).toBeDefined()

        expect(outboxModule.addToOutbox).toBeDefined()
        expect(outboxModule.processOutbox).toBeDefined()
    })

    it('should validate Brazilian phone numbers correctly', async () => {
        const { validateBrazilianPhone } = await import('../contact/smsService.js')

        // Valid phone numbers
        expect(validateBrazilianPhone('5511999999999')).toBe(true)  // Full format
        expect(validateBrazilianPhone('11999999999')).toBe(true)    // Without country code
        expect(validateBrazilianPhone('999999999')).toBe(true)      // Mobile without area code
        expect(validateBrazilianPhone('33334444')).toBe(true)       // Landline without area code

        // Invalid phone numbers
        expect(validateBrazilianPhone('123')).toBe(false)           // Too short
        expect(validateBrazilianPhone('123456789012345')).toBe(false) // Too long
        expect(validateBrazilianPhone('')).toBe(false)              // Empty
        expect(validateBrazilianPhone(null)).toBe(false)            // Null
    })

    it('should generate reminder email content with correct format', async () => {
        const { generateReminderEmailContent } = await import('../appointments/notifications.js')

        const templateData = {
            patient_name: 'João Silva',
            appointment_date: '2024-01-15',
            appointment_time: '14:00:00'
        }

        const emailContent24h = generateReminderEmailContent(templateData, 24)
        const emailContent2h = generateReminderEmailContent(templateData, 2)

        // Check that content is generated
        expect(emailContent24h).toContain('João Silva')
        expect(emailContent24h).toContain('24 horas')
        expect(emailContent24h).toContain('Saraiva Vision')

        expect(emailContent2h).toContain('João Silva')
        expect(emailContent2h).toContain('2 horas')
        expect(emailContent2h).toContain('Saraiva Vision')

        // Check that content is different for different reminder types
        expect(emailContent24h).not.toBe(emailContent2h)
    })

    it('should generate reminder SMS content with correct format', async () => {
        const { generateReminderSMSContent } = await import('../appointments/notifications.js')

        const templateData = {
            patient_name: 'Maria Santos',
            appointment_date: '2024-01-15',
            appointment_time: '16:00:00'
        }

        const smsContent24h = generateReminderSMSContent(templateData, 24)
        const smsContent2h = generateReminderSMSContent(templateData, 2)

        // Check that content is generated and contains key information
        expect(smsContent24h).toContain('Maria Santos')
        expect(smsContent24h).toContain('24h')
        expect(smsContent24h).toContain('Saraiva Vision')

        expect(smsContent2h).toContain('Maria Santos')
        expect(smsContent2h).toContain('2h')
        expect(smsContent2h).toContain('Saraiva Vision')

        // SMS should be shorter than email
        expect(smsContent24h.length).toBeLessThan(160) // SMS length limit
        expect(smsContent2h.length).toBeLessThan(160)
    })

    it('should handle reminder type detection in template generation', async () => {
        const { generateContent, generateSMSContentFromTemplate } = await import('../appointments/notifications.js')

        // Test confirmation message (no reminder_type)
        const confirmationData = {
            patient_name: 'Pedro Costa',
            appointment_date: '2024-01-15',
            appointment_time: '10:00:00'
        }

        // Test reminder message (with reminder_type)
        const reminderData = {
            patient_name: 'Ana Silva',
            appointment_date: '2024-01-15',
            appointment_time: '14:00:00',
            reminder_type: '24h',
            hours_until: 24
        }

        // These functions should handle both types without errors
        expect(() => generateContent(confirmationData)).not.toThrow()
        expect(() => generateContent(reminderData)).not.toThrow()
        expect(() => generateSMSContentFromTemplate(confirmationData)).not.toThrow()
        expect(() => generateSMSContentFromTemplate(reminderData)).not.toThrow()
    })

    it('should calculate reminder times correctly', () => {
        const appointmentDateTime = new Date('2024-01-15T14:00:00Z')

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

    it('should handle timezone considerations for Brazilian appointments', () => {
        // Test appointment in São Paulo timezone (UTC-3)
        const appointmentDate = '2024-01-15'
        const appointmentTime = '14:00:00'

        // Create appointment datetime (assuming local timezone handling)
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)

        // Verify the date components are preserved
        expect(appointmentDateTime.getFullYear()).toBe(2024)
        expect(appointmentDateTime.getMonth()).toBe(0) // January (0-indexed)
        expect(appointmentDateTime.getDate()).toBe(15)
        expect(appointmentDateTime.getHours()).toBe(14)
        expect(appointmentDateTime.getMinutes()).toBe(0)
    })

    it('should validate reminder window logic', () => {
        const now = new Date('2024-01-14T14:00:00Z')
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
        const appointmentInWindow = new Date('2024-01-15T14:15:00Z')
        expect(appointmentInWindow >= windowStart && appointmentInWindow <= windowEnd).toBe(true)

        // Test appointment outside window
        const appointmentOutsideWindow = new Date('2024-01-15T15:00:00Z')
        expect(appointmentOutsideWindow >= windowStart && appointmentOutsideWindow <= windowEnd).toBe(false)
    })
})