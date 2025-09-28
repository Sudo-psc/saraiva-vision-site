# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saraiva Vision is a modern medical clinic website built with React 18, Vite, and TypeScript. It's a hybrid architecture application featuring a healthcare-focused frontend with comprehensive backend integration using native VPS services (no Docker containerization). This is a production medical website for an ophthalmology clinic in Caratinga, MG, Brazil, with strict compliance requirements for CFM (Brazilian Medical Council) and LGPD (General Data Protection Law).

## Tech Stack & Architecture

### Frontend
- **React 18** with Vite for build tooling and development server
- **TypeScript 5.x** for type safety
- **Tailwind CSS** for styling with design system
- **Framer Motion** for animations and micro-interactions
- **React Router** for client-side routing with lazy loading
- **Radix UI** for accessible component primitives

### Backend & APIs (Native VPS Services)
- **Node.js 22+** REST API with Express.js framework (native systemd service)
- **Supabase** as primary database and auth provider (external service)
- **Nginx** as web server and reverse proxy (native service)
- **WordPress Headless CMS** with PHP-FPM 8.1+ for blog content (native service)
- **MySQL** native database server for WordPress and local data
- **Redis** native cache server for performance optimization
- **ES modules** with modern JavaScript features

### Key Integration Points
- Instagram Graph API for social feed
- WhatsApp Business API for patient communication
- Google Maps API for clinic location
- Resend API for email services
- Spotify Web API for podcast content
- WordPress REST API for headless blog integration
- Google Business API for reviews and business information
- Supabase PostgreSQL as primary database with real-time subscriptions

## Commands

### Development
```bash
npm run dev              # Start development server (default port 3002)
npm run build            # Build for production
npm run preview          # Preview production build
npm run start            # Alternative start command (same as dev)
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:run         # Run all tests once
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate coverage report
npm run test:comprehensive  # Run unit, integration, API and frontend tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run end-to-end tests only
npm run test:performance # Run performance tests only
npm run test:api         # Test API functions only
npm run test:frontend    # Test React components only
npm run test:watch       # Run tests in watch mode (alias for npm test)
```

### Development Environment
```bash
npm run dev              # Start development server on port 3002
npm run start            # Alternative start command (same as dev)
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### API Development & Testing
```bash
# Test individual API endpoints directly
node api/health-check.js  # Test API health endpoints
node api/contact/test.js  # Test contact form functionality
node api/appointments/test.js  # Test appointment system

# API validation and linting
npm run lint:syntax-api   # Check API syntax errors
npm run lint:encoding-api   # Check API file encoding (UTF-8)
npm run validate:api        # Complete API validation (syntax + encoding)
```

### Deployment (Native VPS)
```bash
npm run build               # Build application for production
npm run deploy              # Build and copy to server (manual step)
npm run deploy:production   # Show manual deployment command
npm run deploy:health       # Run server health checks
npm run deploy:vps          # Check native VPS service status
npm run production:check    # Production readiness validation

