import { Resend } from 'resend';
import { readFileSync } from 'fs';

let resend;
function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function createReportEmailHTML(reportData) {
  const { generatedAt, status, durationSeconds, results, summary } = reportData;
  const date = new Date(generatedAt);
  const formattedDate = date.toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'success').length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  const statusColor = status === 'success' ? '#10b981' : '#ef4444';
  const statusText = status === 'success' ? 'SUCESSO' : 'FALHA';
  const statusIcon = status === 'success' ? '✓' : '✗';

  let resultsHTML = '';
  for (const result of results) {
    const resultStatus = result.status === 'success' ? '✓' : '✗';
    const resultColor = result.status === 'success' ? '#10b981' : '#ef4444';
    const duration = result.durationSeconds;
    
    resultsHTML += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px;">
          <span style="color: ${resultColor}; font-weight: bold; font-size: 18px;">${resultStatus}</span>
        </td>
        <td style="padding: 12px 8px;">
          <strong style="color: #333;">${sanitizeInput(result.label)}</strong>
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #666; font-family: 'Courier New', monospace;">
          ${duration}s
        </td>
      </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Diário - Saraiva Vision</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <div style="text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 30px; margin-bottom: 40px;">
      <h1 style="color: #0066cc; margin: 0 0 10px 0; font-size: 32px;">Saraiva Vision</h1>
      <p style="color: #666; margin: 0; font-size: 18px; font-weight: 500;">Relatório Diário do Sistema</p>
      <p style="color: #999; margin: 10px 0 0 0; font-size: 14px;">${formattedDate}</p>
    </div>

    <div style="background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}05 100%); border-left: 4px solid ${statusColor}; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2 style="margin: 0 0 8px 0; color: ${statusColor}; font-size: 28px;">
            ${statusIcon} Status: ${statusText}
          </h2>
          <p style="margin: 0; color: #666; font-size: 16px;">
            Duração total: <strong>${durationSeconds}s</strong> | 
            Taxa de sucesso: <strong>${successRate}%</strong>
          </p>
        </div>
      </div>
    </div>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin: 0 0 16px 0; color: #333; font-size: 20px;">📊 Resumo Executivo</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="text-align: center; padding: 16px; background: white; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${totalTests}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">Total de Testes</div>
        </div>
        <div style="text-align: center; padding: 16px; background: white; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #10b981;">${passedTests}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">Aprovados</div>
        </div>
        <div style="text-align: center; padding: 16px; background: white; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${failedTests}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">Falhas</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 32px;">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📋 Resultados Detalhados</h3>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 16px 8px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666; letter-spacing: 0.5px;">Status</th>
            <th style="padding: 16px 8px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666; letter-spacing: 0.5px;">Teste</th>
            <th style="padding: 16px 8px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666; letter-spacing: 0.5px;">Duração</th>
          </tr>
        </thead>
        <tbody>
          ${resultsHTML}
        </tbody>
      </table>
    </div>

    ${summary ? `
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 32px; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; color: #d97706; font-size: 18px;">⚠️ Observações</h3>
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        ${sanitizeInput(summary)}
      </p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #f3f4f6;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
        <strong>Sistema de Monitoramento Automatizado</strong>
      </p>
      <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.5;">
        Este relatório é gerado automaticamente pelo sistema de monitoramento da Saraiva Vision. 
        Inclui validação de API, linting, testes unitários, testes de integração e verificação de build.
      </p>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #999; font-style: italic;">
        Para mais detalhes, consulte os logs completos no servidor ou entre em contato com a equipe técnica.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

function createReportEmailText(reportData) {
  const { generatedAt, status, durationSeconds, results } = reportData;
  const date = new Date(generatedAt);
  const formattedDate = date.toLocaleString('pt-BR');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'success').length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  const statusText = status === 'success' ? 'SUCESSO' : 'FALHA';

  let resultsText = '';
  for (const result of results) {
    const resultStatus = result.status === 'success' ? '[OK]' : '[FALHA]';
    resultsText += `${resultStatus} ${result.label} (${result.durationSeconds}s)\n`;
  }

  return `
RELATÓRIO DIÁRIO DO SISTEMA - SARAIVA VISION
=====================================

Data: ${formattedDate}
Status: ${statusText}
Duração Total: ${durationSeconds}s

RESUMO EXECUTIVO
----------------
Total de Testes: ${totalTests}
Testes Aprovados: ${passedTests}
Testes com Falha: ${failedTests}
Taxa de Sucesso: ${successRate}%

RESULTADOS DETALHADOS
---------------------
${resultsText}

-------------------------------------

Sistema de Monitoramento Automatizado
Este relatório é gerado automaticamente pelo sistema de monitoramento da Saraiva Vision.

Para mais detalhes, consulte os logs completos no servidor.
  `.trim();
}

export async function sendSystemReportEmail(reportData, retries = 3) {
  if (!reportData || !reportData.results) {
    throw new Error('Invalid report data: results are required');
  }

  const emailPayload = {
    from: 'Saraiva Vision Monitor <monitor@saraivavision.com.br>',
    to: [process.env.DOCTOR_EMAIL || 'contato@saraivavision.com.br'],
    subject: `[${reportData.status === 'success' ? '✓' : '✗'}] Relatório Diário do Sistema - ${new Date(reportData.generatedAt).toLocaleDateString('pt-BR')}`,
    html: createReportEmailHTML(reportData),
    text: createReportEmailText(reportData),
    headers: {
      'X-Priority': reportData.status === 'success' ? '3' : '1',
      'X-Mailer': 'SaraivaVision-SystemMonitor',
      'X-Report-Status': reportData.status
    }
  };

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await getResendClient().emails.send(emailPayload);

      if (result.error) {
        throw new Error(result.error.message || 'Resend API error');
      }

      return {
        success: true,
        messageId: result.data.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  return {
    success: false,
    error: {
      code: 'EMAIL_SEND_FAILED',
      message: 'Failed to send system report email after maximum retries',
      details: lastError?.message || 'Unknown error'
    },
    timestamp: new Date().toISOString()
  };
}

export async function sendReportFromFile(jsonFilePath, retries = 3) {
  try {
    const reportContent = readFileSync(jsonFilePath, 'utf8');
    const reportData = JSON.parse(reportContent);
    
    return await sendSystemReportEmail(reportData, retries);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FILE_READ_ERROR',
        message: 'Failed to read or parse report file',
        details: error.message
      },
      timestamp: new Date().toISOString()
    };
  }
}

export function validateReportEmailConfig() {
  const errors = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY environment variable is not set');
  }

  if (!process.env.DOCTOR_EMAIL) {
    errors.push('DOCTOR_EMAIL environment variable is not set');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
