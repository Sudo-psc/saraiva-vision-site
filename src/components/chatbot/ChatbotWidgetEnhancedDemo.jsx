import React, { useState } from 'react';
import ChatbotWidget from './ChatbotWidget';

/**
 * Demo component to showcase the enhanced ChatbotWidget features
 * 
 * Features demonstrated:
 * - Responsive design
 * - Accessibility compliance
 * - Notification badges
 * - Theme support
 * - Position options
 * - Mobile optimization
 */
const ChatbotWidgetEnhancedDemo = () => {
    const [theme, setTheme] = useState('auto');
    const [position, setPosition] = useState('bottom-right');
    const [enableRealtime, setEnableRealtime] = useState(true);
    const [complianceMode, setComplianceMode] = useState('strict');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Enhanced Chatbot Widget Demo
                </h1>

                {/* Configuration Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Widget Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Theme Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Theme
                            </label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="auto">Auto</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        {/* Position Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Position
                            </label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="center">Center</option>
                            </select>
                        </div>

                        {/* Real-time Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Real-time Features
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={enableRealtime}
                                    onChange={(e) => setEnableRealtime(e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Enable Real-time
                                </span>
                            </label>
                        </div>

                        {/* Compliance Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Compliance Mode
                            </label>
                            <select
                                value={complianceMode}
                                onChange={(e) => setComplianceMode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="strict">Strict</option>
                                <option value="standard">Standard</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📱 Responsive Design
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Mobile-first approach</li>
                            <li>• Touch-friendly interface</li>
                            <li>• Adaptive sizing</li>
                            <li>• Landscape support</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            ♿ Accessibility
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• WCAG 2.1 AA compliant</li>
                            <li>• Screen reader support</li>
                            <li>• Keyboard navigation</li>
                            <li>• High contrast mode</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🔔 Smart Notifications
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Unread message badges</li>
                            <li>• Visual indicators</li>
                            <li>• Minimized state alerts</li>
                            <li>• Appointment reminders</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🎨 Modern UI/UX
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Glass morphism design</li>
                            <li>• Smooth animations</li>
                            <li>• Theme support</li>
                            <li>• Reduced motion support</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            🏥 Medical Compliance
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• CFM regulations</li>
                            <li>• LGPD privacy</li>
                            <li>• Medical disclaimers</li>
                            <li>• Emergency handling</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            ⚡ Real-time Features
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• WebSocket connection</li>
                            <li>• Typing indicators</li>
                            <li>• Message status</li>
                            <li>• Session recovery</li>
                        </ul>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        How to Test
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Desktop Testing
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>1. Click the floating action button</li>
                                <li>2. Try different themes and positions</li>
                                <li>3. Test keyboard navigation (Tab, Enter, Escape)</li>
                                <li>4. Minimize/maximize the widget</li>
                                <li>5. Test with screen reader if available</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Mobile Testing
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>1. Open developer tools and toggle device mode</li>
                                <li>2. Test touch interactions</li>
                                <li>3. Try landscape orientation</li>
                                <li>4. Test on different screen sizes</li>
                                <li>5. Verify touch targets are 44px minimum</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Enhanced Chatbot Widget */}
            <ChatbotWidget
                theme={theme}
                position={position}
                enableRealtime={enableRealtime}
                complianceMode={complianceMode}
                enableAppointmentBooking={true}
                enableReferralRequests={true}
                initialMessage="Olá! Bem-vindo à demonstração do assistente virtual aprimorado da Saraiva Vision. Como posso ajudá-lo hoje?"
            />
        </div>
    );
};

export default ChatbotWidgetEnhancedDemo;