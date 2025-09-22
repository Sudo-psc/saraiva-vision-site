# Analytics Implementation Guide

## Overview

This document describes the PostHog analytics integration implemented for Saraiva Vision, including conversion funnel tracking, UTM parameter analysis, Core Web Vitals monitoring, and LGPD compliance features.

## Features Implemented

### ✅ 1. PostHog Analytics Integration
- **Library**: `src/lib/analytics.js`
- **Configuration**: LGPD-compliant setup with opt-out by default
- **Features**:
  - Session recording disabled for privacy
  - Secure cookie configuration
  - Respect for Do Not Track headers
  - Property blacklisting for PII protection

### ✅ 2. Conversion Funnel Tracking
- **Events Tracked**:
  - Page visits
  - Contact form views and submissions
  - Appointment form views and submissions
  - Appointment confirmations
- **Data Sanitization**: No PII stored in analytics events
- **Conversion Rate**: Automatic calculation from funnel data

### ✅ 3. UTM Parameter Tracking
- **Parameters**: Source, medium, campaign, term, content
- **Attribution**: User properties set for campaign attribution
- **Landing Page**: Tracking of entry points and referrers

### ✅ 4. Core Web Vitals Monitoring
- **Metrics**: LCP, FID, CLS, TTFB
- **Integration**: Web Vitals library with PostHog
- **Performance**: Real-time performance monitoring

### ✅ 5. Analytics Dashboard
- **Component**: `src/components/AnalyticsDashboard.jsx`
- **Features**:
  - Funnel visualization
  - Traffic source breakdown
  - Web vitals status indicators
  - Appointment metrics
- **API Integration**: Real-time data from PostHog API

### ✅ 6. LGPD Compliance
- **Consent Management**: `src/components/AnalyticsConsent.jsx`
- **Features**:
  - Explicit consent required
  - Detailed privacy information
  - Easy consent revocation
  - No tracking without consent

## File Structure

```
src/
├── lib/
│   └── analytics.js              # Core analytics library
├── hooks/
│   └── useAnalytics.js          # React hooks for analytics
├── components/
│   ├── AnalyticsDashboard.jsx   # Dashboard component
│   ├── AnalyticsConsent.jsx     # LGPD consent management
│   └── AnalyticsProvider.jsx    # Context provider
├── styles/
│   ├── analytics.css            # Dashboard styles
│   └── consent.css              # Consent banner styles
└── __tests__/
    ├── analytics-simple.test.js # Analytics tests
    └── useAnalytics.test.js     # Hooks tests

api/
├── analytics/
│   ├── funnel.js               # Funnel data API
│   ├── traffic-sources.js      # Traffic source API
│   └── web-vitals.js           # Web vitals API
```

## Environment Variables

Add these to your `.env` file:

```bash
# PostHog Configuration
VITE_POSTHOG_KEY=your_posthog_public_key_here
POSTHOG_API_KEY=your_posthog_api_key_here
POSTHOG_PROJECT_ID=your_posthog_project_id_here
```

## Usage Examples

### Basic Analytics Tracking

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

