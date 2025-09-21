# SPEC-001 - Backend Integration Strategy for Saraiva Vision

## Executive Summary

This document outlines the comprehensive backend integration strategy for Saraiva Vision's ophthalmology clinic website, implementing a hybrid Vercel + VPS Linux architecture. The strategy focuses on modernizing the clinic's digital presence with WordPress headless CMS, automated podcast synchronization, intelligent appointment scheduling, and robust customer communication systems.

## Project Overview

### Business Context
Saraiva Vision is an ophthalmology clinic requiring:
- **Corporate website** with manageable content via CMS
- **Podcast page** with automatic Spotify synchronization
- **Contact forms** with email delivery and audit trail
- **Appointment scheduling** with automated confirmations (< 1 minute)
- **Operational dashboard** for real-time service visibility
- **Analytics** for conversion tracking and system stability
- **WhatsApp widget** with AI chatbot for customer triage

### Key Requirements (MoSCoW)

#### Must Have
- [ ] WordPress headless CMS on VPS Linux with WPGraphQL/REST API
- [ ] Podcast page synchronized with Spotify
- [ ] Contact form with Resend API + database persistence
- [ ] Appointment scheduling with automatic email/SMS confirmations
- [ ] Operational dashboard (service status, queues, failures)
- [ ] Funnel analytics (visit → contact → appointment → confirmation)
- [ ] WhatsApp widget with AI chatbot for self-service
- [ ] LGPD compliance (consent, legal basis, data minimization)
- [ ] Observability (centralized logs, metrics, failure alerts)

#### Should Have
- [ ] Editorial content panel (Marketing/Editor, Admin roles)
- [ ] ReCAPTCHA/hCaptcha and rate limiting
- [ ] Delivery failure webhooks (bounce/complaint, rescheduled appointments)
- [ ] Technical SEO and Core Web Vitals optimization

#### Could Have
- [ ] CSV/Google Sheets export for leads and appointments
- [ ] Personal calendar integration (iCal) for doctor
- [ ] Analytics segmentation by traffic source and UTM campaigns

#### Won't Have (MVP)
- [ ] EMR/ERP system integration
- [ ] Multi-doctor or complex scheduling
- [ ] Online payment processing (Phase 2 consideration)

## Architecture Overview

### Hybrid Infrastructure Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   VPS Linux     │    │   Supabase      │
│                 │    │                 │    │                 │
│  Next.js App    │────┤  WordPress      │────┤  PostgreSQL     │
│  API Routes     │    │  Headless CMS   │    │  Auth Service   │
│  Edge Functions │    │  MariaDB        │    │  Storage        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────────┐
         │                    External Services                    │
         │  Resend Email  │  Zenvia SMS  │  Spotify  │  PostHog   │
         └─────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend/Backend (Vercel)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Deployment**: Vercel Edge Functions

#### CMS (VPS Linux)
- **Platform**: WordPress 6.5+
- **Language**: PHP 8.2
- **Database**: MariaDB 10.6
- **Web Server**: Nginx
- **Caching**: Redis
- **API**: WPGraphQL (preferred) or REST API

#### Database & Services
- **Primary DB**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **SMS**: Zenvia (Brazil)
- **Analytics**: PostHog + Vercel Analytics
- **Podcast**: Spotify API/RSS

## Core Components

### 1. WordPress Headless CMS
**Location**: VPS Linux (cms.saraivavision.com.br)
**Purpose**: Content management for institutional pages and blog

**Key Features**:
- WPGraphQL for flexible content queries
- Redis object caching for performance
- JWT authentication for protected endpoints
- Webhook integration for content revalidation
- Media management and SEO optimization

**Required Plugins**:
- WPGraphQL
- WPGraphQL CORS
- Redis Object Cache
- WP Webhooks
- Yoast SEO (optional)
- Disable Comments (optional)
- Limit Login Attempts

### 2. Next.js Application
**Location**: Vercel (saraivavision.com.br)
**Purpose**: Frontend application and API backend

**Key Features**:
- Static Site Generation (SSG) for optimal performance
- Incremental Static Regeneration (ISR) for content updates
- API Routes for backend functionality
- Edge Functions for global performance
- TypeScript for type safety

### 3. Database Schema (Supabase)

```sql
-- Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  confirmation_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT
);

-- Message Outbox (Transactional)
CREATE TABLE message_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- email, sms
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, delivered
  send_after TIMESTAMPTZ,
  attempt_count INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  related_type TEXT, -- contact, appointment
  related_id UUID
);

-- Podcast Episodes
CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  duration INTEGER, -- seconds
  published_at TIMESTAMPTZ,
  image_url TEXT,
  explicit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Log
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB,
  level TEXT DEFAULT 'info', -- info, warn, error
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  ip_address INET
);
```

### 4. API Endpoints (Next.js Routes)

#### Contact Management
- `POST /api/contact` - Submit contact form with validation
- `GET /api/contact/messages` (admin) - Retrieve contact messages

