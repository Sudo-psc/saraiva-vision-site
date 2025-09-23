/**
 * Analytics Demo Page
 * Demonstrates analytics integration and dashboard components
 */

import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAnalytics } from '../hooks/useAnalytics';
import '../styles/analytics.css';
import '../styles/consent.css';

const AnalyticsDemo = () => {
    const { trackEvent, trackInteraction, trackFormView, isEnabled } = useAnalytics();

    const handleTestEvent = (eventType) => {
        switch (eventType) {
            case 'contact_form_view':
                trackFormView('contact');
                break;
            case 'appointment_form_view':
                trackFormView('appointment');
                break;
            case 'button_click':
                trackInteraction('click', 'demo_button', { demo: true });
                break;
            case 'page_visit':
                trackEvent('page_visit');
                break;
            default:
                console.log('Unknown event type');
        }
    };

    return (
        <div className="analytics-demo-page">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Analytics Integration Demo</h1>

                {/* Analytics Status */}
                <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Analytics Status</h2>
                    <p className="mb-2">
                        <strong>Status:</strong> {isEnabled() ? '✅ Enabled' : '❌ Disabled'}
                    </p>
                    <p className="text-sm text-gray-600">
                        Analytics tracking is {isEnabled() ? 'active' : 'inactive'}.
                        {!isEnabled() && ' Please accept cookies to enable analytics.'}
                    </p>
                </div>

                {/* Test Buttons */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Test Analytics Events</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => handleTestEvent('page_visit')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Track Page Visit
                        </button>
                        <button
                            onClick={() => handleTestEvent('contact_form_view')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Track Contact Form View
                        </button>
                        <button
                            onClick={() => handleTestEvent('appointment_form_view')}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            Track Appointment Form View
                        </button>
                        <button
                            onClick={() => handleTestEvent('button_click')}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                        >
                            Track Button Click
                        </button>
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
                    <AnalyticsDashboard />
                </div>

                {/* Implementation Notes */}
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>PostHog analytics integration with LGPD compliance</li>
                        <li>Conversion funnel tracking: visit → contact → appointment → confirmation</li>
                        <li>UTM parameter tracking for traffic source analysis</li>
                        <li>Core Web Vitals monitoring for performance insights</li>
                        <li>Appointment completion rate tracking</li>
                        <li>User consent management with cookie banner</li>
                        <li>Real-time analytics dashboard with API integration</li>
                        <li>Privacy-first approach - no PII in analytics events</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDemo;