# Technical Architecture Documentation

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                Saraiva Vision Architecture                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   Vercel CDN    │    │   VPS Linux     │    │   Supabase      │      │
│  │                 │    │                 │    │                 │      │
│  │  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │      │
│  │  │ Next.js   │  │────┤  │ WordPress │  │────┤  │ PostgreSQL │  │      │
│  │  │ App       │  │    │  │ Headless  │  │    │  │ Database  │  │      │
│  │  │ API Routes│  │    │  │ CMS       │  │    │  │ Auth      │  │      │
│  │  │ Edge      │  │    │  │ MariaDB   │  │    │  │ Storage   │  │      │
│  │  └───────────┘  │    │  │ Redis     │  │    │  └───────────┘  │      │
│  └─────────────────┘    │  └───────────┘  │    └─────────────────┘      │
│                        └─────────────────┘                              │
│                                  │                                      │
│         ┌─────────────────────────────────────────────────────────────┤
│         │                    External Services                          │
│         │                                                          │
│         │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│         │  │ Resend    │  │ Zenvia    │  │ Spotify   │  │ PostHog   │   │
│         │  │ Email     │  │ SMS       │  │ API       │  │ Analytics │   │
│         │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Browser
    ↓
Vercel CDN (Static Assets)
    ↓
Next.js App (Client-side)
    ↓ ← ← ← ← ← ← ← ← ← ← ← ←
API Routes (Serverless)
    ↓ → → → → → → → → → → → →
Supabase (Database/Auth)
    ↓
WordPress Headless (Content)
    ↓
External Services (Email/SMS/Spotify)
```

## Component Specifications

### 1. Next.js Application (Vercel)

#### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+ (Edge Functions)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + useState
- **Data Fetching**: SWR or TanStack Query

#### Directory Structure
```
frontend/
├── app/
│   ├── (pages)/
│   │   ├── page.tsx                 # Home page
│   │   ├── about/
│   │   ├── contact/
│   │   ├── appointments/
│   │   ├── podcast/
│   │   └── blog/
│   ├── api/                        # API Routes
│   │   ├── contact/
│   │   │   └── route.ts
│   │   ├── appointments/
│   │   │   ├── route.ts
│   │   │   └── confirm/
│   │   │       └── route.ts
│   │   ├── availability/
│   │   │   └── route.ts
│   │   ├── podcast/
│   │   │   ├── episodes/
│   │   │   │   └── route.ts
│   │   │   └── sync/
│   │   │       └── route.ts
│   │   ├── outbox/
│   │   │   └── drain/
│   │   │       └── route.ts
│   │   ├── webhooks/
│   │   │   ├── resend/
│   │   │   │   └── route.ts
│   │   │   ├── zenvia/
│   │   │   │   └── route.ts
│   │   │   └── wp-revalidate/
│   │   │       └── route.ts
│   │   ├── chatbot/
│   │   │   └── route.ts
│   │   └── status/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── components/
│       ├── ui/
│       ├── forms/
│       ├── layout/
│       └── dashboard/
├── lib/
│   ├── db/
│   ├── validations/
│   ├── services/
│   └── utils/
├── public/
└── types/
```

#### Key Features
- **SSG/ISR**: Static generation with incremental revalidation
- **TypeScript**: Full type safety across the application
- **API Routes**: Serverless functions for backend logic
- **Edge Functions**: Global edge deployment for performance
- **Environment Variables**: Secure configuration management

### 2. WordPress Headless CMS (VPS)

#### Technology Stack
- **CMS**: WordPress 6.5+
- **Language**: PHP 8.2-FPM
- **Database**: MariaDB 10.6
- **Web Server**: Nginx 1.24+
- **Caching**: Redis 6.x
- **Container**: Docker
- **Reverse Proxy**: Nginx

#### Directory Structure
```
/srv/wp/
├── docker-compose.yml
├── nginx/
│   └── conf.d/
│       └── cms.saraivavision.com.br.conf
├── wordpress/
│   ├── wp-content/
│   │   ├── plugins/
│   │   ├── themes/
│   │   └── uploads/
│   └── wp-config.php
├── .env
└── scripts/
    ├── backup.sh
    └── restore.sh
