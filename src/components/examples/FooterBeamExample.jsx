import React from 'react';
import { FooterBeamBackground } from '../ui/footer-beam-background';

/**
 * Example usage of FooterBeamBackground component
 * This demonstrates how to integrate the beam background system for footer context
 */
export const FooterBeamExample = () => {
    return (
        <div className="min-h-screen bg-slate-900">
            {/* Main content area */}
            <div className="h-screen flex items-center justify-center">
                <div className="text-white text-center">
                    <h1 className="text-4xl font-bold mb-4">Main Content</h1>
                    <p className="text-slate-300">Scroll down to see the footer with beam effects</p>
                </div>
            </div>

            {/* Footer with beam background */}
            <FooterBeamBackground
                intensity="medium"
                colorScheme="brand"
                className="bg-slate-800 text-white"
            >
                <footer className="py-16 px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {/* Company Info */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Saraiva Vision</h3>
                                <p className="text-slate-300 mb-4">
                                    Providing exceptional eye care services with modern technology and personalized attention.
                                </p>
                                <div className="text-slate-400 text-sm">
                                    <p>Dr. Philipe Saraiva</p>
                                    <p>CRM: 12345-MG</p>
                                </div>
                            </div>

                            {/* Services */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Services</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li>Comprehensive Eye Exams</li>
                                    <li>Cataract Surgery</li>
                                    <li>Glaucoma Treatment</li>
                                    <li>Retinal Care</li>
                                    <li>Contact Lenses</li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Contact</h3>
                                <div className="space-y-2 text-slate-300">
                                    <p>📍 Caratinga, MG</p>
                                    <p>📞 (33) 3321-1234</p>
                                    <p>✉️ contato@saraivavision.com.br</p>
                                    <p>🕒 Mon-Fri: 8AM-6PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom section */}
                        <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
                            <p>&copy; 2024 Saraiva Vision. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </FooterBeamBackground>
        </div>
    );
};

/**
 * Example with different intensity levels
 */
export const FooterBeamIntensityExample = () => {
    const [intensity, setIntensity] = React.useState('medium');
    const [colorScheme, setColorScheme] = React.useState('brand');

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Controls */}
            <div className="p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Footer Beam Background Controls</h2>

                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Intensity:</label>
                        <select
                            value={intensity}
                            onChange={(e) => setIntensity(e.target.value)}
                            className="bg-slate-700 text-white px-3 py-2 rounded"
                        >
                            <option value="subtle">Subtle</option>
                            <option value="medium">Medium</option>
                            <option value="strong">Strong</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Color Scheme:</label>
                        <select
                            value={colorScheme}
                            onChange={(e) => setColorScheme(e.target.value)}
                            className="bg-slate-700 text-white px-3 py-2 rounded"
                        >
                            <option value="brand">Brand (Blue)</option>
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer with configurable beam background */}
            <FooterBeamBackground
                intensity={intensity}
                colorScheme={colorScheme}
                className="bg-slate-800 text-white mt-8"
            >
                <footer className="py-16 px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Footer with {intensity} intensity and {colorScheme} color scheme
                        </h3>
                        <p className="text-slate-300 mb-8">
                            The beam background adapts to device capabilities and user preferences automatically.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div>
                                <h4 className="font-semibold mb-2">Features:</h4>
                                <ul className="text-slate-300 space-y-1">
                                    <li>• Performance-optimized animations</li>
                                    <li>• Respects reduced motion preferences</li>
                                    <li>• Device capability detection</li>
                                    <li>• Brand color integration</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Responsive Design:</h4>
                                <ul className="text-slate-300 space-y-1">
                                    <li>• Mobile-optimized effects</li>
                                    <li>• Tablet touch interactions</li>
                                    <li>• Desktop full-resolution</li>
                                    <li>• Orientation change handling</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </FooterBeamBackground>
        </div>
    );
};

export default FooterBeamExample;