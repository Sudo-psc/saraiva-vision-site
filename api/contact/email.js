const DEFAULT_FROM = 'noreply@saraivavision.com.br';
const DEFAULT_TO = 'philipe_cruz@outlook.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function getResendApiKey() {
  return (process.env.RESEND_API_KEY || '').trim();
}

function getSenderAddress() {
  return (process.env.CONTACT_EMAIL_FROM || DEFAULT_FROM).trim();
}

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

function buildEmailSubject(name) {
  return `Nova mensagem do site - ${name}`;
}

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