const MyComponent = () => {
  const { trackFormView, trackFormSubmit, trackInteraction } = useAnalytics();

  useEffect(() => {
    // Track form view when component mounts
    trackFormView('contact');
  }, []);

  const handleSubmit = (formData) => {
    // Track form submission with sanitized data
    trackFormSubmit('contact', {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      consent: formData.consent
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

### Visibility Tracking

```jsx
import { useVisibilityTracking } from '@/hooks/useAnalytics';

const ImportantSection = () => {
  const sectionRef = useVisibilityTracking('important_section_view', {
    threshold: 0.5,
    trackOnce: true
  });

  return (
    <section ref={sectionRef}>
      {/* Content that should be tracked when visible */}
    </section>
  );
};
```

### Manual Event Tracking

```jsx
import analytics from '@/lib/analytics';

// Track custom events
analytics.trackFunnelEvent('custom_event', {
  category: 'engagement',
  value: 'high'
});

// Track user interactions
analytics.trackUserInteraction('click', 'cta_button', {
  button_text: 'Schedule Appointment',
  page_section: 'hero'
});

// Track appointment metrics
analytics.trackAppointmentMetrics('completed', {
  appointment_id: '123',
  service_type: 'consultation'
});
```

## API Endpoints

### Funnel Data
```
GET /api/analytics/funnel?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
{
  "success": true,
  "data": {
    "steps": [
      { "step": 1, "name": "Visita à Página", "count": 1250, "conversion_rate": 100 },
      { "step": 2, "name": "Visualização do Formulário", "count": 180, "conversion_rate": 14.4 }
    ],
    "overall_conversion_rate": 2.24,
    "total_visits": 1250,
    "total_conversions": 28
  }
}
```

### Traffic Sources
```
GET /api/analytics/traffic-sources?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
{
  "success": true,
  "data": {
    "sources": {
      "organic": 65.2,
      "social": 18.7,
      "direct": 12.1,
      "campaigns": 4.0
    },
    "total_tracked_visits": 1250
  }
}
```

### Web Vitals
```
GET /api/analytics/web-vitals?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
{
  "success": true,
  "data": {
    "lcp": { "value": 2.1, "rating": "good" },
    "fid": { "value": 85, "rating": "good" },
    "cls": { "value": 0.08, "rating": "good" },
    "ttfb": { "value": 450, "rating": "good" }
  }
}
```

## LGPD Compliance Features

### Consent Management
- **Explicit Consent**: Users must actively accept analytics tracking
- **Detailed Information**: Clear explanation of data collection
- **Easy Revocation**: One-click consent withdrawal
- **Persistent Storage**: Consent preferences saved in localStorage

### Data Privacy
- **No PII**: Personal information is never sent to analytics
- **Data Sanitization**: Form data is sanitized before tracking
- **Anonymization**: User interactions are tracked anonymously
- **Opt-out Respect**: No tracking when user opts out

### Privacy Controls
```jsx
// Check consent status
const hasConsent = analytics.isEnabled();

// Enable analytics (after consent)
analytics.enable();

// Disable analytics (revoke consent)
analytics.disable();
```

## Testing

Run analytics tests:
```bash
npm test -- --run src/__tests__/analytics-simple.test.js
npm test -- --run src/__tests__/useAnalytics.test.js
```

## Dashboard Integration

The analytics dashboard is integrated into the existing admin dashboard and can be accessed at `/dashboard`. It provides:

- Real-time conversion funnel visualization
- Traffic source breakdown with charts
- Core Web Vitals monitoring with status indicators
- Appointment metrics and completion rates
- Automatic data refresh every 5 minutes

## Performance Considerations

- **Lazy Loading**: Analytics library loaded only when needed
- **Batch Processing**: Events are batched for efficient transmission
- **Error Handling**: Graceful fallbacks when analytics fails
- **Mock Data**: Fallback to mock data when API is unavailable
- **Minimal Impact**: Analytics code optimized for minimal performance impact

## Troubleshooting

### Common Issues

1. **Analytics not tracking**: Check if user has given consent
2. **Dashboard not loading**: Verify PostHog API credentials
3. **Events not appearing**: Check browser console for errors
4. **Consent banner not showing**: Verify localStorage is available

### Debug Mode

Enable debug logging in development:
```javascript
// In browser console
localStorage.setItem('analytics_debug', 'true');
```

### API Testing

Test API endpoints directly:
```bash
curl -X GET "http://localhost:3000/api/analytics/funnel"
curl -X GET "http://localhost:3000/api/analytics/traffic-sources"
curl -X GET "http://localhost:3000/api/analytics/web-vitals"
```

## Next Steps

1. **Production Setup**: Configure PostHog project and API keys
2. **Custom Events**: Add domain-specific tracking events
3. **A/B Testing**: Implement feature flags with PostHog
4. **Advanced Segmentation**: Set up user cohorts and segments
5. **Automated Alerts**: Configure alerts for conversion rate drops

## Requirements Fulfilled

This implementation fulfills all requirements from the specification:

- ✅ **6.1**: Conversion funnel tracking (visit → contact → appointment → confirmation)
- ✅ **6.2**: UTM parameter tracking for traffic source analysis
- ✅ **6.3**: Core Web Vitals monitoring for performance metrics
- ✅ **6.4**: Analytics dashboard with appointment completion rates
- ✅ **6.5**: LGPD compliance for data privacy protection