# 🎯 PostHog Feature Flags Implementation

**Complete PostHog analytics and feature flags integration for Saraiva Vision website with Instagram integration control.**

## 🚀 **IMPLEMENTATION OVERVIEW**

### ✅ **COMPLETE INTEGRATION**

**1. PostHog Setup**
- PostHog JavaScript library installed and configured
- Environment variables configured for API keys
- Provider pattern for React context integration
- Feature flags with default fallbacks

**2. Feature Flag System**
- `instagram_integration` - Controls Instagram feed visibility
- `instagram_web_crawler` - Controls web crawler usage
- `instagram_real_data` - Controls real vs fallback data
- `analytics_enabled` - Controls PostHog analytics tracking

**3. Instagram Integration Control**
- Feature flag-controlled Instagram feed rendering
- Automatic tracking of Instagram interactions
- Graceful fallbacks when features are disabled
- Loading states while feature flags load

## 📁 **FILE STRUCTURE**

```
src/
├── lib/
│   └── posthog.js                     # PostHog configuration and utilities
├── contexts/
│   └── PostHogContext.jsx             # React context provider
├── hooks/
│   └── useFeatureFlags.js             # Simple feature flags hook
├── components/
│   ├── FeatureFlagsDemo.jsx           # Admin demo component
│   └── instagram/
│       └── InstagramFeedContainer.jsx  # Updated with feature flags
└── pages/
    └── DashboardPage.jsx              # Added feature flags admin page
```

## 🛠️ **USAGE PATTERNS**

### **Pattern 1: Wait for Feature Flags to Load**

```javascript
// Import PostHog
import { posthog } from '../lib/posthog';

// Ensure flags are loaded before usage
posthog.onFeatureFlags(function() {
    // feature flags should be available at this point
    if (posthog.isFeatureEnabled('instagram_integration')) {
        // Initialize Instagram component
        loadInstagramFeed();
    }
});
```

### **Pattern 2: Direct Feature Flag Check**

```javascript
// Direct check (after flags are loaded)
if (posthog.isFeatureEnabled('instagram_integration')) {
    // Show Instagram integration
    renderInstagramWidget();
} else {
    // Show alternative content
    renderFallbackContent();
}
```

### **Pattern 3: React Hook Usage**

```javascript
import useFeatureFlags from '../hooks/useFeatureFlags';

const MyComponent = () => {
    const { isFeatureEnabled, onFeatureFlags, isLoaded } = useFeatureFlags();
    
    // Wait for flags to load
    useEffect(() => {
        onFeatureFlags(() => {
            if (isFeatureEnabled('instagram_integration')) {
                // Do something after flags are loaded
            }
        });
    }, []);
    
    // Or check directly
    if (isFeatureEnabled('instagram_integration')) {
        return <InstagramFeed />;
    }
    
    return <AlternativeContent />;
};
```

### **Pattern 4: Instagram-Specific Hook**

```javascript
import { useInstagramFeatureFlags } from '../contexts/PostHogContext';

const InstagramComponent = () => {
    const {
        isLoaded,
        isEnabled,
        isWebCrawlerEnabled,
        isRealDataEnabled,
        trackEvent
    } = useInstagramFeatureFlags();
    
    if (!isLoaded) {
        return <LoadingSpinner />;
    }
    
    if (!isEnabled()) {
        return <DisabledMessage />;
    }
    
    // Track user interactions
    const handleClick = () => {
        trackEvent('instagram_click', { timestamp: new Date() });
    };
    
    return <InstagramFeed onClick={handleClick} />;
};
```

## 🔧 **CONFIGURATION**

### **Environment Variables**

```bash
# PostHog Configuration
VITE_POSTHOG_KEY=your_posthog_public_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=your_posthog_api_key_here
POSTHOG_PROJECT_ID=your_posthog_project_id_here
```

### **PostHog Project Setup**

