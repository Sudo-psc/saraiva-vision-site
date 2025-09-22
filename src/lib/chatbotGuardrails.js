// Medical guardrails and safety utilities for the chatbot system

export const MEDICAL_GUARDRAILS = {
    // Keywords that should trigger medical disclaimers
    MEDICAL_KEYWORDS: [
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
    ],

    // Emergency keywords that require immediate medical attention
    EMERGENCY_KEYWORDS: [
        'emergência', 'urgente', 'socorro', 'ajuda',
        'perdi a visão', 'não enxergo nada', 'cegueira súbita',
        'dor intensa', 'dor forte', 'muita dor',
        'trauma ocular', 'objeto no olho', 'perfuração',
        'químico no olho', 'produto químico',
        'sangramento', 'muito sangue',
        'acidente', 'batida no olho'
    ],

    // Prohibited diagnostic terms
    DIAGNOSTIC_TERMS: [
        'diagnóstico', 'diagnosticar', 'você tem', 'é provável que seja',
        'parece ser', 'pode ser', 'talvez seja', 'provavelmente',
        'catarata', 'glaucoma', 'retinopatia', 'degeneração macular',
        'ceratocone', 'pterígio', 'conjuntivite', 'uveíte',
        'descolamento', 'hemorragia', 'edema'
    ]
};

export const SYSTEM_PROMPT = `Você é um assistente virtual da Clínica Saraiva Vision, especializada em oftalmologia em Caratinga-MG. 

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

Para dúvidas sobre procedimentos:
"Posso explicar como funciona o procedimento de forma geral, mas cada caso é único. Durante a consulta, Dr. Philipe poderá avaliar sua situação específica e esclarecer todas as suas dúvidas detalhadamente."

IMPORTANTE: Sempre mantenha-se dentro dos limites éticos e legais da prática médica. Quando em dúvida, sempre direcione para consulta presencial.`;

export const EMERGENCY_RESPONSE = `⚠️ ATENÇÃO: Situações como essa podem requerer atendimento médico IMEDIATO.

🚨 PROCURE AJUDA AGORA:
• Pronto-socorro mais próximo
• Ligue para emergência: 192 (SAMU)
• Entre em contato conosco: (33) 99860-1427

A Clínica Saraiva Vision está localizada na Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG.

Não deixe para depois - sua visão é preciosa! 👁️`;

export const MEDICAL_DISCLAIMER = `⚠️ IMPORTANTE: Não posso fornecer diagnósticos ou conselhos médicos específicos através do chat.

Para uma avaliação adequada, é essencial realizar uma consulta presencial onde Dr. Philipe poderá:
• Examinar seus olhos detalhadamente
• Avaliar seu histórico médico
• Realizar exames específicos se necessário
• Fornecer orientações personalizadas

📞 Agende sua consulta: (33) 99860-1427
💬 WhatsApp: (33) 99860-1427
📍 Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG`;

// Function to check if message contains medical keywords
export function containsMedicalKeywords(message) {
    const lowerMessage = message.toLowerCase();
    return MEDICAL_GUARDRAILS.MEDICAL_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );
}

// Function to check if message indicates emergency
export function isEmergencyMessage(message) {
    const lowerMessage = message.toLowerCase();
    return MEDICAL_GUARDRAILS.EMERGENCY_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );
}

// Function to check if response contains prohibited diagnostic terms
export function containsDiagnosticTerms(response) {
    const lowerResponse = response.toLowerCase();
    return MEDICAL_GUARDRAILS.DIAGNOSTIC_TERMS.some(term =>
        lowerResponse.includes(term.toLowerCase())
    );
}

// Function to sanitize bot response
export function sanitizeBotResponse(response, userMessage) {
    let sanitizedResponse = response;

    // Check for emergency situations
    if (isEmergencyMessage(userMessage)) {
        return EMERGENCY_RESPONSE;
    }

    // Check for medical keywords in user message
    if (containsMedicalKeywords(userMessage)) {
        sanitizedResponse += '\n\n' + MEDICAL_DISCLAIMER;
    }

    // Check if bot response contains diagnostic terms
    if (containsDiagnosticTerms(sanitizedResponse)) {
        sanitizedResponse = MEDICAL_DISCLAIMER + '\n\nPara informações gerais sobre procedimentos e serviços, posso ajudar. Mas para avaliação de sintomas específicos, é importante uma consulta presencial.';
    }

    return sanitizedResponse;
}

// Context management for conversation
export class ConversationContext {
    constructor() {
        this.maxMessages = 10; // Keep last 10 messages for context
        this.medicalTopicCount = 0;
        this.emergencyMentioned = false;
    }

    // Process and filter conversation history
    processHistory(messages) {
        // Keep only the most recent messages
        const recentMessages = messages.slice(-this.maxMessages);

        // Count medical topics mentioned
        this.medicalTopicCount = recentMessages.filter(msg =>
            msg.role === 'user' && containsMedicalKeywords(msg.content)
        ).length;

        // Check if emergency was mentioned
        this.emergencyMentioned = recentMessages.some(msg =>
            msg.role === 'user' && isEmergencyMessage(msg.content)
        );

        return recentMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }

    // Get context-aware system prompt
    getContextualPrompt() {
        let prompt = SYSTEM_PROMPT;

        if (this.emergencyMentioned) {
            prompt += '\n\nIMPORTANTE: O usuário mencionou uma possível emergência. Priorize orientações para buscar atendimento médico imediato.';
        } else if (this.medicalTopicCount >= 3) {
            prompt += '\n\nNOTA: O usuário tem feito várias perguntas médicas. Reforce a importância de uma consulta presencial para avaliação adequada.';
        }

        return prompt;
    }

    // Check if conversation should be escalated
    shouldEscalate() {
        return this.emergencyMentioned || this.medicalTopicCount >= 5;
    }
}

export default {
    MEDICAL_GUARDRAILS,
    SYSTEM_PROMPT,
    EMERGENCY_RESPONSE,
    MEDICAL_DISCLAIMER,
    containsMedicalKeywords,
    isEmergencyMessage,
    containsDiagnosticTerms,
    sanitizeBotResponse,
    ConversationContext
};