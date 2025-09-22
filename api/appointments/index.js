/**
 * Appointments API - Main booking endpoint
 * Handles appointment creation with conflict detection and automated notifications
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { supabaseAdmin } from '../../src/lib/supabase.ts'
import { validateAppointmentDateTime, isSlotAvailable } from '../../src/lib/appointmentAvailability.js'
import { validateAppointmentData } from './validation.js'
import { generateConfirmationToken } from './utils.js'
import { addToOutbox, scheduleReminderNotifications } from './notifications.js'
import { logEvent } from '../../src/lib/eventLogger.js'

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
            return await handleCreateAppointment(req, res, requestId)
        } else if (req.method === 'GET') {
            return await handleGetAppointments(req, res, requestId)
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
        console.error('Appointments API error:', error)

        await logEvent({
            eventType: 'api_error',
            severity: 'error',
            source: 'appointments_api',
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
 * Handle appointment creation
 */
async function handleCreateAppointment(req, res, requestId) {
    const { patient_name, patient_email, patient_phone, appointment_date, appointment_time, notes } = req.body

    // Validate input data
    const validation = validateAppointmentData(req.body)
    if (!validation.isValid) {
        await logEvent({
            eventType: 'appointment_validation_failed',
            severity: 'warn',
            source: 'appointments_api',
            requestId,
            eventData: { errors: validation.errors }
        })

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid appointment data',
                details: validation.errors,
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    // Validate date and time
    const dateTimeValidation = validateAppointmentDateTime(appointment_date, appointment_time)
    if (!dateTimeValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_DATETIME',
                message: dateTimeValidation.error,
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    // Check slot availability (Requirement 4.4: Prevent double-booking)
    const isAvailable = await isSlotAvailable(appointment_date, appointment_time)
    if (!isAvailable) {
        await logEvent({
            eventType: 'appointment_slot_conflict',
            severity: 'warn',
            source: 'appointments_api',
            requestId,
            eventData: {
                date: appointment_date,
                time: appointment_time,
                patient_email
            }
        })

        return res.status(409).json({
            success: false,
            error: {
                code: 'SLOT_UNAVAILABLE',
                message: 'The selected time slot is no longer available',
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    // Generate confirmation token
    const confirmationToken = generateConfirmationToken()

    try {
        // Create appointment in database
        const { data: appointment, error: dbError } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_name,
                patient_email,
                patient_phone,
                appointment_date,
                appointment_time,
                notes: notes || null,
                confirmation_token: confirmationToken,
                status: 'pending'
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error creating appointment:', dbError)

            // Check if it's a unique constraint violation (double booking)
            if (dbError.code === '23505' && dbError.constraint === 'appointments_unique_slot') {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'SLOT_UNAVAILABLE',
                        message: 'The selected time slot is no longer available',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                })
            }

            throw dbError
        }

        // Log successful appointment creation
        await logEvent({
            eventType: 'appointment_created',
            severity: 'info',
            source: 'appointments_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                date: appointment_date,
                time: appointment_time,
                patient_email
            }
        })

        // Schedule confirmation notifications (Requirement 4.2: Send within 60 seconds)
        await scheduleConfirmationNotifications(appointment, requestId)

        // Schedule reminder notifications (Requirement 4.3: T-24h and T-2h reminders)
        await scheduleReminderNotifications(appointment, requestId)

        return res.status(201).json({
            success: true,
            data: {
                appointment: {
                    id: appointment.id,
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    status: appointment.status,
                    confirmation_token: appointment.confirmation_token
                },
                message: 'Appointment scheduled successfully. Confirmation details have been sent to your email and phone.'
            },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error creating appointment:', error)
        throw error
    }
}

/**
 * Handle getting appointments (for admin/dashboard use)
 */
async function handleGetAppointments(req, res, requestId) {
    const { date, status, limit = 50 } = req.query

    try {
        let query = supabaseAdmin
            .from('appointments')
            .select('*')
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true })
            .limit(parseInt(limit))

        if (date) {
            query = query.eq('appointment_date', date)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data: appointments, error } = await query

        if (error) {
            throw error
        }

        return res.status(200).json({
            success: true,
            data: { appointments },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error fetching appointments:', error)
        throw error
    }
}

/**
 * Schedule confirmation notifications for email and SMS
 */
async function scheduleConfirmationNotifications(appointment, requestId) {
    try {
        // Email confirmation
        await addToOutbox({
            messageType: 'email',
            recipient: appointment.patient_email,
            subject: 'Confirmação de Consulta - Saraiva Vision',
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                confirmation_token: appointment.confirmation_token,
                appointment_id: appointment.id
            },
            requestId
        })

        // SMS confirmation
        await addToOutbox({
            messageType: 'sms',
            recipient: appointment.patient_phone,
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                confirmation_token: appointment.confirmation_token
            },
            requestId
        })

        await logEvent({
            eventType: 'appointment_notifications_scheduled',
            severity: 'info',
            source: 'appointments_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                email: appointment.patient_email,
                phone: appointment.patient_phone
            }
        })

    } catch (error) {
        console.error('Error scheduling notifications:', error)

        await logEvent({
            eventType: 'notification_scheduling_failed',
            severity: 'error',
            source: 'appointments_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                error: error.message
            }
        })

        // Don't throw - appointment was created successfully
    }
}