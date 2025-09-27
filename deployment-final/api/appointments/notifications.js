/**
 * Appointment notification system
 * Handles email and SMS notifications via Resend and Zenvia APIs
 * Requirements: 4.2, 4.3 - Automated confirmations and reminders
 */

import { supabaseAdmin } from '../utils/supabase.js' 
import { generateAppointmentSummary } from './utils.js'
import { logEvent } from '../../src/lib/eventLogger.js'

/**
 * Add message to outbox for reliable delivery
 * @param {Object} messageData - Message data
 * @returns {Promise<string>} Message ID
 */
export async function addToOutbox(messageData) {
    const { messageType, recipient, subject, templateData, requestId, sendAfter } = messageData

    try {
        let content = ''

        if (messageType === 'email') {
            content = generateContent(templateData)
        } else if (messageType === 'sms') {
            content = generateSMSContentFromTemplate(templateData)
        }

        const { data, error } = await supabaseAdmin.rpc('add_to_outbox', {
            p_message_type: messageType,
            p_recipient: recipient,
            p_subject: subject || null,
            p_content: content,
            p_template_data: templateData,
            p_send_after: sendAfter || new Date().toISOString()
        })

        if (error) {
            throw error
        }

        await logEvent({
            eventType: 'message_queued',
            severity: 'info',
            source: 'appointment_notifications',
            requestId,
            eventData: {
                message_id: data,
                message_type: messageType,
                recipient: messageType === 'email' ? recipient : recipient.substring(0, 5) + '***'
            }
        })

        return data
    } catch (error) {
        console.error('Error adding message to outbox:', error)

        await logEvent({
            eventType: 'outbox_error',
            severity: 'error',
            source: 'appointment_notifications',
            requestId,
            eventData: {
                error: error.message,
                message_type: messageType,
                recipient: messageType === 'email' ? recipient : recipient.substring(0, 5) + '***'
            }
        })

        throw error
    }
}

/**
 * Generate email content for appointment confirmation
 * @param {Object} templateData - Template data
 * @returns {string} HTML email content
 */
