import { z } from 'zod';

/**
 * Input sanitization functions for XSS prevention and security
 */
export const sanitize = {
    /**
     * Sanitize HTML content to prevent XSS attacks
     * @param {string} input - Raw HTML input
     * @returns {string} Sanitized HTML
     */
    html: (input) => {
        if (typeof input !== 'string') return '';

        // Simple HTML tag removal for server-side environments
        // Remove all HTML tags and their content
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
            .replace(/<[^>]*>/g, '') // Remove all other HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .trim();
    },

    /**
     * Sanitize text input by removing potentially dangerous characters
     * @param {string} input - Raw text input
     * @returns {string} Sanitized text
     */
    text: (input) => {
        if (typeof input !== 'string') return '';
        // Remove null bytes, control characters, and normalize whitespace
        return sanitize.html(input) // First remove HTML
            .replace(/\0/g, '') // Remove null bytes
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
            .trim()
            .replace(/\s+/g, ' '); // Normalize whitespace
    },

    /**
     * Sanitize email input
     * @param {string} input - Raw email input
     * @returns {string} Sanitized email
     */
    email: (input) => {
        if (typeof input !== 'string') return '';
        // For emails, we only trim and lowercase, no HTML sanitization that could break @ symbols
        return input.trim().toLowerCase();
    },

    /**
     * Sanitize phone number input
     * @param {string} input - Raw phone input
     * @returns {string} Sanitized phone
     */
    phone: (input) => {
        if (typeof input !== 'string') return '';
        // Keep only digits, spaces, parentheses, hyphens, and plus sign
        return input.replace(/[^\d\s()\-+]/g, '').trim();
    }
};

/**
 * Helper function to validate Brazilian phone numbers
 * @param {string} digits - Phone number digits without country code
 * @returns {boolean} Whether the number is valid
 */
function validateBrazilianNumber(digits) {
    // Should be 10 or 11 digits (area code + number)
    if (digits.length !== 10 && digits.length !== 11) return false;

    // Brazilian area codes are 2 digits (11-99)
    const areaCode = digits.substring(0, 2);
    if (parseInt(areaCode) < 11 || parseInt(areaCode) > 99) return false;

    // For mobile numbers (11 digits total: area code + 9 digits)
    if (digits.length === 11) {
        const firstDigit = digits.charAt(2);
        return firstDigit === '9'; // Mobile numbers start with 9
    }

    // For landline numbers (10 digits total: area code + 8 digits)
    if (digits.length === 10) {
        const firstDigit = digits.charAt(2);
        return firstDigit >= '2' && firstDigit <= '8'; // Landlines start with 2-8
    }

    return false;
}

/**
 * Zod schema for Brazilian phone number validation
 */
const brazilianPhoneSchema = z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform(sanitize.phone)
    .refine(
        (phone) => {
            // Remove all non-digit characters for validation
            const digitsOnly = phone.replace(/\D/g, '');

            // Must have at least 10 digits (area code + number)
            if (digitsOnly.length < 10 || digitsOnly.length > 13) return false;

            // If starts with +55, should have 12 or 13 digits total (country code + area code + number)
            if (phone.startsWith('+55')) {
                if (digitsOnly.length !== 12 && digitsOnly.length !== 13) return false;
                // Remove country code for further validation
                const withoutCountryCode = digitsOnly.substring(2);
                return validateBrazilianNumber(withoutCountryCode);
            }

            // For numbers without country code
            return validateBrazilianNumber(digitsOnly);
        },
        {
            message: 'Formato de telefone inválido. Use: (11) 99999-9999 ou +55 11 99999-9999'
        }
    );

/**
 * ContactSubmission validation schema with Brazilian phone format
 */
