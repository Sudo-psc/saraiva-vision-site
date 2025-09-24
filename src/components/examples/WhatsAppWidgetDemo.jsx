import React, { useState } from 'react';
import WhatsappWidget from '../WhatsappWidget';
import { whatsappConfig } from '../../config/whatsapp';

const WhatsAppWidgetDemo = () => {
    const [position, setPosition] = useState('bottom-right');
    const [messageType, setMessageType] = useState('default');
    const [showGreeting, setShowGreeting] = useState(true);
    const [customMessage, setCustomMessage] = useState('');

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">WhatsApp Widget Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Widget Configuration</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                            </label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Type
                            </label>
                            <select
                                value={messageType}
                                onChange={(e) => setMessageType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="default">Default</option>
                                <option value="appointment">Appointment</option>
                                <option value="services">Services</option>
                                <option value="emergency">Emergency</option>
                                <option value="contact">Contact</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Message
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Leave empty to use default message"
                                className="w-full p-2 border border-gray-300 rounded-md h-20"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showGreeting"
                                checked={showGreeting}
                                onChange={(e) => setShowGreeting(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="showGreeting" className="text-sm font-medium text-gray-700">
                                Show Greeting Message
                            </label>
                        </div>
                    </div>
                </div>

                {/* Information Panel */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Widget Features</h2>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Responsive design with mobile optimization</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Business hours detection with visual indicators</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Professional greeting messages with doctor avatar</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Deep linking with pre-filled clinic information</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Analytics tracking (Google Analytics & PostHog)</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Accessibility compliance (WCAG 2.1 AA)</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Auto-hide greeting with configurable timing</span>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Pulse animation during business hours</span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                        <h3 className="font-medium text-blue-900 mb-2">Current Configuration:</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                            <div>Phone: {whatsappConfig.phoneNumber}</div>
                            <div>Position: {position}</div>
                            <div>Message Type: {messageType}</div>
                            <div>Show Greeting: {showGreeting ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Example */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Usage Example</h2>

                <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                    {`import WhatsappWidget from '@/components/WhatsappWidget';

// Basic usage
<WhatsappWidget />

// With custom configuration
<WhatsappWidget
  position="${position}"
  messageType="${messageType}"
  showGreeting={${showGreeting}}
  ${customMessage ? `message="${customMessage}"` : ''}
  customGreeting="Custom greeting message"
/>`}
                </pre>
            </div>

            {/* Live Widget */}
            <WhatsappWidget
                position={position}
                messageType={messageType}
                showGreeting={showGreeting}
                message={customMessage || undefined}
                greetingDelay={2000}
                className="demo-widget"
            />
        </div>
    );
};

export default WhatsAppWidgetDemo;