1. **Create PostHog Account**: Sign up at [posthog.com](https://posthog.com)

2. **Create Feature Flags in PostHog Dashboard**:
   - `instagram_integration` (Boolean) - Default: `true`
   - `instagram_web_crawler` (Boolean) - Default: `true`  
   - `instagram_real_data` (Boolean) - Default: `true`
   - `analytics_enabled` (Boolean) - Default: `true`

3. **Configure Release Conditions**:
   - Set percentage rollouts (0-100%)
   - Target specific user groups
   - Geographic targeting
   - Custom user properties

## 📊 **FEATURE FLAG CONTROLS**

### **instagram_integration**
```javascript
// Controls entire Instagram integration visibility
if (posthog.isFeatureEnabled('instagram_integration')) {
    // Show Instagram feed component
    // Enable Instagram-related features
    // Display Instagram content
} else {
    // Hide Instagram integration
    // Show alternative content
    // Disable Instagram features
}
```

### **instagram_web_crawler**
```javascript
// Controls web crawler usage
if (posthog.isFeatureEnabled('instagram_web_crawler')) {
    // Use web crawler to fetch real Instagram data
    fetchDataViaWebCrawler();
} else {
    // Use alternative data sources or fallback
    useFallbackData();
}
```

### **instagram_real_data**
```javascript
// Controls real vs demo data
if (posthog.isFeatureEnabled('instagram_real_data')) {
    // Fetch and display real Instagram posts
    displayRealInstagramData();
} else {
    // Use realistic fallback data
    displayFallbackData();
}
```

### **analytics_enabled**
```javascript
// Controls PostHog analytics tracking
if (posthog.isFeatureEnabled('analytics_enabled')) {
    // Track user events
    posthog.capture('user_action', { data });
} else {
    // Skip analytics tracking
    console.log('Analytics disabled');
}
```

## 🎛️ **ADMIN INTERFACE**

### **Feature Flags Demo Page**

Access the admin demo at `/admin/feature-flags`:

- **Real-time Status**: Shows feature flag loading state
- **Flag Testing**: Test individual flags with buttons
- **Code Examples**: Copy-paste code snippets
- **Usage Patterns**: Both PostHog patterns demonstrated
- **Live Results**: See flag values and their effects

### **Integration Testing**

```javascript
// Test feature flag changes
const testFlags = () => {
    // Method 1: Using callback
    posthog.onFeatureFlags(() => {
        console.log('Instagram integration:', 
            posthog.isFeatureEnabled('instagram_integration'));
    });
    
    // Method 2: Direct check
    console.log('Web crawler enabled:', 
        posthog.isFeatureEnabled('instagram_web_crawler'));
};
```

## 📈 **ANALYTICS TRACKING**

### **Automatic Event Tracking**

The Instagram component automatically tracks:

```javascript
// Fetch attempts
trackInstagramEvent('fetch_attempt', {
    force: boolean,
    webCrawlerEnabled: boolean,
    realDataEnabled: boolean,
    timestamp: string
});

// Successful fetches
trackInstagramEvent('fetch_success', {
    source: string,
    postCount: number,
    cached: boolean,
    webCrawlerUsed: boolean,
    timestamp: string
});

// Fetch errors
trackInstagramEvent('fetch_error', {
    error: string,
    errorType: string,
    shouldShowFallback: boolean,
    hasFallbackData: boolean,
    timestamp: string
});

// Post interactions
trackInstagramEvent('post_click', {
    postId: string,
    postIndex: number,
    username: string,
    hasPermalink: boolean,
    source: string,
    timestamp: string
});

// Feature flag actions
trackInstagramEvent('integration_disabled', {
    reason: 'feature_flag',
    timestamp: string
});
```

### **Custom Event Tracking**

```javascript
import { Analytics } from '../lib/posthog';

// Track custom events
Analytics.track('custom_event', {
    property1: 'value1',
    property2: 'value2'
});

// Track page views
Analytics.trackPageView('home_page');

// Identify users
Analytics.identify('user_123', {
    email: 'user@example.com',
    plan: 'premium'
});
```

## 🔒 **PRIVACY & COMPLIANCE**

### **LGPD Compliance**
- Feature flag to disable all analytics: `analytics_enabled`
- Respect user preferences for tracking
- No sensitive data in event properties
- User identification only when consented

### **Security Features**
- API keys are client-safe (public keys only)
- No server-side secrets exposed to frontend
- Input sanitization for tracked events
- Rate limiting on event tracking

## 🧪 **TESTING STRATEGIES**

### **Feature Flag Testing**

```javascript
// Test with mocked PostHog
jest.mock('../lib/posthog', () => ({
    posthog: {
        isFeatureEnabled: jest.fn(),
        onFeatureFlags: jest.fn(callback => callback()),
        capture: jest.fn()
    }
}));

// Test component with flags enabled
test('shows Instagram feed when flag enabled', () => {
    posthog.isFeatureEnabled.mockReturnValue(true);
    render(<InstagramComponent />);
    expect(screen.getByTestId('instagram-feed')).toBeInTheDocument();
});

// Test component with flags disabled
test('hides Instagram feed when flag disabled', () => {
    posthog.isFeatureEnabled.mockReturnValue(false);
    render(<InstagramComponent />);
    expect(screen.queryByTestId('instagram-feed')).not.toBeInTheDocument();
});
```

### **Manual Testing**

1. **Enable/disable flags in PostHog dashboard**
2. **Refresh page and verify behavior changes**
3. **Check browser console for tracking events**
4. **Test loading states before flags load**
5. **Verify fallback behavior when flags are disabled**

## 🚀 **DEPLOYMENT**

### **Vercel Environment Variables**

```bash
# Add to Vercel project settings
vercel env add VITE_POSTHOG_KEY
vercel env add VITE_POSTHOG_HOST
vercel env add POSTHOG_API_KEY
vercel env add POSTHOG_PROJECT_ID
```

### **Build & Deploy**

```bash
# Build with PostHog integration
npm run build

# Deploy to Vercel
vercel --prod
```

### **Production Verification**

1. **Check PostHog dashboard for incoming events**
2. **Verify feature flags are loading correctly**
3. **Test flag changes reflect in production**
4. **Monitor for any console errors**
5. **Validate analytics data collection**

## 📋 **TROUBLESHOOTING**

### **Common Issues**

**Feature flags not loading:**
- Check VITE_POSTHOG_KEY is set correctly
- Verify PostHog project is active
- Check browser console for errors
- Ensure flags are created in PostHog dashboard

**Events not tracking:**
- Verify `analytics_enabled` flag is true
- Check POSTHOG_API_KEY configuration
- Ensure user has consented to tracking
- Check network tab for failed requests

**Instagram integration not responding to flags:**
- Verify flag names match exactly
- Check component is using useInstagramFeatureFlags hook
- Ensure flags are loaded before checking
- Test with PostHog debug mode enabled

### **Debug Mode**

```javascript
// Enable in development
if (import.meta.env.DEV) {
    posthog.debug(true);
}

// Check flag loading status
console.log('PostHog loaded:', posthog.isFeatureEnabled('any_flag') !== undefined);

// Verify flag values
console.log('Flags:', {
    instagram: posthog.isFeatureEnabled('instagram_integration'),
    crawler: posthog.isFeatureEnabled('instagram_web_crawler'),
    realData: posthog.isFeatureEnabled('instagram_real_data'),
    analytics: posthog.isFeatureEnabled('analytics_enabled')
});
```

## 🎉 **SUMMARY**

The PostHog feature flags integration provides:

1. **Complete Instagram Control**: Enable/disable Instagram integration remotely
2. **A/B Testing Ready**: Test different Instagram data sources
3. **Analytics Tracking**: Comprehensive event tracking for user behavior
4. **Graceful Fallbacks**: System works even when flags are disabled
5. **Admin Interface**: Easy testing and monitoring of feature flags
6. **Privacy Compliant**: Respects user preferences and LGPD requirements

**Deploy and start using feature flags immediately!** 🚀

---

**Implementation complete for Saraiva Vision** - PostHog feature flags with Instagram integration control!