/**
 * Next.js Chatbot API with xAI (Grok) Integration - JSON Response
 * Uses AI SDK with structured JSON response for compatibility
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

        // Validate XAI API key
        if (!process.env.XAI_API_KEY) {
            console.error('XAI_API_KEY not configured');
            return res.status(500).json({
                success: false,
                error: 'Configuration error',
                message: 'Chatbot service temporarily unavailable'
            });
        }

        // Create system prompt for Clínica Saraiva Vision
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

        // Configure xAI model
        const model = xai(process.env.XAI_MODEL || "grok-2-1212");

        // Generate response
        const result = await generateText({
            model: model,
            system: systemPrompt,
            prompt: message,
            maxTokens: parseInt(process.env.XAI_MAX_TOKENS) || 1000,
            temperature: parseFloat(process.env.XAI_TEMPERATURE) || 0.1,
        });

        // Generate session ID if not provided
        const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Analyze response for booking suggestions
        const lowerMessage = message.toLowerCase();
        const lowerResponse = result.text.toLowerCase();
        const suggestsBooking = lowerMessage.includes('agendar') ||
            lowerMessage.includes('consulta') ||
            lowerMessage.includes('horário') ||
            lowerResponse.includes('agendar') ||
            lowerResponse.includes('consulta');

        return res.status(200).json({
            success: true,
            data: {
                response: result.text,
                sessionId: currentSessionId,
                timestamp: new Date().toISOString(),
                suggestsBooking: suggestsBooking,
                model: process.env.XAI_MODEL || "grok-2-1212",
                tokensUsed: result.usage?.totalTokens || 0
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