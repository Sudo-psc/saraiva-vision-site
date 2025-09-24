/**
 * Chatbot API Endpoint
 * Handles chat requests with Gemini Flash 2.5 integration
 */

import geminiService from '../../src/services/geminiService.js';
import chatbotConfig from '../../src/config/chatbotConfig.js';
import conversationStateManager from '../../src/services/conversationStateManager.js';
import chatbotAppointmentService from '../../src/services/chatbotAppointmentService.js';
import appointmentBookingHandler from '../../src/services/appointmentBookingHandler.js';
import chatbotCacheService from '../../src/services/chatbotCacheService.js';
import chatbotPerformanceMonitor from '../../src/services/chatbotPerformanceMonitor.js';
import chatbotResourceManager from '../../src/services/chatbotResourceManager.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Input validation middleware
 */
function validateChatRequest(req) {
    const { message, sessionId, conversationHistory, userConsent, context } = req.body;
    const errors = [];

    // Validate message
    if (!message || typeof message !== 'string') {
        errors.push('Message is required and must be a string');
    } else if (message.length > chatbotConfig.get('security').maxMessageLength) {
        errors.push(`Message exceeds maximum length of ${chatbotConfig.get('security').maxMessageLength} characters`);
    }

    // Validate sessionId if provided
    if (sessionId && typeof sessionId !== 'string') {
        errors.push('SessionId must be a string');
    }

    // Validate conversationHistory if provided
    if (conversationHistory && !Array.isArray(conversationHistory)) {
        errors.push('ConversationHistory must be an array');
    }

    // Validate context if provided
    if (context && typeof context !== 'object') {
        errors.push('Context must be an object');
    }

    return errors;
}

/**
 * Medical safety filter
 */
function checkMedicalSafety(message) {
    const medicalConfig = chatbotConfig.get('medical');
    const emergencyKeywords = medicalConfig.emergencyKeywords;
    const medicalTerms = medicalConfig.medicalTerms;

    const lowerMessage = message.toLowerCase();

    // Check for emergency keywords
    const emergencyDetected = emergencyKeywords.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );

    // Check for medical advice requests
    const medicalAdviceDetected = medicalTerms.some(term =>
        lowerMessage.includes(term.toLowerCase())
    );

    return {
        emergencyDetected,
        medicalAdviceDetected,
        requiresDisclaimer: medicalAdviceDetected || emergencyDetected,
        suggestsAppointment: medicalAdviceDetected && !emergencyDetected
    };
}

/**
 * Log conversation to database
 */
async function logConversation(sessionId, userMessage, botResponse, metadata) {
    try {
        const { error } = await supabase
            .from('chatbot_conversations')
            .insert({
                session_id: sessionId,
                user_message: userMessage,
                bot_response: botResponse,
                message_metadata: metadata,
                compliance_flags: {
                    emergency_detected: metadata.emergencyDetected,
                    medical_advice_detected: metadata.medicalAdviceDetected,
                    disclaimer_included: metadata.requiresDisclaimer
                }
            });

        if (error) {
            console.error('Failed to log conversation:', error);
        }
    } catch (error) {
        console.error('Database logging error:', error);
    }
}

