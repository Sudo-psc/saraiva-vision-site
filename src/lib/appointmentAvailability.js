/**
 * Appointment Availability Management
 * Handles calculation of available time slots for Monday-Friday 08:00-18:00
 * Requirement 4.1: Show open slots Monday-Friday 08:00-18:00 in 30-minute intervals
 */

import { supabaseAdmin } from './supabase.ts'

// Check if supabaseAdmin is available
if (!supabaseAdmin) {
    console.warn('Supabase admin client not available. Appointment availability features may not work.');
}

// Business hours configuration
export const BUSINESS_HOURS = {
    start: '08:00',
    end: '18:00',
    slotDuration: 30, // minutes
    workDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday)
    timezone: 'America/Sao_Paulo'
}

/**
 * Generate time slots for a given date
 * @param {Date} date - The date to generate slots for
 * @returns {string[]} Array of time strings in HH:MM format
 */
export function generateTimeSlots(date) {
    const slots = []
    const startHour = 8
    const endHour = 18
    const slotDuration = BUSINESS_HOURS.slotDuration

    // Skip weekends
    const dayOfWeek = date.getDay()
    if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
        return slots
    }

    // Generate slots from 08:00 to 18:00 in 30-minute intervals
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            slots.push(timeString)
        }
    }

    return slots
}

/**
 * Check if a specific date/time slot is available
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} excludeAppointmentId - Optional appointment ID to exclude from conflict check
 * @returns {Promise<boolean>} True if slot is available
 */
export async function isSlotAvailable(date, time, excludeAppointmentId = null) {
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not available for slot availability check');
        return false;
    }

    try {
        // Use Supabase function for availability check
        const { data, error } = await supabaseAdmin.rpc('check_appointment_availability', {
            p_date: date,
            p_time: time,
            p_exclude_id: excludeAppointmentId
        })

        if (error) {
            console.error('Error checking slot availability:', error)
            return false
        }

        return data === true
    } catch (error) {
        console.error('Error in isSlotAvailable:', error)
        return false
    }
}

/**
 * Get available slots for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format (optional, defaults to startDate)
 * @returns {Promise<Array>} Array of available slots with date and time
 */
export async function getAvailableSlots(startDate, endDate = null) {
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not available for getting available slots');
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin.rpc('get_available_slots', {
            p_start_date: startDate,
            p_end_date: endDate || startDate
        })

        if (error) {
            console.error('Error getting available slots:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in getAvailableSlots:', error)
        return []
    }
}

/**
 * Get available slots for the next N business days
 * @param {number} days - Number of business days to look ahead
 * @returns {Promise<Object>} Object with dates as keys and available slots as values
 */
export async function getAvailableSlotsForNextDays(days = 14) {
    const availableSlots = {}
    const today = new Date()

    // Set timezone to Brazil
    const brazilTime = new Date(today.toLocaleString("en-US", { timeZone: BUSINESS_HOURS.timezone }))

    let currentDate = new Date(brazilTime)
    let businessDaysFound = 0

    while (businessDaysFound < days) {
        const dayOfWeek = currentDate.getDay()

        // Only process business days
        if (BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
            const dateString = currentDate.toISOString().split('T')[0]

            // Skip past dates (only for today, allow future dates)
            const isToday = dateString === brazilTime.toISOString().split('T')[0]
            const currentHour = brazilTime.getHours()

            if (!isToday || currentHour < 18) { // Allow booking for today if before 6 PM
                const slots = await getAvailableSlots(dateString)

                // Filter out past slots for today
                let filteredSlots = slots
                if (isToday) {
                    const currentTime = `${currentHour.toString().padStart(2, '0')}:${brazilTime.getMinutes().toString().padStart(2, '0')}`
                    filteredSlots = slots.filter(slot => slot.slot_time > currentTime)
                }

                if (filteredSlots.length > 0) {
                    availableSlots[dateString] = filteredSlots
                }
            }

            businessDaysFound++
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return availableSlots
}

/**
 * Validate appointment date and time
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {Object} Validation result with isValid and error message
 */
export function validateAppointmentDateTime(date, time) {
    const appointmentDate = new Date(date + 'T' + time)
    const now = new Date()

    // Set timezone to Brazil
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: BUSINESS_HOURS.timezone }))
    const brazilAppointment = new Date(appointmentDate.toLocaleString("en-US", { timeZone: BUSINESS_HOURS.timezone }))

    // Check if appointment is in the past
    if (brazilAppointment <= brazilNow) {
        return {
            isValid: false,
            error: 'Appointment must be scheduled for a future date and time'
        }
    }

    // Check if it's a business day
    const dayOfWeek = brazilAppointment.getDay()
    if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
        return {
            isValid: false,
            error: 'Appointments can only be scheduled Monday through Friday'
        }
    }

    // Check if it's within business hours
    const [hour, minute] = time.split(':').map(Number)
    if (hour < 8 || hour >= 18 || (hour === 17 && minute >= 30)) {
        return {
            isValid: false,
            error: 'Appointments can only be scheduled between 08:00 and 18:00'
        }
    }

    // Check if it's a valid 30-minute slot
    if (minute !== 0 && minute !== 30) {
        return {
            isValid: false,
            error: 'Appointments must be scheduled in 30-minute intervals (e.g., 09:00, 09:30)'
        }
    }

    return { isValid: true }
}

/**
 * Format date for display in Brazilian format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date in DD/MM/YYYY format
 */
export function formatDateBR(dateString) {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
}

/**
 * Format time for display in Brazilian format
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time in HH:MM format
 */
export function formatTimeBR(timeString) {
    return timeString
}

/**
 * Get day name in Portuguese
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Day name in Portuguese
 */
export function getDayNameBR(dateString) {
    const date = new Date(dateString + 'T00:00:00')
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    return dayNames[date.getDay()]
}