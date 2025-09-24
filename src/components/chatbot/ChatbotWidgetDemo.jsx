import React, { useState } from 'react';
import { Settings, Monitor, Smartphone, Palette, Shield, Wifi } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';

/**
 * Chatbot Widget Demo Component
 * 
 * Demonstrates all features and configurations of the chatbot widget
 * Includes theme switching, position controls, and feature toggles
 */
const ChatbotWidgetDemo = () => {
    // Demo configuration state
    const [config, setConfig] = useState({
        theme: 'auto',
        position: 'bottom-right',
        enableAppointmentBooking: true,
        enableReferralRequests: true,
        enableRealtime: true,
        complianceMode: 'strict',
        initialMessage: 'Olá! Sou o assistente virtual da Clínica Saraiva Vision. Como posso ajudá-lo hoje?'
    });

    const [showSettings, setShowSettings] = useState(false);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const resetConfig = () => {
        setConfig({
            theme: 'auto',
            position: 'bottom-right',
            enableAppointmentBooking: true,
            enableReferralRequests: true,
            enableRealtime: true,
            complianceMode: 'strict',
            initialMessage: 'Olá! Sou o assistente virtual da Clínica Saraiva Vision. Como posso ajudá-lo hoje?'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Chatbot Widget Demo
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Demonstração completa do assistente virtual da Clínica Saraiva Vision
                    </p>

                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Settings size={16} />
                            <span>Configurações</span>
                        </button>

                        <button
                            onClick={resetConfig}
                            className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <span>Resetar</span>
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            Configurações do Widget
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Theme Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Palette size={16} className="inline mr-2" />
                                    Tema
                                </label>
                                <select
                                    value={config.theme}
                                    onChange={(e) => updateConfig('theme', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="auto">Automático</option>
                                    <option value="light">Claro</option>
                                    <option value="dark">Escuro</option>
                                </select>
                            </div>

                            {/* Position Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Monitor size={16} className="inline mr-2" />
                                    Posição
                                </label>
                                <select
                                    value={config.position}
                                    onChange={(e) => updateConfig('position', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="bottom-right">Inferior Direita</option>
                                    <option value="bottom-left">Inferior Esquerda</option>
                                    <option value="center">Centro</option>
                                </select>
                            </div>

                            {/* Compliance Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Shield size={16} className="inline mr-2" />
                                    Modo de Conformidade
                                </label>
                                <select
                                    value={config.complianceMode}
                                    onChange={(e) => updateConfig('complianceMode', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="strict">Rigoroso (CFM + LGPD)</option>
                                    <option value="standard">Padrão</option>
                                </select>
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Recursos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={config.enableAppointmentBooking}
                                        onChange={(e) => updateConfig('enableAppointmentBooking', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Agendamento de Consultas
                                    </span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={config.enableReferralRequests}
                                        onChange={(e) => updateConfig('enableReferralRequests', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Solicitação de Encaminhamentos
                                    </span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={config.enableRealtime}
                                        onChange={(e) => updateConfig('enableRealtime', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                        <Wifi size={14} className="mr-1" />
                                        Recursos em Tempo Real
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Initial Message */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mensagem Inicial
                            </label>
                            <textarea
                                value={config.initialMessage}
                                onChange={(e) => updateConfig('initialMessage', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Digite a mensagem de boas-vindas..."
                            />
                        </div>
                    </div>
                )}

                {/* Feature Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Responsive Design */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <Smartphone size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Design Responsivo
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Interface adaptável para dispositivos móveis e desktop com suporte completo a touch e teclado.
                        </p>
                    </div>

                    {/* Accessibility */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <Shield size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                WCAG 2.1 AA
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Conformidade total com diretrizes de acessibilidade, incluindo suporte a leitores de tela.
                        </p>
                    </div>

                    {/* Real-time Features */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                <Wifi size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Tempo Real
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            WebSocket para indicadores de digitação, status de mensagens e recuperação de sessão.
                        </p>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Como Usar
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                Recursos Principais
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>• Clique no botão flutuante para abrir o chat</li>
                                <li>• Digite mensagens e pressione Enter para enviar</li>
                                <li>• Use Escape para fechar o widget</li>
                                <li>• Botões de ação rápida para WhatsApp e agendamentos</li>
                                <li>• Indicadores de status de mensagem em tempo real</li>
                                <li>• Recuperação automática de sessões anteriores</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                Conformidade e Segurança
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>• Avisos de conformidade CFM para conteúdo médico</li>
                                <li>• Proteção de dados conforme LGPD</li>
                                <li>• Criptografia end-to-end das conversas</li>
                                <li>• Detecção automática de emergências médicas</li>
                                <li>• Filtros de segurança para conteúdo médico</li>
                                <li>• Auditoria completa de todas as interações</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Current Configuration Display */}
                <div className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Configuração Atual
                    </h3>
                    <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(config, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Chatbot Widget */}
            <ChatbotWidget
                initialMessage={config.initialMessage}
                theme={config.theme}
                position={config.position}
                enableAppointmentBooking={config.enableAppointmentBooking}
                enableReferralRequests={config.enableReferralRequests}
                enableRealtime={config.enableRealtime}
                complianceMode={config.complianceMode}
            />
        </div>
    );
};

export default ChatbotWidgetDemo;