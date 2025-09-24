import React from 'react';
import XAIChatbotExample from '../components/examples/XAIChatbotExample';
import ChatbotWidgetStream from '../components/ChatbotWidgetStream';

const ChatbotTestPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Teste do Chatbot xAI Grok
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Esta página demonstra a integração do chatbot com xAI Grok usando o AI SDK.
                        O chatbot está configurado especificamente para a Clínica Saraiva Vision.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Example component */}
                    <XAIChatbotExample />

                    {/* Instructions */}
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Configuração do xAI Grok
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">1. Instalar dependências:</h3>
                                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                                    npm install @ai-sdk/xai ai
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">2. Configurar variáveis de ambiente:</h3>
                                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                                    XAI_API_KEY=your_xai_api_key_here<br/>
                                    XAI_MODEL=grok-2-1212<br/>
                                    XAI_MAX_TOKENS=8192<br/>
                                    XAI_TEMPERATURE=0.1
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">3. Código básico do API:</h3>
                                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto">
{`import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

const result = await streamText({
  model: xai("grok-2-1212"),
  prompt: "Sua pergunta aqui",
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}`}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">4. Widget do chatbot:</h3>
                                <p className="text-gray-600 text-sm">
                                    O widget do chatbot aparece no canto inferior direito da tela.
                                    Clique no ícone para abrir e testar a integração.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating chatbot widget */}
            <ChatbotWidgetStream />
        </div>
    );
};

export default ChatbotTestPage;