function generateEmailContent(templateData) {
    const { patient_name, appointment_date, appointment_time, confirmation_token } = templateData
    const summary = generateAppointmentSummary({
        patient_name,
        appointment_date,
        appointment_time,
        confirmation_token
    })

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Consulta - Saraiva Vision</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .appointment-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button.secondary { background-color: #6b7280; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Saraiva Vision</h1>
            <p>Confirmação de Consulta</p>
        </div>
        
        <div class="content">
            <h2>Olá, ${summary.patientName}!</h2>
            
            <p>Sua consulta foi agendada com sucesso. Confira os detalhes abaixo:</p>
            
            <div class="appointment-details">
                <h3>Detalhes da Consulta</h3>
                <p><strong>Data:</strong> ${summary.dayName}, ${summary.date}</p>
                <p><strong>Horário:</strong> ${summary.time}</p>
                <p><strong>Local:</strong> Saraiva Vision - Clínica Oftalmológica</p>
                <p><strong>Médico:</strong> Dr. Philipe Saraiva</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${summary.confirmationURL}" class="button">Confirmar Consulta</a>
                <a href="${summary.cancellationURL}" class="button secondary">Cancelar Consulta</a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>Importante:</h4>
                <ul>
                    <li>Chegue com 15 minutos de antecedência</li>
                    <li>Traga um documento com foto</li>
                    <li>Traga seus óculos ou lentes de contato atuais</li>
                    <li>Se usar colírios, traga a receita</li>
                </ul>
            </div>
            
            <p>Você receberá lembretes por email e SMS 24 horas e 2 horas antes da consulta.</p>
            
            <p>Em caso de dúvidas, entre em contato conosco:</p>
            <p>📞 Telefone: (11) 99999-9999<br>
               📧 Email: contato@saraivavision.com.br</p>
        </div>
        
        <div class="footer">
            <p>Saraiva Vision - Clínica Oftalmológica</p>
            <p>Este é um email automático, não responda a esta mensagem.</p>
        </div>
    </div>
</body>
</html>`
}

/**
 * Generate SMS content for appointment confirmation
 * @param {Object} templateData - Template data
 * @returns {string} SMS text content
 */
function generateSMSContent(templateData) {
    const { patient_name, appointment_date, appointment_time } = templateData
    const summary = generateAppointmentSummary({
        patient_name,
        appointment_date,
        appointment_time
    })

    return `Saraiva Vision: Olá ${summary.patientName}! Sua consulta foi agendada para ${summary.dayName}, ${summary.date} às ${summary.time}. Chegue 15min antes. Confirme em: ${summary.confirmationURL}`
}

/**
 * Generate content based on message type and template data
 * @param {Object} templateData - Template data
 * @returns {string} Generated content
 */
export function generateContent(templateData) {
    if (templateData.reminder_type) {
        // This is a reminder message
        const hoursUntil = templateData.hours_until || (templateData.reminder_type === '24h' ? 24 : 2)
        return generateReminderEmailContent(templateData, hoursUntil)
    } else {
        // This is a confirmation message
        return generateEmailContent(templateData)
    }
}

/**
 * Generate SMS content based on template data
 * @param {Object} templateData - Template data
 * @returns {string} Generated SMS content
 */
export function generateSMSContentFromTemplate(templateData) {
    if (templateData.reminder_type) {
        // This is a reminder SMS
        const hoursUntil = templateData.hours_until || (templateData.reminder_type === '24h' ? 24 : 2)
        return generateReminderSMSContent(templateData, hoursUntil)
    } else {
        // This is a confirmation SMS
        return generateSMSContent(templateData)
    }
}

/**
 * Generate reminder email content
 * @param {Object} templateData - Template data
 * @param {number} hoursUntil - Hours until appointment
 * @returns {string} HTML email content
 */
export function generateReminderEmailContent(templateData, hoursUntil) {
    const { patient_name, appointment_date, appointment_time } = templateData
    const summary = generateAppointmentSummary({
        patient_name,
        appointment_date,
        appointment_time
    })

    const reminderType = hoursUntil === 24 ? '24 horas' : '2 horas'

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lembrete de Consulta - Saraiva Vision</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .appointment-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Saraiva Vision</h1>
            <p>Lembrete de Consulta</p>
        </div>
        
        <div class="content">
            <h2>Olá, ${summary.patientName}!</h2>
            
            <p>Este é um lembrete de que sua consulta está marcada para daqui a ${reminderType}.</p>
            
            <div class="appointment-details">
                <h3>Detalhes da Consulta</h3>
                <p><strong>Data:</strong> ${summary.dayName}, ${summary.date}</p>
                <p><strong>Horário:</strong> ${summary.time}</p>
                <p><strong>Local:</strong> Saraiva Vision - Clínica Oftalmológica</p>
                <p><strong>Médico:</strong> Dr. Philipe Saraiva</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${summary.confirmationURL}" class="button">Confirmar Presença</a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>Lembre-se:</h4>
                <ul>
                    <li>Chegue com 15 minutos de antecedência</li>
                    <li>Traga um documento com foto</li>
                    <li>Traga seus óculos ou lentes de contato atuais</li>
                </ul>
            </div>
            
            <p>Caso precise cancelar ou reagendar, entre em contato conosco o quanto antes.</p>
            
            <p>📞 Telefone: (11) 99999-9999<br>
               📧 Email: contato@saraivavision.com.br</p>
        </div>
        
        <div class="footer">
            <p>Saraiva Vision - Clínica Oftalmológica</p>
        </div>
    </div>
</body>
</html>`
}

/**
 * Generate reminder SMS content
 * @param {Object} templateData - Template data
 * @param {number} hoursUntil - Hours until appointment
 * @returns {string} SMS text content
 */
export function generateReminderSMSContent(templateData, hoursUntil) {
    const { patient_name, appointment_date, appointment_time } = templateData
    const summary = generateAppointmentSummary({
        patient_name,
        appointment_date,
        appointment_time
    })

    const reminderType = hoursUntil === 24 ? '24h' : '2h'

    return `Saraiva Vision: Lembrete! ${summary.patientName}, sua consulta é em ${reminderType} - ${summary.dayName}, ${summary.date} às ${summary.time}. Chegue 15min antes. Tel: (11) 99999-9999`
}

/**
 * Schedule reminder notifications
 * @param {Object} appointment - Appointment data
 * @param {string} requestId - Request ID for tracking
 */
export async function scheduleReminderNotifications(appointment, requestId) {
    try {
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`)

        // Schedule 24-hour reminder
        const reminder24h = new Date(appointmentDateTime.getTime() - (24 * 60 * 60 * 1000))
        if (reminder24h > new Date()) {
            await addToOutbox({
                messageType: 'email',
                recipient: appointment.patient_email,
                subject: 'Lembrete: Consulta em 24 horas - Saraiva Vision',
                templateData: {
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    reminder_type: '24h'
                },
                sendAfter: reminder24h.toISOString(),
                requestId
            })

            await addToOutbox({
                messageType: 'sms',
                recipient: appointment.patient_phone,
                templateData: {
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    reminder_type: '24h'
                },
                sendAfter: reminder24h.toISOString(),
                requestId
            })
        }

        // Schedule 2-hour reminder
        const reminder2h = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000))
        if (reminder2h > new Date()) {
            await addToOutbox({
                messageType: 'email',
                recipient: appointment.patient_email,
                subject: 'Lembrete: Consulta em 2 horas - Saraiva Vision',
                templateData: {
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    reminder_type: '2h'
                },
                sendAfter: reminder2h.toISOString(),
                requestId
            })

            await addToOutbox({
                messageType: 'sms',
                recipient: appointment.patient_phone,
                templateData: {
                    patient_name: appointment.patient_name,
                    appointment_date: appointment.appointment_date,
                    appointment_time: appointment.appointment_time,
                    reminder_type: '2h'
                },
                sendAfter: reminder2h.toISOString(),
                requestId
            })
        }

        await logEvent({
            eventType: 'reminders_scheduled',
            severity: 'info',
            source: 'appointment_notifications',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                reminder_24h: reminder24h.toISOString(),
                reminder_2h: reminder2h.toISOString()
            }
        })

    } catch (error) {
        console.error('Error scheduling reminder notifications:', error)

        await logEvent({
            eventType: 'reminder_scheduling_failed',
            severity: 'error',
            source: 'appointment_notifications',
            requestId,
            eventData: {
                appointment_id: appointment.id,
                error: error.message
            }
        })
    }
}