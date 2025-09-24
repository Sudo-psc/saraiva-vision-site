/**
 * SMS Service using Zenvia API
 * Handles SMS delivery for appointment confirmations and reminders
 * Requirements: 4.2, 4.3 - SMS notifications for appointments
 */

import { logEvent } from '../../../../../../..../../../../src/lib/eventLogger.js'

/**
 * Send SMS via Zenvia API
 * @param {Object} smsData - SMS data
 * @returns {Promise<Object>} Delivery result
 */
export async function sendSMS(smsData) {
    const { to, message, messageId } = smsData

    try {
        // Validate required environment variables
        if (!process.env.ZENVIA_API_TOKEN) {
            throw new Error('ZENVIA_API_TOKEN not configured')
        }

        if (!process.env.ZENVIA_FROM_NUMBER) {
            throw new Error('ZENVIA_FROM_NUMBER not configured')
        }

        // Format phone number (remove non-digits and ensure Brazilian format)
        const formattedPhone = formatBrazilianPhone(to)
        if (!formattedPhone) {
            throw new Error('Invalid phone number format')
        }

        // Prepare Zenvia API request
        const zenviaPayload = {
            from: process.env.ZENVIA_FROM_NUMBER,
            to: formattedPhone,
            contents: [{
                type: 'text',
                text: message
            }]
        }

        // Send SMS via Zenvia API
        const response = await fetch('https://api.zenvia.com/v2/channels/sms/messages', {
            method: 'POST',
            headers: {
                'X-API-TOKEN': process.env.ZENVIA_API_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(zenviaPayload)
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(`Zenvia API error: ${response.status} - ${responseData.message || 'Unknown error'}`)
        }

        // Log successful SMS delivery
        await logEvent({
            eventType: 'sms_sent',
            severity: 'info',
            source: 'sms_service',
            eventData: {
                message_id: messageId,
                zenvia_id: responseData.id,
                to: formattedPhone.substring(0, 5) + '***', // Mask phone number
                status: 'sent'
            }
        })

        return {
            success: true,
            messageId: responseData.id,
            status: 'sent',
            provider: 'zenvia'
        }

    } catch (error) {
        console.error('SMS delivery failed:', error)

        // Log SMS delivery failure
        await logEvent({
            eventType: 'sms_failed',
            severity: 'error',
            source: 'sms_service',
            eventData: {
                message_id: messageId,
                to: to ? to.substring(0, 5) + '***' : 'unknown',
                error: error.message
            }
        })

        return {
            success: false,
            error: {
                message: error.message,
                code: 'SMS_DELIVERY_FAILED'
            }
        }
    }
}

/**
 * Format Brazilian phone number for Zenvia API
 * @param {string} phone - Raw phone number
 * @returns {string|null} Formatted phone number or null if invalid
 */
function formatBrazilianPhone(phone) {
    if (!phone) return null

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')

    // Brazilian phone number patterns:
    // Mobile: 11 digits (55 + 2-digit area code + 9 + 8 digits)
    // Landline: 10 digits (55 + 2-digit area code + 8 digits)

    if (digits.length === 13 && digits.startsWith('55')) {
        // Already has country code (55 + 11 digits)
        return digits
    } else if (digits.length === 11 && digits.charAt(2) === '9') {
        // Mobile number without country code (11 + 9 + 8 digits)
        return '55' + digits
    } else if (digits.length === 10) {
        // Landline without country code (11 + 8 digits)
        return '55' + digits
    } else if (digits.length === 9 && digits.charAt(0) === '9') {
        // Mobile number without area code (assume São Paulo 11)
        return '5511' + digits
    } else if (digits.length === 8) {
        // Landline without area code (assume São Paulo 11)
        return '5511' + digits
    }

    // Invalid format
    return null
}

/**
 * Validate Brazilian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validateBrazilianPhone(phone) {
    return formatBrazilianPhone(phone) !== null
}

/**
 * Send appointment confirmation SMS
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Delivery result
 */
export async function sendAppointmentConfirmationSMS(appointmentData) {
    const { patient_name, patient_phone, appointment_date, appointment_time, confirmation_token } = appointmentData

    // Format date and time for Brazilian locale
    const appointmentDate = new Date(`${appointment_date}T${appointment_time}:00`)
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    const message = `Saraiva Vision: Olá ${patient_name}! Sua consulta foi agendada para ${formattedDate} às ${formattedTime}. Chegue 15min antes. Confirme em: https://saraivavision.com.br/confirmar/${confirmation_token}`

    return await sendSMS({
        to: patient_phone,
        message,
        messageId: `appointment_${appointmentData.id || 'unknown'}`
    })
}

/**
 * Send appointment reminder SMS
 * @param {Object} appointmentData - Appointment data
 * @param {number} hoursUntil - Hours until appointment
 * @returns {Promise<Object>} Delivery result
 */
export async function sendAppointmentReminderSMS(appointmentData, hoursUntil) {
    const { patient_name, patient_phone, appointment_date, appointment_time } = appointmentData

    // Format date and time for Brazilian locale
    const appointmentDate = new Date(`${appointment_date}T${appointment_time}:00`)
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric'
    })
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    const reminderType = hoursUntil === 24 ? '24h' : '2h'
    const message = `Saraiva Vision: Lembrete! ${patient_name}, sua consulta é em ${reminderType} - ${formattedDate} às ${formattedTime}. Chegue 15min antes. Tel: (11) 99999-9999`

    return await sendSMS({
        to: patient_phone,
        message,
        messageId: `reminder_${appointmentData.id || 'unknown'}_${reminderType}`
    })
}

export default {
    sendSMS,
    validateBrazilianPhone,
    sendAppointmentConfirmationSMS,
    sendAppointmentReminderSMS
}