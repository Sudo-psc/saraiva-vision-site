# Architecture Summary - Saraiva Vision

A high-level overview of the Saraiva Vision medical website architecture, optimized for the Brazilian healthcare market.

## System Overview

**Saraiva Vision** is a production-ready medical clinic website built with modern web technologies and deployed on native VPS infrastructure for maximum performance and regulatory compliance.

### Key Characteristics
- **Medical-Grade Security**: CFM and LGPD compliance (Targeting full compliance - see compliance framework docs)
- **High Performance**: Targeting sub-3 second load times with native VPS deployment (In progress - performance monitoring active)
- **Accessibility First**: WCAG 2.1 AA compliance throughout
- **Scalable Architecture**: React 18 with TypeScript and modern tooling
- **Brazilian Market Focus**: Localized for Brazilian healthcare regulations

## Technology Stack

### Frontend (React SPA)
```text
React 18.2.0          → Modern concurrent features
TypeScript 5.9.2      → Type safety and developer experience
Vite 7.1.7            → Fast build tool and dev server
Tailwind CSS 3.3.3    → Utility-first styling system
Framer Motion 12.23   → Smooth animations and interactions
Radix UI              → Accessible component primitives
```

### Backend & Infrastructure
```text
Node.js 22+           → ES modules with modern JavaScript
MySQL                 → Primary database for all application data
Redis                 → Session management, caching, and real-time features
Nginx                 → Web server and reverse proxy
Ubuntu/Debian VPS     → Native deployment without containers
```

### Development & Testing
```text
Vitest 3.2.4          → Modern testing framework
ESLint 9.36.0         → Code quality and consistency
React Testing Library → Component testing utilities
Playwright            → End-to-end testing (when needed)
TypeScript Strict     → Maximum type safety
```

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                 🌐 Internet Users                           │
│               (Patients & Staff)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│                🔒 Nginx Reverse Proxy                       │
│          SSL Termination + Security Headers                 │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    React    │  │  Node.js    │  │ WordPress   │        │
│  │     SPA     │  │     API     │  │  GraphQL    │        │
│  │             │  │             │  │             │        │
│  │ Port :80    │  │ Port :3001  │  │ Port :8080  │        │
│  │ /var/www/   │  │ /opt/api/   │  │ /var/www/wp │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────────────┐
                    │   🗄️ Databases   │
                    │                 │
                    │  MySQL          │  ← Primary data
                    │                 │     (patients, appointments, blog)
                    │                 │
                    │  Redis          │  ← Sessions, cache, real-time
                    └─────────────────┘
```

## Data Flow Patterns

### 1. Patient Interaction Flow
```text
Patient Browser → Nginx → React SPA → Node.js API → MySQL
                                   ↘
                                    → WordPress GraphQL → MySQL
```

### 2. Content Management Flow
```text
WordPress Admin → MySQL → GraphQL API → React Components → Patient View
```

### 3. Real-time Features
```text
Appointment Booking → Redis Pub/Sub → WebSocket → React UI Updates
```

## Key Architectural Decisions

### 1. Native VPS vs Containerization
**Decision**: Native VPS deployment without Docker
**Rationale**:
- Maximum performance for medical applications
- Simplified debugging and maintenance
- Direct OS-level optimizations
- Lower resource overhead

### 2. Unified Database Strategy
**Decision**: MySQL as primary database for all data
**Rationale**:
- Single database technology stack for simplicity
- MySQL: Mature, reliable, and well-understood
- Redis: Real-time features and caching
- Reduced complexity and maintenance overhead

### 3. WordPress Headless Integration
**Decision**: GraphQL-based headless WordPress
**Rationale**:
- Content management familiarity for medical staff
- SEO-optimized blog functionality
- Decoupled architecture for better performance
- Medical content compliance workflows

### 4. TypeScript Throughout
**Decision**: Strict TypeScript implementation
**Rationale**:
- Medical data requires type safety
- Better developer experience and maintenance
- Reduced runtime errors in production
- Enhanced IDE support and refactoring

## Security Architecture

### Medical Data Protection
```text
Input Validation → Sanitization → Encryption → Database → Audit Logs
                ↓
            CFM Compliance Validation
                ↓
            LGPD Privacy Controls
