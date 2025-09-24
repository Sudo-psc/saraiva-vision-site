/**
 * Chatbot Appointment Service
 * Handles appointment booking logic and natural language processing for appointments
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { getAvailableSlots, getAvailableSlotsForNextDays, validateAppointmentDateTime } from '../lib/appointmentAvailability.js';

class ChatbotAppointmentService {
    constructor() {
        this.appointmentIntents = [
            'agendar', 'marcar', 'consulta', 'agendamento', 'horário',
            'disponibilidade', 'vaga', 'appointment', 'schedule'
        ];

        this.timePreferences = {
            'manhã': 'morning',
            'manha': 'morning',
            'matutino': 'morning',
            'de manhã': 'morning',
            'pela manhã': 'morning',
            'tarde': 'afternoon',
            'vespertino': 'afternoon',
            'de tarde': 'afternoon',
            'pela tarde': 'afternoon',
            'cedo': 'early_morning',
            'cedinho': 'early_morning',
            'final da tarde': 'late_afternoon',
            'fim da tarde': 'late_afternoon'
        };

        this.datePatterns = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // DD/MM/YYYY
            /(\d{1,2})\/(\d{1,2})/g, // DD/MM
            /(segunda|terça|quarta|quinta|sexta)(-feira)?/gi,
            /(amanhã|hoje|depois de amanhã)/gi,
            /(próxima|próximo)\s+(segunda|terça|quarta|quinta|sexta)/gi
        ];

        this.appointmentSteps = {
            INTENT_DETECTED: 'intent_detected',
            COLLECTING_PREFERENCES: 'collecting_preferences',
            SHOWING_AVAILABILITY: 'showing_availability',
            COLLECTING_DETAILS: 'collecting_details',
            CONFIRMING_APPOINTMENT: 'confirming_appointment',
            COMPLETED: 'completed'
        };
    }

    /**
     * Detect appointment intent in user message
     * @param {string} message - User message
     * @returns {Object} Intent detection result
     */
    detectAppointmentIntent(message) {
        const lowerMessage = message.toLowerCase();

        const intentDetected = this.appointmentIntents.some(intent =>
            lowerMessage.includes(intent)
        );

        const urgencyKeywords = ['urgente', 'emergência', 'rápido', 'hoje', 'amanhã'];
        const urgencyDetected = urgencyKeywords.some(keyword =>
            lowerMessage.includes(keyword)
        );

        const specificTimeRequested = this.extractTimePreferences(message).length > 0 ||
            this.extractDatePreferences(message).length > 0;

        return {
            intentDetected,
            urgencyDetected,
            specificTimeRequested,
            confidence: this.calculateIntentConfidence(message),
            extractedInfo: {
                timePreferences: this.extractTimePreferences(message),
                datePreferences: this.extractDatePreferences(message),
                appointmentType: this.extractAppointmentType(message)
            }
        };
    }

    /**
     * Calculate confidence score for appointment intent
     * @param {string} message - User message
     * @returns {number} Confidence score (0-1)
     */
    calculateIntentConfidence(message) {
        const lowerMessage = message.toLowerCase();
        let score = 0;

        // Direct appointment keywords
        const directKeywords = ['agendar', 'marcar consulta', 'agendamento'];
        if (directKeywords.some(keyword => lowerMessage.includes(keyword))) {
            score += 0.8;
        }

        // Indirect appointment keywords
        const indirectKeywords = ['consulta', 'horário', 'disponibilidade'];
        if (indirectKeywords.some(keyword => lowerMessage.includes(keyword))) {
            score += 0.4;
        }

        // Time/date references
        if (this.extractTimePreferences(message).length > 0) {
            score += 0.3;
        }
        if (this.extractDatePreferences(message).length > 0) {
            score += 0.3;
        }

        // Question patterns
        const questionPatterns = [
            /posso agendar/i,
            /como faço para/i,
            /gostaria de marcar/i,
            /tem vaga/i,
            /está disponível/i
        ];
        if (questionPatterns.some(pattern => pattern.test(message))) {
            score += 0.5;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Extract time preferences from message
     * @param {string} message - User message
     * @returns {Array} Array of time preferences
     */
    extractTimePreferences(message) {
        const lowerMessage = message.toLowerCase();
        const preferences = [];

        for (const [keyword, preference] of Object.entries(this.timePreferences)) {
            if (lowerMessage.includes(keyword)) {
                preferences.push(preference);
            }
        }

        // Extract specific times
        const timePattern = /(\d{1,2}):?(\d{2})?\s*(h|horas?)?/g;
        let match;
        while ((match = timePattern.exec(lowerMessage)) !== null) {
            const hour = parseInt(match[1]);
            const minute = match[2] ? parseInt(match[2]) : 0;

            if (hour >= 8 && hour <= 18) {
                preferences.push({
                    type: 'specific_time',
                    hour,
                    minute,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                });
            }
        }

        return [...new Set(preferences)]; // Remove duplicates
    }

    /**
     * Extract date preferences from message
     * @param {string} message - User message
     * @returns {Array} Array of date preferences
     */
    extractDatePreferences(message) {
        const lowerMessage = message.toLowerCase();
        const preferences = [];

        // Handle relative dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        if (lowerMessage.includes('hoje')) {
            preferences.push({
                type: 'relative',
                date: today.toISOString().split('T')[0],
                display: 'hoje'
            });
        }
        if (lowerMessage.includes('amanhã')) {
            preferences.push({
                type: 'relative',
                date: tomorrow.toISOString().split('T')[0],
                display: 'amanhã'
            });
        }
        if (lowerMessage.includes('depois de amanhã')) {
            preferences.push({
                type: 'relative',
                date: dayAfterTomorrow.toISOString().split('T')[0],
                display: 'depois de amanhã'
            });
        }

        // Handle weekday references
        const weekdays = {
            'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5
        };

        for (const [dayName, dayNumber] of Object.entries(weekdays)) {
            if (lowerMessage.includes(dayName)) {
                const nextDate = this.getNextWeekday(dayNumber);
                preferences.push({
                    type: 'weekday',
                    date: nextDate.toISOString().split('T')[0],
                    display: dayName + '-feira',
                    dayNumber
                });
            }
        }

        // Handle specific dates (DD/MM/YYYY or DD/MM)
        const datePattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/g;
        let match;
        while ((match = datePattern.exec(message)) !== null) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = match[3] ? parseInt(match[3]) : today.getFullYear();

            try {
                const date = new Date(year, month - 1, day);
                if (date > today) {
                    preferences.push({
                        type: 'specific',
                        date: date.toISOString().split('T')[0],
                        display: `${day}/${month}/${year}`
                    });
                }
            } catch (error) {
                // Invalid date, skip
            }
        }

        return preferences;
    }

    /**
     * Extract appointment type from message
     * @param {string} message - User message
     * @returns {string|null} Appointment type
     */
    extractAppointmentType(message) {
        const lowerMessage = message.toLowerCase();

        const appointmentTypes = {
            'consulta': 'consultation',
            'retorno': 'follow_up',
            'exame': 'examination',
            'cirurgia': 'surgery',
            'avaliação': 'evaluation',
            'check-up': 'checkup',
            'emergência': 'emergency'
        };

        for (const [keyword, type] of Object.entries(appointmentTypes)) {
            if (lowerMessage.includes(keyword)) {
                return type;
            }
        }

        return 'consultation'; // Default type
    }

    /**
     * Get next occurrence of a weekday
     * @param {number} targetDay - Target day (1=Monday, 5=Friday)
     * @returns {Date} Next occurrence of the weekday
     */
    getNextWeekday(targetDay) {
        const today = new Date();
        const currentDay = today.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));

        return nextDate;
    }

    /**
     * Process appointment request and return appropriate response
     * @param {string} message - User message
     * @param {Object} conversationState - Current conversation state
     * @returns {Object} Processing result with response and actions
     */
    async processAppointmentRequest(message, conversationState = {}) {
        const intentResult = this.detectAppointmentIntent(message);

        if (!intentResult.intentDetected) {
            return {
                success: false,
                reason: 'no_appointment_intent',
                response: null
            };
        }

        const currentStep = conversationState.appointmentStep || this.appointmentSteps.INTENT_DETECTED;

        try {
            switch (currentStep) {
                case this.appointmentSteps.INTENT_DETECTED:
                    return await this.handleIntentDetected(message, intentResult, conversationState);

                case this.appointmentSteps.COLLECTING_PREFERENCES:
                    return await this.handleCollectingPreferences(message, intentResult, conversationState);

                case this.appointmentSteps.SHOWING_AVAILABILITY:
                    return await this.handleShowingAvailability(message, conversationState);

                case this.appointmentSteps.COLLECTING_DETAILS:
                    return await this.handleCollectingDetails(message, conversationState);

                case this.appointmentSteps.CONFIRMING_APPOINTMENT:
                    return await this.handleConfirmingAppointment(message, conversationState);

                default:
                    return await this.handleIntentDetected(message, intentResult, conversationState);
            }
        } catch (error) {
            console.error('Error processing appointment request:', error);
            return {
                success: false,
                reason: 'processing_error',
                response: 'Desculpe, ocorreu um erro ao processar sua solicitação de agendamento. Tente novamente.',
                error: error.message
            };
        }
    }

    /**
     * Handle initial appointment intent detection
     */
    async handleIntentDetected(message, intentResult, conversationState) {
        const { extractedInfo } = intentResult;

        // If we have specific preferences, try to show availability immediately
        if (extractedInfo.datePreferences.length > 0 || extractedInfo.timePreferences.length > 0) {
            return await this.showAvailabilityWithPreferences(extractedInfo, conversationState);
        }

        // Otherwise, ask for preferences
        return {
            success: true,
            response: `Ótimo! Vou ajudá-lo a agendar uma consulta. 

Para encontrar o melhor horário para você, me diga:
- Você tem preferência de dia da semana?
- Prefere manhã ou tarde?
- Há alguma data específica que gostaria?

Nosso atendimento é de segunda a sexta, das 8h às 18h.`,
            nextStep: this.appointmentSteps.COLLECTING_PREFERENCES,
            conversationState: {
                ...conversationState,
                appointmentStep: this.appointmentSteps.COLLECTING_PREFERENCES,
                appointmentData: {
                    type: extractedInfo.appointmentType,
                    preferences: extractedInfo
                }
            },
            suggestedActions: [
                {
                    type: 'quick_reply',
                    label: 'Manhã',
                    value: 'Prefiro pela manhã'
                },
                {
                    type: 'quick_reply',
                    label: 'Tarde',
                    value: 'Prefiro à tarde'
                },
                {
                    type: 'quick_reply',
                    label: 'Qualquer horário',
                    value: 'Qualquer horário disponível'
                }
            ]
        };
    }

    /**
     * Handle collecting user preferences
     */
    async handleCollectingPreferences(message, intentResult, conversationState) {
        const { extractedInfo } = intentResult;
        const existingPreferences = conversationState.appointmentData?.preferences || {};

        // Merge new preferences with existing ones
        const mergedPreferences = {
            timePreferences: [
                ...(existingPreferences.timePreferences || []),
                ...extractedInfo.timePreferences
            ],
            datePreferences: [
                ...(existingPreferences.datePreferences || []),
                ...extractedInfo.datePreferences
            ],
            appointmentType: extractedInfo.appointmentType || existingPreferences.appointmentType
        };

        return await this.showAvailabilityWithPreferences(mergedPreferences, conversationState);
    }

    /**
     * Show availability based on user preferences
     */
    async showAvailabilityWithPreferences(preferences, conversationState) {
        try {
            let availabilityData = {};

            // If specific dates are requested, check those dates
            if (preferences.datePreferences && preferences.datePreferences.length > 0) {
                for (const datePref of preferences.datePreferences) {
                    const slots = await getAvailableSlots(datePref.date);
                    if (slots.length > 0) {
                        availabilityData[datePref.date] = slots;
                    }
                }
            } else {
                // Get availability for next 7 days
                availabilityData = await getAvailableSlotsForNextDays(7);
            }

            // Filter by time preferences
            if (preferences.timePreferences && preferences.timePreferences.length > 0) {
                availabilityData = this.filterAvailabilityByTimePreferences(availabilityData, preferences.timePreferences);
            }

            if (Object.keys(availabilityData).length === 0) {
                return {
                    success: true,
                    response: `Não encontrei horários disponíveis com suas preferências. 

Posso mostrar outras opções disponíveis nos próximos dias?`,
                    nextStep: this.appointmentSteps.COLLECTING_PREFERENCES,
                    conversationState: {
                        ...conversationState,
                        appointmentStep: this.appointmentSteps.COLLECTING_PREFERENCES
                    },
                    suggestedActions: [
                        {
                            type: 'quick_reply',
                            label: 'Sim, mostrar outras opções',
                            value: 'Sim, mostre outras opções disponíveis'
                        },
                        {
                            type: 'quick_reply',
                            label: 'Tentar outras datas',
                            value: 'Quero tentar outras datas'
                        }
                    ]
                };
            }

            // Format availability for display
            const formattedAvailability = this.formatAvailabilityForDisplay(availabilityData);

            return {
                success: true,
                response: `Encontrei os seguintes horários disponíveis:

${formattedAvailability}

Qual horário você gostaria de escolher? Você pode me dizer o dia e horário (exemplo: "Quarta-feira às 14:30").`,
                nextStep: this.appointmentSteps.SHOWING_AVAILABILITY,
                conversationState: {
                    ...conversationState,
                    appointmentStep: this.appointmentSteps.SHOWING_AVAILABILITY,
                    availableSlots: availabilityData,
                    appointmentData: {
                        ...conversationState.appointmentData,
                        preferences
                    }
                },
                availabilityData
            };

        } catch (error) {
            console.error('Error showing availability:', error);
            return {
                success: false,
                reason: 'availability_error',
                response: 'Desculpe, não consegui verificar a disponibilidade no momento. Tente novamente em alguns instantes.',
                error: error.message
            };
        }
    }

    /**
     * Handle user selection from available slots
     */
    async handleShowingAvailability(message, conversationState) {
        const selectedSlot = this.parseSlotSelection(message, conversationState.availableSlots);

        if (!selectedSlot) {
            return {
                success: true,
                response: `Não consegui identificar qual horário você escolheu. 

Por favor, me diga o dia e horário desejado (exemplo: "Segunda-feira às 9:00" ou "15/01 às 14:30").`,
                nextStep: this.appointmentSteps.SHOWING_AVAILABILITY,
                conversationState
            };
        }

        // Validate the selected slot is still available
        const isStillAvailable = await this.validateSlotAvailability(selectedSlot.date, selectedSlot.time);

        if (!isStillAvailable) {
            return {
                success: true,
                response: `Desculpe, o horário ${selectedSlot.displayTime} do dia ${selectedSlot.displayDate} não está mais disponível. 

Gostaria de escolher outro horário?`,
                nextStep: this.appointmentSteps.SHOWING_AVAILABILITY,
                conversationState
            };
        }

        return {
            success: true,
            response: `Perfeito! Você escolheu ${selectedSlot.displayDate} às ${selectedSlot.displayTime}.

Agora preciso de alguns dados para confirmar o agendamento:
- Seu nome completo
- E-mail
- Telefone

Pode me fornecer essas informações?`,
            nextStep: this.appointmentSteps.COLLECTING_DETAILS,
            conversationState: {
                ...conversationState,
                appointmentStep: this.appointmentSteps.COLLECTING_DETAILS,
                selectedSlot
            }
        };
    }

    /**
     * Handle collecting patient details
     */
    async handleCollectingDetails(message, conversationState) {
        const extractedDetails = this.extractPatientDetails(message);
        const existingDetails = conversationState.patientDetails || {};

        // Merge extracted details with existing ones
        const patientDetails = {
            ...existingDetails,
            ...extractedDetails
        };

        // Check if we have all required details
        const requiredFields = ['name', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !patientDetails[field]);

        if (missingFields.length > 0) {
            const missingFieldsText = missingFields.map(field => {
                switch (field) {
                    case 'name': return 'nome completo';
                    case 'email': return 'e-mail';
                    case 'phone': return 'telefone';
                    default: return field;
                }
            }).join(', ');

            return {
                success: true,
                response: `Obrigado pelas informações! Ainda preciso do seu ${missingFieldsText}.`,
                nextStep: this.appointmentSteps.COLLECTING_DETAILS,
                conversationState: {
                    ...conversationState,
                    patientDetails
                }
            };
        }

        // All details collected, show confirmation
        const { selectedSlot } = conversationState;

        return {
            success: true,
            response: `Vou confirmar os dados do seu agendamento:

📅 **Data e Horário:** ${selectedSlot.displayDate} às ${selectedSlot.displayTime}
👤 **Nome:** ${patientDetails.name}
📧 **E-mail:** ${patientDetails.email}
📱 **Telefone:** ${patientDetails.phone}

Os dados estão corretos? Se sim, confirme para finalizar o agendamento.`,
            nextStep: this.appointmentSteps.CONFIRMING_APPOINTMENT,
            conversationState: {
                ...conversationState,
                appointmentStep: this.appointmentSteps.CONFIRMING_APPOINTMENT,
                patientDetails
            },
            suggestedActions: [
                {
                    type: 'quick_reply',
                    label: 'Confirmar agendamento',
                    value: 'Sim, confirmo o agendamento'
                },
                {
                    type: 'quick_reply',
                    label: 'Corrigir dados',
                    value: 'Preciso corrigir alguns dados'
                }
            ]
        };
    }

    /**
     * Handle appointment confirmation
     */
    async handleConfirmingAppointment(message, conversationState) {
        const lowerMessage = message.toLowerCase();
        const confirmationKeywords = ['sim', 'confirmo', 'confirmar', 'ok', 'certo', 'perfeito'];
        const correctionKeywords = ['não', 'corrigir', 'alterar', 'mudar', 'errado'];

        if (correctionKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                success: true,
                response: `Sem problemas! Vamos corrigir os dados. 

Me informe novamente:
- Seu nome completo
- E-mail  
- Telefone`,
                nextStep: this.appointmentSteps.COLLECTING_DETAILS,
                conversationState: {
                    ...conversationState,
                    appointmentStep: this.appointmentSteps.COLLECTING_DETAILS,
                    patientDetails: {} // Reset details
                }
            };
        }

        if (confirmationKeywords.some(keyword => lowerMessage.includes(keyword))) {
            // Proceed with booking the appointment
            return {
                success: true,
                response: 'Processando seu agendamento...',
                nextStep: this.appointmentSteps.COMPLETED,
                conversationState: {
                    ...conversationState,
                    appointmentStep: this.appointmentSteps.COMPLETED
                },
                action: 'BOOK_APPOINTMENT',
                appointmentData: {
                    patient_name: conversationState.patientDetails.name,
                    patient_email: conversationState.patientDetails.email,
                    patient_phone: conversationState.patientDetails.phone,
                    appointment_date: conversationState.selectedSlot.date,
                    appointment_time: conversationState.selectedSlot.time,
                    notes: `Agendado via chatbot - Tipo: ${conversationState.appointmentData?.preferences?.appointmentType || 'consultation'}`
                }
            };
        }

        return {
            success: true,
            response: `Por favor, confirme se deseja agendar a consulta ou se precisa corrigir algum dado.`,
            nextStep: this.appointmentSteps.CONFIRMING_APPOINTMENT,
            conversationState,
            suggestedActions: [
                {
                    type: 'quick_reply',
                    label: 'Confirmar',
                    value: 'Sim, confirmo'
                },
                {
                    type: 'quick_reply',
                    label: 'Corrigir',
                    value: 'Preciso corrigir'
                }
            ]
        };
    }

    /**
     * Filter availability by time preferences
     */
    filterAvailabilityByTimePreferences(availabilityData, timePreferences) {
        const filtered = {};

        for (const [date, slots] of Object.entries(availabilityData)) {
            const filteredSlots = slots.filter(slot => {
                const hour = parseInt(slot.slot_time.split(':')[0]);

                return timePreferences.some(pref => {
                    if (typeof pref === 'string') {
                        switch (pref) {
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
                    } else if (pref.type === 'specific_time') {
                        return hour === pref.hour;
                    }
                    return true;
                });
            });

            if (filteredSlots.length > 0) {
                filtered[date] = filteredSlots;
            }
        }

        return filtered;
    }

    /**
     * Format availability for display in chat
     */
    formatAvailabilityForDisplay(availabilityData) {
        const formatted = [];

        for (const [date, slots] of Object.entries(availabilityData)) {
            const dateObj = new Date(date + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
            const formattedDate = dateObj.toLocaleDateString('pt-BR');

            const timeSlots = slots.slice(0, 4).map(slot => slot.slot_time).join(', ');
            const moreSlots = slots.length > 4 ? ` e mais ${slots.length - 4} horários` : '';

            formatted.push(`📅 **${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${formattedDate}**\n   ⏰ ${timeSlots}${moreSlots}`);
        }

        return formatted.join('\n\n');
    }

    /**
     * Parse slot selection from user message
     */
    parseSlotSelection(message, availableSlots) {
        const lowerMessage = message.toLowerCase();

        // Try to extract date and time from message
        const datePrefs = this.extractDatePreferences(message);
        const timePrefs = this.extractTimePreferences(message);

        // Look for matches in available slots
        for (const [date, slots] of Object.entries(availableSlots)) {
            // Check if date matches
            const dateMatch = datePrefs.some(pref => pref.date === date) ||
                lowerMessage.includes(date) ||
                this.matchesDateDescription(lowerMessage, date);

            if (dateMatch) {
                // Look for time match
                for (const slot of slots) {
                    const timeMatch = timePrefs.some(pref =>
                        (typeof pref === 'object' && pref.time === slot.slot_time) ||
                        lowerMessage.includes(slot.slot_time) ||
                        lowerMessage.includes(slot.slot_time.replace(':', 'h')) ||
                        lowerMessage.includes(slot.slot_time.replace(':', ':'))
                    );

                    if (timeMatch || timePrefs.length === 0) {
                        return {
                            date,
                            time: slot.slot_time,
                            displayDate: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR'),
                            displayTime: slot.slot_time
                        };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Check if message matches date description
     */
    matchesDateDescription(message, date) {
        const dateObj = new Date(date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

        return message.includes(dayName) ||
            message.includes(dayName.substring(0, 3)) || // Short form
            message.includes(dateObj.toLocaleDateString('pt-BR'));
    }

    /**
     * Extract patient details from message
     */
    extractPatientDetails(message) {
        const details = {};

        // Extract email
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const emailMatch = message.match(emailPattern);
        if (emailMatch) {
            details.email = emailMatch[0];
        }

        // Extract phone
        const phonePattern = /(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/g;
        const phoneMatch = message.match(phonePattern);
        if (phoneMatch) {
            details.phone = phoneMatch[0].replace(/\D/g, ''); // Remove non-digits
        }

        // Extract name (more complex, look for patterns)
        const namePatterns = [
            /(?:nome|chamo|sou)\s+(?:é\s+)?([A-Za-zÀ-ÿ\s]{2,50})/i,
            /^([A-Za-zÀ-ÿ\s]{2,50})(?:\s|$)/i // Name at beginning
        ];

        for (const pattern of namePatterns) {
            const nameMatch = message.match(pattern);
            if (nameMatch && nameMatch[1]) {
                const name = nameMatch[1].trim();
                // Validate name (at least 2 words, reasonable length)
                if (name.split(' ').length >= 2 && name.length >= 5 && name.length <= 50) {
                    details.name = name;
                    break;
                }
            }
        }

        return details;
    }

    /**
     * Validate slot availability
     */
    async validateSlotAvailability(date, time) {
        try {
            const validation = validateAppointmentDateTime(date, time);
            if (!validation.isValid) {
                return false;
            }

            const slots = await getAvailableSlots(date);
            return slots.some(slot => slot.slot_time === time);
        } catch (error) {
            console.error('Error validating slot availability:', error);
            return false;
        }
    }

    /**
     * Get service statistics
     */
    getServiceStatistics() {
        return {
            service: 'ChatbotAppointmentService',
            supportedIntents: this.appointmentIntents.length,
            timePreferences: Object.keys(this.timePreferences).length,
            appointmentSteps: Object.keys(this.appointmentSteps).length,
            status: 'active'
        };
    }
}

export default new ChatbotAppointmentService();