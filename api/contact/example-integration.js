/**
 * Example integration of the rate limiting system with a Vercel serverless function
 * This demonstrates how to use the rate limiter in the actual contact API endpoint
 */

import { applyRateLimiting, sanitizeFormData, validateRequiredFields, createErrorResponse, createSuccessResponse, logRequest } from './utils.js';

/**
 * Example Vercel serverless function handler
 * @param {Request} req - Vercel request object
 * @param {Response} res - Vercel response object
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json(createErrorResponse('method_not_allowed', 'Method not allowed'));
    }

    try {
        // Parse and sanitize form data
        const rawFormData = req.body;
        const sanitizedData = sanitizeFormData(rawFormData);

        // Validate required fields
        const fieldValidation = validateRequiredFields(sanitizedData);
        if (!fieldValidation.valid) {
            logRequest(req, 'validation_failed', { errors: fieldValidation.errors.length });
            return res.status(400).json({
                success: false,
                errors: fieldValidation.errors
            });
        }

        // Apply rate limiting and spam detection
        const rateLimitResult = applyRateLimiting(req, res, sanitizedData);
        if (rateLimitResult) {
            logRequest(req, 'rate_limited', {
                type: JSON.parse(rateLimitResult.body).error.code
            });
            return res.status(rateLimitResult.statusCode).json(JSON.parse(rateLimitResult.body));
        }

        // At this point, the request has passed all validations
        // Here you would integrate with the email service (Resend API)

        // Example: Send email (this would be implemented in the email service)
        // const emailResult = await sendContactEmail(sanitizedData);

        // Log successful submission
        logRequest(req, 'form_submitted', { status: 'success' });

        // Return success response
        return res.status(200).json(createSuccessResponse(
            'Your message has been sent successfully. We will contact you soon.',
            {
                timestamp: new Date().toISOString(),
                // messageId: emailResult.messageId // Would come from email service
            }
        ));

    } catch (error) {
        // Log error without exposing sensitive information
        logRequest(req, 'internal_error', { error: error.message });

        return res.status(500).json(createErrorResponse(
            'internal_error',
            'An internal error occurred. Please try again later.'
        ));
    }
}

/**
 * Example usage in a different serverless function or API route
 */
export function exampleUsage() {
    // Example of how to use individual components

    const mockReq = {
        method: 'POST',
        headers: {
            'x-forwarded-for': '203.0.113.1',
            'user-agent': 'Mozilla/5.0'
        },
        body: {
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '+5511999999999',
            message: 'Gostaria de agendar uma consulta.',
            consent: true,
            honeypot: '' // Empty honeypot field
        }
    };

    const mockRes = {
        setHeader: (key, value) => console.log(`Header: ${key} = ${value}`),
        status: (code) => ({
            json: (data) => console.log(`Response ${code}:`, data)
        })
    };

    // This would be called in your actual handler
    return handler(mockReq, mockRes);
}

// Export individual functions for testing
export {
    handler,
    exampleUsage
};