import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Medical guardrails and safety utilities
const MEDICAL_KEYWORDS = [
    'dor', 'dói', 'doendo', 'machuca', 'machucando',
    'vermelho', 'vermelha', 'inflamado', 'inflamada',
    'coceira', 'coça', 'ardor', 'arde', 'queima',
    'visão turva', 'embaçado', 'embaçada', 'borrado',
    'mancha', 'manchas', 'ponto', 'pontos', 'moscas',
    'flash', 'flashes', 'luz', 'luzes',
    'diplopia', 'dupla', 'duplicada',
    'cego', 'cega', 'cegueira', 'não vejo', 'não enxergo',
    'sangue', 'sangramento', 'hemorragia',
    'trauma', 'batida', 'pancada', 'acidente',
    'químico', 'produto', 'substância',
    'diabetes', 'diabético', 'diabética',
    'pressão alta', 'hipertensão',
    'remédio', 'medicamento', 'colírio', 'pomada'
];

const EMERGENCY_KEYWORDS = [
    'emergência', 'urgente', 'socorro', 'ajuda',
    'perdi a visão', 'não enxergo nada', 'cegueira súbita',
    'dor intensa', 'dor forte', 'muita dor',
    'trauma ocular', 'objeto no olho', 'perfuração',
    'químico no olho', 'produto químico',
    'sangramento', 'muito sangue',
    'acidente', 'batida no olho'
];

const SYSTEM_PROMPT = `Você é um assistente virtual da Clínica Saraiva Vision, especializada em oftalmologia em Caratinga-MG. 

DIRETRIZES CRÍTICAS DE SEGURANÇA:
1. NUNCA forneça diagnósticos médicos ou conselhos clínicos específicos
2. NUNCA interprete sintomas ou sugira o que o paciente "pode ter"
3. SEMPRE direcione questões médicas para agendamento de consulta presencial
4. Para emergências, SEMPRE oriente procurar atendimento médico imediato
5. Seja educativo sobre procedimentos gerais, mas não prescritivo
6. Mantenha tom profissional, acolhedor e empático
7. Foque em informações gerais sobre saúde ocular e serviços da clínica

SERVIÇOS DA CLÍNICA SARAIVA VISION:
- Consultas oftalmológicas gerais e especializadas
- Cirurgia de catarata com lentes intraoculares premium
- Diagnóstico e tratamento de glaucoma
- Cirurgia refrativa (correção de miopia, astigmatismo, hipermetropia)
- Tratamento de doenças da retina e retinopatia diabética
- Exames especializados: campo visual, retinografia, topografia de córnea, paquimetria
- Adaptação de lentes de contato
- Oftalmologia pediátrica
- Tratamento de pterígio e outras patologias da superfície ocular

INFORMAÇÕES DA CLÍNICA:
- Endereço: Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG, CEP: 35300-299
- Telefone: (33) 99860-1427
- WhatsApp: (33) 99860-1427
- Horário de funcionamento: Segunda a Sexta-feira, das 08:00 às 18:00
- Dr. Philipe Saraiva - Oftalmologista CRM/MG
- Atendemos convênios e particular

RESPOSTAS OBRIGATÓRIAS PARA SITUAÇÕES ESPECÍFICAS:

Para sintomas ou problemas oculares:
"Para uma avaliação adequada dos seus sintomas, é importante realizar uma consulta presencial. Recomendo agendar uma consulta com Dr. Philipe para um exame completo e orientação personalizada."

Para emergências oculares:
"Situações como essa requerem atendimento médico imediato. Procure o pronto-socorro mais próximo ou entre em contato conosco pelo telefone (33) 99860-1427 para orientações urgentes."

Para agendamentos:
"Ficaria feliz em ajudar com o agendamento! Nossa agenda está disponível de segunda a sexta, das 08:00 às 18:00. Você pode ligar no (33) 99860-1427 ou usar nosso WhatsApp para marcar sua consulta."

IMPORTANTE: Sempre mantenha-se dentro dos limites éticos e legais da prática médica. Quando em dúvida, sempre direcione para consulta presencial.`;

const EMERGENCY_RESPONSE = `⚠️ ATENÇÃO: Situações como essa podem requerer atendimento médico IMEDIATO.

🚨 PROCURE AJUDA AGORA:
• Pronto-socorro mais próximo
• Ligue para emergência: 192 (SAMU)
• Entre em contato conosco: (33) 99860-1427

A Clínica Saraiva Vision está localizada na Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG.

Não deixe para depois - sua visão é preciosa! 👁️`;

const MEDICAL_DISCLAIMER = `⚠️ IMPORTANTE: Não posso fornecer diagnósticos ou conselhos médicos específicos através do chat.

Para uma avaliação adequada, é essencial realizar uma consulta presencial onde Dr. Philipe poderá:
• Examinar seus olhos detalhadamente
• Avaliar seu histórico médico
• Realizar exames específicos se necessário
• Fornecer orientações personalizadas

📞 Agende sua consulta: (33) 99860-1427
💬 WhatsApp: (33) 99860-1427
📍 Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG`;

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map();

