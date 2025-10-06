import React, { useEffect } from 'react';

const ErrorTracking = ({ data }) => {
  useEffect(() => {
    if (!data) return;

    // Send error data to backend for analysis
    const trackError404 = async () => {
      try {
        // Store in localStorage for analytics
        const existingErrors = JSON.parse(localStorage.getItem('404_errors') || '[]');
        const newError = {
          ...data,
          id: Date.now().toString(),
          sessionId: sessionStorage.getItem('sessionId') || 'unknown'
        };

        // Keep only last 50 errors
        existingErrors.push(newError);
        if (existingErrors.length > 50) {
          existingErrors.shift();
        }

        localStorage.setItem('404_errors', JSON.stringify(existingErrors));

        // Send to backend if available
        await fetch('/api/track-404', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newError)
        });

        // Console logging for debugging
        console.group('🔍 404 Error Tracking');
        console.log('URL:', data.attemptedUrl);
        console.log('Referrer:', data.referrer);
        console.log('Timestamp:', data.timestamp);
        console.log('User Agent:', data.userAgent);
        console.groupEnd();

      } catch (error) {
        // Silently fail - don't let tracking errors break the user experience
        console.warn('Error tracking failed:', error);
      }
    };

    trackError404();
  }, [data]);

  // This component doesn't render anything visible
  return null;
};

export default ErrorTracking;