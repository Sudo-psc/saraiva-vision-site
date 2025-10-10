/**
 * Form Submit Seguro com CORS e CSRF protection
 * Substitui JSONP por POST com validação
 */

class SecureFormSubmit {
  constructor(options = {}) {
    this.endpoint = options.endpoint;
    this.csrfTokenEndpoint = options.csrfTokenEndpoint || '/api/csrf-token';
    this.csrfToken = null;
    this.csrfTokenExpiry = null;
    this.tokenRefreshInterval = options.tokenRefreshInterval || 300000; // 5 minutos
  }

  async ensureCSRFToken() {
    // Verificar se token ainda é válido
    if (this.csrfToken && this.csrfTokenExpiry && Date.now() < this.csrfTokenExpiry) {
      return this.csrfToken;
    }

    try {
      console.log('[SecureForm] Fetching CSRF token');

      const response = await fetch(this.csrfTokenEndpoint, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();

      this.csrfToken = data.token;
      this.csrfTokenExpiry = Date.now() + (data.expiresIn || this.tokenRefreshInterval);

      console.log('[SecureForm] CSRF token obtained', {
        expiresAt: new Date(this.csrfTokenExpiry).toISOString()
      });

      return this.csrfToken;

    } catch (error) {
      console.error('[SecureForm] Failed to fetch CSRF token', error);
      throw error;
    }
  }

  async submit(formData) {
    // Validar dados obrigatórios
    const validation = this.validate(formData);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Obter CSRF token
    const csrfToken = await this.ensureCSRFToken();

    try {
      console.log('[SecureForm] Submitting form', {
        endpoint: this.endpoint,
        fields: Object.keys(formData)
      });

      const response = await fetch(this.endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        // Tentar ler erro do corpo
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // Ignorar erro de parse
          }
        }

        throw new Error(errorMessage);
      }

      // Parse resposta
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { success: true };
      }

      console.log('[SecureForm] Form submitted successfully', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('[SecureForm] Form submission failed', error);

      // Classificar erro
      if (error.message.includes('403') || error.message.includes('CSRF')) {
        // Token inválido, limpar e tentar novamente
        this.csrfToken = null;
        this.csrfTokenExpiry = null;

        throw new Error('CSRF token expired, please try again');
      }

      if (error.message.includes('400')) {
        throw new Error('Invalid form data, please check your input');
      }

      if (error.message.includes('429')) {
        throw new Error('Too many requests, please try again later');
      }

      throw error;
    }
  }

  validate(formData) {
    const errors = [];

    // Validações básicas
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!formData.email || !this.isValidEmail(formData.email)) {
      errors.push('Invalid email address');
    }

    if (!formData.message || formData.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    }

    // Verificar tamanho máximo
    if (formData.message && formData.message.length > 5000) {
      errors.push('Message too long (max 5000 characters)');
    }

    // Verificar caracteres suspeitos (XSS básico)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onerror, etc
      /<iframe/i
    ];

    for (const field of Object.values(formData)) {
      if (typeof field === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(field)) {
            errors.push('Invalid characters detected in form data');
            break;
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    // Regex básico para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método auxiliar para criar form handler
  createFormHandler(formElement) {
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(formElement);
      const data = Object.fromEntries(formData.entries());

      // Mostrar loading
      const submitButton = formElement.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      try {
        const result = await this.submit(data);

        // Sucesso
        console.log('Form submitted:', result);

        // Mostrar mensagem de sucesso
        this.showMessage(formElement, 'success', 'Formulário enviado com sucesso!');

        // Limpar formulário
        formElement.reset();

      } catch (error) {
        console.error('Form submission failed:', error);

        // Mostrar mensagem de erro
        this.showMessage(formElement, 'error', error.message);

      } finally {
        // Restaurar botão
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Enviar';
        }
      }
    });
  }

  showMessage(formElement, type, message) {
    // Remover mensagens anteriores
    const oldMessages = formElement.querySelectorAll('.form-message');
    oldMessages.forEach(msg => msg.remove());

    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;

    // Estilos inline (pode ser movido para CSS)
    messageDiv.style.padding = '12px';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.marginTop = '16px';
    messageDiv.style.fontWeight = '500';

    if (type === 'success') {
      messageDiv.style.backgroundColor = '#d4edda';
      messageDiv.style.color = '#155724';
      messageDiv.style.border = '1px solid #c3e6cb';
    } else {
      messageDiv.style.backgroundColor = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.border = '1px solid #f5c6cb';
    }

    formElement.appendChild(messageDiv);

    // Remover após 5 segundos
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
}

// Backend: Endpoint CSRF Token
// api/src/routes/csrf.js
/*
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Armazenar tokens (usar Redis em produção)
const tokens = new Map();

// Gerar token
router.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.sessionID || req.ip;

  tokens.set(sessionId, {
    token,
    expiresAt: Date.now() + 300000 // 5 minutos
  });

  res.json({
    token,
    expiresIn: 300000
  });
});

// Middleware de validação
export function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionId = req.sessionID || req.ip;

  if (!token) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const storedData = tokens.get(sessionId);

  if (!storedData) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }

  if (Date.now() > storedData.expiresAt) {
    tokens.delete(sessionId);
    return res.status(403).json({ error: 'CSRF token expired' });
  }

  if (storedData.token !== token) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  // Token válido, remover (uso único)
  tokens.delete(sessionId);

  next();
}

export default router;
*/

// Backend: Form Submit Endpoint
// api/src/routes/contact.js
/*
import express from 'express';
import { validateCSRF } from './csrf.js';

const router = express.Router();

router.post('/contact', validateCSRF, async (req, res) => {
  const { name, email, message } = req.body;

  // Validar dados
  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Missing required fields',
      fields: { name, email, message }
    });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Processar formulário (enviar email, salvar no DB, etc)
    console.log('Contact form:', { name, email, message });

    // Enviar email
    // await sendEmail({ to: 'contato@saraivavision.com.br', from: email, subject: 'Contact Form', body: message });

    res.json({
      success: true,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Form processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
*/

// Uso
const contactForm = new SecureFormSubmit({
  endpoint: 'https://saraivavision.com.br/api/contact',
  csrfTokenEndpoint: 'https://saraivavision.com.br/api/csrf-token'
});

// Anexar handler ao formulário
const form = document.getElementById('contact-form');
if (form) {
  contactForm.createFormHandler(form);
}

// Ou submit programático
async function submitContactForm() {
  try {
    const result = await contactForm.submit({
      name: 'João Silva',
      email: 'joao@example.com',
      message: 'Gostaria de agendar uma consulta'
    });

    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default SecureFormSubmit;
