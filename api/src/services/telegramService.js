/**
 * Telegram Bot Service - Saraiva Vision
 * Notificações, alertas de sistema e comandos de controle via Telegram
 * Author: Dr. Philipe Saraiva Cruz
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Envia uma mensagem para um chat do Telegram
 */
export async function sendMessage(chatId, text, options = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN não configurado');
    return { ok: false, error: 'Token não configurado' };
  }

  const targetChatId = chatId || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!targetChatId) {
    console.warn('[Telegram] TELEGRAM_ADMIN_CHAT_ID não configurado');
    return { ok: false, error: 'Chat ID não configurado' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      })
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('[Telegram] Erro ao enviar mensagem:', data.description);
    }
    return data;
  } catch (error) {
    console.error('[Telegram] Falha na requisição:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Notifica novo contato recebido pelo formulário do site
 */
export async function notifyNewContact({ name, email, phone, message, contactId }) {
  const text = [
    '📬 <b>Novo Contato - Saraiva Vision</b>',
    '',
    `👤 <b>Nome:</b> ${escapeHtml(name)}`,
    `📧 <b>E-mail:</b> ${escapeHtml(email)}`,
    phone ? `📞 <b>Telefone:</b> ${escapeHtml(phone)}` : null,
    '',
    `💬 <b>Mensagem:</b>`,
    escapeHtml(message.slice(0, 300)) + (message.length > 300 ? '...' : ''),
    '',
    `🆔 ID: <code>${contactId}</code>`,
    `🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  ].filter(Boolean).join('\n');

  return sendMessage(null, text);
}

/**
 * Notifica novo agendamento
 */
export async function notifyNewAppointment({ name, email, phone, service, date, notes, appointmentId }) {
  const text = [
    '📅 <b>Novo Agendamento - Saraiva Vision</b>',
    '',
    `👤 <b>Paciente:</b> ${escapeHtml(name)}`,
    `📧 <b>E-mail:</b> ${escapeHtml(email)}`,
    phone ? `📞 <b>Telefone:</b> ${escapeHtml(phone)}` : null,
    service ? `🔬 <b>Serviço:</b> ${escapeHtml(service)}` : null,
    date ? `📆 <b>Data desejada:</b> ${escapeHtml(date)}` : null,
    notes ? `📝 <b>Observações:</b> ${escapeHtml(notes.slice(0, 200))}` : null,
    '',
    appointmentId ? `🆔 ID: <code>${appointmentId}</code>` : null,
    `🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  ].filter(Boolean).join('\n');

  return sendMessage(null, text);
}

/**
 * Envia alerta de sistema (erro crítico, serviço indisponível, etc.)
 */
export async function sendSystemAlert({ level = 'warning', title, description, details = null }) {
  const icons = { info: 'ℹ️', warning: '⚠️', error: '🚨', success: '✅' };
  const icon = icons[level] || '⚠️';

  const text = [
    `${icon} <b>Alerta de Sistema - Saraiva Vision</b>`,
    '',
    `<b>${escapeHtml(title)}</b>`,
    escapeHtml(description),
    details ? `\n<pre>${escapeHtml(String(details).slice(0, 500))}</pre>` : null,
    '',
    `🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  ].filter(Boolean).join('\n');

  return sendMessage(null, text);
}

/**
 * Notifica resultado de deploy
 */
export async function notifyDeploy({ success, version, duration, errors = [] }) {
  const icon = success ? '🚀' : '💥';
  const status = success ? 'Deploy concluído com sucesso!' : 'Falha no deploy!';

  const text = [
    `${icon} <b>${status}</b>`,
    '',
    version ? `📦 <b>Versão:</b> ${escapeHtml(version)}` : null,
    duration ? `⏱️ <b>Duração:</b> ${duration}s` : null,
    errors.length ? `\n❌ <b>Erros:</b>\n${errors.slice(0, 3).map(e => `• ${escapeHtml(e)}`).join('\n')}` : null,
    '',
    `🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  ].filter(Boolean).join('\n');

  return sendMessage(null, text);
}

/**
 * Processa comandos recebidos pelo bot
 */
export async function processCommand(chatId, command, userId) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  // Apenas o chat admin pode executar comandos
  if (adminChatId && String(chatId) !== String(adminChatId)) {
    return sendMessage(chatId, '⛔ Acesso não autorizado.');
  }

  const cmd = command.split(' ')[0].toLowerCase().replace('@', '');

  switch (cmd) {
    case '/start':
    case '/help':
      return sendMessage(chatId, [
        '🤖 <b>Saraiva Vision Bot</b>',
        '',
        'Comandos disponíveis:',
        '/status - Status do sistema',
        '/health - Verificar saúde da API',
        '/help - Esta mensagem',
        '',
        '📡 Notificações ativas:',
        '• Novos contatos do formulário',
        '• Novos agendamentos',
        '• Alertas de sistema'
      ].join('\n'));

    case '/status':
      return sendMessage(chatId, [
        '📊 <b>Status - Saraiva Vision</b>',
        '',
        `✅ Bot: Online`,
        `🖥️ API: ${process.env.NODE_ENV || 'development'}`,
        `⏱️ Uptime: ${formatUptime(process.uptime())}`,
        `💾 Memória: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        '',
        `🕐 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
      ].join('\n'));

    case '/health':
      try {
        const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        return sendMessage(chatId, [
          `${data.status === 'healthy' ? '✅' : '❌'} <b>API Health Check</b>`,
          '',
          `Status: <b>${data.status}</b>`,
          `Uptime: ${formatUptime(data.uptime)}`,
          `Ambiente: ${data.environment}`
        ].join('\n'));
      } catch (err) {
        return sendMessage(chatId, `❌ API inacessível: ${escapeHtml(err.message)}`);
      }

    default:
      return sendMessage(chatId, `❓ Comando desconhecido: <code>${escapeHtml(cmd)}</code>\nDigite /help para ver os comandos disponíveis.`);
  }
}

/**
 * Registra o webhook do bot no Telegram
 */
export async function registerWebhook(webhookUrl, secretToken) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN não configurado');

  const response = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ['message'],
      drop_pending_updates: true
    })
  });

  return response.json();
}

/**
 * Remove o webhook do bot
 */
export async function deleteWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN não configurado');

  const response = await fetch(`${TELEGRAM_API}${token}/deleteWebhook`, {
    method: 'POST'
  });

  return response.json();
}

/**
 * Obtém informações do bot
 */
export async function getBotInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: 'Token não configurado' };

  const response = await fetch(`${TELEGRAM_API}${token}/getMe`);
  return response.json();
}

// Utilitários
function escapeHtml(text) {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
