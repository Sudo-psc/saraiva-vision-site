const DEFAULT_FROM = 'noreply@saraivavision.com.br';
const DEFAULT_TO = 'philipe_cruz@outlook.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Retrieves the Resend API key from environment variables.
 * @returns {string} The Resend API key.
 */
function getResendApiKey() {
  return (process.env.RESEND_API_KEY || '').trim();
}

/**
 * Retrieves the sender email address from environment variables, with a fallback to a default.
 * @returns {string} The sender email address.
 */
function getSenderAddress() {
  return (process.env.CONTACT_EMAIL_FROM || DEFAULT_FROM).trim();
}

/**
 * Retrieves the recipient email address(es) from environment variables.
 * It supports a comma-separated list of addresses.
 * @returns {string} A string of one or more recipient email addresses.
 */
function getRecipientAddress() {
  const envValue = process.env.CONTACT_EMAIL_TO || process.env.CONTACT_NOTIFICATIONS_TO;
  if (!envValue) {
    return DEFAULT_TO;
  }
  return envValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(',');
}

/**
 * Builds the subject line for the contact email.
 * @param {string} name The name of the person who submitted the form.
 * @returns {string} The email subject line.
 */
function buildEmailSubject(name) {
  return `Nova mensagem do site - ${name}`;
}

/**
 * Builds the HTML body of the contact email.
 * @param {object} submission The sanitized submission data.
 * @param {object} verification The reCAPTCHA verification result.
 * @returns {string} The HTML content of the email.
 */
function buildHtmlBody(submission, verification) {
  const formattedMessage = submission.message.replace(/\n/g, '<br>');
  const formattedPhone = submission.phone ? `<p><strong>Telefone:</strong> ${submission.phone}</p>` : '';
  const timestamp = new Date().toLocaleString('pt-BR');

  return `
    <h2>Nova mensagem de contato - SaraivaVision</h2>
    <p><strong>Nome:</strong> ${submission.name}</p>
    <p><strong>Email:</strong> ${submission.email}</p>
    ${formattedPhone}
    <p><strong>Mensagem:</strong></p>
    <p>${formattedMessage}</p>
    <hr>
    <p><small>Data: ${timestamp}</small></p>
    <p><small>Score reCAPTCHA: ${verification.score}</small></p>
  `;
}

/**
 * Builds the plain text body of the contact email.
 * @param {object} submission The sanitized submission data.
 * @param {object} verification The reCAPTCHA verification result.
 * @returns {string} The plain text content of the email.
 */
function buildTextBody(submission, verification) {
  const timestamp = new Date().toLocaleString('pt-BR');
  return `
Nova mensagem de contato - SaraivaVision

Nome: ${submission.name}
Email: ${submission.email}
${submission.phone ? `Telefone: ${submission.phone}\n` : ''}
Mensagem:
${submission.message}

Data: ${timestamp}
Score reCAPTCHA: ${verification.score}
`;
}

/**
 * Sends the contact form submission as an email using the Resend API.
 *
 * @param {object} params The email sending parameters.
 * @param {object} params.submission The sanitized contact form data.
 * @param {object} params.verification The reCAPTCHA verification result.
 * @returns {Promise<{ok: boolean, id?: string, status?: number, error?: string, details?: object}>}
 * A promise that resolves to an object indicating the result of the email sending operation.
 */
export async function sendContactEmail({ submission, verification }) {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return { ok: false, status: 500, error: 'email_service_unavailable' };
  }

  const endpoint = process.env.RESEND_API_ENDPOINT || RESEND_ENDPOINT;
  const payload = {
    from: getSenderAddress(),
    to: getRecipientAddress(),
    subject: buildEmailSubject(submission.name),
    html: buildHtmlBody(submission, verification),
    text: buildTextBody(submission, verification)
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      ok: false,
      status: response.status || 500,
      error: 'email_send_failed',
      details: errorData
    };
  }

  const data = await response.json();
  return { ok: true, id: data.id };
}
