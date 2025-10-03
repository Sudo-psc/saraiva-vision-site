# Implementation Checklist - Profile Detection Middleware

Step-by-step guide to implement the Edge Middleware profile detection system in your Next.js project.

## Pre-Implementation

### Requirements Check

- [ ] **Next.js Version**: 13.0.0 or higher
- [ ] **Node.js**: 18.0.0 or higher
- [ ] **TypeScript**: 5.0.0 or higher (recommended)
- [ ] **Deployment**: Vercel, Cloudflare Pages, or self-hosted with Edge Runtime support

### Dependencies

```json
{
  "dependencies": {
    "next": "^13.0.0 || ^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Installation Steps

### Step 1: Copy Middleware Files

```bash
# From this documentation directory to your Next.js project root
cp docs/nextjs-middleware/middleware.ts ./middleware.ts
cp -r docs/nextjs-middleware/lib ./lib
```

**File locations in your project:**
```
your-nextjs-project/
├── middleware.ts                    # Main middleware
├── lib/
│   ├── profile-detector.ts          # Detection logic
│   ├── profile-types.ts             # TypeScript types
│   ├── profile-config.ts            # Configuration
│   └── profile-analytics.ts         # Analytics (optional)
```

### Step 2: TypeScript Configuration

Update `tsconfig.json` to include lib directory:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "paths": {
      "@/*": ["./*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": [
    "middleware.ts",
    "lib/**/*",
    "app/**/*"
  ]
}
```

### Step 3: Next.js Configuration

Update `next.config.js` (optional, for advanced features):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Edge Runtime for middleware (default in Next.js 13+)
  },

  // Headers for additional security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Step 4: Environment Variables (Optional)

Create `.env.local` for analytics integration:

```bash
# Optional: Custom analytics endpoint
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://api.yoursite.com/analytics

# Optional: Enable debug logging
NEXT_PUBLIC_DEBUG_PROFILE=true
```

---

## Configuration

### Step 5: Customize Profile Settings

Edit `lib/profile-config.ts` to match your design system:

```typescript
// Adjust font sizes
export const FONT_SIZE_VARS = {
  base: {
    '--font-base': '1rem',     // 16px - adjust to your base size
    '--font-lg': '1.125rem',   // 18px
    // ... other sizes
  },
  large: {
    '--font-base': '1.125rem', // 18px for senior
    // ... other sizes
  },
};

// Adjust contrast ratios
export const CONTRAST_VARS = {
  normal: {
    '--text-primary': '#333333', // Your primary text color
    '--bg-primary': '#FFFFFF',   // Your background color
  },
  high: {
    '--text-primary': '#000000', // High contrast for senior
    '--bg-primary': '#FFFFFF',
  },
};
```

### Step 6: Customize Detection Patterns (Optional)

Edit `lib/profile-detector.ts` to adjust User-Agent patterns:

```typescript
// Add custom patterns for your target audience
const SENIOR_PATTERNS = [
  /KAIOS/i,
  /Nokia/i,
  /YourCustomPattern/i, // Add custom patterns
  // ...
];

const JOVEM_PATTERNS = [
  /Instagram/i,
  /TikTok/i,
  /YourCustomPattern/i, // Add custom patterns
  // ...
];
```

---

## Integration

### Step 7: Server Component Integration

Update your root layout (`app/layout.tsx`):

```typescript
import { cookies } from 'next/headers';
import { getProfileCSSVars } from '@/lib/profile-config';
import type { UserProfile } from '@/lib/profile-types';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = (cookies().get('saraiva_profile_preference')?.value || 'familiar') as UserProfile;
  const cssVars = getProfileCSSVars(profile);

  return (
    <html lang="pt-BR" data-profile={profile}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${Object.entries(cssVars).map(([k, v]) => `${k}: ${v};`).join('\n')}
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 8: Client Component Hook

Create a profile hook (`hooks/useProfile.ts`):

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/profile-types';

export function useProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>('familiar');

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('saraiva_profile_preference='))
      ?.split('=')[1];

    if (cookie && ['familiar', 'jovem', 'senior'].includes(cookie)) {
      setProfile(cookie as UserProfile);
    }
  }, []);

  return profile;
}
```

### Step 9: Profile Switcher Component

Create switcher component (`components/ProfileSwitcher.tsx`):

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

export function ProfileSwitcher() {
  const router = useRouter();
  const currentProfile = useProfile();

  const switchProfile = (profile: string) => {
    router.push(`/?profile=${profile}`);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => switchProfile('familiar')}>
        👨‍👩‍👧‍👦 Familiar
      </button>
      <button onClick={() => switchProfile('jovem')}>
        📱 Jovem
      </button>
      <button onClick={() => switchProfile('senior')}>
        👴 Senior
      </button>
    </div>
  );
}
```

---

## Testing

### Step 10: Manual Testing

Test each detection method:

```bash
# 1. Test default detection (should be 'familiar')
curl -v http://localhost:3000/

# 2. Test senior UA detection
curl -v -A "KAIOS/2.5" http://localhost:3000/

# 3. Test jovem UA detection
curl -v -A "Instagram 123.0.0.0" http://localhost:3000/

# 4. Test query parameter override
curl -v http://localhost:3000/?profile=senior