export const contactSubmissionSchema = z.object({
    name: z
        .string()
        .min(1, 'Nome é obrigatório')
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .transform(sanitize.text)
        .refine(
            (name) => name.length >= 2,
            { message: 'Nome deve ter pelo menos 2 caracteres após sanitização' }
        ),

    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .transform(sanitize.email)
        .refine(
            (email) => {
                // Basic email validation regex
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            { message: 'Formato de email inválido' }
        )
        .refine(
            (email) => email.length <= 254,
            { message: 'Email deve ter no máximo 254 caracteres' }
        ),

    phone: brazilianPhoneSchema,

    message: z
        .string()
        .min(1, 'Mensagem é obrigatória')
        .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
        .max(2000, 'Mensagem deve ter no máximo 2000 caracteres')
        .transform(sanitize.text)
        .refine(
            (message) => message.length >= 10,
            { message: 'Mensagem deve ter pelo menos 10 caracteres após sanitização' }
        ),

    consent: z
        .boolean()
        .refine(
            (consent) => consent === true,
            { message: 'Você deve aceitar o consentimento LGPD para continuar' }
        ),

    // Honeypot field for spam detection - should always be empty
    honeypot: z
        .string()
        .optional()
        .transform(sanitize.text)
        .refine(
            (honeypot) => !honeypot || honeypot.length === 0,
            { message: 'Campo de segurança detectou atividade suspeita' }
        )
});

/**
 * Validation error mapping for user-friendly messages
 */
export const validationErrorMap = {
    // Field-specific error codes
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Por favor, insira um email válido',
    INVALID_PHONE: 'Por favor, insira um telefone válido no formato brasileiro',
    MESSAGE_TOO_SHORT: 'A mensagem deve ter pelo menos 10 caracteres',
    MESSAGE_TOO_LONG: 'A mensagem deve ter no máximo 2000 caracteres',
    NAME_TOO_SHORT: 'O nome deve ter pelo menos 2 caracteres',
    NAME_TOO_LONG: 'O nome deve ter no máximo 100 caracteres',
    CONSENT_REQUIRED: 'Você deve aceitar o consentimento LGPD',
    SPAM_DETECTED: 'Atividade suspeita detectada. Tente novamente.',

    // General error codes
    VALIDATION_ERROR: 'Por favor, verifique os dados informados',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente em alguns minutos.',
    RATE_LIMIT_ERROR: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',

    // Success messages
    FORM_SUBMITTED: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',

    // Loading states
    SUBMITTING: 'Enviando mensagem...',
    VALIDATING: 'Validando dados...'
};

/**
 * Maps Zod validation errors to user-friendly messages
 * @param {z.ZodError} zodError - Zod validation error
 * @returns {Object} Mapped error object with field-specific messages
 */
export const mapValidationErrors = (zodError) => {
    const errors = {};

    zodError.errors.forEach((error) => {
        const field = error.path[0];
        const code = error.code;
        const message = error.message;

        // Map specific error types to user-friendly messages
        switch (field) {
            case 'name':
                if (message.includes('pelo menos 2')) {
                    errors[field] = validationErrorMap.NAME_TOO_SHORT;
                } else if (message.includes('máximo 100')) {
                    errors[field] = validationErrorMap.NAME_TOO_LONG;
                } else if (message.includes('obrigatório')) {
                    errors[field] = validationErrorMap.REQUIRED_FIELD;
                } else {
                    errors[field] = message;
                }
                break;

            case 'email':
                if (code === 'invalid_string' || message.includes('email inválido')) {
                    errors[field] = validationErrorMap.INVALID_EMAIL;
                } else if (message.includes('obrigatório')) {
                    errors[field] = validationErrorMap.REQUIRED_FIELD;
                } else {
                    errors[field] = message;
                }
                break;

            case 'phone':
                if (message.includes('Formato de telefone inválido')) {
                    errors[field] = validationErrorMap.INVALID_PHONE;
                } else if (message.includes('obrigatório')) {
                    errors[field] = validationErrorMap.REQUIRED_FIELD;
                } else {
                    errors[field] = message;
                }
                break;

            case 'message':
                if (message.includes('pelo menos 10')) {
                    errors[field] = validationErrorMap.MESSAGE_TOO_SHORT;
                } else if (message.includes('máximo 2000')) {
                    errors[field] = validationErrorMap.MESSAGE_TOO_LONG;
                } else if (message.includes('obrigatório')) {
                    errors[field] = validationErrorMap.REQUIRED_FIELD;
                } else {
                    errors[field] = message;
                }
                break;

            case 'consent':
                errors[field] = validationErrorMap.CONSENT_REQUIRED;
                break;

            case 'honeypot':
                errors[field] = validationErrorMap.SPAM_DETECTED;
                break;

            default:
                errors[field] = message || validationErrorMap.VALIDATION_ERROR;
        }
    });

    return errors;
};

/**
 * Validates contact form submission data
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation result with success flag and data/errors
 */
export const validateContactSubmission = (data) => {
    try {
        const validatedData = contactSubmissionSchema.parse(data);
        return {
            success: true,
            data: validatedData,
            errors: null
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                data: null,
                errors: mapValidationErrors(error)
            };
        }

        // Handle unexpected errors
        return {
            success: false,
            data: null,
            errors: { general: validationErrorMap.VALIDATION_ERROR }
        };
    }
};