```

### Authentication & Authorization
```text
User Login → Node.js Auth → JWT Tokens → Role-Based Access → Protected Routes
```

### Infrastructure Security
```text
Let's Encrypt SSL → Security Headers → Rate Limiting → Input Validation → Audit Logging
```

## Performance Architecture

### Frontend Optimizations
- **Code Splitting**: All routes lazy-loaded
- **Bundle Optimization**: Strategic vendor chunking
- **Image Optimization**: WebP/AVIF with fallbacks
- **Critical CSS**: Above-the-fold optimization

### Backend Optimizations
- **Redis Caching**: API response, session caching, and real-time features
- **Database Indexing**: Optimized queries for medical data in MySQL
- **CDN Strategy**: Static asset optimization
- **Compression**: Gzip for all text content

### Monitoring & Observability
```text
Core Web Vitals → Performance API → Analytics Dashboard
Error Tracking → Logging System → Alert Management
Health Checks → Service Monitoring → Automated Recovery
```

## Compliance Architecture

### CFM (Brazilian Medical Council) Compliance
- **Medical Disclaimer System**: Automatic injection for medical content
- **Professional Identification**: CRM validation for medical professionals
- **Content Validation**: Real-time compliance checking
- **Audit Trail**: Complete logging of medical content interactions

### LGPD (Brazilian Data Protection) Compliance
- **Consent Management**: Granular consent tracking
- **Data Minimization**: Only collect necessary medical data
- **Right to Deletion**: Automated data removal workflows
- **Anonymization**: PII detection and automatic anonymization

## Deployment Architecture

### Build Process
```text
Git Push → CI/CD Pipeline → Test Suite → Build Validation → VPS Deployment
```

### Deployment Strategy
```text
Local Build → Validation → SSH Upload → Atomic Replacement → Health Check → Rollback if Failed
```

### Backup Strategy
```text
Daily: Application Files → Daily: MySQL Database Backup → Weekly: Redis Cache Backup → Monthly: Full System Backup
```

## Scalability Considerations

### Current Architecture Supports
- **Concurrent Users**: 1000+ simultaneous users
- **Database Load**: Optimized for medical clinic workload with MySQL
- **Content Volume**: Unlimited blog posts and medical content
- **File Storage**: Local file system with Redis caching

### Future Scaling Options
- **Horizontal Scaling**: Load balancer + multiple VPS instances
- **Database Scaling**: MySQL replication + read replicas
- **CDN Integration**: CloudFlare or similar for global reach
- **Microservices**: API decomposition for specialized medical services

## Development Workflow

### Local Development
```text
npm run dev → Hot Reload → Real-time Testing → Git Commit → PR Review
```

### Testing Strategy
```text
Unit Tests → Integration Tests → E2E Tests → Performance Tests → Security Scans
```

### Quality Assurance
```text
ESLint → TypeScript Check → Test Coverage → Accessibility Scan → Medical Compliance Check
```

## Business Context Integration

### Medical Industry Requirements
- **Regulatory Compliance**: CFM and LGPD built-in
- **Patient Privacy**: HIPAA-equivalent data protection
- **Professional Standards**: Medical content validation
- **Accessibility**: Healthcare accessibility standards (WCAG 2.1 AA)

### Brazilian Market Specifics
- **Portuguese Language**: Primary language with internationalization support
- **Local Regulations**: CFM compliance for medical websites
- **Payment Integration**: Brazilian payment method support
- **Regional SEO**: Optimized for Brazilian search engines

## Key Benefits

### For Patients
- **Fast Loading**: Sub-3 second page loads
- **Mobile Optimized**: Responsive design for all devices
- **Accessible**: Screen reader and keyboard navigation support
- **Secure**: Medical-grade data protection

### for Medical Staff
- **Easy Content Management**: WordPress admin interface
- **Compliance Automation**: Automatic CFM validation
- **Performance Monitoring**: Real-time system health
- **Professional Design**: Medical industry standards

### For Developers
- **Modern Stack**: Latest React and TypeScript features
- **Type Safety**: Comprehensive TypeScript implementation
- **Testing Coverage**: Automated testing at all levels
- **Documentation**: Comprehensive development guides

### For Operations
- **Monitoring**: Comprehensive health and performance monitoring
- **Automated Backups**: Daily, weekly, and monthly backups
- **Security Scanning**: Automated vulnerability detection
- **Recovery Procedures**: Documented emergency procedures

---

*This architecture summary provides a high-level overview. For detailed implementation information, consult the complete PROJECT_DOCUMENTATION.md file.*