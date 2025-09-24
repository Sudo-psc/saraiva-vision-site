/**
 * Chatbot Appointment Booking API
 * Handles appointment scheduling through chatbot interface
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { getAvailableSlots, getAvailableSlotsForNextDays, validateAppointmentDateTime, isSlotAvailable } from '../../src/lib/appointmentAvailability.js';
import { validateAppointmentData } from '../appointments/validation.js';
import { generateConfirmationToken } from '../appointments/utils.js';
import { addToOutbox, scheduleReminderNotifications } from '../appointments/notifications.js';
import { supabaseAdmin } from '../../src/lib/supabase.ts';
import { logEvent } from '../../src/lib/eventLogger.js';
import { applyCorsHeaders, applySecurityHeaders } from '../utils/securityHeaders.js';
import { validateSecurity } from '../utils/inputValidation.js';
import { validateRequest, getClientIP } from '../contact/rateLimiter.js';
import { handleApiError } from '../utils/errorHandler.js';

export default async function handler(req, res) {
    const requestId = `chatbot_appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Apply security headers
    applyCorsHeaders(req, res);
    applySecurityHeaders(res, { requestId });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Apply rate limiting
    const rateLimitResult = validateRequest(req, req.body || {});
    if (!rateLimitResult.allowed) {
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        const rateLimitError = new Error(rateLimitResult.message);
        rateLimitError.code = rateLimitResult.type === 'rate_limit' ? 'RATE_LIMIT_EXCEEDED' : 'SPAM_DETECTED';
        return await handleApiError(rateLimitError, req, res, {
            source: 'chatbot-appointment-api',
            requestId,
            context: { retryAfter: rateLimitResult.retryAfter }
        });
    }

    try {
        if (req.method === 'GET') {
            return await handleGetAvailability(req, res, requestId);
        } else if (req.method === 'POST') {
            return await handleAppointmentAction(req, res, requestId);
        } else {
            const methodError = new Error('Method not allowed');
            methodError.code = 'METHOD_NOT_ALLOWED';
            return await handleApiError(methodError, req, res, {
                source: 'chatbot-appointment-api',
                requestId,
                context: { method: req.method, allowedMethods: ['GET', 'POST'] }
            });
        }
    } catch (error) {
        console.error('Chatbot appointment API error:', error);

        await logEvent({
            eventType: 'api_error',
            severity: 'error',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                error: error.message,
                stack: error.stack,
                method: req.method,
                url: req.url
            }
        });

        return await handleApiError(error, req, res, {
            source: 'chatbot-appointment-api',
            requestId,
            context: { method: req.method, url: req.url }
        });
    }
}

/**
 * Handle availability requests for chatbot
 */
