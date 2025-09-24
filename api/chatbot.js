/**
 * Enhanced Chatbot API with xAI (Grok) Integration
 * Uses AI SDK for intelligent responses with fallback to simple logic
 */

import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        const { message, sessionId } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid message',
                message: 'Message is required and must be a string'
            });
        }

        let response = '';
        let aiPowered = false;

        // Try xAI first if API key is available
        if (process.env.XAI_API_KEY) {
            try {
                const systemPrompt = `Você é o assistente virtual da Clínica Saraiva Vision, uma clínica oftalmológica em Caratinga-MG. 

INFORMAÇÕES DA CLÍNICA:
- Nome: Clínica Saraiva Vision
- Médico: Dr. Philipe Saraiva (CRM-MG 123456)
- Endereço: Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG, CEP: 35300-299
- Telefone: (33) 99860-1427
- WhatsApp: (33) 99860-1427
- Horário: Segunda a Sexta-feira, das 08:00 às 18:00

SERVIÇOS OFERECIDOS:
- Consultas oftalmológicas gerais e especializadas
- Cirurgia de catarata
- Tratamento de glaucoma
- Cirurgia refrativa (miopia, hipermetropia, astigmatismo)
- Tratamento de doenças da retina
- Exames especializados (OCT, campimetria, etc.)
- Adaptação de lentes de contato
- Oftalmologia pediátrica

DIRETRIZES:
1. Seja sempre cordial, profissional e empático
2. Forneça informações precisas sobre a clínica
3. Para agendamentos, sempre direcione para o telefone/WhatsApp
4. Para sintomas ou emergências, recomende consulta presencial urgente
5. Não forneça diagnósticos ou conselhos médicos específicos
6. Mantenha respostas concisas e úteis (máximo 200 palavras)
7. Use linguagem acessível e clara

IMPORTANTE: Para qualquer sintoma ocular, dor, perda de visão ou emergência, sempre recomende procurar atendimento médico imediato.`;

                const model = xai(process.env.XAI_MODEL || "grok-2-1212");

                const result = await generateText({
                    model: model,
                    system: systemPrompt,
                    prompt: message,
                    maxTokens: parseInt(process.env.XAI_MAX_TOKENS) || 1000,
                    temperature: parseFloat(process.env.XAI_TEMPERATURE) || 0.1,
                });

                response = result.text;
                aiPowered = true;
            } catch (aiError) {
                console.error('xAI API error, falling back to simple logic:', aiError);
                // Fall back to simple logic below
            }
        }

        // Fallback to simple response logic if AI fails or is not configured
        if (!response) {
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('hello')) {
                response = 'Olá! Sou o assistente virtual da Clínica Saraiva Vision. Como posso ajudá-lo hoje? Posso fornecer informações sobre nossos serviços, horários de funcionamento ou ajudar com agendamentos.';
            } else if (lowerMessage.includes('agendar') || lowerMessage.includes('consulta') || lowerMessage.includes('horário')) {
                response = 'Para agendar sua consulta, entre em contato conosco pelo telefone (33) 99860-1427 ou WhatsApp. Nosso horário de funcionamento é de segunda a sexta-feira, das 08:00 às 18:00. Estamos localizados na Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG.';
            } else if (lowerMessage.includes('serviços') || lowerMessage.includes('tratamento')) {
                response = 'A Clínica Saraiva Vision oferece diversos serviços oftalmológicos: consultas gerais e especializadas, cirurgia de catarata, tratamento de glaucoma, cirurgia refrativa, tratamento de doenças da retina, exames especializados, adaptação de lentes de contato e oftalmologia pediátrica.';
            } else if (lowerMessage.includes('endereço') || lowerMessage.includes('localização') || lowerMessage.includes('onde')) {
                response = 'Estamos localizados na Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG, CEP: 35300-299. Telefone: (33) 99860-1427. Horário de funcionamento: Segunda a Sexta-feira, das 08:00 às 18:00.';
            } else if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('convênio')) {
                response = 'Atendemos convênios e particular. Para informações sobre valores e convênios aceitos, entre em contato conosco pelo telefone (33) 99860-1427. Nossa equipe poderá fornecer todas as informações sobre preços e formas de pagamento.';
            } else if (lowerMessage.includes('dor') || lowerMessage.includes('problema') || lowerMessage.includes('sintoma')) {
                response = 'Para questões relacionadas a sintomas ou problemas oculares, é importante realizar uma consulta presencial para uma avaliação adequada. Recomendo agendar uma consulta com Dr. Philipe Saraiva para um exame completo. Entre em contato pelo (33) 99860-1427.';
            } else {
                response = 'Obrigado pela sua mensagem! Para melhor atendê-lo, entre em contato conosco pelo telefone (33) 99860-1427 ou WhatsApp. Nossa equipe estará pronta para esclarecer suas dúvidas e ajudar com agendamentos. Horário de funcionamento: Segunda a Sexta-feira, das 08:00 às 18:00.';
            }
        }

        // Generate session ID if not provided
        const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Analyze response for booking suggestions
        const lowerMessage = message.toLowerCase();
        const lowerResponse = response.toLowerCase();
        const suggestsBooking = lowerMessage.includes('agendar') ||
            lowerMessage.includes('consulta') ||
            lowerMessage.includes('horário') ||
            lowerResponse.includes('agendar') ||
            lowerResponse.includes('consulta');

        return res.status(200).json({
            success: true,
            data: {
                response: response,
                sessionId: currentSessionId,
                timestamp: new Date().toISOString(),
                suggestsBooking: suggestsBooking,
                aiPowered: aiPowered,
                model: aiPowered ? (process.env.XAI_MODEL || "grok-2-1212") : "fallback"
            }
        });

    } catch (error) {
        console.error('Chatbot API error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Desculpe, ocorreu um erro interno. Tente novamente ou entre em contato conosco pelo telefone (33) 99860-1427.',
            fallback: {
                phone: '(33) 99860-1427',
                whatsapp: 'https://wa.me/5533998601427',
                address: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG'
            }
        });
    }
}