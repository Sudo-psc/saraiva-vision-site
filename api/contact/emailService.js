import { Resend } from 'resend';
import { randomBytes } from 'crypto';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to get doctor email (allows for testing)
function getDoctorEmail() {
    return process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com';
}

// Email templates
const emailTemplates = {
    // Professional HTML email template
    html: (data) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Contato - Saraiva Vision</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0A1628 0%, #1E2A47 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #0A1628;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e9ecef;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 12px;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
        }
        .info-value {
            color: #333;
        }
        .message-box {
            background-color: #f8f9fa;
            border-left: 4px solid #0A1628;
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .message-box p {
            margin: 0;
            white-space: pre-wrap;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .footer a {
            color: #0A1628;
            text-decoration: none;
        }
        .badge {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
        }
        .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Novo Contato do Site</h1>
            <p>Saraiva Vision - Clínica Oftalmológica</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">Informações do Paciente</div>
                
                <div class="info-grid">
                    <div class="info-label">Nome:</div>
                    <div class="info-value">${data.name}</div>
                </div>
                
                <div class="info-grid">
                    <div class="info-label">E-mail:</div>
                    <div class="info-value">
                        <a href="mailto:${data.email}">${data.email}</a>
                        <div class="badge">Responder</div>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-label">Telefone:</div>
                    <div class="info-value">
                        <a href="tel:${data.phone}">${data.phone}</a>
                        <div class="badge">Ligar</div>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-label">Data/Hora:</div>
                    <div class="info-value">${new Date(data.timestamp).toLocaleString('pt-BR')}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Mensagem</div>
                <div class="message-box">
                    <p>${data.message}</p>
                </div>
            </div>
            
            <div class="security-notice">
                <strong>LGPD - Informações de Privacidade:</strong><br>
                Este contato foi enviado com consentimento explícito do paciente para tratamento de dados 
                conforme Lei Geral de Proteção de Dados (LGPD). As informações são confidenciais 
                e devem ser tratadas de acordo com nossas políticas de privacidade.
            </div>
        </div>
        
        <div class="footer">
            <p>Este e-mail foi gerado automaticamente pelo sistema de contatos do site Saraiva Vision.</p>
            <p>© ${new Date().getFullYear()} Saraiva Vision. Todos os direitos reservados.</p>
            <p><a href="https://saraivavision.com.br">saraivavision.com.br</a></p>
        </div>
    </div>
</body>
</html>
  `,

    // Plain text email template for fallback
    text: (data) => `
NOVO CONTATO - SARAIVA VISION
================================

Informações do Paciente:
----------------------
Nome: ${data.name}
E-mail: ${data.email}
Telefone: ${data.phone}
Data/Hora: ${new Date(data.timestamp).toLocaleString('pt-BR')}

Mensagem:
--------
${data.message}

---
Informações de Privacidade (LGPD):
Este contato foi enviado com consentimento explícito do paciente para tratamento de dados 
conforme Lei Geral de Proteção de Dados (LGPD). As informações são confidenciais 
e devem ser tratadas de acordo com nossas políticas de privacidade.

Enviado automaticamente pelo sistema de contatos do site Saraiva Vision
© ${new Date().getFullYear()} Saraiva Vision - https://saraivavision.com.br
  `
};

// Retry configuration
const RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2
};

/**
 * Implements exponential backoff with jitter for retries
 */
function calculateRetryDelay(attempt) {
    const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1),
        RETRY_CONFIG.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 500;
}

/**
 * Sanitizes and formats contact data for email templates
 */
function mapContactData(contactData) {
    return {
        name: sanitizeInput(contactData.name),
        email: sanitizeEmail(contactData.email),
        phone: formatPhoneNumber(contactData.phone),
        message: sanitizeInput(contactData.message),
        timestamp: contactData.timestamp || new Date(),
        id: contactData.id || generateUniqueId()
    };
}

/**
 * Generates a unique ID for tracking
 */
function generateUniqueId() {
    return randomBytes(16).toString('hex');
}

/**
 * Sanitizes input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    // Remove potentially dangerous characters
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

/**
 * Validates and sanitizes email address
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';

    const sanitized = email.trim().toLowerCase();
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Formats Brazilian phone number to standard format
 */
function formatPhoneNumber(phone) {
    if (typeof phone !== 'string') return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Brazilian phone number formats
    if (digits.length === 11) {
        // Mobile: (XX) XXXXX-XXXX
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
        // Landline: (XX) XXXX-XXXX
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    // Return original if format doesn't match
    return phone;
}

/**
 * Creates a standardized email object from contact data
 */
function createEmailObject(contactData) {
    const mappedData = mapContactData(contactData);

    return {
        from: 'Saraiva Vision <contato@saraivavision.com.br>',
        to: [getDoctorEmail()],
        replyTo: mappedData.email,
        subject: `Novo contato do site - ${mappedData.name}`,
        html: emailTemplates.html(mappedData),
        text: emailTemplates.text(mappedData),
        headers: {
            'X-Priority': '1', // High priority
            'X-Mailer': 'SaraivaVision-ContactForm',
            'X-Contact-ID': mappedData.id,
            'List-ID': 'Saraiva Vision Contact Form'
        }
    };
}

/**
 * Sends email using Resend API with retry logic
 */
export async function sendContactEmail(contactData, attempt = 1) {
    try {
        const emailObject = createEmailObject(contactData);

        const response = await resend.emails.send(emailObject);

        if (response.error) {
            throw new Error(`Resend API error: ${response.error.message}`);
        }

        return {
            success: true,
            messageId: response.data?.id,
            contactId: contactData.id || generateUniqueId(),
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        // Log error for monitoring (without PII)
        console.error('Email send error:', {
            error: error.message,
            attempt,
            contactId: contactData.id
        });

        // Retry logic
        if (attempt < RETRY_CONFIG.maxAttempts) {
            const delay = calculateRetryDelay(attempt);
            console.log(`Retrying email send in ${delay}ms (attempt ${attempt + 1})`);

            // Wait for delay before retry
            await new Promise(resolve => setTimeout(resolve, delay));

            return sendContactEmail(contactData, attempt + 1);
        }

        // All retries failed
        return {
            success: false,
            error: {
                code: 'EMAIL_SEND_FAILED',
                message: 'Failed to send email after maximum retries',
                details: error.message
            },
            contactId: contactData.id || generateUniqueId(),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Validates email service configuration
 */
export function validateEmailServiceConfig() {
    const errors = [];

    if (!process.env.RESEND_API_KEY) {
        errors.push('RESEND_API_KEY environment variable is not set');
    }

    if (!process.env.DOCTOR_EMAIL) {
        errors.push('DOCTOR_EMAIL environment variable is not set');
    } else if (!sanitizeEmail(process.env.DOCTOR_EMAIL)) {
        errors.push('DOCTOR_EMAIL environment variable is not a valid email address');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Health check for email service
 */
export async function checkEmailServiceHealth() {
    try {
        const configValidation = validateEmailServiceConfig();

        if (!configValidation.isValid) {
            return {
                healthy: false,
                error: 'Configuration error',
                details: configValidation.errors
            };
        }

        // Validate that we can create an email object with test data
        const testData = {
            name: 'Health Check',
            email: 'test@example.com',
            phone: '(11) 99999-9999',
            message: 'This is a health check message',
            timestamp: new Date()
        };

        // This validates template generation without sending
        createEmailObject(testData);

        return {
            healthy: true,
            message: 'Email service is configured correctly',
            config: {
                doctorEmail: getDoctorEmail(),
                resendConfigured: !!process.env.RESEND_API_KEY
            }
        };

    } catch (error) {
        return {
            healthy: false,
            error: 'Health check failed',
            details: error.message
        };
    }
}
