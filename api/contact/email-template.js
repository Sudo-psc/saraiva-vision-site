export function createEmailTemplate({ name, email, phone, message, submittedAt }) {
  const formattedDate = new Date(submittedAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Solicitação de Contato</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📧 Nova Solicitação de Contato
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">
                Saraiva Vision - Oftalmologia
              </p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                  ⚡ Solicitação urgente de potencial paciente
                </p>
              </div>
            </td>
          </tr>

          <!-- Patient Information -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Dados do Paciente
              </h2>
              
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <strong style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Nome Completo</strong>
                    <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px; font-weight: 500;">${escapeHtml(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <strong style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">E-mail</strong>
                    <p style="margin: 4px 0 0 0;">
                      <a href="mailto:${email}" style="color: #2563eb; font-size: 15px; text-decoration: none; font-weight: 500;">
                        ${email}
                      </a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <strong style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Telefone/WhatsApp</strong>
                    <p style="margin: 4px 0 0 0;">
                      <a href="tel:${phone.replace(/\D/g, '')}" style="color: #059669; font-size: 15px; text-decoration: none; font-weight: 500;">
                        ${escapeHtml(phone)}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Content -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Mensagem
              </h2>
              <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; line-height: 1.6;">
                <p style="margin: 0; color: #374151; font-size: 15px; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 8px;">
                    <a href="mailto:${email}?subject=Re:%20Sua%20mensagem%20para%20Saraiva%20Vision" 
                       style="display: block; background-color: #2563eb; color: #ffffff; text-align: center; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                      📧 Responder por E-mail
                    </a>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <a href="https://wa.me/${phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(name.split(' ')[0])},%20sou%20Dr.%20Philipe%20da%20Saraiva%20Vision" 
                       style="display: block; background-color: #059669; color: #ffffff; text-align: center; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                      💬 Responder no WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                <strong>Data de Envio:</strong> ${formattedDate}
              </p>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">
                <strong>Origem:</strong> Formulário de Contato - saraivavision.com.br
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #1f2937; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #e5e7eb; font-size: 14px; font-weight: 600;">
                Saraiva Vision - Oftalmologia
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este e-mail foi gerado automaticamente pelo sistema de contato do site
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

export default createEmailTemplate;