# Manual deployment commands (run on VPS):
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
sudo systemctl restart saraiva-api  # If API updated
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm  # Verify all services
```

### Linting & Validation
```bash
npm run lint                # Run ESLint for code quality
npm run lint:syntax-api     # Check API syntax errors
npm run lint:encoding-api   # Check API file encoding (UTF-8)
npm run validate:api        # Complete API validation (syntax + encoding)
```

## Project Architecture

### Native VPS Architecture Overview
Saraiva Vision uses a **native VPS architecture** without Docker containerization for optimal performance:

- **Frontend (React SPA)**: Static files served by Nginx with efficient caching
- **Backend (Node.js API)**: REST API services running as native systemd services
- **Communication Flow**: User → Nginx → Static Files (frontend) / API Proxy (backend) → Node.js Services

### Native VPS Services
The server runs all services directly on the host OS (Ubuntu/Debian):
- **Web Server**: Nginx (native service) serving static files and proxying API requests
- **API Service**: Node.js application (systemd service) with Express.js for business logic
- **Blog CMS**: WordPress headless with PHP-FPM 8.1+ (native service) for blog content management
- **Database**: MySQL (native service) for WordPress and local data storage
- **External Database**: Supabase PostgreSQL for main application data
- **Cache**: Redis (native service) for performance optimization and session storage

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Base design system components (Radix UI based)
│   ├── icons/          # Custom icon components (Lucide React)
│   ├── blog/           # Blog-related components (BlogList, BlogPost)
│   ├── compliance/     # CFM compliance components
│   ├── instagram/      # Instagram feed integration with performance optimization
│   ├── ErrorBoundaries/ # Error handling with recovery mechanisms
│   └── __tests__/      # Component tests with React Testing Library
├── pages/              # Route-level page components with lazy loading
├── hooks/              # Custom React hooks (including useCFMCompliance)
├── lib/                # Core utilities and configurations
│   ├── lgpd/           # LGPD compliance utilities
│   └── __tests__/      # Library tests
├── contexts/           # React context providers (Auth, Analytics)
├── utils/              # Helper functions with error tracking
├── services/           # External service integrations (Google Business, Instagram, WordPress)
├── config/             # Configuration files (CFM rules, Google Business settings)
├── workers/            # Web Workers (CFM validation worker)
├── middleware/        # Request/response middleware
├── integrations/       # Third-party integrations (Google Business)
└── styles/             # Global CSS files with design system

api/                    # Node.js API endpoints (Express.js backend)
├── contact/            # Contact form endpoints with validation
├── appointments/       # Appointment booking system with scheduling
├── podcast/            # Podcast management and RSS processing
├── monitoring/         # Health checks and monitoring endpoints
├── google-reviews/     # Google Reviews API integration
├── instagram/          # Instagram API proxy and caching
├── wordpress/          # WordPress integration and webhooks
├── middleware/         # Security and validation middleware
├── __tests__/          # API tests with Supertest
└── src/               # API utilities and helpers

docs/                   # Documentation and deployment scripts
├── WORDPRESS_BLOG_SPECS.md    # Blog integration specifications
├── install-wordpress-blog.sh  # WordPress installation script
├── deploy-wordpress-blog.sh   # Deployment automation
├── monitor-wordpress-blog.sh  # Monitoring and health checks
├── nginx-wordpress-blog.conf  # Nginx configuration
└── php-fpm-wordpress.conf     # PHP-FPM configuration
```

### Key Architectural Patterns

#### Component Organization
- Page components in `src/pages/` handle routing and layout
- Reusable UI components in `src/components/` with test co-location
- Design system components in `src/components/ui/`
- Custom hooks in `src/hooks/` for shared stateful logic

#### API Architecture
- **Dual API Structure**: Both legacy `api/` root directory and modern `api/src/` structure
- **Legacy API**: Root `api/` directory with individual endpoint files (contact, appointments, etc.)
- **Modern API**: `api/src/` directory with organized routes and lib structure
- **Express.js Framework**: ES modules with modern JavaScript features
- **Database Operations**: Supabase client with TypeScript types and RLS policies
- **WordPress Integration**: REST API + GraphQL with SSL/CORS proxy fallback
- **Authentication**: Supabase Auth with role-based access control (user/admin/super_admin)
- **Message Queue**: Supabase `message_outbox` table for async email/SMS operations
- **Compliance**: CFM validation with Web Workers for non-blocking performance
- **Security**: Rate limiting, Zod schema validation, CORS configuration
- **Real-time**: Supabase websockets for live data subscriptions

#### State Management
- React Context for global state (Auth, Analytics, Widgets)
- Local component state for UI interactions
- Supabase real-time subscriptions for live data
- Custom hooks abstract complex state logic

#### Error Handling
- Global error boundaries for React component errors
- Centralized error tracking in `src/utils/errorTracking.js`
- API error handling with proper HTTP status codes
- Graceful fallbacks for external service failures

### Database Schema

