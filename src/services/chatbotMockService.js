/**
 * Mock Chatbot Service for Development
 * Simulates chatbot responses when API is not available
 */

export class ChatbotMockService {
    static async generateResponse(message, sessionId) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const lowerMessage = message.toLowerCase();
        let response = '';

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

        return {
            success: true,
            data: {
                response: response,
                sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                suggestsBooking: lowerMessage.includes('agendar') || lowerMessage.includes('consulta'),
                isEmergency: false,
                containsMedicalKeywords: lowerMessage.includes('dor') || lowerMessage.includes('problema')
            }
        };
    }
}