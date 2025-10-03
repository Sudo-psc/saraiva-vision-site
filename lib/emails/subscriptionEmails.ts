/**
 * Subscription Email Notifications
 * Using Resend API for transactional emails
 */

import { Resend } from 'resend';
import type { Subscription } from '../../types/subscription';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured - emails will not be sent');
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.CONTACT_EMAIL_FROM || 'noreply@saraivavision.com.br';

/**
 * Send welcome email after subscription creation
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  planName: string
): Promise<void> {
  if (!resend) {
    console.log('Email skipped (no Resend configured):', { email, planName });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo à Saraiva Vision - Assinatura Confirmada',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .steps { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
              .step { margin: 15px 0; }
              .step-number { display: inline-block; background: #667eea; color: white; width: 24px; height: 24px; text-align: center; border-radius: 50%; margin-right: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bem-vindo à Saraiva Vision!</h1>
              </div>

              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Parabéns! Sua assinatura do plano <strong>${planName}</strong> foi confirmada com sucesso.</p>

                <div class="steps">
                  <h3>Próximos Passos:</h3>

                  <div class="step">
                    <span class="step-number">1</span>
                    <strong>Envie sua receita médica</strong><br>
                    Envie uma foto clara da sua receita oftalmológica para: receita@saraivavision.com.br
                  </div>

                  <div class="step">
                    <span class="step-number">2</span>
                    <strong>Aguarde a confirmação</strong><br>
                    Nossa equipe validará sua receita em até 24 horas.
                  </div>

                  <div class="step">
                    <span class="step-number">3</span>
                    <strong>Receba suas lentes</strong><br>
                    Suas lentes serão enviadas em até 3 dias úteis após aprovação da receita.
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/jovem/assinatura/manage" class="button">
                    Gerenciar Minha Assinatura
                  </a>
                </p>

                <p><strong>Importante:</strong> Consultas oftalmológicas regulares são essenciais para a saúde dos seus olhos. Este serviço de assinatura não substitui o acompanhamento médico profissional.</p>
              </div>

              <div class="footer">
                <p>Saraiva Vision - Clínica Oftalmológica<br>
                Caratinga, MG - Brasil</p>
                <p>Dúvidas? Entre em contato: suporte@saraivavision.com.br</p>
                <p style="font-size: 11px; margin-top: 10px;">
                  Este email foi enviado para ${email} porque você se inscreveu para uma assinatura.<br>
                  Seus dados são protegidos conforme a LGPD (Lei Geral de Proteção de Dados).
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(
  email: string,
  name: string,
  amount: number,
  invoiceUrl?: string
): Promise<void> {
  if (!resend) {
    console.log('Email skipped (no Resend configured):', { email, amount });
    return;
  }

  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount / 100);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Pagamento Confirmado - Saraiva Vision',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .receipt { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
              .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✓ Pagamento Confirmado</h1>
              </div>

              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Recebemos seu pagamento com sucesso!</p>

                <div class="receipt">
                  <p style="text-align: center; color: #666; margin: 0;">Valor Pago</p>
                  <div class="amount">${amountFormatted}</div>
                  <p style="text-align: center; color: #666; margin: 0;">
                    Data: ${new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>

                ${
                  invoiceUrl
                    ? `<p style="text-align: center;">
                         <a href="${invoiceUrl}" style="color: #667eea; text-decoration: none;">
                           Baixar Nota Fiscal
                         </a>
                       </p>`
                    : ''
                }

                <p>Sua assinatura está ativa e suas lentes serão enviadas conforme programado.</p>

                <p>Obrigado por confiar na Saraiva Vision!</p>
              </div>

              <div class="footer">
                <p>Saraiva Vision - Clínica Oftalmológica<br>
                Caratinga, MG - Brasil</p>
                <p>Dúvidas? Entre em contato: suporte@saraivavision.com.br</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Payment receipt sent to:', email);
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    throw error;
  }
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailedEmail(
  email: string,
  name: string,
  reason?: string
): Promise<void> {
  if (!resend) {
    console.log('Email skipped (no Resend configured):', { email });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Problema com seu Pagamento - Saraiva Vision',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
              .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Problema com Pagamento</h1>
              </div>

              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Não conseguimos processar o pagamento da sua assinatura.</p>

                ${reason ? `<div class="warning"><strong>Motivo:</strong> ${reason}</div>` : ''}

                <p><strong>O que fazer:</strong></p>
                <ul>
                  <li>Verifique se há saldo suficiente em sua conta</li>
                  <li>Confirme se os dados do cartão estão corretos</li>
                  <li>Entre em contato com seu banco se necessário</li>
                </ul>

                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/jovem/assinatura/manage" class="button">
                    Atualizar Forma de Pagamento
                  </a>
                </p>

                <p><small>Sua assinatura será suspensa se o pagamento não for processado em até 7 dias.</small></p>
              </div>

              <div class="footer">
                <p>Saraiva Vision - Clínica Oftalmológica<br>
                Caratinga, MG - Brasil</p>
                <p>Dúvidas? Entre em contato: suporte@saraivavision.com.br</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Payment failed email sent to:', email);
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(
  email: string,
  name: string,
  endDate: Date
): Promise<void> {
  if (!resend) {
    console.log('Email skipped (no Resend configured):', { email });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Assinatura Cancelada - Saraiva Vision',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .info { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Assinatura Cancelada</h1>
              </div>

              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>

                <p>Confirmamos o cancelamento da sua assinatura.</p>

                <div class="info">
                  <p><strong>Data de término:</strong> ${endDate.toLocaleDateString('pt-BR')}</p>
                  <p>Você continuará tendo acesso aos benefícios até esta data.</p>
                </div>

                <p>Sentiremos sua falta! Se houver algo que possamos melhorar, adoraríamos ouvir seu feedback.</p>

                <p>Você pode reativar sua assinatura a qualquer momento acessando nosso site.</p>

                <p>Obrigado por ter sido parte da Saraiva Vision!</p>
              </div>

              <div class="footer">
                <p>Saraiva Vision - Clínica Oftalmológica<br>
                Caratinga, MG - Brasil</p>
                <p>Dúvidas? Entre em contato: suporte@saraivavision.com.br</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Cancellation email sent to:', email);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
}