```

#### Key Features
- **Headless Mode**: Content-only, no frontend theme
- **GraphQL API**: WPGraphQL for flexible content queries
- **Caching**: Redis for object and page caching
- **Webhooks**: Content update notifications
- **Security**: JWT authentication, rate limiting

#### Required Plugins
```bash
# Core Functionality
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-cors --activate
wp plugin install redis-cache --activate
wp plugin install wp-webhooks --activate

# Security
wp plugin install jwt-authentication-for-wp-rest-api --activate
wp plugin install limit-login-attempts-reloaded --activate

# SEO & Performance
wp plugin install wordpress-seo --activate
wp plugin install disable-comments --activate
```

### 3. Database Layer (Supabase)

#### Technology Stack
- **Database**: PostgreSQL 15+
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **RLS**: Row Level Security
- **Backups**: Automated daily backups

#### Schema Implementation
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables (as defined in main strategy)
-- ... (contact_messages, appointments, message_outbox, podcast_episodes, event_log)

-- Functions
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(encode(gen_random_bytes(4), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_podcast_episodes_updated_at
    BEFORE UPDATE ON podcast_episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. External Services Integration

#### Email Service (Resend)
```typescript
// lib/services/resend.ts
interface EmailService {
  send(options: {
    to: string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ id: string; messageId: string }>;
}

interface Template {
  id: string;
  variables: Record<string, string>;
}
```

#### SMS Service (Zenvia)
```typescript
// lib/services/zenvia.ts
interface SMSService {
  send(options: {
    to: string;
    message: string;
    from?: string;
  }): Promise<{ id: string; status: string }>;
}
```

#### Spotify API Integration
```typescript
// lib/services/spotify.ts
interface SpotifyService {
  getShowEpisodes(showId: string): Promise<Episode[]>;
  getEpisodeDetails(episodeId: string): Promise<Episode>;
}
```

#### Analytics (PostHog)
```typescript
// lib/services/posthog.ts
interface AnalyticsService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, properties?: Record<string, any>): void;
  group(groupId: string, properties?: Record<string, any>): void;
}
```

## API Design Patterns

### 1. RESTful API Structure
```
GET    /api/availability           # Get available slots
POST   /api/appointments          # Create appointment
GET    /api/appointments/confirm  # Confirm appointment
POST   /api/contact               # Submit contact form
GET    /api/podcast/episodes      # Get podcast episodes
POST   /api/chatbot               # Chatbot interaction
```

### 2. Response Format Standards
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### 3. Error Handling Pattern
```typescript
interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## Security Architecture

### 1. Authentication & Authorization
```typescript
// Authentication flow
interface AuthContext {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'user';
  };
  token: string;
  expiresAt: Date;
}

// Authorization middleware
interface AuthMiddleware {
  (req: NextRequest, requiredRole?: string): Promise<AuthContext>;
}
```

### 2. Data Validation
```typescript
// Zod validation schemas
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/).optional(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(5000),
  consent: z.boolean().refine(val => val === true),
  recaptchaToken: z.string().optional(),
});
```

### 3. Rate Limiting
```typescript
// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;     // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}
```

## Performance Optimization

### 1. Caching Strategy
```typescript
// Cache configuration
interface CacheConfig {
  // Next.js Data Cache
  dataCache: {
    tags: string[];
    revalidate: number; // seconds
  };

  // Redis Cache
  redis: {
    ttl: number; // seconds
    keyPrefix: string;
  };

  // CDN Cache
  cdn: {
    cacheControl: string;
    staleWhileRevalidate: number;
  };
}
```