// Utility functions
function containsMedicalKeywords(message) {
    const lowerMessage = message.toLowerCase();
    return MEDICAL_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );
}

function isEmergencyMessage(message) {
    const lowerMessage = message.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );
}

function sanitizeBotResponse(response, userMessage) {
    // Check for emergency situations first
    if (isEmergencyMessage(userMessage)) {
        return EMERGENCY_RESPONSE;
    }

    // Check for medical keywords in user message
    if (containsMedicalKeywords(userMessage)) {
        return response + '\n\n' + MEDICAL_DISCLAIMER;
    }

    return response;
}

// Rate limiting function
function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(identifier)) {
        rateLimitStore.set(identifier, []);
    }

    const requests = rateLimitStore.get(identifier);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    rateLimitStore.set(identifier, validRequests);

    if (validRequests.length >= maxRequests) {
        return false;
    }

    validRequests.push(now);
    rateLimitStore.set(identifier, validRequests);
    return true;
}

// Generate anonymized session ID
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Log conversation (anonymized)
async function logConversation(sessionId, userMessage, botResponse, metadata = {}) {
    try {
        await supabase
            .from('event_log')
            .insert({
                event_type: 'chatbot_interaction',
                event_data: {
                    session_id: sessionId,
                    user_message_length: userMessage.length,
                    bot_response_length: botResponse.length,
                    contains_medical_keywords: containsMedicalKeywords(userMessage),
                    is_emergency: isEmergencyMessage(userMessage),
                    timestamp: new Date().toISOString(),
                    ...metadata
                },
                severity: 'info',
                source: 'chatbot_api'
            });
    } catch (error) {
        console.error('Failed to log conversation:', error);
    }
}

// OpenAI API call
async function callOpenAI(messages, contextualPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: contextualPrompt },
                ...messages
            ],
            max_tokens: 500,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    return response.json();
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { message, sessionId: providedSessionId, conversationHistory = [] } = req.body;

        // Validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a non-empty string'
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Message too long. Maximum 1000 characters allowed.'
            });
        }

        // Rate limiting based on IP
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        if (!checkRateLimit(clientIp, 10, 60000)) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please wait before sending another message.'
            });
        }

        // Generate or use existing session ID
        const sessionId = providedSessionId || generateSessionId();

        // Prepare conversation context (limit to last 10 messages for context)
        const contextMessages = conversationHistory
            .slice(-10)
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

        // Add current message
        contextMessages.push({ role: 'user', content: message.trim() });

        // Count medical topics in conversation
        const medicalTopicCount = conversationHistory.filter(msg =>
            msg.role === 'user' && containsMedicalKeywords(msg.content)
        ).length;

        // Create contextual system prompt
        let contextualPrompt = SYSTEM_PROMPT;
        if (isEmergencyMessage(message)) {
            contextualPrompt += '\n\nIMPORTANTE: O usuário mencionou uma possível emergência. Priorize orientações para buscar atendimento médico imediato.';
        } else if (medicalTopicCount >= 3) {
            contextualPrompt += '\n\nNOTA: O usuário tem feito várias perguntas médicas. Reforce a importância de uma consulta presencial para avaliação adequada.';
        }

        // Call OpenAI API
        const openaiResponse = await callOpenAI(contextMessages, contextualPrompt);

        if (!openaiResponse.choices || openaiResponse.choices.length === 0) {
            throw new Error('No response from OpenAI');
        }

        let botResponse = openaiResponse.choices[0].message.content;

        // Apply medical guardrails to the response
        botResponse = sanitizeBotResponse(botResponse, message);

        // Log the conversation (anonymized)
        await logConversation(sessionId, message, botResponse, {
            model_used: 'gpt-3.5-turbo',
            tokens_used: openaiResponse.usage?.total_tokens || 0,
            client_ip_hash: require('crypto').createHash('sha256').update(clientIp).digest('hex').substring(0, 16),
            medical_topic_count: medicalTopicCount
        });

        // Check if response suggests booking appointment
        const suggestsBooking = /agendar|consulta|horário|disponível|marcar/i.test(botResponse);

        return res.status(200).json({
            success: true,
            data: {
                response: botResponse,
                sessionId: sessionId,
                suggestsBooking: suggestsBooking,
                timestamp: new Date().toISOString(),
                isEmergency: isEmergencyMessage(message),
                containsMedicalKeywords: containsMedicalKeywords(message)
            }
        });

    } catch (error) {
        console.error('Chatbot API error:', error);

        // Log error
        try {
            await supabase
                .from('event_log')
                .insert({
                    event_type: 'chatbot_error',
                    event_data: {
                        error_message: error.message,
                        timestamp: new Date().toISOString()
                    },
                    severity: 'error',
                    source: 'chatbot_api'
                });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }

        return res.status(500).json({
            success: false,
            error: 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco diretamente.',
            fallback: {
                message: 'Para agendamentos e dúvidas, entre em contato pelo telefone (33) 99860-1427 ou WhatsApp.',
                contactInfo: {
                    phone: '(33) 99860-1427',
                    whatsapp: 'https://wa.me/5533998601427',
                    address: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG'
                }
            }
        });
    }
}