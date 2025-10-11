# Google Reviews Integration - Technical Documentation

## Overview

Real-time integration with Google Places API for displaying authentic customer reviews with profile photos and intelligent fallback system.

## Architecture

### Components

```
┌─────────────────────────────────────────────────┐
│         CompactGoogleReviews Component          │
│  (Frontend Display with Real-time API Data)     │
└────────────────┬────────────────────────────────┘
                 │
                 ├── useGoogleReviews Hook
                 │   ├── Auto-fetch on mount
                 │   ├── Retry with exponential backoff
                 │   └── Error handling & recovery
                 │
                 ├── API Endpoint: /api/google-reviews
                 │   ├── Rate limiting: 30 req/min
                 │   ├── Google Places API proxy
                 │   └── Response transformation
                 │
                 └── Fallback System
                     ├── Local curated reviews
                     ├── Profile photo fallbacks
                     └── Seamless transition
```

## API Integration

### Google Places API Endpoint

**Base URL:** `/api/google-reviews`

**Method:** `GET`

**Query Parameters:**
- `placeId` (required): Google Place ID
- `limit` (optional): Number of reviews (default: 5, max: 5)
- `language` (optional): Language code (default: pt-BR)

**Example Request:**
```bash
GET /api/google-reviews?placeId=ChIJVUKww7WRugARF7u2lAe7BeE&limit=5
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "places-1757704573",
        "reviewer": {
          "displayName": "Beatriz Ferreira",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/...",
          "isAnonymous": false
        },
        "starRating": 5,
        "comment": "Fui mt bem atendida...",
        "createTime": "2025-09-12T19:16:13.000Z",
        "updateTime": "2025-09-12T19:16:13.000Z",
        "reviewReply": null,
        "isRecent": true,
        "hasResponse": false,
        "wordCount": 42,
        "language": "pt",
        "originalRating": 5,
        "relativeTimeDescription": "2 semanas atrás"
      }
    ],
    "stats": {
      "overview": {
        "totalReviews": 136,
        "averageRating": 4.9,
        "recentReviews": 1,
        "responseRate": 0
      },
      "distribution": {
        "1": 0, "2": 0, "3": 0, "4": 0, "5": 5
      },
      "sentiment": {
        "positive": 5,
        "neutral": 0,
        "negative": 0,
        "positivePercentage": 100,
        "negativePercentage": 0
      }
    },
    "metadata": {
      "fetchedAt": "2025-09-29T17:30:27.573Z",
      "source": "google-places-api",
      "placeId": "ChIJVUKww7WRugARF7u2lAe7BeE",
      "placeName": "Saraiva Vision Oftalmologia",
      "totalReviews": 136,
      "averageRating": 4.9
    }
  }
}
```

## Frontend Implementation

### useGoogleReviews Hook

**Location:** `src/hooks/useGoogleReviews.js`

**Features:**
- Auto-fetch on component mount
- Retry logic with exponential backoff (3 attempts)
- Abort controller for request cancellation
- Refresh interval support
- Local filtering and sorting utilities

**Usage Example:**
```javascript
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { CLINIC_PLACE_ID } from '@/lib/clinicInfo';

const {
  reviews,      // Array of review objects
  stats,        // Statistics object
  loading,      // Loading state
  error,        // Error object
  refresh       // Manual refresh function
} = useGoogleReviews({
  placeId: CLINIC_PLACE_ID,
  limit: 5,
  autoFetch: true
});
```

### CompactGoogleReviews Component

**Location:** `src/components/CompactGoogleReviews.jsx`

**Features:**
- Real-time API integration
- Intelligent fallback system
- Profile photo error handling
- Responsive grid layout
- Framer Motion animations
- i18n support

**Data Format Compatibility:**
```javascript
// Handles both API and fallback formats
const displayName = review.reviewer?.displayName || review.author;
const profilePhoto = review.reviewer?.profilePhotoUrl || review.avatar;
const rating = review.starRating || review.rating;
const text = review.comment || review.text;
const timeDescription = review.relativeTimeDescription || review.relativeTime;
```

## Fallback System

### Local Curated Reviews

**Trigger Conditions:**
- API not configured (missing Place ID)
- Network failure
- API error response
- Empty results from API

