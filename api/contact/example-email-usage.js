/**
 * Example usage of the Email Service for Resend integration
 * 
 * This file demonstrates how to use the email service in the contact API endpoint.
 * It shows the proper data structure and error handling patterns.
 */

import {
    sendContactEmail,
    validateEmailServiceConfig,
    checkEmailServiceHealth
} from './emailService.js';

/**
 * Example: Basic email sending
 */
async function exampleBasicEmailSend() {
    const contactData = {
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '11987654321',
        message: 'Gostaria de agendar uma consulta para avaliação de catarata.',
        timestamp: new Date()
    };

    try {
        const result = await sendContactEmail(contactData);

        if (result.success) {
            console.log('Email sent successfully:', {
                messageId: result.messageId,
                contactId: result.contactId,
                timestamp: result.timestamp
            });
            return { success: true, data: result };
        } else {
            console.error('Email send failed:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: { code: 'UNEXPECTED_ERROR', message: error.message } };
    }
}

/**
 * Example: Configuration validation before sending
 */
async function exampleWithValidation() {
    // First, validate the service configuration
    const configValidation = validateEmailServiceConfig();

    if (!configValidation.isValid) {
        console.error('Email service configuration is invalid:', configValidation.errors);
        return { success: false, error: { code: 'CONFIG_ERROR', details: configValidation.errors } };
    }

    // Check service health
    const healthCheck = await checkEmailServiceHealth();

    if (!healthCheck.healthy) {
        console.error('Email service is not healthy:', healthCheck.error);
        return { success: false, error: { code: 'SERVICE_UNHEALTHY', details: healthCheck.error } };
    }

    // Proceed with sending email
    const contactData = {
        name: 'João Santos',
        email: 'joao.santos@example.com',
        phone: '1133334444', // Landline format
        message: 'Preciso de uma consulta urgente para verificar um problema na visão.',
        timestamp: new Date()
    };

    return await sendContactEmail(contactData);
}

/**
 * Example: Handling different phone number formats
 */
async function examplePhoneFormats() {
    const testCases = [
        {
            name: 'Ana Costa',
            email: 'ana@example.com',
            phone: '11987654321', // Mobile - 11 digits
            message: 'Consulta de rotina'
        },
        {
            name: 'Carlos Lima',
            email: 'carlos@example.com',
            phone: '1133334444', // Landline - 10 digits
            message: 'Exame de vista'
        },
        {
            name: 'Fernanda Oliveira',
            email: 'fernanda@example.com',
            phone: '+55 (11) 9 8765-4321', // Formatted mobile
            message: 'Agendar consulta'
        }
    ];

    const results = [];

    for (const testCase of testCases) {
        const contactData = {
            ...testCase,
            timestamp: new Date()
        };

        const result = await sendContactEmail(contactData);
        results.push({
            name: testCase.name,
            phone: testCase.phone,
            success: result.success,
            messageId: result.messageId || null,
            error: result.error || null
        });
    }

    return results;
}

/**
 * Example: Error handling patterns
 */
async function exampleErrorHandling() {
    const contactData = {
        name: 'Teste Error',
        email: 'invalid-email', // Invalid email to trigger validation
        phone: '123', // Invalid phone
        message: '', // Empty message
        timestamp: new Date()
    };

    try {
        const result = await sendContactEmail(contactData);

        if (!result.success) {
            // Handle different types of errors
            switch (result.error.code) {
                case 'EMAIL_SEND_FAILED':
                    console.log('Email delivery failed, may need to retry later');
                    break;
                case 'VALIDATION_ERROR':
                    console.log('Input validation failed:', result.error.message);
                    break;
                case 'RATE_LIMIT_EXCEEDED':
                    console.log('Rate limit exceeded, retry after:', result.error.retryAfter);
                    break;
                default:
                    console.log('Unknown error:', result.error);
            }
        }

        return result;
    } catch (error) {
        console.error('Service error:', error);
        return { success: false, error: { code: 'SERVICE_ERROR', message: error.message } };
    }
}

/**
 * Example: Integration with API endpoint
 */
export async function handleContactFormSubmission(req, res) {
    try {
        // Validate service configuration first
        const configValidation = validateEmailServiceConfig();
        if (!configValidation.isValid) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'SERVICE_CONFIG_ERROR',
                    message: 'Email service is not properly configured'
                }
            });
        }

        // Extract and validate request data
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'All fields are required'
                }
            });
        }

        // Prepare contact data
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            message: message.trim(),
            timestamp: new Date()
        };

        // Send email
        const result = await sendContactEmail(contactData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Contact form submitted successfully',
                contactId: result.contactId
            });
        } else {
            // Map internal errors to user-friendly responses
            const statusCode = result.error.code === 'EMAIL_SEND_FAILED' ? 500 : 400;

            res.status(statusCode).json({
                success: false,
                error: {
                    code: result.error.code,
                    message: 'Failed to send contact form. Please try again.'
                }
            });
        }

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred'
            }
        });
    }
}

// Export examples for testing/demonstration
export {
    exampleBasicEmailSend,
    exampleWithValidation,
    examplePhoneFormats,
    exampleErrorHandling
};