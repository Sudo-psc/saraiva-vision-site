/**
 * Appointment utilities
 * Helper functions for appointment management and token generation
 */

import crypto from 'crypto'

/**
 * Generate a secure confirmation token
 * @returns {string} 64-character hexadecimal token
 */
export function generateConfirmationToken() {
    return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a unique request ID for tracking
 * @returns {string} Unique request identifier
 */
export function generateRequestId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `req_${timestamp}_${random}`
}

/**
 * Hash IP address for privacy-compliant rate limiting
 * @param {string} ip - IP address to hash
 * @returns {string} SHA-256 hash of the IP address
 */
export function hashIP(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex')
}

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
export function getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1'
}

/**
 * Format appointment date for display in Brazilian format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date in DD/MM/YYYY format
 */
export function formatAppointmentDate(dateString) {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
}

/**
 * Format appointment time for display
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time
 */
export function formatAppointmentTime(timeString) {
    return timeString
}

/**
 * Get day name in Portuguese
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Day name in Portuguese
 */
export function getAppointmentDayName(dateString) {
    const date = new Date(dateString + 'T00:00:00')
    const dayNames = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ]
    return dayNames[date.getDay()]
}

/**
 * Calculate appointment duration in minutes
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in minutes
 */
export function calculateAppointmentDuration(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    return endMinutes - startMinutes
}

/**
 * Generate appointment confirmation URL
 * @param {string} token - Confirmation token
 * @returns {string} Confirmation URL
 */
export function generateConfirmationURL(token) {
    const baseURL = process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : 'http://localhost:3000'

    return `${baseURL}/appointments/confirm?token=${token}`
}

/**
 * Generate appointment cancellation URL
 * @param {string} token - Confirmation token
 * @returns {string} Cancellation URL
 */
export function generateCancellationURL(token) {
    const baseURL = process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : 'http://localhost:3000'

    return `${baseURL}/appointments/cancel?token=${token}`
}

/**
 * Check if appointment is within reminder window
 * @param {string} appointmentDate - Date in YYYY-MM-DD format
 * @param {string} appointmentTime - Time in HH:MM format
 * @param {number} hoursBeforeReminder - Hours before appointment to send reminder
 * @returns {boolean} True if within reminder window
 */
export function isWithinReminderWindow(appointmentDate, appointmentTime, hoursBeforeReminder) {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)
    const now = new Date()

    // Convert to Brazil timezone
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    const brazilAppointment = new Date(appointmentDateTime.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

    const timeDifference = brazilAppointment.getTime() - brazilNow.getTime()
    const hoursDifference = timeDifference / (1000 * 60 * 60)

    return hoursDifference <= hoursBeforeReminder && hoursDifference > 0
}

/**
 * Generate appointment summary for notifications
 * @param {Object} appointment - Appointment data
 * @returns {Object} Formatted appointment summary
 */
export function generateAppointmentSummary(appointment) {
    return {
        patientName: appointment.patient_name,
        date: formatAppointmentDate(appointment.appointment_date),
        time: formatAppointmentTime(appointment.appointment_time),
        dayName: getAppointmentDayName(appointment.appointment_date),
        confirmationURL: generateConfirmationURL(appointment.confirmation_token),
        cancellationURL: generateCancellationURL(appointment.confirmation_token)
    }
}

/**
 * Validate appointment time slot format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid time slot
 */
export function isValidTimeSlot(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
        return false
    }

    const [hour, minute] = time.split(':').map(Number)

    // Check if it's within business hours (08:00 - 18:00)
    if (hour < 8 || hour >= 18) {
        return false
    }

    // Check if it's a valid 30-minute slot
    if (minute !== 0 && minute !== 30) {
        return false
    }

    return true
}

/**
 * Get next available time slot
 * @param {string} currentTime - Current time in HH:MM format
 * @returns {string|null} Next available time slot or null if no more slots today
 */
export function getNextTimeSlot(currentTime) {
    const [hour, minute] = currentTime.split(':').map(Number)
    let nextHour = hour
    let nextMinute = minute + 30

    if (nextMinute >= 60) {
        nextHour += 1
        nextMinute = 0
    }

    // Check if still within business hours
    if (nextHour >= 18) {
        return null
    }

    return `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
}

/**
 * Calculate business days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of business days
 */
export function calculateBusinessDays(startDate, endDate) {
    let count = 0
    const current = new Date(startDate)

    while (current <= endDate) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
            count++
        }
        current.setDate(current.getDate() + 1)
    }

    return count
}