async function handleGetAvailability(req, res, requestId) {
    const { sessionId, days = 7, preferredDates, timePreferences } = req.query;

    try {
        let availabilityData = {};

        if (preferredDates) {
            // Handle specific date requests
            const dates = preferredDates.split(',');
            for (const date of dates) {
                const dateValidation = validateAppointmentDateTime(date.trim(), '09:00');
                if (dateValidation.isValid) {
                    const slots = await getAvailableSlots(date.trim());
                    if (slots.length > 0) {
                        availabilityData[date.trim()] = slots;
                    }
                }
            }
        } else {
            // Get availability for next N days
            const daysToLookAhead = Math.min(parseInt(days), 14); // Max 14 days
            availabilityData = await getAvailableSlotsForNextDays(daysToLookAhead);
        }

        // Filter by time preferences if specified
        if (timePreferences && timePreferences !== 'any') {
            availabilityData = filterSlotsByTimePreference(availabilityData, timePreferences);
        }

        // Format response for chatbot consumption
        const formattedAvailability = formatAvailabilityForChatbot(availabilityData);

        await logEvent({
            eventType: 'chatbot_availability_requested',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                sessionId,
                days: daysToLookAhead,
                timePreferences,
                slotsFound: Object.keys(availabilityData).length
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                availability: formattedAvailability,
                summary: {
                    totalDates: Object.keys(availabilityData).length,
                    totalSlots: Object.values(availabilityData).reduce((sum, slots) => sum + slots.length, 0),
                    nextAvailable: getNextAvailableSlot(availabilityData),
                    businessHours: {
                        start: '08:00',
                        end: '18:00',
                        timezone: 'America/Sao_Paulo'
                    }
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error fetching chatbot availability:', error);
        throw error;
    }
}

/**
 * Handle appointment actions (book, modify, cancel)
 */
async function handleAppointmentAction(req, res, requestId) {
    const { action, sessionId, appointmentData, appointmentId } = req.body;

    // Validate input security
    if (req.body) {
        const securityResult = validateSecurity(req.body);
        if (!securityResult.safe) {
            await logEvent({
                eventType: 'security_threat_detected',
                severity: 'warn',
                source: 'chatbot_appointment_api',
                requestId,
                eventData: {
                    threats: securityResult.threats,
                    confidence: securityResult.confidence,
                    clientIP: getClientIP(req),
                    sessionId
                }
            });

            const securityError = new Error('Request blocked due to security threat detection');
            securityError.code = 'SECURITY_THREAT_DETECTED';
            return await handleApiError(securityError, req, res, {
                source: 'chatbot-appointment-api',
                requestId,
                context: { threats: securityResult.threats.map(t => t.type) }
            });
        }
    }

    try {
        switch (action) {
            case 'book':
                return await handleBookAppointment(req, res, requestId, sessionId, appointmentData);
            case 'modify':
                return await handleModifyAppointment(req, res, requestId, sessionId, appointmentId, appointmentData);
            case 'cancel':
                return await handleCancelAppointment(req, res, requestId, sessionId, appointmentId);
            case 'check_availability':
                return await handleCheckSpecificSlot(req, res, requestId, appointmentData);
            default:
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: 'Invalid action. Supported actions: book, modify, cancel, check_availability',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                });
        }
    } catch (error) {
        console.error('Error handling appointment action:', error);
        throw error;
    }
}

/**
 * Handle appointment booking through chatbot
 */
async function handleBookAppointment(req, res, requestId, sessionId, appointmentData) {
    const { patient_name, patient_email, patient_phone, appointment_date, appointment_time, notes, userConsent } = appointmentData;

    // Validate appointment data
    const validation = validateAppointmentData(appointmentData);
    if (!validation.isValid) {
        await logEvent({
            eventType: 'chatbot_appointment_validation_failed',
            severity: 'warn',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: { errors: validation.errors, sessionId }
        });

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid appointment data',
                details: validation.errors,
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }

    // Validate date and time
    const dateTimeValidation = validateAppointmentDateTime(appointment_date, appointment_time);
    if (!dateTimeValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_DATETIME',
                message: dateTimeValidation.error,
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }

    // Check slot availability
    const isAvailable = await isSlotAvailable(appointment_date, appointment_time);
    if (!isAvailable) {
        await logEvent({
            eventType: 'chatbot_appointment_slot_conflict',
            severity: 'warn',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                date: appointment_date,
                time: appointment_time,
                sessionId,
                patient_email
            }
        });

        // Get alternative slots
        const alternativeSlots = await getAlternativeSlots(appointment_date, appointment_time);

        return res.status(409).json({
            success: false,
            error: {
                code: 'SLOT_UNAVAILABLE',
                message: 'The selected time slot is no longer available',
                timestamp: new Date().toISOString(),
                requestId
            },
            data: {
                alternativeSlots: alternativeSlots.slice(0, 3), // Suggest up to 3 alternatives
                waitlistAvailable: true
            }
        });
    }

    // Generate confirmation token
    const confirmationToken = generateConfirmationToken();

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
                status: 'pending',
                created_via: 'chatbot',
                session_id: sessionId,
                user_consent: userConsent || {}
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error creating chatbot appointment:', dbError);

            if (dbError.code === '23505' && dbError.constraint === 'appointments_unique_slot') {
                const alternativeSlots = await getAlternativeSlots(appointment_date, appointment_time);
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'SLOT_UNAVAILABLE',
                        message: 'The selected time slot is no longer available',
                        timestamp: new Date().toISOString(),
                        requestId
                    },
                    data: {
                        alternativeSlots: alternativeSlots.slice(0, 3),
                        waitlistAvailable: true
                    }
                });
            }

            throw dbError;
        }

        // Log successful appointment creation
        await logEvent({
            eventType: 'chatbot_appointment_created',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                date: appointment_date,
                time: appointment_time,
                sessionId,
                patient_email
            }
        });

        // Schedule notifications
        await scheduleAppointmentNotifications(appointment, requestId);

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
                message: 'Appointment scheduled successfully through chatbot',
                nextSteps: [
                    'You will receive a confirmation email shortly',
                    'You will receive an SMS confirmation',
                    'Reminders will be sent 24 hours and 2 hours before your appointment'
                ]
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error creating chatbot appointment:', error);
        throw error;
    }
}