#### Supabase Tables
Key tables defined in `src/lib/supabase.ts`:
- `contact_messages` - Contact form submissions with LGPD compliance
- `appointments` - Patient appointment bookings with reminder system
- `message_outbox` - Async message queue for emails/SMS with retry logic
- `podcast_episodes` - Podcast content management with RSS integration
- `profiles` - User authentication and authorization with role-based access
- `event_log` - Application event tracking with performance monitoring
- `review_cache` - Cached Google Business reviews with expiration

#### WordPress Database
WordPress blog content managed through MySQL:
- `wp_posts` - Blog posts and pages with CFM compliance metadata
- `wp_users` - WordPress admin users with access control
- `wp_postmeta` - Post metadata including CFM compliance status and SEO data
- `wp_terms` - Categories and tags for content organization
- Custom tables for CFM compliance tracking and audit logs
- Cache tables for performance optimization

### Testing Strategy
- **Unit Tests**: Component behavior with React Testing Library and Vitest
- **Integration Tests**: API endpoints with Vitest and Supertest
- **E2E Tests**: Critical user flows (when applicable)
- **Performance Tests**: Core Web Vitals and optimization validation
- **Coverage Target**: 80% minimum for core functionality with thresholds configured
- **Test Organization**: Tests co-located with source code in `__tests__/` directories
- **API Testing**: Separate API test suite in `api/__tests__/` with Express integration tests
- **Mock Configuration**: Centralized test setup in `src/__tests__/setup.js` with Supabase mocking

## Development Guidelines

### File Naming
- React components: PascalCase (`ContactForm.jsx`)
- Utilities/hooks: camelCase (`useAuth.js`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)
- Test files: `.test.jsx` or `.test.js` suffix

### Import Conventions
- Use `@/` alias for `src/` directory imports
- Absolute imports preferred over relative for `src/` files
- Group imports: React, external libraries, internal modules

### Code Style
- **ESLint Configuration**: React rules with TypeScript parser, excludes `api/` directory (has separate linting)
- **TypeScript**: Partial strict mode (strict: false) for legacy compatibility
- **Styling**: Tailwind CSS only (avoid inline styles)
- **Components**: Prefer composition over inheritance
- **Imports**: Use absolute imports with `@/` alias for `src/` directory
- **API Linting**: Separate validation with `npm run validate:api` for syntax and encoding checks

### Environment Configuration
- Development: `.env` file with local configurations
- Production: Environment variables on server and VPS
- Required vars: Supabase URL/keys, Google Maps API, Resend API, WordPress endpoints
- Vite environment variables prefixed with `VITE_` for client-side access

### Development Server Configuration
- Development server runs on port 3002 with hot reload
- Proxy configuration for WordPress API (localhost:8083) and Google Places API
- Health check API proxy (localhost:3001) for backend services
- CORS headers configured for cross-origin development
- WordPress GraphQL proxy endpoint: `/api/wordpress-graphql/graphql` for SSL/CORS bypass

## Performance Considerations

### Bundle Optimization
- Lazy loading for route components with React Router
- Code splitting configured in `vite.config.js` with manual chunk strategy
- Tree shaking enabled for production builds
- Chunk optimization for vendor dependencies (React isolated, utilities separated)
- ESBuild minification with modern target (ES2020)
- Assets inline limit increased for VPS performance (8192 bytes)

### Runtime Performance
- React.memo for expensive re-renders
- Debounced inputs for search/filter operations
- IntersectionObserver for lazy loading and performance optimization
- RequestAnimationFrame for smooth animations
- PerformanceObserver API for real-time monitoring
- Web Vitals tracking with Core Web Metrics
- GPU acceleration for animations and 3D effects

### Database Performance
- Supabase RLS policies for security
- Indexed queries for common operations
- Connection pooling handled by Supabase
- Optimistic updates for better UX

## Security & Compliance

### Authentication & Authorization
- Supabase Auth for user management
- Role-based access control (user/admin/super_admin)
- Protected routes via `ProtectedRoute` component
- Session management with automatic refresh