/**
 * Main chat handler
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        // Validate request
        const validationErrors = validateChatRequest(req);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Request validation failed',
                details: validationErrors
            });
        }

        const {
            message,
            sessionId,
            conversationHistory = [],
            userConsent = {},
            context = {},
            metadata = {}
        } = req.body;

        // Get client IP for rate limiting
        const clientIp = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            'unknown';

        // Get or create session
        let session;
        if (sessionId) {
            session = await conversationStateManager.getSession(sessionId);
        }

        if (!session) {
            session = await conversationStateManager.createSession({
                userConsent,
                metadata: {
                    ...metadata,
                    ipAddress: clientIp,
                    userAgent: req.headers['user-agent'] || 'unknown'
                }
            });
        }

        // Check medical safety
        const safetyCheck = checkMedicalSafety(message);

        // Check for appointment intent
        const appointmentIntent = chatbotAppointmentService.detectAppointmentIntent(message);

        // Update context with safety and appointment information
        const enhancedContext = {
            ...context,
            emergencyContext: safetyCheck.emergencyDetected,
            medicalAdviceContext: safetyCheck.medicalAdviceDetected,
            appointmentIntent: appointmentIntent.intentDetected,
            appointmentConfidence: appointmentIntent.confidence
        };

        // Add user message to conversation state
        await conversationStateManager.addMessage(session.sessionId, {
            role: 'user',
            content: message,
            metadata: {
                ...safetyCheck,
                clientIp: clientIp.substring(0, 10) + '***'
            }
        });

        // Start performance monitoring
        const requestStartTime = Date.now();

        // Check cache first (unless it's an appointment request)
        let cachedResponse = null;
        let cacheHit = false;

        if (!appointmentIntent.intentDetected || appointmentIntent.confidence < 0.5) {
            try {
                cachedResponse = await chatbotCacheService.getCachedResponse(message, enhancedContext);
                if (cachedResponse.success) {
                    cacheHit = true;
                    console.log('Cache hit for message:', message.substring(0, 50) + '...');
                }
            } catch (error) {
                console.error('Cache lookup error:', error);
                // Continue without cache
            }
        }

        // Get conversation history from state manager
        const storedHistory = await conversationStateManager.getConversationHistory(
            session.sessionId,
            { limit: 10, decryptContent: true }
        );

        // Check if this is an appointment-related conversation
        let appointmentResponse = null;
        if (appointmentIntent.intentDetected && appointmentIntent.confidence > 0.5) {
            try {
                appointmentResponse = await chatbotAppointmentService.processAppointmentRequest(
                    message,
                    session.state
                );
            } catch (error) {
                console.error('Error processing appointment request:', error);
                // Continue with normal flow if appointment processing fails
            }
        }

        let geminiResponse;
        let finalResponse;

        if (cachedResponse && cachedResponse.success) {
            // Use cached response
            finalResponse = cachedResponse.response;
            geminiResponse = {
                content: finalResponse,
                metadata: {
                    ...cachedResponse.metadata,
                    tokensUsed: 0,
                    responseTime: Date.now() - requestStartTime,
                    safetyRatings: [],
                    source: 'cache'
                }
            };
        } else if (appointmentResponse && appointmentResponse.success) {
            // Handle appointment booking action
            if (appointmentResponse.action === 'BOOK_APPOINTMENT') {
                try {
                    const bookingResult = await appointmentBookingHandler.bookAppointment(
                        appointmentResponse.appointmentData,
                        session.sessionId
                    );

                    if (bookingResult.success) {
                        finalResponse = appointmentBookingHandler.formatBookingConfirmation(bookingResult.appointment);
                    } else {
                        finalResponse = appointmentBookingHandler.formatBookingError(
                            bookingResult.message,
                            bookingResult.alternatives || []
                        );
                    }
                } catch (error) {
                    console.error('Error booking appointment:', error);
                    finalResponse = 'Desculpe, ocorreu um erro ao processar seu agendamento. Tente novamente ou entre em contato conosco.';
                }
            } else {
                // Use appointment service response
                finalResponse = appointmentResponse.response;
            }

            // Update session state with appointment conversation state
            if (appointmentResponse.conversationState) {
                await conversationStateManager.updateSessionState(
                    session.sessionId,
                    appointmentResponse.conversationState
                );
            }

            // Create mock gemini response for consistency
            geminiResponse = {
                content: finalResponse,
                metadata: {
                    tokensUsed: 0,
                    responseTime: Date.now() - requestStartTime,
                    safetyRatings: [],
                    source: 'appointment_service'
                }
            };
        } else {
            // Generate response using Gemini service with stored context
            geminiResponse = await geminiService.generateResponse(message, {
                sessionId: session.sessionId,
                conversationHistory: storedHistory,
                context: enhancedContext,
                useStoredContext: true
            });

            finalResponse = geminiResponse.content;

            // Cache the response if it's cacheable and not from appointment service
            if (geminiResponse.metadata.source !== 'appointment_service') {
                try {
                    await chatbotCacheService.cacheResponse(
                        message,
                        finalResponse,
                        enhancedContext,
                        {
                            ...geminiResponse.metadata,
                            sessionId: session.sessionId,
                            timestamp: new Date().toISOString()
                        }
                    );
                } catch (error) {
                    console.error('Error caching response:', error);
                    // Continue without caching
                }
            }
        }

        // Add medical disclaimers if required (only for non-appointment responses)
        if (!appointmentResponse?.success && safetyCheck.requiresDisclaimer) {
            const disclaimer = '\n\n⚠️ Esta informação é apenas educativa. Consulte sempre um médico oftalmologista para diagnóstico e tratamento adequados.';
            finalResponse += disclaimer;
        }

        // Add emergency response if detected
        if (safetyCheck.emergencyDetected) {
            const emergencyResponse = '\n\n🚨 EMERGÊNCIA MÉDICA: Se você está enfrentando uma emergência médica, ligue imediatamente para o SAMU (192) ou dirija-se ao pronto-socorro mais próximo.';
            finalResponse = emergencyResponse + '\n\n' + finalResponse;
        }

        // Add assistant response to conversation state
        await conversationStateManager.addMessage(session.sessionId, {
            role: 'assistant',
            content: finalResponse,
            metadata: {
                ...geminiResponse.metadata,
                ...safetyCheck,
                disclaimerAdded: safetyCheck.requiresDisclaimer,
                emergencyResponseAdded: safetyCheck.emergencyDetected
            }
        });

        // Calculate final response time
        const totalResponseTime = Date.now() - requestStartTime;

        // Record performance metrics
        chatbotPerformanceMonitor.recordRequest({
            success: true,
            responseTime: totalResponseTime,
            tokensUsed: geminiResponse.metadata.tokensUsed || 0,
            cacheHit: cacheHit,
            metadata: {
                source: geminiResponse.metadata.source,
                sessionId: session.sessionId,
                messageLength: message.length,
                responseLength: finalResponse.length,
                emergencyDetected: safetyCheck.emergencyDetected,
                medicalAdviceDetected: safetyCheck.medicalAdviceDetected
            }
        });

        // Prepare response metadata
        const responseMetadata = {
            ...geminiResponse.metadata,
            ...safetyCheck,
            sessionId: session.sessionId,
            clientIp: clientIp.substring(0, 10) + '***', // Partially anonymize IP
            timestamp: new Date().toISOString(),
            cacheHit: cacheHit,
            totalResponseTime: totalResponseTime
        };

        // Log conversation to database using resource manager
        await chatbotResourceManager.executeWithConnection(async (client) => {
            const { error } = await client
                .from('chatbot_conversations')
                .insert({
                    session_id: session.sessionId,
                    user_message: message,
                    bot_response: finalResponse,
                    message_metadata: responseMetadata,
                    compliance_flags: {
                        emergency_detected: responseMetadata.emergencyDetected,
                        medical_advice_detected: responseMetadata.medicalAdviceDetected,
                        disclaimer_included: responseMetadata.requiresDisclaimer
                    }
                });

            if (error) {
                console.error('Failed to log conversation:', error);
                throw error;
            }
        }, { timeout: 10000, retries: 2 });

        // Generate context-aware suggestions
        const contextPrompts = conversationStateManager.generateContextAwarePrompts(session);

        // Check for waitlist opportunities if appointment booking failed
        let waitlistSuggestion = null;
        if (appointmentResponse?.success === false && appointmentResponse?.reason === 'slot_unavailable') {
            waitlistSuggestion = {
                type: 'waitlist',
                label: 'Entrar na Lista de Espera',
                action: 'join_waitlist',
                data: appointmentResponse.appointmentData
            };
        }

        // Prepare suggested actions
        let suggestedActions = [];

        // Use appointment service suggested actions if available
        if (appointmentResponse?.suggestedActions) {
            suggestedActions = appointmentResponse.suggestedActions;
        } else {
            // Default suggested actions
            if (safetyCheck.suggestsAppointment) {
                suggestedActions.push({
                    type: 'appointment',
                    label: 'Agendar Consulta',
                    action: 'schedule_appointment'
                });
            }

            if (safetyCheck.emergencyDetected) {
                suggestedActions.push({
                    type: 'emergency',
                    label: 'Contatos de Emergência',
                    action: 'show_emergency_contacts'
                });
            }

            // Add waitlist suggestion if available
            if (waitlistSuggestion) {
                suggestedActions.push(waitlistSuggestion);
            }

            // Add context-aware suggestions
            contextPrompts.forEach(prompt => {
                if (prompt.type === 'appointment' && !suggestedActions.some(a => a.type === 'appointment')) {
                    suggestedActions.push({
                        type: 'appointment',
                        label: 'Continuar Agendamento',
                        action: 'continue_appointment'
                    });
                }
                if (prompt.type === 'referral') {
                    suggestedActions.push({
                        type: 'referral',
                        label: 'Solicitar Encaminhamento',
                        action: 'request_referral'
                    });
                }
            });
        }

        // Get conversation insights
        const conversationInsights = conversationStateManager.getConversationSummary(session.sessionId);

        // Validate final response before sending
        if (!finalResponse || typeof finalResponse !== 'string' || finalResponse.trim() === '') {
            console.error('Empty or invalid final response generated');
            finalResponse = 'Desculpe, ocorreu um erro interno. Tente novamente ou entre em contato conosco.';
        }

        // Ensure all required fields are present
        const responseData = {
            success: true,
            data: {
                response: finalResponse,
                sessionId: session.sessionId,
                complianceInfo: {
                    emergencyDetected: safetyCheck.emergencyDetected,
                    medicalAdviceDetected: safetyCheck.medicalAdviceDetected,
                    disclaimerIncluded: safetyCheck.requiresDisclaimer,
                    cfmCompliant: true,
                    consentStatus: session.consent
                },
                suggestedActions,
                contextPrompts: contextPrompts.map(p => p.suggestions).flat(),
                conversationState: {
                    currentTopic: session.state.currentTopic,
                    currentIntent: session.state.currentIntent,
                    messageCount: conversationInsights.messageCount,
                    duration: conversationInsights.duration
                },
                appointmentAvailability: appointmentResponse?.availabilityData || (safetyCheck.suggestsAppointment ? [] : undefined)
            },
            metadata: {
                tokensUsed: responseMetadata.tokensUsed,
                responseTime: responseMetadata.totalResponseTime,
                safetyScore: responseMetadata.safetyRatings?.length || 0,
                rateLimitRemaining: responseMetadata.rateLimitRemaining,
                conversationLength: geminiResponse.metadata.conversationLength,
                optimizationMetrics: geminiResponse.metadata.optimizationMetrics,
                cacheHit: cacheHit,
                source: geminiResponse.metadata.source
            }
        };

        // Set proper headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Return successful response
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Chatbot API error:', error);

        // Ensure proper headers are set for error responses
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Record error in performance monitor
        const errorResponseTime = Date.now() - (requestStartTime || Date.now());
        try {
            chatbotPerformanceMonitor.recordRequest({
                success: false,
                responseTime: errorResponseTime,
                tokensUsed: 0,
                cacheHit: false,
                error: {
                    type: error.name || 'UnknownError',
                    message: error.message,
                    stack: error.stack
                },
                metadata: {
                    source: 'error',
                    errorType: error.name || 'UnknownError'
                }
            });
        } catch (monitorError) {
            console.error('Failed to record error in performance monitor:', monitorError);
        }

        // Handle specific error types with proper JSON responses
        if (error.message.includes('Rate limit exceeded')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                message: error.message,
                retryAfter: 60,
                timestamp: new Date().toISOString()
            });
        }

        if (error.message.includes('API quota exceeded')) {
            return res.status(503).json({
                success: false,
                error: 'Service temporarily unavailable',
                message: 'Our AI service is temporarily unavailable. Please try again later.',
                retryAfter: 300,
                timestamp: new Date().toISOString()
            });
        }

        if (error.message.includes('Content blocked')) {
            return res.status(400).json({
                success: false,
                error: 'Content blocked',
                message: 'Your message was blocked by our safety filters. Please rephrase and try again.',
                timestamp: new Date().toISOString()
            });
        }

        // Generic error response with fallback
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred. Please try again later.',
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        };

        return res.status(500).json(errorResponse);
    }
}