/**
 * Handle appointment modification through chatbot
 */
async function handleModifyAppointment(req, res, requestId, sessionId, appointmentId, appointmentData) {
    const { new_appointment_date, new_appointment_time, reason } = appointmentData;

    try {
        // First, verify the appointment exists and belongs to the session
        const { data: existingAppointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .eq('session_id', sessionId)
            .single();

        if (fetchError || !existingAppointment) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_NOT_FOUND',
                    message: 'Appointment not found or does not belong to this session',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        // Check if appointment can be modified (not within 24 hours)
        const appointmentDateTime = new Date(existingAppointment.appointment_date + 'T' + existingAppointment.appointment_time);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilAppointment < 24) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MODIFICATION_TOO_LATE',
                    message: 'Appointments cannot be modified within 24 hours of the scheduled time',
                    timestamp: new Date().toISOString(),
                    requestId
                },
                data: {
                    hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10,
                    contactInfo: {
                        phone: '(11) 1234-5678',
                        email: 'contato@saraivavision.com.br'
                    }
                }
            });
        }

        // Validate new date and time if provided
        if (new_appointment_date && new_appointment_time) {
            const dateTimeValidation = validateAppointmentDateTime(new_appointment_date, new_appointment_time);
            if (!dateTimeValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_NEW_DATETIME',
                        message: dateTimeValidation.error,
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                });
            }

            // Check if new slot is available
            const isNewSlotAvailable = await isSlotAvailable(new_appointment_date, new_appointment_time, appointmentId);
            if (!isNewSlotAvailable) {
                const alternativeSlots = await getAlternativeSlots(new_appointment_date, new_appointment_time);
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'NEW_SLOT_UNAVAILABLE',
                        message: 'The new time slot is not available',
                        timestamp: new Date().toISOString(),
                        requestId
                    },
                    data: {
                        alternativeSlots: alternativeSlots.slice(0, 3),
                        originalAppointment: {
                            date: existingAppointment.appointment_date,
                            time: existingAppointment.appointment_time
                        }
                    }
                });
            }
        }

        // Update the appointment
        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (new_appointment_date) updateData.appointment_date = new_appointment_date;
        if (new_appointment_time) updateData.appointment_time = new_appointment_time;
        if (reason) updateData.modification_reason = reason;

        const { data: updatedAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update(updateData)
            .eq('id', appointmentId)
            .select()
            .single();

        if (updateError) {
            console.error('Database error updating appointment:', updateError);
            throw updateError;
        }

        // Log the modification
        await logEvent({
            eventType: 'chatbot_appointment_modified',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: appointmentId,
                sessionId,
                old_date: existingAppointment.appointment_date,
                old_time: existingAppointment.appointment_time,
                new_date: updatedAppointment.appointment_date,
                new_time: updatedAppointment.appointment_time,
                reason
            }
        });

        // Send modification notifications
        await scheduleModificationNotifications(existingAppointment, updatedAppointment, requestId);

        return res.status(200).json({
            success: true,
            data: {
                appointment: {
                    id: updatedAppointment.id,
                    patient_name: updatedAppointment.patient_name,
                    appointment_date: updatedAppointment.appointment_date,
                    appointment_time: updatedAppointment.appointment_time,
                    status: updatedAppointment.status,
                    confirmation_token: updatedAppointment.confirmation_token
                },
                message: 'Appointment successfully modified',
                changes: {
                    dateChanged: existingAppointment.appointment_date !== updatedAppointment.appointment_date,
                    timeChanged: existingAppointment.appointment_time !== updatedAppointment.appointment_time
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error modifying appointment:', error);
        throw error;
    }
}

/**
 * Handle appointment cancellation through chatbot
 */
async function handleCancelAppointment(req, res, requestId, sessionId, appointmentId) {
    const { reason, request_reschedule } = req.body;

    try {
        // First, verify the appointment exists and belongs to the session
        const { data: existingAppointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .eq('session_id', sessionId)
            .single();

        if (fetchError || !existingAppointment) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'APPOINTMENT_NOT_FOUND',
                    message: 'Appointment not found or does not belong to this session',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        // Check if appointment is already cancelled
        if (existingAppointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_CANCELLED',
                    message: 'This appointment is already cancelled',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        // Check cancellation policy (24 hours notice)
        const appointmentDateTime = new Date(existingAppointment.appointment_date + 'T' + existingAppointment.appointment_time);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

        const isLateCancel = hoursUntilAppointment < 24;

        // Update appointment status to cancelled
        const { data: cancelledAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                status: 'cancelled',
                cancellation_reason: reason || 'Cancelled via chatbot',
                cancelled_at: new Date().toISOString(),
                late_cancellation: isLateCancel,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select()
            .single();

        if (updateError) {
            console.error('Database error cancelling appointment:', updateError);
            throw updateError;
        }

        // Log the cancellation
        await logEvent({
            eventType: 'chatbot_appointment_cancelled',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: appointmentId,
                sessionId,
                date: existingAppointment.appointment_date,
                time: existingAppointment.appointment_time,
                reason,
                late_cancellation: isLateCancel,
                hours_until_appointment: hoursUntilAppointment
            }
        });

        // Send cancellation notifications
        await scheduleCancellationNotifications(cancelledAppointment, requestId);

        // If user requested reschedule, provide available slots
        let rescheduleOptions = null;
        if (request_reschedule) {
            const availabilityData = await getAvailableSlotsForNextDays(14);
            rescheduleOptions = formatAvailabilityForChatbot(availabilityData).slice(0, 5); // Show first 5 options
        }

        return res.status(200).json({
            success: true,
            data: {
                appointment: {
                    id: cancelledAppointment.id,
                    status: cancelledAppointment.status,
                    cancelled_at: cancelledAppointment.cancelled_at,
                    late_cancellation: isLateCancel
                },
                message: isLateCancel
                    ? 'Appointment cancelled. Please note this is a late cancellation (less than 24 hours notice).'
                    : 'Appointment successfully cancelled.',
                cancellationPolicy: {
                    notice: isLateCancel ? 'Late cancellation' : 'On time',
                    hoursNotice: Math.round(hoursUntilAppointment * 10) / 10
                },
                rescheduleOptions
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
}

/**
 * Check availability for a specific slot
 */
async function handleCheckSpecificSlot(req, res, requestId, appointmentData) {
    const { appointment_date, appointment_time } = appointmentData;

    const dateTimeValidation = validateAppointmentDateTime(appointment_date, appointment_time);
    if (!dateTimeValidation.isValid) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_DATETIME',
                message: dateTimeValidation.error,
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }

    const isAvailable = await isSlotAvailable(appointment_date, appointment_time);

    return res.status(200).json({
        success: true,
        data: {
            available: isAvailable,
            date: appointment_date,
            time: appointment_time,
            alternatives: isAvailable ? [] : await getAlternativeSlots(appointment_date, appointment_time, 3)
        },
        timestamp: new Date().toISOString(),
        requestId
    });
}

/**
 * Filter slots by time preference
 */
function filterSlotsByTimePreference(availabilityData, timePreference) {
    const filtered = {};

    for (const [date, slots] of Object.entries(availabilityData)) {
        const filteredSlots = slots.filter(slot => {
            const hour = parseInt(slot.slot_time.split(':')[0]);

            switch (timePreference) {
                case 'morning':
                    return hour >= 8 && hour < 12;
                case 'afternoon':
                    return hour >= 12 && hour < 18;
                case 'early_morning':
                    return hour >= 8 && hour < 10;
                case 'late_afternoon':
                    return hour >= 16 && hour < 18;
                default:
                    return true;
            }
        });

        if (filteredSlots.length > 0) {
            filtered[date] = filteredSlots;
        }
    }

    return filtered;
}

/**
 * Format availability data for chatbot consumption
 */
function formatAvailabilityForChatbot(availabilityData) {
    const formatted = [];

    for (const [date, slots] of Object.entries(availabilityData)) {
        const dateObj = new Date(date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
        const formattedDate = dateObj.toLocaleDateString('pt-BR');

        formatted.push({
            date,
            displayDate: formattedDate,
            dayName,
            slots: slots.map(slot => ({
                time: slot.slot_time,
                displayTime: slot.slot_time,
                available: true,
                slotId: `${date}_${slot.slot_time}`
            }))
        });
    }

    return formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Get the next available slot
 */
function getNextAvailableSlot(availabilityData) {
    const dates = Object.keys(availabilityData).sort();

    for (const date of dates) {
        const slots = availabilityData[date];
        if (slots.length > 0) {
            return {
                date,
                time: slots[0].slot_time,
                displayDate: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR'),
                displayTime: slots[0].slot_time
            };
        }
    }

    return null;
}

/**
 * Get alternative slots when requested slot is unavailable
 */
async function getAlternativeSlots(requestedDate, requestedTime, limit = 5) {
    try {
        // Get availability for the next 7 days
        const availabilityData = await getAvailableSlotsForNextDays(7);
        const alternatives = [];

        // First, try to find slots on the same date
        if (availabilityData[requestedDate]) {
            const sameDateSlots = availabilityData[requestedDate]
                .filter(slot => slot.slot_time !== requestedTime)
                .slice(0, 2);

            sameDateSlots.forEach(slot => {
                alternatives.push({
                    date: requestedDate,
                    time: slot.slot_time,
                    displayDate: new Date(requestedDate + 'T00:00:00').toLocaleDateString('pt-BR'),
                    displayTime: slot.slot_time,
                    reason: 'same_date'
                });
            });
        }

        // Then, find slots on nearby dates
        const dates = Object.keys(availabilityData).sort();
        for (const date of dates) {
            if (alternatives.length >= limit) break;
            if (date === requestedDate) continue;

            const slots = availabilityData[date];
            if (slots.length > 0) {
                alternatives.push({
                    date,
                    time: slots[0].slot_time,
                    displayDate: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR'),
                    displayTime: slots[0].slot_time,
                    reason: 'nearby_date'
                });
            }
        }

        return alternatives.slice(0, limit);
    } catch (error) {
        console.error('Error getting alternative slots:', error);
        return [];
    }
}

/**
 * Schedule appointment notifications
 */
async function scheduleAppointmentNotifications(appointment, requestId) {
    try {
        // Email confirmation
        await addToOutbox({
            messageType: 'email',
            recipient: appointment.patient_email,
            subject: 'Confirmação de Consulta via Chatbot - Saraiva Vision',
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                confirmation_token: appointment.confirmation_token,
                appointment_id: appointment.id,
                booked_via: 'chatbot'
            },
            requestId
        });

        // SMS confirmation
        await addToOutbox({
            messageType: 'sms',
            recipient: appointment.patient_phone,
            templateData: {
                patient_name: appointment.patient_name,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                confirmation_token: appointment.confirmation_token,
                booked_via: 'chatbot'
            },
            requestId
        });

        // Schedule reminder notifications
        await scheduleReminderNotifications(appointment, requestId);

        await logEvent({
            eventType: 'chatbot_appointment_notifications_scheduled',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                email: appointment.patient_email,
                phone: appointment.patient_phone
            }
        });

    } catch (error) {
        console.error('Error scheduling chatbot appointment notifications:', error);

        await logEvent({
            eventType: 'chatbot_notification_scheduling_failed',
            severity: 'error',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                error: error.message
            }
        });
    }
}

/**
 * Schedule modification notifications
 */
async function scheduleModificationNotifications(originalAppointment, updatedAppointment, requestId) {
    try {
        // Email modification notification
        await addToOutbox({
            messageType: 'email',
            recipient: updatedAppointment.patient_email,
            subject: 'Consulta Reagendada - Saraiva Vision',
            templateData: {
                patient_name: updatedAppointment.patient_name,
                original_date: originalAppointment.appointment_date,
                original_time: originalAppointment.appointment_time,
                new_date: updatedAppointment.appointment_date,
                new_time: updatedAppointment.appointment_time,
                confirmation_token: updatedAppointment.confirmation_token,
                appointment_id: updatedAppointment.id,
                modified_via: 'chatbot'
            },
            requestId
        });

        // SMS modification notification
        await addToOutbox({
            messageType: 'sms',
            recipient: updatedAppointment.patient_phone,
            templateData: {
                patient_name: updatedAppointment.patient_name,
                original_date: originalAppointment.appointment_date,
                original_time: originalAppointment.appointment_time,
                new_date: updatedAppointment.appointment_date,
                new_time: updatedAppointment.appointment_time,
                confirmation_token: updatedAppointment.confirmation_token,
                modified_via: 'chatbot'
            },
            requestId
        });

        // Schedule new reminder notifications for the updated appointment
        await scheduleReminderNotifications(updatedAppointment, requestId);

        await logEvent({
            eventType: 'chatbot_modification_notifications_scheduled',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: updatedAppointment.id,
                email: updatedAppointment.patient_email,
                phone: updatedAppointment.patient_phone
            }
        });

    } catch (error) {
        console.error('Error scheduling modification notifications:', error);

        await logEvent({
            eventType: 'chatbot_modification_notification_failed',
            severity: 'error',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: updatedAppointment.id,
                error: error.message
            }
        });
    }
}

/**
 * Schedule cancellation notifications
 */
async function scheduleCancellationNotifications(cancelledAppointment, requestId) {
    try {
        // Email cancellation notification
        await addToOutbox({
            messageType: 'email',
            recipient: cancelledAppointment.patient_email,
            subject: 'Consulta Cancelada - Saraiva Vision',
            templateData: {
                patient_name: cancelledAppointment.patient_name,
                appointment_date: cancelledAppointment.appointment_date,
                appointment_time: cancelledAppointment.appointment_time,
                cancellation_reason: cancelledAppointment.cancellation_reason,
                cancelled_at: cancelledAppointment.cancelled_at,
                late_cancellation: cancelledAppointment.late_cancellation,
                appointment_id: cancelledAppointment.id,
                cancelled_via: 'chatbot'
            },
            requestId
        });

        // SMS cancellation notification
        await addToOutbox({
            messageType: 'sms',
            recipient: cancelledAppointment.patient_phone,
            templateData: {
                patient_name: cancelledAppointment.patient_name,
                appointment_date: cancelledAppointment.appointment_date,
                appointment_time: cancelledAppointment.appointment_time,
                cancelled_at: cancelledAppointment.cancelled_at,
                cancelled_via: 'chatbot'
            },
            requestId
        });

        await logEvent({
            eventType: 'chatbot_cancellation_notifications_scheduled',
            severity: 'info',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: cancelledAppointment.id,
                email: cancelledAppointment.patient_email,
                phone: cancelledAppointment.patient_phone
            }
        });

    } catch (error) {
        console.error('Error scheduling cancellation notifications:', error);

        await logEvent({
            eventType: 'chatbot_cancellation_notification_failed',
            severity: 'error',
            source: 'chatbot_appointment_api',
            requestId,
            eventData: {
                appointment_id: cancelledAppointment.id,
                error: error.message
            }
        });
    }
}