### Medical Compliance (CFM)
- **Brazilian Medical Council (CFM) compliance** system with automated validation
- **CFM Compliance Component** (`src/components/compliance/CFMCompliance.jsx`) for real-time content validation
- **useCFMCompliance Hook** (`src/hooks/useCFMCompliance.js`) with Web Worker integration
- **Medical disclaimer injection** for all medical content
- **CRM identification validation** ensuring proper medical responsibility
- **PII detection and anonymization** to prevent patient data exposure
- **Compliance scoring system** with actionable recommendations

### Data Privacy (LGPD Compliance)
- Consent management system in `src/components/ConsentManager.jsx`
- Data anonymization utilities in `src/lib/lgpd/`
- **CFM-integrated PII protection** with pattern detection for CPF, patient names, birth dates
- Audit logging for data access and compliance validation
- User data deletion capabilities
- **Secure cache keys** using SHA-256 hashing to prevent sensitive data exposure

### API Security
- Input validation using Zod schemas
- Rate limiting on contact forms
- CORS configuration in Express.js middleware
- Security headers for production
- **WordPress API security** with authenticated endpoints and content validation

## SEO & Schema.org Implementation

### Structured Data Markup
The project includes comprehensive Schema.org structured markup for medical SEO:

#### Medical Schema Types Implemented
- **MedicalClinic**: Primary business entity with location, services, and contact info
- **Physician**: Medical professionals with credentials and specialties
- **MedicalOrganization**: Organizational structure and certifications
- **LocalBusiness**: Local search optimization with geo-coordinates
- **MedicalProcedure**: Available services and treatments
- **FAQPage**: Structured FAQ content for rich snippets

#### Schema Files
- `src/lib/schemaMarkup.js` - Main schema generation functions
- `src/lib/serviceFAQSchema.js` - Service-specific FAQ schemas
- `api/src/lib/schemaMarkup.js` - API-side schema generation
- `src/utils/schemaValidator.js` - Schema.org validation utilities
- `src/hooks/useSEO.js` - SEO hook with integrated schema support

#### Rich Snippets Support
- Business information (address, hours, contact)
- Medical procedures and services
- FAQ sections with structured Q&A
- Professional credentials and certifications
- Patient reviews and ratings integration

## Common Development Tasks

### Adding New API Endpoint
1. Create route in `api/` directory using Express.js
2. Add corresponding test in `api/__tests__/`
3. Update TypeScript types if needed
4. Configure route middleware and validation

### Creating New Component
1. Add component file in appropriate `src/components/` subdirectory
2. Create test file in same directory
3. Export from component if reusable
4. Add to design system if it's a UI primitive

### Adding Blog Content with CFM Compliance
1. Create content in WordPress admin at `https://blog.saraivavision.com.br/wp-admin`
2. Content automatically validated against CFM compliance rules
3. Use `CFMCompliance` component for real-time validation in React
4. Medical disclaimers automatically injected per CFM regulations

### Database Schema Changes
1. Update types in `src/lib/supabase.ts`
2. Add migration to `database/migrations/`
3. Update related API functions
4. Add corresponding tests

### WordPress Blog Management (Native Installation)
1. **Installation**: Run `docs/install-wordpress-blog.sh` as root (installs native MySQL, PHP-FPM, WordPress)
2. **Deployment**: Use `docs/deploy-wordpress-blog.sh` for updates (no Docker, direct file operations)
3. **Monitoring**: Run `docs/monitor-wordpress-blog.sh` for health checks (native service monitoring)
4. **Configuration**: Nginx and PHP-FPM configs in `docs/` directory (native service configurations)

### Performance Monitoring
- Real-time metrics via `src/hooks/usePerformanceMonitor.js`
- Core Web Vitals tracking
- Error rate monitoring
- Bundle analysis tools available

## Deployment Configuration

### Native VPS Deployment (No Docker)

