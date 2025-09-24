/**
 * Simplified Chatbot API - Minimal Implementation
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: { message: 'Method not allowed' }
        });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: { message: 'Message is required' }
            });
        }

        // Simple Gemini API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Você é o assistente virtual da Clínica Saraiva Vision em Caratinga-MG. Responda de forma profissional e acolhedora sobre oftalmologia. Nunca dê diagnósticos médicos. Para emergências, oriente procurar atendimento imediato.

Usuário: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua mensagem.';

        return res.status(200).json({
            success: true,
            data: {
                response: botResponse,
                sessionId: `session_${Date.now()}`,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Erro interno. Tente novamente ou entre em contato pelo telefone (33) 99860-1427.'
            }
        });
    }
}