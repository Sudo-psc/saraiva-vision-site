/**
 * Appointment Confirmation API
 * Handles appointment confirmation via unique tokens
 * Requirement 4.3: Appointment confirmation system with unique tokens
 */

import { supabaseAdmin } from 'from 'from '../../../../../../..../../../../src/lib/supabase.js'' ' 
import { validateConfirmationToken, validateStatusTransition } from './validation.js'
import { logEvent } from '../../../../../../..../../../../src/lib/eventLogger.js'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        if (req.method === 'GET') {
            return await handleGetAppointmentByToken(req, res, requestId)
        } else if (req.method === 'POST') {
            return await handleConfirmAppointment(req, res, requestId)
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
        console.error('Confirmation API error:', error)

        await logEvent({
            eventType: 'api_error',
            severity: 'error',
            source: 'confirmation_api',
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
 * Get appointment details by confirmation token
 */
async function handleGetAppointmentByToken(req, res, requestId) {
    const { token } = req.query

    // Validate token format
    const tokenValidation = validateConfirmationToken(token)
    if (!tokenValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: tokenValidation.error,
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    try {
        // Find appointment by confirmation token
        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('confirmation_token', token)
            .single()

        if (error || !appointment) {
            await logEvent({
                eventType: 'appointment_token_not_found',
                severity: 'warn',
                source: 'confirmation_api',
                requestId,
                eventData: { token: token.substring(0, 8) + '...' }
            })

            return res.status(404).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_NOT_FOUND',
                    message: 'Appointment not found or token is invalid',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }

        // Check if appointment is still valid for confirmation
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`)
        const now = new Date()

        if (appointmentDateTime <= now) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_EXPIRED',
                    message: 'This appointment has already passed and cannot be confirmed',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }

        // Return appointment details (without sensitive information)
        return res.status(200).json({
            success: true,
            data: {
                appointment: {
                    id: appointment.id,
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    status: appointment.status,
                    notes: appointment.notes,
                    created_at: appointment.created_at
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error fetching appointment by token:', error)
        throw error
    }
}

/**
 * Confirm appointment using token
 */
async function handleConfirmAppointment(req, res, requestId) {
    const { token, action = 'confirm' } = req.body

    // Validate token format
    const tokenValidation = validateConfirmationToken(token)
    if (!tokenValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: tokenValidation.error,
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    // Validate action
    if (!['confirm', 'cancel'].includes(action)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_ACTION',
                message: 'Action must be either "confirm" or "cancel"',
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }

    try {
        // Find appointment by confirmation token
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('confirmation_token', token)
            .single()

        if (fetchError || !appointment) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_NOT_FOUND',
                    message: 'Appointment not found or token is invalid',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }

        // Check if appointment is still valid for confirmation/cancellation
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`)
        const now = new Date()

        if (appointmentDateTime <= now) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_EXPIRED',
                    message: 'This appointment has already passed and cannot be modified',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }

        // Determine new status based on action
        const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'

        // Validate status transition
        const statusValidation = validateStatusTransition(appointment.status, newStatus)
        if (!statusValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_TRANSITION',
                    message: statusValidation.error,
                    timestamp: new Date().toISOString(),
                    requestId
                }
            })
        }

        // Update appointment status
        const updateData = {
            status: newStatus
        }

        if (action === 'confirm') {
            updateData.confirmed_at = new Date().toISOString()
        }

        const { data: updatedAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update(updateData)
            .eq('id', appointment.id)
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        // Log the confirmation/cancellation
        await logEvent({
            eventType: `appointment_${action}ed`,
            severity: 'info',
            source: 'confirmation_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                patient_email: appointment.patient_email,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                previous_status: appointment.status,
                new_status: newStatus
            }
        })

        const actionMessage = action === 'confirm'
            ? 'Appointment confirmed successfully'
            : 'Appointment cancelled successfully'

        return res.status(200).json({
            success: true,
            data: {
                appointment: {
                    id: updatedAppointment.id,
                    patient_name: updatedAppointment.patient_name,
                    appointment_date: updatedAppointment.appointment_date,
                    appointment_time: updatedAppointment.appointment_time,
                    status: updatedAppointment.status,
                    confirmed_at: updatedAppointment.confirmed_at
                },
                message: actionMessage
            },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error confirming appointment:', error)
        throw error
    }
}