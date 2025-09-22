/**
 * Appointment validation utilities
 * Validates appointment data according to business rules and LGPD requirements
 */

/**
 * Validate appointment booking data
 * @param {Object} data - Appointment data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateAppointmentData(data) {
    const errors = []
    const { patient_name, patient_email, patient_phone, appointment_date, appointment_time, notes } = data

    // Validate patient name
    if (!patient_name || typeof patient_name !== 'string') {
        errors.push({
            field: 'patient_name',
            message: 'Nome do paciente é obrigatório'
        })
    } else if (patient_name.trim().length < 2) {
        errors.push({
            field: 'patient_name',
            message: 'Nome do paciente deve ter pelo menos 2 caracteres'
        })
    } else if (patient_name.trim().length > 100) {
        errors.push({
            field: 'patient_name',
            message: 'Nome do paciente deve ter no máximo 100 caracteres'
        })
    }

    // Validate email
    if (!patient_email || typeof patient_email !== 'string') {
        errors.push({
            field: 'patient_email',
            message: 'Email é obrigatório'
        })
    } else {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(patient_email)) {
            errors.push({
                field: 'patient_email',
                message: 'Email deve ter um formato válido'
            })
        } else if (patient_email.length > 255) {
            errors.push({
                field: 'patient_email',
                message: 'Email deve ter no máximo 255 caracteres'
            })
        }
    }

    // Validate phone
    if (!patient_phone || typeof patient_phone !== 'string') {
        errors.push({
            field: 'patient_phone',
            message: 'Telefone é obrigatório'
        })
    } else {
        // Brazilian phone number validation (with or without country code)
        const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
        const cleanPhone = patient_phone.replace(/\s/g, '')

        if (!phoneRegex.test(cleanPhone)) {
            errors.push({
                field: 'patient_phone',
                message: 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
            })
        } else if (cleanPhone.length > 20) {
            errors.push({
                field: 'patient_phone',
                message: 'Telefone deve ter no máximo 20 caracteres'
            })
        }
    }

    // Validate appointment date
    if (!appointment_date || typeof appointment_date !== 'string') {
        errors.push({
            field: 'appointment_date',
            message: 'Data do agendamento é obrigatória'
        })
    } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(appointment_date)) {
            errors.push({
                field: 'appointment_date',
                message: 'Data deve estar no formato YYYY-MM-DD'
            })
        } else {
            const date = new Date(appointment_date)
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'appointment_date',
                    message: 'Data deve ser válida'
                })
            }
        }
    }

    // Validate appointment time
    if (!appointment_time || typeof appointment_time !== 'string') {
        errors.push({
            field: 'appointment_time',
            message: 'Horário do agendamento é obrigatório'
        })
    } else {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(appointment_time)) {
            errors.push({
                field: 'appointment_time',
                message: 'Horário deve estar no formato HH:MM'
            })
        }
    }

    // Validate notes (optional)
    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string') {
            errors.push({
                field: 'notes',
                message: 'Observações devem ser texto'
            })
        } else if (notes.length > 1000) {
            errors.push({
                field: 'notes',
                message: 'Observações devem ter no máximo 1000 caracteres'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Validate appointment confirmation token
 * @param {string} token - Confirmation token to validate
 * @returns {Object} Validation result
 */
export function validateConfirmationToken(token) {
    if (!token || typeof token !== 'string') {
        return {
            isValid: false,
            error: 'Token de confirmação é obrigatório'
        }
    }

    if (token.length !== 64) {
        return {
            isValid: false,
            error: 'Token de confirmação inválido'
        }
    }

    // Check if token contains only valid characters (hex)
    const hexRegex = /^[a-f0-9]+$/i
    if (!hexRegex.test(token)) {
        return {
            isValid: false,
            error: 'Token de confirmação inválido'
        }
    }

    return { isValid: true }
}

/**
 * Sanitize patient data for logging (remove PII)
 * @param {Object} appointmentData - Raw appointment data
 * @returns {Object} Sanitized data safe for logging
 */
export function sanitizeForLogging(appointmentData) {
    const { patient_name, patient_email, patient_phone, ...safeData } = appointmentData

    return {
        ...safeData,
        patient_name_length: patient_name?.length || 0,
        patient_email_domain: patient_email?.split('@')[1] || null,
        patient_phone_prefix: patient_phone?.substring(0, 3) || null
    }
}

/**
 * Validate appointment status transition
 * @param {string} currentStatus - Current appointment status
 * @param {string} newStatus - New status to transition to
 * @returns {Object} Validation result
 */
export function validateStatusTransition(currentStatus, newStatus) {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']

    if (!validStatuses.includes(newStatus)) {
        return {
            isValid: false,
            error: 'Status inválido'
        }
    }

    // Define valid transitions
    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'no_show', 'cancelled'],
        cancelled: [], // Cannot transition from cancelled
        completed: [], // Cannot transition from completed
        no_show: [] // Cannot transition from no_show
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return {
            isValid: false,
            error: `Não é possível alterar status de '${currentStatus}' para '${newStatus}'`
        }
    }

    return { isValid: true }
}