**Fallback Data Structure:**
```javascript
const fallbackReviews = [
  {
    id: 'fallback-5',
    reviewer: {
      displayName: 'Carlos M.',
      profilePhotoUrl: '/images/avatar-male-brown-640w.webp',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Excelente profissional!...',
    relativeTimeDescription: 'há 2 semanas'
  }
  // ... more reviews
];
```

### Profile Photo Fallback

**Hierarchy:**
1. Google-hosted photo URL (from API)
2. Local avatar image (from fallback data)
3. Default avatar on error: `/images/avatar-female-blonde-640w.webp`

**Error Handling:**
```javascript
<img
  src={profilePhoto}
  onError={(e) => {
    e.target.src = '/images/avatar-female-blonde-640w.webp';
  }}
/>
```

## Configuration

### Environment Variables

**Required:**
```bash
VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
```

**Validation:**
- Place ID validated via `clinicInfo.js`
- Placeholder detection prevents API calls
- Graceful fallback without errors

### Nginx Configuration

**API Proxy:**
```nginx
location /api/ {
    limit_req zone=api_limit burst=10 nodelay;
    proxy_pass http://api_backend;
    proxy_http_version 1.1;
    # ... headers
}
```

**Rate Limiting:**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
```

## Performance Optimizations

### Caching Strategy

**API Level:**
- No caching (real-time data priority)
- Fresh data on every component mount

**Image Level:**
- Google-hosted photos: CDN-cached by Google
- Local avatars: 1-year browser cache with immutable flag

### Network Optimization

**Retry Logic:**
```javascript
const maxRetries = 3;
const delay = Math.pow(2, currentRetry) * 1000; // 1s, 2s, 4s
```

**Request Cancellation:**
```javascript
const abortControllerRef = useRef(null);
// Cancel previous request on new fetch
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
```

### Lazy Loading

**Component:**
- Not lazy-loaded (critical UX element)
- Renders on mount with hydration

**Images:**
```javascript
<img loading="lazy" decoding="async" />
```

## Error Handling

### API Errors

**Types Handled:**
- Network errors (ECONNREFUSED, ENOTFOUND)
- HTTP errors (4xx, 5xx)
- JSON parsing errors
- Timeout errors

**Retry Strategy:**
- Network errors: Retry with backoff
- Auth errors (401/403): No retry, log warning
- 5xx errors: Retry up to max attempts

**User Impact:**
- Transparent fallback to local data
- No error messages shown to user
- Console logging for debugging

### Image Errors

**Strategy:**
```javascript
onError={(e) => {
  // Fallback to default avatar
  e.target.src = '/images/avatar-female-blonde-640w.webp';
}}
```

## Security Considerations

### API Key Protection

**Server-Side Only:**
- API calls proxied through backend
- Google API key never exposed to client
- Environment variable validation

### Rate Limiting

**Nginx Level:**
```nginx
rate=30r/m  # 30 requests per minute per IP
burst=10    # Allow burst up to 10 requests
nodelay     # Process burst immediately
```

### CORS Configuration

**Allowed Origins:**
```nginx
map $http_origin $cors_origin {
    "~^https://saraivavision\.com\.br$" "https://saraivavision.com.br";
    "~^https://localhost:\d+$" "$http_origin";  # Development
}
```

## Monitoring & Logging

### API Logs

**Success:**
```javascript
console.log(`Successfully fetched ${reviews.length} reviews from Google Places API`);
```

**Errors:**
```javascript
console.error('Google Places Reviews API Error:', error);
console.warn('Authentication error with Google Reviews API:', err.message);
```

### Metrics Tracked

**Hook Level:**
- `lastFetch`: Timestamp of last successful fetch
- `retryCount`: Number of retry attempts
- `isRetrying`: Boolean retry state

**API Level:**
- Request count (via rate limiting logs)
- Error rate (via Nginx error logs)
- Response time (via access logs)

## Testing

### Manual Testing

**API Endpoint:**
```bash
# Test via internal API
curl http://localhost:3001/api/google-reviews?placeId=ChIJVUKww7WRugARF7u2lAe7BeE