### 2. Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at);
CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status);
CREATE INDEX idx_message_outbox_status_send_after ON message_outbox (status, send_after);
CREATE INDEX idx_podcast_episodes_published_at ON podcast_episodes (published_at);
CREATE INDEX idx_event_log_created_at ON event_log (created_at);
```

### 3. CDN Strategy
```typescript
// Static asset optimization
interface CDNConfig {
  // Next.js Image Optimization
  images: {
    domains: ['cms.saraivavision.com.br'];
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384];
  };

  // Asset caching
  assets: {
    css: 'public, max-age=31536000, immutable';
    js: 'public, max-age=31536000, immutable';
    images: 'public, max-age=31536000, immutable';
  };
}
```

## Monitoring & Observability

### 1. Logging Strategy
```typescript
// Structured logging interface
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  metadata: Record<string, any>;
  context: {
    service: string;
    version: string;
    environment: string;
  };
}
```

### 2. Metrics Collection
```typescript
// Business metrics
interface BusinessMetrics {
  contactFormSubmissions: Counter;
  appointmentCreations: Counter;
  appointmentConfirmations: Counter;
  messageDeliveries: Counter;
  chatbotInteractions: Counter;

  timingMetrics: {
    emailDeliveryTime: Histogram;
    smsDeliveryTime: Histogram;
    apiResponseTime: Histogram;
  };
}
```

### 3. Alerting Configuration
```typescript
// Alert thresholds
interface AlertThresholds {
  apiErrorRate: {
    warning: 0.05;  // 5%
    critical: 0.10; // 10%
  };

  messageDeliveryFailure: {
    warning: 0.02;  // 2%
    critical: 0.05; // 5%
  };

  responseTime: {
    warning: 1000;  // 1 second
    critical: 3000; // 3 seconds
  };
}
```

## Deployment Architecture

### 1. Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "app/**/*",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "crons": [
    {
      "path": "/api/outbox/drain",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/podcast/sync",
      "schedule": "0,30 * * * *"
    }
  ]
}
```

### 2. External WordPress API Configuration

**Note**: WordPress is hosted externally and consumed via REST API. No local installation required.

**External WordPress Endpoints**:
- **API Base**: `https://cms.saraivavision.com.br`
- **REST API**: `https://cms.saraivavision.com.br/wp-json/wp/v2/`
- **Authentication**: JWT tokens for admin operations
- **Public Access**: Posts and pages via REST API (no auth required)

**Environment Configuration**:
```bash
# .env.production
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_SITE_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
```

**Integration Architecture**:
```
React Frontend (VPS) → REST API → External WordPress CMS
                     ↓
                 Supabase Cache
                     ↓
              Fallback System
```

See [WORDPRESS_CMS_URL_ARCHITECTURE.md](../../docs/WORDPRESS_CMS_URL_ARCHITECTURE.md) for complete integration details.

## Disaster Recovery

### 1. Backup Strategy

**External WordPress**: Managed by external hosting provider
- Database backups handled externally
- Content accessible via REST API
- Local cache in Supabase provides redundancy

**Local Data Backup**:
```bash
#!/bin/bash
# Backup Supabase cache and application data
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Supabase data backup (via pg_dump or Supabase CLI)
# Application configuration backup
tar -czf "$BACKUP_DIR/app-config.tar.gz" .env.production nginx-optimized.conf
```

### 2. Failover Procedures
```typescript
// Health check implementation
interface HealthCheck {
  // Database connectivity
  database(): Promise<boolean>;

  // External service connectivity
  externalServices(): Promise<boolean>;

  // WordPress API availability
  wordpress(): Promise<boolean>;

  // Overall system health
  system(): Promise<{
    healthy: boolean;
    components: Record<string, boolean>;
    timestamp: string;
  }>;
}
```

## Conclusion

This technical architecture provides a robust, scalable foundation for Saraiva Vision's digital transformation. The hybrid approach leverages the strengths of both Vercel (frontend performance) and VPS (CMS flexibility), while maintaining security, performance, and reliability throughout the system.

The architecture is designed to:
- Scale horizontally as the business grows
- Maintain high availability and performance
- Provide comprehensive monitoring and observability
- Ensure security and compliance with LGPD requirements
- Enable rapid development and deployment cycles

Regular review and optimization of this architecture will ensure it continues to meet business needs as they evolve.