/**
 * Validates individual form fields for real-time feedback
 * @param {string} field - Field name to validate
 * @param {any} value - Field value
 * @param {Object} allData - All form data for context
 * @returns {Object} Field validation result
 */
export const validateField = (field, value, allData = {}) => {
    try {
        // Create a partial schema for the specific field
        const fieldSchema = contactSubmissionSchema.pick({ [field]: true });
        const result = fieldSchema.parse({ [field]: value });

        return {
            success: true,
            value: result[field],
            error: null
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldError = error.errors.find(err => err.path[0] === field);
            if (fieldError) {
                const mappedErrors = mapValidationErrors(error);
                return {
                    success: false,
                    value: null,
                    error: mappedErrors[field]
                };
            }
        }

        return {
            success: false,
            value: null,
            error: validationErrorMap.VALIDATION_ERROR
        };
    }
};

/**
 * Message Outbox validation schema for reliable email delivery
 */
export const messageOutboxSchema = z.object({
    message_type: z.enum(['email', 'sms'], {
        errorMap: () => ({ message: 'Tipo de mensagem deve ser email ou sms' })
    }),
    recipient: z
        .string()
        .min(1, 'Destinatário é obrigatório')
        .transform(sanitize.email)
        .refine(
            (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            { message: 'Email do destinatário inválido' }
        ),
    subject: z
        .string()
        .min(1, 'Assunto é obrigatório')
        .max(255, 'Assunto deve ter no máximo 255 caracteres')
        .transform(sanitize.text),
    content: z
        .string()
        .min(1, 'Conteúdo é obrigatório')
        .transform(sanitize.html),
    template_data: z
        .record(z.any())
        .optional(),
    max_retries: z
        .number()
        .int()
        .min(0)
        .max(10)
        .default(3),
    send_after: z
        .date()
        .optional()
        .default(() => new Date())
});

/**
 * Validates message outbox data for reliable delivery
 * @param {Object} data - Outbox message data
 * @returns {Object} Validation result
 */
export const validateMessageOutbox = (data) => {
    try {
        const validatedData = messageOutboxSchema.parse(data);
        return {
            success: true,
            data: validatedData,
            errors: null
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                data: null,
                errors: mapValidationErrors(error)
            };
        }

        return {
            success: false,
            data: null,
            errors: { general: validationErrorMap.VALIDATION_ERROR }
        };
    }
};

export default {
    contactSubmissionSchema,
    messageOutboxSchema,
    validateContactSubmission,
    validateMessageOutbox,
    validateField,
    mapValidationErrors,
    validationErrorMap,
    sanitize
};