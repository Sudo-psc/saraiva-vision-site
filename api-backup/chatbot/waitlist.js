/**
 * Chatbot Waitlist Management API
 * Handles waitlist functionality for appointment booking
 * Requirements: 2.4, 2.6
 */

import { supabaseAdmin } from '../../src/lib/supabase.ts';
import { validateAppointmentDateTime } from '../../src/lib/appointmentAvailability.js';
import { logEvent } from '../../src/lib/eventLogger.js';
import { applyCorsHeaders, applySecurityHeaders } from '../utils/securityHeaders.js';
import { validateSecurity } from '../utils/inputValidation.js';
import { validateRequest, getClientIP } from '../contact/rateLimiter.js';
import { handleApiError } from '../utils/errorHandler.js';
import { addToOutbox } from '../appointments/notifications.js';

export default async function handler(req, res) {
    const requestId = `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
            source: 'chatbot-waitlist-api',
            requestId,
            context: { retryAfter: rateLimitResult.retryAfter }
        });
    }

    try {
        if (req.method === 'GET') {
            return await handleGetWaitlistStatus(req, res, requestId);
        } else if (req.method === 'POST') {
            return await handleWaitlistAction(req, res, requestId);
        } else {
            const methodError = new Error('Method not allowed');
            methodError.code = 'METHOD_NOT_ALLOWED';
            return await handleApiError(methodError, req, res, {
                source: 'chatbot-waitlist-api',
                requestId,
                context: { method: req.method, allowedMethods: ['GET', 'POST'] }
            });
        }
    } catch (error) {
        console.error('Chatbot waitlist API error:', error);

        await logEvent({
            eventType: 'api_error',
            severity: 'error',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                error: error.message,
                stack: error.stack,
                method: req.method,
                url: req.url
            }
        });

        return await handleApiError(error, req, res, {
            source: 'chatbot-waitlist-api',
            requestId,
            context: { method: req.method, url: req.url }
        });
    }
}

/**
 * Handle waitlist status requests
 */
async function handleGetWaitlistStatus(req, res, requestId) {
    const { sessionId, patientEmail, appointmentId } = req.query;

    try {
        let query = supabaseAdmin
            .from('appointment_waitlist')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }
        if (patientEmail) {
            query = query.eq('patient_email', patientEmail);
        }
        if (appointmentId) {
            query = query.eq('preferred_appointment_id', appointmentId);
        }

        const { data: waitlistEntries, error } = await query;

        if (error) {
            throw error;
        }

        // Calculate estimated wait times
        const enrichedEntries = await Promise.all(
            waitlistEntries.map(async (entry) => {
                const position = await getWaitlistPosition(entry.id);
                const estimatedWaitTime = calculateEstimatedWaitTime(position, entry.preferred_date);

                return {
                    ...entry,
                    position,
                    estimatedWaitTime
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: {
                waitlistEntries: enrichedEntries,
                totalActive: waitlistEntries.length
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error fetching waitlist status:', error);
        throw error;
    }
}

/**
 * Handle waitlist actions (join, leave, update)
 */
async function handleWaitlistAction(req, res, requestId) {
    const { action, sessionId, waitlistData } = req.body;

    // Validate input security
    if (req.body) {
        const securityResult = validateSecurity(req.body);
        if (!securityResult.safe) {
            await logEvent({
                eventType: 'security_threat_detected',
                severity: 'warn',
                source: 'chatbot_waitlist_api',
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
                source: 'chatbot-waitlist-api',
                requestId,
                context: { threats: securityResult.threats.map(t => t.type) }
            });
        }
    }

    try {
        switch (action) {
            case 'join':
                return await handleJoinWaitlist(req, res, requestId, sessionId, waitlistData);
            case 'leave':
                return await handleLeaveWaitlist(req, res, requestId, sessionId, waitlistData);
            case 'update':
                return await handleUpdateWaitlist(req, res, requestId, sessionId, waitlistData);
            default:
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: 'Invalid action. Supported actions: join, leave, update',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                });
        }
    } catch (error) {
        console.error('Error handling waitlist action:', error);
        throw error;
    }
}

/**
 * Handle joining waitlist
 */
async function handleJoinWaitlist(req, res, requestId, sessionId, waitlistData) {
    const {
        patient_name,
        patient_email,
        patient_phone,
        preferred_date,
        preferred_time,
        time_flexibility,
        date_flexibility,
        notes
    } = waitlistData;

    // Validate required fields
    if (!patient_name || !patient_email || !patient_phone) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'MISSING_REQUIRED_FIELDS',
                message: 'Patient name, email, and phone are required',
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }

    // Validate preferred date/time if provided
    if (preferred_date && preferred_time) {
        const dateTimeValidation = validateAppointmentDateTime(preferred_date, preferred_time);
        if (!dateTimeValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PREFERRED_DATETIME',
                    message: dateTimeValidation.error,
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }
    }

    try {
        // Check if user is already on waitlist for similar preferences
        const { data: existingEntry, error: checkError } = await supabaseAdmin
            .from('appointment_waitlist')
            .select('*')
            .eq('patient_email', patient_email)
            .eq('status', 'active')
            .eq('preferred_date', preferred_date)
            .single();

        if (existingEntry) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'ALREADY_ON_WAITLIST',
                    message: 'You are already on the waitlist for this date',
                    timestamp: new Date().toISOString(),
                    requestId
                },
                data: {
                    existingEntry: {
                        id: existingEntry.id,
                        preferred_date: existingEntry.preferred_date,
                        preferred_time: existingEntry.preferred_time,
                        created_at: existingEntry.created_at
                    }
                }
            });
        }

        // Add to waitlist
        const { data: waitlistEntry, error: insertError } = await supabaseAdmin
            .from('appointment_waitlist')
            .insert({
                session_id: sessionId,
                patient_name,
                patient_email,
                patient_phone,
                preferred_date,
                preferred_time,
                time_flexibility: time_flexibility || 'flexible',
                date_flexibility: date_flexibility || 'same_week',
                notes: notes || null,
                status: 'active',
                created_via: 'chatbot'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Database error adding to waitlist:', insertError);
            throw insertError;
        }

        // Get waitlist position
        const position = await getWaitlistPosition(waitlistEntry.id);
        const estimatedWaitTime = calculateEstimatedWaitTime(position, preferred_date);

        // Log waitlist join
        await logEvent({
            eventType: 'chatbot_waitlist_joined',
            severity: 'info',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                waitlist_id: waitlistEntry.id,
                sessionId,
                patient_email,
                preferred_date,
                preferred_time,
                position
            }
        });

        // Send waitlist confirmation notification
        await scheduleWaitlistNotifications(waitlistEntry, position, estimatedWaitTime, requestId);

        return res.status(201).json({
            success: true,
            data: {
                waitlistEntry: {
                    id: waitlistEntry.id,
                    patient_name: waitlistEntry.patient_name,
                    preferred_date: waitlistEntry.preferred_date,
                    preferred_time: waitlistEntry.preferred_time,
                    status: waitlistEntry.status,
                    position,
                    estimatedWaitTime
                },
                message: 'Successfully added to waitlist',
                nextSteps: [
                    'You will be notified if a slot becomes available',
                    'You can check your waitlist status anytime',
                    'You will have 2 hours to confirm if a slot opens up'
                ]
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error joining waitlist:', error);
        throw error;
    }
}

/**
 * Handle leaving waitlist
 */
async function handleLeaveWaitlist(req, res, requestId, sessionId, waitlistData) {
    const { waitlistId, reason } = waitlistData;

    try {
        // Verify waitlist entry exists and belongs to session
        const { data: existingEntry, error: fetchError } = await supabaseAdmin
            .from('appointment_waitlist')
            .select('*')
            .eq('id', waitlistId)
            .eq('session_id', sessionId)
            .single();

        if (fetchError || !existingEntry) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'WAITLIST_ENTRY_NOT_FOUND',
                    message: 'Waitlist entry not found or does not belong to this session',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        // Update status to cancelled
        const { data: updatedEntry, error: updateError } = await supabaseAdmin
            .from('appointment_waitlist')
            .update({
                status: 'cancelled',
                cancellation_reason: reason || 'Cancelled via chatbot',
                cancelled_at: new Date().toISOString()
            })
            .eq('id', waitlistId)
            .select()
            .single();

        if (updateError) {
            console.error('Database error leaving waitlist:', updateError);
            throw updateError;
        }

        // Log waitlist leave
        await logEvent({
            eventType: 'chatbot_waitlist_left',
            severity: 'info',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                waitlist_id: waitlistId,
                sessionId,
                reason
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                message: 'Successfully removed from waitlist',
                waitlistEntry: {
                    id: updatedEntry.id,
                    status: updatedEntry.status,
                    cancelled_at: updatedEntry.cancelled_at
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error leaving waitlist:', error);
        throw error;
    }
}

/**
 * Handle updating waitlist preferences
 */
async function handleUpdateWaitlist(req, res, requestId, sessionId, waitlistData) {
    const { waitlistId, updates } = waitlistData;

    try {
        // Verify waitlist entry exists and belongs to session
        const { data: existingEntry, error: fetchError } = await supabaseAdmin
            .from('appointment_waitlist')
            .select('*')
            .eq('id', waitlistId)
            .eq('session_id', sessionId)
            .eq('status', 'active')
            .single();

        if (fetchError || !existingEntry) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'WAITLIST_ENTRY_NOT_FOUND',
                    message: 'Active waitlist entry not found or does not belong to this session',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        // Validate updates
        const allowedUpdates = ['preferred_date', 'preferred_time', 'time_flexibility', 'date_flexibility', 'notes'];
        const updateData = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                updateData[key] = value;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_VALID_UPDATES',
                    message: 'No valid updates provided',
                    timestamp: new Date().toISOString(),
                    requestId
                }
            });
        }

        updateData.updated_at = new Date().toISOString();

        // Update waitlist entry
        const { data: updatedEntry, error: updateError } = await supabaseAdmin
            .from('appointment_waitlist')
            .update(updateData)
            .eq('id', waitlistId)
            .select()
            .single();

        if (updateError) {
            console.error('Database error updating waitlist:', updateError);
            throw updateError;
        }

        // Log waitlist update
        await logEvent({
            eventType: 'chatbot_waitlist_updated',
            severity: 'info',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                waitlist_id: waitlistId,
                sessionId,
                updates: Object.keys(updateData)
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                message: 'Waitlist preferences updated successfully',
                waitlistEntry: {
                    id: updatedEntry.id,
                    preferred_date: updatedEntry.preferred_date,
                    preferred_time: updatedEntry.preferred_time,
                    time_flexibility: updatedEntry.time_flexibility,
                    date_flexibility: updatedEntry.date_flexibility,
                    updated_at: updatedEntry.updated_at
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        console.error('Error updating waitlist:', error);
        throw error;
    }
}

/**
 * Get waitlist position for an entry
 */
async function getWaitlistPosition(waitlistId) {
    try {
        const { data: entry, error: entryError } = await supabaseAdmin
            .from('appointment_waitlist')
            .select('created_at')
            .eq('id', waitlistId)
            .single();

        if (entryError || !entry) {
            return null;
        }

        const { count, error: countError } = await supabaseAdmin
            .from('appointment_waitlist')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lt('created_at', entry.created_at);

        if (countError) {
            console.error('Error calculating waitlist position:', countError);
            return null;
        }

        return (count || 0) + 1;
    } catch (error) {
        console.error('Error getting waitlist position:', error);
        return null;
    }
}

/**
 * Calculate estimated wait time
 */
function calculateEstimatedWaitTime(position, preferredDate) {
    if (!position) return null;

    // Base calculation: assume 2-3 slots become available per week
    const slotsPerWeek = 2.5;
    const weeksToWait = Math.ceil(position / slotsPerWeek);

    // Adjust based on preferred date
    const today = new Date();
    const preferred = new Date(preferredDate + 'T00:00:00');
    const daysUntilPreferred = Math.ceil((preferred - today) / (1000 * 60 * 60 * 24));

    // If preferred date is far in the future, wait time might be shorter
    const adjustedWeeks = Math.max(1, Math.min(weeksToWait, Math.ceil(daysUntilPreferred / 7)));

    return {
        estimatedWeeks: adjustedWeeks,
        estimatedDays: adjustedWeeks * 7,
        confidence: position <= 5 ? 'high' : position <= 15 ? 'medium' : 'low',
        factors: {
            position,
            daysUntilPreferred,
            averageSlotsPerWeek: slotsPerWeek
        }
    };
}

/**
 * Schedule waitlist notifications
 */
async function scheduleWaitlistNotifications(waitlistEntry, position, estimatedWaitTime, requestId) {
    try {
        // Email waitlist confirmation
        await addToOutbox({
            messageType: 'email',
            recipient: waitlistEntry.patient_email,
            subject: 'Adicionado à Lista de Espera - Saraiva Vision',
            templateData: {
                patient_name: waitlistEntry.patient_name,
                preferred_date: waitlistEntry.preferred_date,
                preferred_time: waitlistEntry.preferred_time,
                position,
                estimated_wait_time: estimatedWaitTime,
                waitlist_id: waitlistEntry.id,
                added_via: 'chatbot'
            },
            requestId
        });

        // SMS waitlist confirmation
        await addToOutbox({
            messageType: 'sms',
            recipient: waitlistEntry.patient_phone,
            templateData: {
                patient_name: waitlistEntry.patient_name,
                preferred_date: waitlistEntry.preferred_date,
                position,
                waitlist_id: waitlistEntry.id,
                added_via: 'chatbot'
            },
            requestId
        });

        await logEvent({
            eventType: 'chatbot_waitlist_notifications_scheduled',
            severity: 'info',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                waitlist_id: waitlistEntry.id,
                email: waitlistEntry.patient_email,
                phone: waitlistEntry.patient_phone
            }
        });

    } catch (error) {
        console.error('Error scheduling waitlist notifications:', error);

        await logEvent({
            eventType: 'chatbot_waitlist_notification_failed',
            severity: 'error',
            source: 'chatbot_waitlist_api',
            requestId,
            eventData: {
                waitlist_id: waitlistEntry.id,
                error: error.message
            }
        });
    }
}