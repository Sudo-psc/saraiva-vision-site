/**
 * Appointment Availability API
 * Provides available time slots for appointment booking
 * Requirement 4.1: Show open slots Monday-Friday 08:00-18:00 in 30-minute intervals
 */

import { getAvailableSlots, getAvailableSlotsForNextDays, validateAppointmentDateTime } from '../../src/lib/appointmentAvailability.js'
import { logEvent } from '../../src/lib/eventLogger.js'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
            return await handleGetAvailability(req, res, requestId)
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
        console.error('Availability API error:', error)

        await logEvent({
            eventType: 'api_error',
            severity: 'error',
            source: 'availability_api',
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
 * Handle availability requests
 */
async function handleGetAvailability(req, res, requestId) {
    const { date, days, start_date, end_date } = req.query

    try {
        let availabilityData = {}

        if (date) {
            // Get availability for a specific date
            const dateValidation = validateAppointmentDateTime(date, '09:00')
            if (!dateValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATE',
                        message: 'Invalid date format. Use YYYY-MM-DD format.',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                })
            }

            const slots = await getAvailableSlots(date)
            availabilityData[date] = slots

        } else if (start_date && end_date) {
            // Get availability for a date range
            const startValidation = validateAppointmentDateTime(start_date, '09:00')
            const endValidation = validateAppointmentDateTime(end_date, '09:00')

            if (!startValidation.isValid || !endValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATE_RANGE',
                        message: 'Invalid date range. Use YYYY-MM-DD format for both dates.',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                })
            }

            // Get slots for each date in the range
            const startDate = new Date(start_date)
            const endDate = new Date(end_date)
            const currentDate = new Date(startDate)

            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0]
                const slots = await getAvailableSlots(dateString)
                if (slots.length > 0) {
                    availabilityData[dateString] = slots
                }
                currentDate.setDate(currentDate.getDate() + 1)
            }

        } else {
            // Get availability for next N business days (default: 14)
            const daysToLookAhead = days ? parseInt(days) : 14

            if (isNaN(daysToLookAhead) || daysToLookAhead < 1 || daysToLookAhead > 30) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DAYS_PARAMETER',
                        message: 'Days parameter must be a number between 1 and 30',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                })
            }

            availabilityData = await getAvailableSlotsForNextDays(daysToLookAhead)
        }

        // Log successful availability request
        await logEvent({
            eventType: 'availability_requested',
            severity: 'info',
            source: 'availability_api',
            requestId,
            eventData: {
                query_params: { date, days, start_date, end_date },
                slots_found: Object.keys(availabilityData).length
            }
        })

        return res.status(200).json({
            success: true,
            data: {
                availability: availabilityData,
                business_hours: {
                    start: '08:00',
                    end: '18:00',
                    slot_duration: 30,
                    work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    timezone: 'America/Sao_Paulo'
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Error fetching availability:', error)
        throw error
    }
}