#### Server Configuration
The project is deployed on a single Linux VPS using native services:
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (served by Nginx)
- **Node.js Version**: 22+ minimum (as specified in package.json engines)
- **Location**: Brazilian data center (31.97.129.78) for optimal local performance
- **SSL**: Let's Encrypt certificates managed by Nginx

#### Native Service Architecture
Services running directly on Ubuntu/Debian VPS without containerization:
- **Nginx**: Web server serving static files and reverse proxy for APIs
- **Node.js**: Native Node.js runtime for API services
- **MySQL**: Native MySQL server for relational data (WordPress, user data)
- **Redis**: Native Redis server for caching and session storage
- **PHP-FPM 8.1+**: Native PHP-FPM for WordPress CMS
- **Supabase**: External PostgreSQL database service for main application data

#### Native Deployment Process
1. **Build**: `npm run build` creates production-ready static files in `dist/`
2. **Deploy**: Manual copy to web directory and service reload
3. **Static Files**: Nginx serves React SPA from `/var/www/html/`
4. **API Proxy**: Nginx proxies `/api/*` requests to Node.js backend
5. **Process Management**: systemd services for Node.js API processes
6. **No Containerization**: All services run directly on host OS

#### Manual Deployment Steps
```bash
# Build application
npm run build

# Copy static files to web directory
sudo cp -r dist/* /var/www/html/

# Reload Nginx to serve new files
sudo systemctl reload nginx

# Optional: Restart Node.js API service if updated
sudo systemctl restart saraiva-api

# Verify services are running
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm
```

### Environment Variables Required
```
# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=

# External APIs
VITE_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=

# WordPress Integration
VITE_WORDPRESS_API_URL=https://blog.saraivavision.com.br/wp-json/wp/v2
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql

# WordPress Database (Native VPS)
WORDPRESS_DB_NAME=saraiva_blog
WORDPRESS_DB_USER=wp_blog_user
WORDPRESS_DB_PASSWORD=secure_password

# Development Configuration
NODE_ENV=production
VITE_GRAPHQL_TIMEOUT=15000
VITE_GRAPHQL_MAX_RETRIES=3
```

## Troubleshooting Common Issues

### Build Failures
- Check Node.js version (requires 18+)
- Verify environment variables are set
- Clear node_modules and npm cache if needed

### Database Connection Issues
- Verify Supabase environment variables
- Check RLS policies for data access
- Ensure database migrations are applied

### API Service Errors
- Check service logs with `journalctl -u saraiva-api` or PM2 logs
- Verify Node.js process and memory usage
- Test locally with `npm run dev`
- Check Nginx proxy configuration in `/etc/nginx/sites-available/`
- Verify all native services are running: `sudo systemctl status nginx mysql redis php8.1-fpm`
- Test individual API endpoints: `node api/health-check.js`, `node api/contact/test.js`

### SSL Certificate Issues
- WordPress GraphQL SSL errors are common - check `docs/nginx-cors.conf`
- Use Certbot for SSL certificate renewal: `sudo certbot renew`
- Verify SSL configuration: `openssl s_client -connect cms.saraivavision.com.br:443`
- Check SSL Labs grade: https://www.ssllabs.com/ssltest/

### WordPress Integration Issues
- Verify WordPress is running on port 8080: `curl http://localhost:8080/`
- Check WordPress database connection: `sudo systemctl status mysql`
- Test WordPress REST API: `curl http://localhost:8080/wp-json/wp/v2/posts`
- Verify CORS headers for GraphQL endpoint
- Test GraphQL proxy: `curl -X POST http://localhost:3002/api/wordpress-graphql/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'`

### Performance Issues
- Monitor Core Web Vitals with `src/hooks/usePerformanceMonitor.js`
- Check Redis cache status: `sudo systemctl status redis`
- Verify Nginx caching configuration
- Use browser DevTools Network tab to analyze load times

This codebase prioritizes medical industry standards, accessibility compliance, and Brazilian market requirements while maintaining modern development practices and performance optimization.