# 5. Check performance
curl -v http://localhost:3000/ 2>&1 | grep X-Profile-Detection-Time
```

### Step 11: Browser Testing

1. **Open DevTools** → Application → Cookies
2. **Navigate to** `http://localhost:3000`
3. **Verify** `saraiva_profile_preference` cookie is set
4. **Test switcher** using ProfileSwitcher component
5. **Check** cookie updates and page re-renders

### Step 12: Performance Testing

```typescript
// Create test file: __tests__/middleware-performance.test.ts
import { benchmarkDetection } from '@/lib/profile-detector';

describe('Middleware Performance', () => {
  it('should execute in <50ms', () => {
    const results = benchmarkDetection(1000);
    expect(results.averageTime).toBeLessThan(50);
  });

  it('should handle 1000+ req/s', async () => {
    const start = Date.now();
    const promises = Array.from({ length: 1000 }, () =>
      fetch('http://localhost:3000/')
    );
    await Promise.all(promises);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // All requests in <1s
  });
});
```

---

## Deployment

### Step 13: Pre-Deployment Checklist

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Middleware file is in project root: `middleware.ts`
- [ ] Cookie config matches environment (HTTP vs HTTPS)
- [ ] Performance tests pass (<50ms execution)
- [ ] Security headers configured
- [ ] Analytics integration tested (if enabled)

### Step 14: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Production deploy
vercel --prod
```

**Verification:**
1. Visit deployed URL
2. Check cookie is set
3. Test profile switcher
4. Verify Edge Runtime in Vercel dashboard

### Step 15: Cloudflare Pages Deployment

```bash
# 1. Copy middleware to functions directory
mkdir -p functions
cp middleware.ts functions/_middleware.ts

# 2. Deploy via CLI or dashboard
npx wrangler pages publish dist
```

### Step 16: Self-Hosted Deployment

```bash
# Build for standalone deployment
npm run build

# Start server (requires Node.js 18+)
node .next/standalone/server.js

# Verify Edge Runtime support
curl -I http://localhost:3000/ | grep X-User-Profile
```

---

## Monitoring

### Step 17: Analytics Setup

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Google Analytics (GA4):**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 18: Performance Monitoring

Create monitoring dashboard:

```typescript
// app/api/monitoring/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Example: Return middleware performance metrics
  return NextResponse.json({
    middlewareVersion: '1.0.0',
    averageExecutionTime: '12ms',
    throughput: '1200 req/s',
    profileDistribution: {
      familiar: '60%',
      jovem: '30%',
      senior: '10%',
    },
  });
}
```

---

## Troubleshooting

### Common Issues

**Issue**: Cookie not persisting
- **Check**: `secure` flag matches protocol (HTTP vs HTTPS)
- **Fix**: Set `secure: false` for localhost

**Issue**: TypeScript errors
- **Check**: `tsconfig.json` includes middleware.ts
- **Fix**: Add to `include` array

**Issue**: Performance >50ms
- **Check**: User-Agent patterns complexity
- **Fix**: Optimize regex patterns, add early returns

**Issue**: Profile not updating
- **Check**: Cookie value is valid profile
- **Fix**: Clear cookies and retry

### Debug Mode

Enable detailed logging:

```typescript
// middleware.ts
if (process.env.NODE_ENV === 'development') {
  console.log('[Middleware Debug]', {
    queryParam: profileParam,
    cookie: profileCookie,
    detected: detectedProfile,
    final: finalProfile,
    executionTime: Date.now() - startTime,
  });
}
```

---

## Optimization Tips

### Performance Optimization

1. **Cookie-first**: Most requests use cached cookie (fastest path)
2. **Early returns**: Avoid unnecessary processing
3. **Pre-compiled patterns**: Regex compiled at build time
4. **No external calls**: All logic in-memory

### Security Hardening

1. **Input validation**: All profile values validated
2. **CSP headers**: Configured in middleware
3. **Rate limiting**: Implement per-profile limits
4. **Secure cookies**: HTTPS-only in production

### Accessibility Enhancement

1. **WCAG AAA** for senior profile
2. **Touch targets**: 60px minimum for senior
3. **Reduced motion**: Respect user preferences
4. **Screen reader**: Optimized labels and ARIA

---

## Success Criteria

### Functional Requirements

- [x] Profile detected from User-Agent
- [x] Query parameter override works
- [x] Cookie persists for 1 year
- [x] Profile switcher updates correctly
- [x] Server components access profile
- [x] Client components access profile

### Performance Requirements

- [x] Middleware execution <50ms
- [x] Throughput >1000 req/s
- [x] No external API calls
- [x] Edge Runtime compatible

### Security Requirements

- [x] Input validation implemented
- [x] CSP headers configured
- [x] Secure cookies in production
- [x] No PII stored in cookies

### Accessibility Requirements

- [x] WCAG AAA for senior profile
- [x] High contrast mode
- [x] Large touch targets
- [x] Reduced motion support

---

## Next Steps

After successful implementation:

1. **Monitor analytics** for profile distribution
2. **Gather user feedback** on profile experiences
3. **Optimize patterns** based on real User-Agent data
4. **A/B test** profile-specific features
5. **Document learnings** for future iterations

---

## Support Resources

- **README.md**: Complete documentation
- **INTEGRATION_EXAMPLES.md**: Code examples
- **profile-detector.ts**: Detection logic
- **profile-config.ts**: Configuration options

**Questions?** Review examples in INTEGRATION_EXAMPLES.md

**Performance issues?** Check benchmarkDetection() results

**Security concerns?** Review SECURITY_HEADERS in middleware.ts
