/**
 * Google Reviews Test Page
 * Test page to verify Google Places API integration is working
 */

import React from 'react';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import GoogleReviewsTest from '@/components/GoogleReviewsTest';
import EnhancedFooter from '@/components/EnhancedFooter';

function GoogleReviewsTestPage() {
    return (
        <>
            <SEOHead
                title="Google Reviews API Test - Saraiva Vision"
                description="Testing Google Places API integration for reviews"
            />

            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-20">
                    <div className="py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    Google Reviews API Test
                                </h1>
                                <p className="text-gray-600">
                                    Testing the integration with Google Places API to fetch real reviews
                                </p>
                            </div>

                            <GoogleReviewsTest />
                        </div>
                    </div>
                </main>

                <EnhancedFooter />
            </div>
        </>
    );
}

export default GoogleReviewsTestPage;