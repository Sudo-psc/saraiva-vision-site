const DEFAULT_FROM = 'noreply@saraivavision.com.br';
const DEFAULT_TO = 'philipe_cruz@outlook.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Get the Resend API key from environment, trimmed.
 *
 * Returns the value of RESEND_API_KEY with surrounding whitespace removed; if the variable is unset, returns an empty string.
 * @returns {string} The trimmed Resend API key or an empty string when not configured.
 */
function getResendApiKey() {
  return (process.env.RESEND_API_KEY || '').trim();
}

/**
 * Returns the sender email address used for outgoing contact emails.
 *
 * If the CONTACT_EMAIL_FROM environment variable is set it is used; otherwise DEFAULT_FROM is returned.
 * Leading and trailing whitespace are trimmed.
 *
 * @return {string} The sender email address.
 */
function getSenderAddress() {
  return (process.env.CONTACT_EMAIL_FROM || DEFAULT_FROM).trim();
}

/**
 * Resolve the recipient email address(es) for contact notifications.
 *
 * Reads CONTACT_EMAIL_TO or CONTACT_NOTIFICATIONS_TO from environment; if neither is set returns DEFAULT_TO.
 * When an environment value is present, splits on commas, trims whitespace, filters out empty entries, and
 * returns a comma-separated string of addresses.
 *
 * @returns {string} A single email address or a comma-separated list of addresses.
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
 * Build the subject line for a contact-form email.
 *
 * @param {string} name - Sender's name to include in the subject.
 * @returns {string} A subject string in the form "Nova mensagem do site - {name}".
 */
function buildEmailSubject(name) {
  return `Nova mensagem do site - ${name}`;
}

/**
 * Build an HTML email body for a contact submission including optional phone and reCAPTCHA score.
 *
 * Formats the submission message (preserving line breaks as <br>), includes name and email,
 * conditionally adds a phone line when present, and appends a localized timestamp (pt-BR)
 * plus the verification score.
 *
 * @param {{ name: string, email: string, message: string, phone?: string }} submission - Contact data; `phone` is optional.
 * @param {{ score: number }} verification - Verification result containing a numeric `score` (e.g., reCAPTCHA).
 * @returns {string} HTML string suitable for sending as an email body.
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
 * Build a plain-text email body for a contact form submission.
 *
 * Produces a Portuguese plain-text message that includes the sender's name, email,
 * optional phone, the message content, a localized timestamp (pt-BR), and the
 * reCAPTCHA score.
 *
 * @param {{ name: string, email: string, message: string, phone?: string }} submission - Contact submission data; `phone` is optional.
 * @param {{ score: number }} verification - reCAPTCHA verification result with a numeric `score`.
 * @return {string} The formatted plain-text email body.
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
 * Send a contact email via the Resend API using submission and verification data.
 *
 * Builds HTML and plain-text bodies from the provided submission and verification objects,
 * posts the message to the Resend endpoint configured by RESEND_API_ENDPOINT (or the default),
 * and returns a normalized result object describing success or failure.
 *
 * @param {{ name: string, email: string, message: string, phone?: string }} params.submission
 *   Contact form submission data used to populate the email subject and body.
 * @param {{ score?: number }} params.verification
 *   reCAPTCHA / verification metadata (used to include the verification score in the message).
 * @return {Promise<
 *   { ok: true, id: string } |
 *   { ok: false, status: number, error: string, details?: any }
 * >}
 *   Resolves to an object with `ok: true` and the provider `id` on success.
 *   On failure returns `ok: false` with an HTTP-like `status`, an `error` code, and optional `details`
 *   returned by the Resend API.
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
