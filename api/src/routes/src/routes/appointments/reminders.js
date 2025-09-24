/**
 * Appointment Reminder System
 * Processes scheduled reminders for appointments (T-24h and T-2h)
 * Requirements: 4.3 - Reminder scheduling and processing
 */

import { supabaseAdmin } from 'from 'from '../../../../../../..../../../../src/lib/supabase.js'' ' 
import { addToOutbox } from './notifications.js'
import { logEvent } from '../../../../../../../..../../../../src/lib/eventLogger.js'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({})
    }

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value)
    })

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
        if (req.method === 'POST') {
            return await processReminders(req, res, requestId)
        } else if (req.method === 'GET') {
            return await getReminderStats(req, res, requestId)
        } else {
            return res.status(405).json({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: 'Method not allowed',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }
    } catch (error) {
        console.error('Reminders API error:', error)

        await logEvent({
            eventType: 'reminders_api_error',
            severity: 'error',
            source: 'reminders_api',
            requestId,
            eventData: {
                error: error.message,
                stack: error.stack,
                method: req.method,
                url: req.url
            }
        })

        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }
}

/**
 * Process due reminders for appointments
 */
async function processReminders(req, res, requestId) {
    try {
        const now = new Date()
        const reminderResults = {
            processed24h: 0,
            processed2h: 0,
            failed: 0,
            total: 0
        }

        // Process 24-hour reminders
        const reminders24h = await findDueReminders(24, now)
        for (const appointment of reminders24h) {
            try {
                await sendReminderNotifications(appointment, 24, requestId)
                await markReminderSent(appointment.id, '24h')
                reminderResults.processed24h++
            } catch (error) {
                console.error(`Failed to send 24h reminder for appointment ${appointment.id}:`, error)
                reminderResults.failed++
            }
        }

        // Process 2-hour reminders
        const reminders2h = await findDueReminders(2, now)
        for (const appointment of reminders2h) {
            try {
                await sendReminderNotifications(appointment, 2, requestId)
                await markReminderSent(appointment.id, '2h')
                reminderResults.processed2h++
            } catch (error) {
                console.error(`Failed to send 2h reminder for appointment ${appointment.id}:`, error)
                reminderResults.failed++
            }
        }

        reminderResults.total = reminderResults.processed24h + reminderResults.processed2h + reminderResults.failed

        await logEvent({
            eventType: 'reminders_processed',
            severity: 'info',
            source: 'reminders_api',
            requestId,
            eventData: reminderResults
        })

        return res.status(200).json({
            success: true,
            data: reminderResults,
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error processing reminders:', error)
        throw error
    }
}

/**
 * Find appointments that need reminders
 * @param {number} hoursUntil - Hours until appointment (24 or 2)
 * @param {Date} now - Current time
 * @returns {Promise<Array>} Appointments needing reminders
 */
export async function findDueReminders(hoursUntil, now) {
    try {
        // Calculate the target time range for reminders
        const targetTime = new Date(now.getTime() + (hoursUntil * 60 * 60 * 1000))
        const windowStart = new Date(targetTime.getTime() - (30 * 60 * 1000)) // 30 minutes before
        const windowEnd = new Date(targetTime.getTime() + (30 * 60 * 1000))   // 30 minutes after

        const reminderField = hoursUntil === 24 ? 'reminder_24h_sent' : 'reminder_2h_sent'

        const { data: appointments, error } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('status', 'confirmed')
            .eq(reminderField, false)
            .gte('appointment_date', windowStart.toISOString().split('T')[0])
            .lte('appointment_date', windowEnd.toISOString().split('T')[0])

        if (error) {
            throw error
        }

        // Filter appointments that fall within the reminder window
        const dueAppointments = appointments.filter(appointment => {
            const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`)
            return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd
        })

        return dueAppointments

    } catch (error) {
        console.error(`Error finding ${hoursUntil}h reminders:`, error)
        throw error
    }
}

/**
 * Send reminder notifications for an appointment
 * @param {Object} appointment - Appointment data
 * @param {number} hoursUntil - Hours until appointment
 * @param {string} requestId - Request ID for tracking
 */
export async function sendReminderNotifications(appointment, hoursUntil, requestId) {
    try {
        const reminderType = hoursUntil === 24 ? '24h' : '2h'

        // Email reminder
        await addToOutbox({
            messageType: 'email',
            recipient: appointment.patient_email,
            subject: `Lembrete: Consulta em ${hoursUntil === 24 ? '24 horas' : '2 horas'} - Saraiva Vision`,
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                appointment_id: appointment.id,
                confirmation_token: appointment.confirmation_token,
                reminder_type: reminderType,
                hours_until: hoursUntil
            },
            requestId
        })

        // SMS reminder
        await addToOutbox({
            messageType: 'sms',
            recipient: appointment.patient_phone,
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                reminder_type: reminderType,
                hours_until: hoursUntil
            },
            requestId
        })

        await logEvent({
            eventType: 'reminder_notifications_sent',
            severity: 'info',
            source: 'reminders_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                reminder_type: reminderType,
                patient_email: appointment.patient_email,
                patient_phone: appointment.patient_phone.substring(0, 5) + '***'
            }
        })

    } catch (error) {
        console.error(`Error sending ${hoursUntil}h reminder notifications:`, error)
        throw error
    }
}

/**
 * Mark reminder as sent to prevent duplicates
 * @param {string} appointmentId - Appointment ID
 * @param {string} reminderType - '24h' or '2h'
 */
export async function markReminderSent(appointmentId, reminderType) {
    try {
        const updateField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_2h_sent'

        const { error } = await supabaseAdmin
            .from('appointments')
            .update({ [updateField]: true })
            .eq('id', appointmentId)

        if (error) {
            throw error
        }

    } catch (error) {
        console.error(`Error marking ${reminderType} reminder as sent:`, error)
        throw error
    }
}

/**
 * Get reminder statistics for monitoring
 */
async function getReminderStats(req, res, requestId) {
    try {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]

        // Get reminder statistics
        const { data: stats, error } = await supabaseAdmin
            .from('appointments')
            .select('status, reminder_24h_sent, reminder_2h_sent, appointment_date')
            .in('status', ['confirmed', 'pending'])
            .gte('appointment_date', today)
            .lte('appointment_date', tomorrow)

        if (error) {
            throw error
        }

        const reminderStats = {
            total_appointments: stats.length,
            confirmed_appointments: stats.filter(a => a.status === 'confirmed').length,
            pending_appointments: stats.filter(a => a.status === 'pending').length,
            reminders_24h_sent: stats.filter(a => a.reminder_24h_sent).length,
            reminders_2h_sent: stats.filter(a => a.reminder_2h_sent).length,
            reminders_24h_pending: stats.filter(a => a.status === 'confirmed' && !a.reminder_24h_sent).length,
            reminders_2h_pending: stats.filter(a => a.status === 'confirmed' && !a.reminder_2h_sent).length
        }

        return res.status(200).json({
            success: true,
            data: reminderStats,
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error getting reminder stats:', error)
        throw error
    }
}