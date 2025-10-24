# Technical Architecture Documentation

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                Saraiva Vision Architecture                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   VPS Linux     │    │   MySQL DB      │    │   Redis Cache   │      │
│  │                 │    │                 │    │                 │      │
│  │  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │      │
│  │  │ React SPA │  │────┤  │ MySQL     │  │────┤  │ Redis     │  │      │
│  │  │ Node.js   │  │    │  │ App Data  │  │    │  │ Sessions  │  │      │
│  │  │ API       │  │    │  │ Contacts  │  │    │  │ Cache     │  │      │
│  │  │ Nginx     │  │    │  │ Appts     │  │    │  │ Real-time │  │      │
│  │  │ Static    │  │    │  │           │  │    │  │           │  │      │
│  │  │ Blog      │  │    │  │           │  │    │  │           │  │      │
│  │  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │      │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘      │
│                                  │                                        │
│         ┌─────────────────────────────────────────────────────────────┐   │
│         │                    External Services                          │
│         │                                                          │
│         │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│         │  │ Resend    │  │ Google    │  │ Spotify   │  │ Analytics │   │
│         │  │ Email     │  │ APIs      │  │ API       │  │ Service   │   │
│         │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Browser
    ↓
React SPA (Static + Client-side)
    ↓
API Routes (Node.js Backend)
    ↓ → → → → → → → → → → → →
MySQL (Application Data)
    ↓
External Services (Email/SMS/Spotify/Google)
```

## Component Specifications

### 1. React Application (VPS)

#### Technology Stack
- **Framework**: React 18 (SPA)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 22+
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + useState
- **Data**: Static blog posts in src/data/blogPosts.js

#### Directory Structure
```
src/
├── app/
│   ├── (pages)/
│   │   ├── page.jsx                 # Home page
│   │   ├── about/
│   │   ├── contact/
│   │   ├── appointments/
│   │   ├── podcast/
│   │   └── blog/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layout/
├── lib/
│   ├── services/
│   └── utils/
├── data/
│   └── blogPosts.js               # Static blog content
├── public/
└── types/
```


### 3. Database Layer (MySQL)

#### Technology Stack
- **Database**: MySQL 8.0+
- **Connection**: Native MySQL driver
- **Caching**: Redis for query results
- **Backups**: Automated daily backups
- **Transactions**: ACID compliance for critical operations

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

### 1. VPS Deployment Configuration

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/saraivavision
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    
    # React SPA
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Environment Configuration
```bash
# .env.production (VPS)
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saraiva_vision
DB_USER=api_user
DB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_key
RESEND_API_KEY=your_key
```

### 2. Static Blog Deployment

**Note**: Blog content is stored in version-controlled source code (src/data/blogPosts.js). No external CMS required.

**Blog Content Management**:
- **Edit**: Modify src/data/blogPosts.js directly
- **Version Control**: Full Git history of all content changes
- **Deployment**: Build and deploy like any code change
- **Zero Dependencies**: No external services or databases

**Blog Data Flow**:
```
Git Repository → Build Process → Static Bundle → VPS Deployment
     ↓
src/data/blogPosts.js → Bundled in JS → Served to Browser
```

## Disaster Recovery

### 1. Backup Strategy

**Application Data**: 
```bash
#!/bin/bash
# Backup MySQL database and application data
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# MySQL backup
mysqldump -u root -p saraiva_vision > "$BACKUP_DIR/database.sql"

# Application configuration backup
tar -czf "$BACKUP_DIR/app-config.tar.gz" .env.production /etc/nginx/sites-available/saraivavision

# Blog content is version controlled in Git (no separate backup needed)
```

### 2. Failover Procedures
```typescript
// Health check implementation
interface HealthCheck {
  // Database connectivity
  database(): Promise<boolean>;

  // External service connectivity
  externalServices(): Promise<boolean>;

  // Overall system health
  system(): Promise<{
    healthy: boolean;
    components: Record<string, boolean>;
    timestamp: string;
  }>;
}
```

## Conclusion

This technical architecture provides a robust, scalable foundation for Saraiva Vision's digital transformation. The architecture leverages native VPS deployment for maximum performance and control, with a simplified static blog system that eliminates external dependencies while maintaining security, performance, and reliability throughout the system.

The architecture is designed to:
- Scale horizontally as the business grows
- Maintain high availability and performance
- Provide comprehensive monitoring and observability
- Ensure security and compliance with LGPD requirements
- Enable rapid development and deployment cycles
- Minimize external dependencies for maximum reliability

Key advantages of this architecture:
- **Zero CMS Overhead**: Static blog content with no database queries
- **Version-Controlled Content**: Complete audit trail in Git
- **Native Performance**: Direct VPS deployment without containerization
- **Simplified Maintenance**: Fewer moving parts and external services
- **Maximum Control**: Full control over infrastructure and deployment

Regular review and optimization of this architecture will ensure it continues to meet business needs as they evolve.