# Implementation Plan

- [x] 1. Set up VPS infrastructure and WordPress headless deployment
  - Configure Ubuntu 22.04 VPS with Docker and Docker Compose
  - Create Docker Compose configuration for WordPress, MySQL, Redis, and Nginx
  - Set up SSL certificates with Let's Encrypt for cms.saraivavision.com.br
  - Install and configure WordPress plugins: WPGraphQL, Redis Object Cache, JWT Auth
  - _Requirements: 1.2, 1.3_

- [x] 2. Create Supabase database schema and RLS policies
  - Implement database tables: contact_messages, appointments, message_outbox, podcast_episodes, event_log
  - Create Row Level Security policies for service role and admin access
  - Set up database indexes for performance optimization
  - Configure Supabase Auth for admin dashboard access
  - _Requirements: 3.2, 5.1, 8.2, 8.5_

- [x] 3. Implement WordPress GraphQL integration in Next.js
  - Create GraphQL client configuration for WordPress API consumption
  - Build content fetching utilities for pages, posts, and custom post types
  - Implement ISR (Incremental Static Regeneration) for WordPress content
  - Create webhook endpoint for WordPress revalidation triggers
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 4. Build contact form API with Resend integration and outbox pattern
  - Create Zod validation schemas for contact form data
  - Implement rate limiting system with IP hashing for spam protection
  - Build contact API endpoint with Resend email integration
  - Create message outbox system for reliable email delivery with retry logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Develop appointment scheduling system with availability management
  - Create availability calculation logic for Monday-Friday 08:00-18:00 slots
  - Implement appointment booking API with conflict detection
  - Build appointment confirmation system with unique tokens
  - Create automated email and SMS notification system via Resend and Zenvia
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Implement podcast synchronization with Spotify integration
  - Create Spotify RSS feed parser for episode metadata extraction
  - Build podcast sync API endpoint with incremental update logic
  - Implement episode caching system in Postgres database
  - Create podcast display components with embedded Spotify players
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Build AI chatbot system with OpenAI integration
  - Create chatbot API endpoint with OpenAI GPT integration
  - Implement medical guardrails and conversation context management
  - Build chatbot widget component with floating interface
  - Create conversation logging system with anonymized data storage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Create operational dashboard with real-time monitoring
  - Build dashboard API endpoints for system metrics and KPI calculation
  - Implement service health checking for external dependencies
  - Create dashboard UI components for metrics visualization
  - Build real-time data refresh system with 30-second intervals
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Implement analytics integration with PostHog
  - Set up PostHog analytics tracking for conversion funnel events
  - Create custom event tracking for appointments, contacts, and user interactions
  - Implement UTM parameter tracking for traffic source analysis
  - Build analytics dashboard components for funnel visualization
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Add WhatsApp integration and floating widget
  - Create WhatsApp floating widget component with responsive design
  - Implement WhatsApp deep linking with pre-filled clinic information
  - Add professional greeting message configuration
  - Ensure mobile compatibility with native WhatsApp app integration
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 11. Implement LGPD compliance and data privacy features
  - Create consent management system with explicit privacy notices
  - Implement data encryption for sensitive information at rest and in transit
  - Build data anonymization utilities for patient request handling
  - Create access control system with role-based permissions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Build comprehensive logging and monitoring system
  - Implement structured logging system with centralized event storage
  - Create error tracking and alerting system for email/SMS delivery failures
  - Build performance monitoring with response time and error rate tracking
  - Implement log sanitization to prevent PII exposure in log entries
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Create message outbox processing system with cron jobs
  - Implement outbox drain API endpoint for processing pending messages
  - Create retry logic with exponential backoff for failed deliveries
  - Build webhook handlers for Resend and Zenvia delivery status updates
  - Set up Vercel cron jobs for automated message processing
  - _Requirements: 3.3, 4.2, 4.3_

- [x] 14. Implement appointment reminder system
  - Create reminder scheduling logic for T-24h and T-2h notifications
  - Build reminder processing system with outbox integration
  - Implement reminder status tracking to prevent duplicate sends
  - Create reminder template system for email and SMS notifications
  - _Requirements: 4.3_

- [x] 15. Build comprehensive test suite for all components
  - Write unit tests for API endpoints, validation schemas, and business logic
  - Create integration tests for WordPress GraphQL integration and external services
  - Implement end-to-end tests for complete user workflows (contact, booking, confirmation)
  - Add performance tests for appointment availability calculation and concurrent bookings
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_

- [x] 16. Configure Vercel deployment with environment variables and cron jobs
  - Set up production and preview environment configurations in Vercel
  - Configure secure environment variable storage for API keys and secrets
  - Set up Vercel cron jobs for outbox processing and podcast synchronization
  - Test deployment process and serverless function performance optimization
  - _Requirements: 1.5, 2.1, 3.1, 4.2, 5.5_

- [x] 17. Implement security hardening and rate limiting
  - Add comprehensive input validation and XSS prevention across all endpoints
  - Implement CORS configuration and security headers
  - Create honeypot fields and advanced spam detection for forms
  - Add IP-based rate limiting with configurable thresholds
  - _Requirements: 3.3, 8.2, 8.5_

- [x] 18. Create admin authentication and dashboard access control
  - Implement Supabase Auth integration for admin users
  - Create protected dashboard routes with role-based access control
  - Build admin login interface with secure session management
  - Add admin user management system with appropriate permissions
  - _Requirements: 5.1, 5.5, 8.5_

- [x] 19. Build error handling and user feedback systems
  - Create comprehensive error response mapping for all API endpoints
  - Implement user-friendly error messages with recovery guidance
  - Add accessibility-compliant error announcements for screen readers
  - Create fallback mechanisms for external service failures
  - _Requirements: 3.4, 4.5, 7.5, 9.5_

- [x] 20. Finalize deployment and production readiness
  - Complete production deployment testing for both VPS and Vercel components
  - Verify SSL certificate configuration and automatic renewal
  - Test backup and recovery procedures for WordPress and database
  - Conduct final security audit and performance optimization
  - _Requirements: 1.2, 8.2, 9.3_