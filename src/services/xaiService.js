/**
 * xAI (Grok) Service
 * Handles integration with xAI API using AI SDK
 */

import { xai } from "@ai-sdk/xai";
import { generateText, streamText } from "ai";

class XAIService {
    constructor() {
        this.model = null;
        this.isConfigured = false;
        this.init();
    }

    init() {
        try {
            if (process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your_xai_api_key_here') {
                this.model = xai(process.env.XAI_MODEL || "grok-2-1212");
                this.isConfigured = true;
                console.log('xAI Service initialized successfully');
            } else {
                console.warn('XAI_API_KEY not found or not configured in environment variables');
                this.isConfigured = false;
            }
        } catch (error) {
            console.error('Failed to initialize xAI Service:', error);
            this.isConfigured = false;
        }
    }

    /**
     * Generate a single response using xAI
     */
    async generateResponse(prompt, systemPrompt = null, options = {}) {
        if (!this.isConfigured) {
            throw new Error('xAI Service not configured');
        }

        try {
            const config = {
                model: this.model,
                prompt: prompt,
                maxTokens: options.maxTokens || parseInt(process.env.XAI_MAX_TOKENS) || 1000,
                temperature: options.temperature || parseFloat(process.env.XAI_TEMPERATURE) || 0.1,
            };

            if (systemPrompt) {
                config.system = systemPrompt;
            }

            const result = await generateText(config);

            return {
                text: result.text,
                usage: result.usage,
                finishReason: result.finishReason
            };
        } catch (error) {
            console.error('xAI generation error:', error);
            throw error;
        }
    }

    /**
     * Generate a streaming response using xAI
     */
    async generateStreamingResponse(prompt, systemPrompt = null, options = {}) {
        if (!this.isConfigured) {
            throw new Error('xAI Service not configured');
        }

        try {
            const config = {
                model: this.model,
                prompt: prompt,
                maxTokens: options.maxTokens || parseInt(process.env.XAI_MAX_TOKENS) || 1000,
                temperature: options.temperature || parseFloat(process.env.XAI_TEMPERATURE) || 0.1,
            };

            if (systemPrompt) {
                config.system = systemPrompt;
            }

            const result = await streamText(config);
            return result;
        } catch (error) {
            console.error('xAI streaming error:', error);
            throw error;
        }
    }

    /**
     * Get the system prompt for Clínica Saraiva Vision
     */
    getClinicSystemPrompt() {
        return `Você é o assistente virtual da Clínica Saraiva Vision, uma clínica oftalmológica em Caratinga-MG. 

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
8. Sempre termine com uma pergunta ou sugestão de próximo passo

IMPORTANTE: Para qualquer sintoma ocular, dor, perda de visão ou emergência, sempre recomende procurar atendimento médico imediato.

EXEMPLOS DE EMERGÊNCIA:
- Perda súbita de visão
- Dor ocular intensa
- Flashes de luz ou moscas volantes súbitas
- Trauma ocular
- Vermelhidão intensa com dor

Para estes casos, sempre recomende: "Esta situação requer atenção médica imediata. Procure o pronto-socorro mais próximo ou entre em contato conosco urgentemente pelo (33) 99860-1427."`;
    }

    /**
     * Generate a chatbot response for the clinic
     */
    async generateClinicResponse(userMessage, options = {}) {
        const systemPrompt = this.getClinicSystemPrompt();

        try {
            const result = await this.generateResponse(userMessage, systemPrompt, options);

            // Analyze for booking suggestions
            const lowerMessage = userMessage.toLowerCase();
            const lowerResponse = result.text.toLowerCase();
            const suggestsBooking = lowerMessage.includes('agendar') ||
                lowerMessage.includes('consulta') ||
                lowerMessage.includes('horário') ||
                lowerResponse.includes('agendar') ||
                lowerResponse.includes('consulta');

            return {
                ...result,
                suggestsBooking,
                isEmergency: this.detectEmergency(userMessage)
            };
        } catch (error) {
            console.error('Clinic response generation error:', error);
            throw error;
        }
    }

    /**
     * Detect emergency keywords in user message
     */
    detectEmergency(message) {
        const emergencyKeywords = [
            'emergência', 'socorro', 'dor intensa', 'perda de visão',
            'sangramento', 'acidente', 'trauma', 'não consigo ver',
            'visão turva súbita', 'flashes', 'moscas volantes'
        ];

        const lowerMessage = message.toLowerCase();
        return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Check if service is properly configured
     */
    isReady() {
        return this.isConfigured;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            model: process.env.XAI_MODEL || "grok-2-1212",
            hasApiKey: !!process.env.XAI_API_KEY
        };
    }
}

// Export singleton instance
export default new XAIService();