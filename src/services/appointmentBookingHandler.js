/**
 * Appointment Booking Handler
 * Handles the actual booking process when user confirms appointment through chatbot
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

class AppointmentBookingHandler {
    constructor() {
        this.apiBaseUrl = process.env.NODE_ENV === 'production'
            ? 'https://saraivavision.com.br'
            : 'http://localhost:3000';
    }

    /**
     * Book appointment through chatbot API
     * @param {Object} appointmentData - Appointment data
     * @param {string} sessionId - Chat session ID
     * @returns {Object} Booking result
     */
    async bookAppointment(appointmentData, sessionId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chatbot/appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'book',
                    sessionId,
                    appointmentData: {
                        ...appointmentData,
                        userConsent: {
                            dataProcessing: true,
                            medicalData: true,
                            notifications: true,
                            timestamp: new Date().toISOString()
                        }
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to book appointment');
            }

            return {
                success: true,
                appointment: result.data.appointment,
                message: result.data.message,
                nextSteps: result.data.nextSteps
            };

        } catch (error) {
            console.error('Error booking appointment:', error);
            return {
                success: false,
                error: error.message,
                message: 'Desculpe, não foi possível completar o agendamento no momento. Tente novamente ou entre em contato conosco.'
            };
        }
    }

    /**
     * Check slot availability
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @returns {Object} Availability result
     */
    async checkSlotAvailability(date, time) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chatbot/appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'check_availability',
                    appointmentData: {
                        appointment_date: date,
                        appointment_time: time
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to check availability');
            }

            return {
                success: true,
                available: result.data.available,
                alternatives: result.data.alternatives || []
            };

        } catch (error) {
            console.error('Error checking slot availability:', error);
            return {
                success: false,
                error: error.message,
                available: false,
                alternatives: []
            };
        }
    }

    /**
     * Get available slots for chatbot
     * @param {Object} options - Options for availability query
     * @returns {Object} Availability data
     */
    async getAvailableSlots(options = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (options.days) queryParams.append('days', options.days);
            if (options.preferredDates) queryParams.append('preferredDates', options.preferredDates);
            if (options.timePreferences) queryParams.append('timePreferences', options.timePreferences);
            if (options.sessionId) queryParams.append('sessionId', options.sessionId);

            const response = await fetch(`${this.apiBaseUrl}/api/chatbot/appointment?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to get availability');
            }

            return {
                success: true,
                availability: result.data.availability,
                summary: result.data.summary
            };

        } catch (error) {
            console.error('Error getting available slots:', error);
            return {
                success: false,
                error: error.message,
                availability: [],
                summary: null
            };
        }
    }

    /**
     * Format booking confirmation message
     * @param {Object} appointment - Booked appointment data
     * @returns {string} Confirmation message
     */
    formatBookingConfirmation(appointment) {
        const appointmentDate = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
        const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = appointment.appointment_time;

        return `✅ **Agendamento Confirmado!**

📅 **Data:** ${formattedDate}
⏰ **Horário:** ${formattedTime}
👤 **Paciente:** ${appointment.patient_name}
🎫 **Código de Confirmação:** ${appointment.confirmation_token}

📧 Você receberá um e-mail de confirmação em breve
📱 Um SMS de confirmação também será enviado
⏰ Lembretes serão enviados 24h e 2h antes da consulta

**Informações importantes:**
• Chegue 15 minutos antes do horário agendado
• Traga um documento de identidade
• Em caso de cancelamento, avise com pelo menos 24h de antecedência

Obrigado por escolher a Saraiva Vision! 👁️✨`;
    }

    /**
     * Format booking error message
     * @param {string} error - Error message
     * @param {Array} alternatives - Alternative slots if available
     * @returns {string} Error message with alternatives
     */
    formatBookingError(error, alternatives = []) {
        let message = `❌ **Não foi possível completar o agendamento**

${error}`;

        if (alternatives.length > 0) {
            message += '\n\n**Horários alternativos disponíveis:**\n';
            alternatives.forEach((alt, index) => {
                message += `${index + 1}. ${alt.displayDate} às ${alt.displayTime}\n`;
            });
            message += '\nGostaria de escolher um destes horários?';
        } else {
            message += '\n\nPor favor, tente novamente ou entre em contato conosco:\n📞 (11) 1234-5678\n📧 contato@saraivavision.com.br';
        }

        return message;
    }

    /**
     * Validate appointment data before booking
     * @param {Object} appointmentData - Appointment data to validate
     * @returns {Object} Validation result
     */
    validateAppointmentData(appointmentData) {
        const errors = [];

        // Validate required fields
        if (!appointmentData.patient_name || appointmentData.patient_name.trim().length < 2) {
            errors.push('Nome completo é obrigatório');
        }

        if (!appointmentData.patient_email || !this.isValidEmail(appointmentData.patient_email)) {
            errors.push('E-mail válido é obrigatório');
        }

        if (!appointmentData.patient_phone || !this.isValidPhone(appointmentData.patient_phone)) {
            errors.push('Telefone válido é obrigatório');
        }

        if (!appointmentData.appointment_date || !this.isValidDate(appointmentData.appointment_date)) {
            errors.push('Data de agendamento é obrigatória');
        }

        if (!appointmentData.appointment_time || !this.isValidTime(appointmentData.appointment_time)) {
            errors.push('Horário de agendamento é obrigatório');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone format
     * @param {string} phone - Phone to validate
     * @returns {boolean} Is valid phone
     */
    isValidPhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    /**
     * Validate date format
     * @param {string} date - Date to validate (YYYY-MM-DD)
     * @returns {boolean} Is valid date
     */
    isValidDate(date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;

        const dateObj = new Date(date + 'T00:00:00');
        return dateObj instanceof Date && !isNaN(dateObj);
    }

    /**
     * Validate time format
     * @param {string} time - Time to validate (HH:MM)
     * @returns {boolean} Is valid time
     */
    isValidTime(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    /**
     * Get service health status
     * @returns {Object} Health status
     */
    getHealthStatus() {
        return {
            service: 'AppointmentBookingHandler',
            status: 'healthy',
            apiBaseUrl: this.apiBaseUrl,
            timestamp: new Date().toISOString()
        };
    }
}

export default new AppointmentBookingHandler();