#### Appointment System
- `GET /api/availability` - Get available time slots
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/confirm?token={token}` - Confirm appointment
- `POST /api/appointments/cancel` - Cancel appointment

#### Content Management
- `GET /api/posts` - Fetch blog posts from WordPress
- `GET /api/pages` - Fetch pages from WordPress
- `POST /api/webhooks/wp-revalidate` - Handle content updates

#### Podcast Integration
- `GET /api/podcast/episodes` - Get podcast episodes
- `POST /api/podcast/sync` (cron) - Sync with Spotify

#### Messaging
- `POST /api/outbox/drain` (cron) - Process pending messages
- `POST /api/webhooks/resend` - Handle email delivery status
- `POST /api/webhooks/zenvia` - Handle SMS delivery status

#### Chatbot
- `POST /api/chatbot` - AI-powered customer service

#### Dashboard
- `GET /api/status` (admin) - System health metrics
- `GET /api/analytics` (admin) - Analytics data

## Security & Compliance

### LGPD Compliance
- **Data Minimization**: Collect only essential information
- **Explicit Consent**: Clear opt-in mechanisms for all data processing
- **Legal Basis**: Document legitimate interests for data processing
- **Data Retention**: Automatic deletion of old records
- **Access Control**: Role-based access to sensitive data
- **Encryption**: Data encrypted at rest and in transit
- **Anonymization**: Capability to anonymize data upon request

### Security Measures
- **Authentication**: JWT tokens for API access
- **Rate Limiting**: Prevent abuse of public endpoints
- **Input Validation**: Zod schemas for all API inputs
- **CORS**: Restricted cross-origin requests
- **HTTPS**: Mandatory TLS encryption
- **Headers**: Security headers (HSTS, CSP, XSS protection)
- **Monitoring**: Real-time security event logging

## Performance & Monitoring

### Key Performance Indicators
- **Content Updates**: < 1 minute reflection time
- **Email Delivery**: < 60 seconds confirmation delivery
- **SMS Delivery**: < 60 seconds confirmation delivery
- **Uptime**: 99.9% service availability
- **Response Time**: < 500ms for API endpoints
- **Success Rate**: > 99% for transactional messages

### Monitoring Strategy
- **Infrastructure**: Vercel monitoring, VPS health checks
- **Application**: Error tracking, performance metrics
- **Business**: Funnel conversion rates, appointment success
- **Security**: Failed login attempts, suspicious activities

## Deployment Strategy

### Environment Setup
1. **VPS Configuration**: Ubuntu 22.04, Docker, Nginx
2. **WordPress Installation**: Headless setup with GraphQL
3. **Database**: Supabase project with RLS enabled
4. **Frontend**: Next.js application on Vercel
5. **DNS Configuration**: Proper routing between services

### CI/CD Pipeline
- **Frontend**: Automatic deployment on Vercel
- **Content**: WordPress webhook-triggered revalidation
- **Database**: Schema migrations via Supabase
- **Monitoring**: Automated alerts for critical issues

## Timeline & Milestones

### Phase 1: Infrastructure Setup (5-7 days)
- [ ] VPS provisioning and Docker setup
- [ ] WordPress headless installation
- [ ] Database schema creation
- [ ] Basic Next.js application structure

### Phase 2: Core Features (10-14 days)
- [ ] WordPress integration
- [ ] Contact form implementation
- [ ] Appointment scheduling system
- [ ] Message outbox processing

### Phase 3: Advanced Features (8-10 days)
- [ ] Podcast synchronization
- [ ] AI chatbot integration
- [ ] Dashboard development
- [ ] Analytics implementation

### Phase 4: Optimization (5-7 days)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing and validation
- [ ] Documentation completion

## Success Metrics

### Technical Metrics
- **Content Update Latency**: < 1 minute
- **API Response Time**: < 500ms (p95)
- **Message Delivery Success**: > 99%
- **System Uptime**: > 99.9%
- **Error Rate**: < 0.1%

### Business Metrics
- **Contact Form Conversion**: > 70%
- **Appointment Confirmation Rate**: > 90%
- **WhatsApp Chatbot Engagement**: > 50%
- **Content Engagement**: Time on site > 3 minutes
- **Mobile Traffic**: > 60% of total traffic

## Risk Management

### Technical Risks
- **Service Downtime**: Redundant systems and monitoring
- **Data Loss**: Regular backups and testing
- **Performance Issues**: Caching and optimization
- **Security Breaches**: Regular security audits

### Business Risks
- **User Adoption**: Clear onboarding and support
- **Regulatory Compliance**: Legal review and documentation
- **Cost Overruns**: Regular budget reviews
- **Timeline Delays**: Agile methodology and regular check-ins

## Conclusion

This backend integration strategy provides a robust, scalable foundation for Saraiva Vision's digital transformation. By leveraging modern technologies and best practices, the system will deliver exceptional user experience while maintaining security and compliance requirements.

## Next Steps

1. **Infrastructure Procurement**: Acquire VPS and configure DNS
2. **Development Environment**: Set up local development tools
3. **Team Alignment**: Review technical approach with stakeholders
4. **Sprint Planning**: Break down work into 2-week sprints
5. **Initial Development**: Begin with core infrastructure components

---

*This document should be reviewed and updated regularly as the project progresses and requirements evolve.*