# Test via Nginx proxy
curl https://saraivavision.com.br/api/google-reviews?placeId=ChIJVUKww7WRugARF7u2lAe7BeE
```

**Component Testing:**
1. Load homepage: https://saraivavision.com.br
2. Scroll to reviews section
3. Verify real photos display
4. Check browser console for API logs

### Validation Checklist

- [ ] API returns 200 status
- [ ] Reviews array not empty
- [ ] Profile photos load correctly
- [ ] Fallback works when API disabled
- [ ] Rate limiting prevents abuse
- [ ] CORS headers present
- [ ] Real-time data displayed
- [ ] No console errors

## Maintenance

### Updating Fallback Reviews

**File:** `src/components/CompactGoogleReviews.jsx`

**Process:**
1. Fetch latest reviews from API
2. Select best 5 reviews (highest ratings, recent, detailed)
3. Update `fallbackReviews` array
4. Ensure profile photos exist locally
5. Test fallback display

### API Key Rotation

**Steps:**
1. Generate new key in Google Cloud Console
2. Update environment variable: `VITE_GOOGLE_PLACES_API_KEY`
3. Rebuild application: `npm run build`
4. Restart Node.js API: `sudo systemctl restart saraiva-api`
5. Test endpoint functionality

### Place ID Validation

**Current:**
```
ChIJVUKww7WRugARF7u2lAe7BeE
```

**Verify:**
```bash
# Test via Google Maps
https://www.google.com/maps/place/?q=place_id:ChIJVUKww7WRugARF7u2lAe7BeE
```

## Troubleshooting

### No Reviews Displayed

**Symptoms:** Empty reviews section or only fallback data

**Checks:**
1. Verify API key: `echo $VITE_GOOGLE_PLACES_API_KEY`
2. Test API directly: `curl localhost:3001/api/google-reviews?placeId=...`
3. Check browser console for errors
4. Verify Nginx proxy: `curl https://saraivavision.com.br/api/google-reviews?placeId=...`

### Profile Photos Not Loading

**Symptoms:** Broken image icons or fallback avatars only

**Causes:**
- Google CDN blocked (firewall/ad-blocker)
- CORS issues with Google domains
- Invalid profile photo URLs

**Solutions:**
1. Check browser console for CORS errors
2. Verify image URLs are accessible
3. Ensure fallback images exist: `ls /var/www/html/images/avatar-*.webp`

### Rate Limiting Errors

**Symptoms:** 429 Too Many Requests

**Solutions:**
1. Check Nginx logs: `tail -f /var/log/nginx/saraivavision_error.log`
2. Adjust rate limit: Edit `/etc/nginx/sites-available/saraivavision`
3. Reload Nginx: `sudo systemctl reload nginx`

## Best Practices

### Data Freshness

- API fetches on every component mount
- No stale data caching
- Real-time user feedback

### User Experience

- Seamless fallback (user unaware of API status)
- Fast loading with lazy images
- Smooth animations with Framer Motion

### Performance

- Minimal API calls (mount only, not on render)
- Efficient retry logic (exponential backoff)
- Request cancellation on unmount

### Accessibility

- Alt text for all images
- Semantic HTML structure
- ARIA labels for links

## Future Enhancements

### Potential Features

1. **Review Filtering:**
   - By rating (5-star, 4-star, etc.)
   - By date range
   - By keyword search

2. **Pagination:**
   - Load more reviews on demand
   - Infinite scroll support

3. **Business Responses:**
   - Display owner replies to reviews
   - Highlight responded reviews

4. **Analytics:**
   - Track review clicks
   - Measure conversion impact
   - A/B test display formats

5. **Caching:**
   - Redis cache for API responses
   - Cache invalidation strategy
   - Reduced API quota usage

## References

- **Google Places API Docs:** https://developers.google.com/maps/documentation/places/web-service/details
- **React Hooks Best Practices:** https://react.dev/reference/react
- **Nginx Rate Limiting:** https://www.nginx.com/blog/rate-limiting-nginx/
- **Framer Motion:** https://www.framer.com/motion/

## Change Log

### 2025-09-29
- ✅ Implemented real-time Google Places API integration
- ✅ Added useGoogleReviews custom hook
- ✅ Created intelligent fallback system
- ✅ Integrated profile photo display with error handling
- ✅ Configured Nginx proxy and rate limiting
- ✅ Deployed to production (saraivavision.com.br)

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-09-29
**Maintained By:** Development Team