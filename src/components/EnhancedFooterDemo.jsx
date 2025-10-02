import React, { useState } from 'react';
import { BrowserRouter } from '@/utils/router';
import EnhancedFooter from './EnhancedFooter';
import Footer from './Footer';

/**
 * Demo component showing EnhancedFooter as a drop-in replacement for Footer
 * This demonstrates that all existing functionality is preserved while adding enhancements
 */
const EnhancedFooterDemo = () => {
    const [useEnhanced, setUseEnhanced] = useState(true);
    const [glassOpacity, setGlassOpacity] = useState(0.1);
    const [glassBlur, setGlassBlur] = useState(20);
    const [enableAnimations, setEnableAnimations] = useState(true);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                {/* Demo Controls */}
                <div className="bg-white shadow-sm border-b p-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Enhanced Footer Demo</h1>
                        <p className="text-gray-600 mb-4">
                            This demo shows how EnhancedFooter can be used as a drop-in replacement for the original Footer component,
                            preserving all existing functionality while adding modern visual enhancements.
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={useEnhanced}
                                    onChange={(e) => setUseEnhanced(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">
                                    Use Enhanced Footer
                                </span>
                            </label>

                            {useEnhanced && (
                                <>
                                    <label className="flex items-center gap-2">
                                        <span className="text-sm">Glass Opacity:</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="0.3"
                                            step="0.05"
                                            value={glassOpacity}
                                            onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
                                            className="w-20"
                                        />
                                        <span className="text-xs text-gray-500 w-8">
                                            {glassOpacity.toFixed(2)}
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <span className="text-sm">Glass Blur:</span>
                                        <input
                                            type="range"
                                            min="5"
                                            max="40"
                                            step="5"
                                            value={glassBlur}
                                            onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                                            className="w-20"
                                        />
                                        <span className="text-xs text-gray-500 w-8">
                                            {glassBlur}px
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={enableAnimations}
                                            onChange={(e) => setEnableAnimations(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Enable Animations</span>
                                    </label>
                                </>
                            )}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">
                                Currently showing: {useEnhanced ? 'Enhanced Footer' : 'Original Footer'}
                            </h3>
                            <p className="text-sm text-blue-700">
                                {useEnhanced
                                    ? 'Enhanced version with glass morphism effects, 3D social icons, and modern animations while preserving all original functionality.'
                                    : 'Original footer component with standard styling and functionality.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Page Content</h2>
                            <p className="text-gray-600 mb-4">
                                This is sample page content to demonstrate how the footer appears in context.
                                Scroll down to see the footer component in action.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="p-4 bg-gray-50 rounded">
                                    <h3 className="font-medium mb-2">Preserved Functionality</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• All navigation links work exactly the same</li>
                                        <li>• Contact information and external links preserved</li>
                                        <li>• WhatsApp and email links function identically</li>
                                        <li>• Scroll to top button maintains behavior</li>
                                        <li>• Legal information and compliance details intact</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-50 rounded">
                                    <h3 className="font-medium mb-2">Enhanced Features</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Glass morphism background effects</li>
                                        <li>• 3D interactive social media icons</li>
                                        <li>• Smooth animations and transitions</li>
                                        <li>• Enhanced accessibility features</li>
                                        <li>• Performance optimization and graceful degradation</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-medium text-green-900 mb-2">Drop-in Replacement</h3>
                                <p className="text-sm text-green-700">
                                    The EnhancedFooter component can be used as a direct replacement for the original Footer component
                                    without any code changes. Simply import EnhancedFooter instead of Footer and all functionality
                                    will work exactly the same, with added visual enhancements.
                                </p>
                            </div>
                        </div>

                        {/* Spacer to push footer down */}
                        <div className="h-96"></div>
                    </div>
                </div>

                {/* Footer Component */}
                {useEnhanced ? (
                    <EnhancedFooter
                        glassOpacity={glassOpacity}
                        glassBlur={glassBlur}
                        enableAnimations={enableAnimations}
                    />
                ) : (
                    <Footer />
                )}
            </div>
        </BrowserRouter>
    );
};

export default EnhancedFooterDemo;