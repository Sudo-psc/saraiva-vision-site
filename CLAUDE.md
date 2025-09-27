# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saraiva Vision is a modern medical clinic website built with React 18, Vite, and TypeScript. It's a full-stack application featuring a healthcare-focused frontend with comprehensive backend API integration using Node.js APIs and Supabase as the database.

## Tech Stack & Architecture

### Frontend
- **React 18** with Vite for build tooling and development server
- **TypeScript 5.x** for type safety
- **Tailwind CSS** for styling with design system
- **Framer Motion** for animations and micro-interactions
- **React Router** for client-side routing with lazy loading
- **Radix UI** for accessible component primitives

### Backend & APIs
- **Node.js 22+** REST API with Express.js framework
- **Supabase** as primary database and auth provider
- **Nginx** as web server and reverse proxy
- **WordPress Headless CMS** with PHP-FPM 8.1+ for blog content
- **ES modules** with modern JavaScript features

### Key Integration Points
- Instagram Graph API for social feed
- WhatsApp Business API for patient communication
- Google Maps API for clinic location
- Resend API for email services
- Spotify Web API for podcast content
- WordPress REST API for headless blog integration

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

### Deployment
```bash
npm run deploy              # Deploy to production server
npm run deploy:preview      # Deploy to staging environment
npm run deploy:production   # Copy dist/ to server and reload nginx
npm run deploy:health       # Run server health checks
npm run production:check    # Production readiness validation
```

### Linting & Validation
```bash
npm run lint                # Run ESLint for code quality
npm run lint:syntax-api     # Check API syntax errors
npm run lint:encoding-api   # Check API file encoding (UTF-8)
npm run validate:api        # Complete API validation (syntax + encoding)
```

## Project Architecture

### Server Architecture Overview
Saraiva Vision uses a **unified server architecture** deployed directly on Nginx for optimal performance:

- **Frontend (React SPA)**: Static files served by Nginx with efficient caching
- **Backend (Node.js API)**: REST API services running on the same server
- **Communication Flow**: User → Nginx → Static Files (frontend) / API Proxy (backend) → Node.js Services

### Server Services
The server runs native services without containerization:
- **Web Server**: Nginx serving static files and proxying API requests
- **API Service**: Node.js application with Express.js for business logic
- **Blog CMS**: WordPress headless with PHP-FPM 8.1+ for blog content management
- **Database**: MySQL for relational data storage (Supabase + WordPress)
- **Cache**: Redis for performance optimization

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Base design system components
│   ├── icons/          # Custom icon components
│   ├── blog/           # Blog-related components (BlogList, BlogPost)
│   ├── compliance/     # CFM compliance components
│   └── __tests__/      # Component tests
├── pages/              # Route-level page components
├── hooks/              # Custom React hooks (including useCFMCompliance)
├── lib/                # Core utilities and configurations
├── contexts/           # React context providers
├── utils/              # Helper functions
├── services/           # External service integrations (WordPress API)
├── config/             # Configuration files (CFM rules, settings)
├── workers/            # Web Workers (CFM validation worker)
└── styles/             # Global CSS files

api/                    # Node.js API endpoints (backend)
├── contact/            # Contact form endpoints
├── appointments/       # Appointment booking system
├── podcast/            # Podcast management
└── __tests__/          # API tests

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
- RESTful APIs in `api/` directory using Express.js framework
- Database operations through Supabase client with TypeScript types
- WordPress REST API integration for headless blog content
- Authentication handled via Supabase Auth with role-based access control
- Message queue system using Supabase `message_outbox` table
- CFM compliance validation with Web Workers for non-blocking performance

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
- `contact_messages` - Contact form submissions
- `appointments` - Patient appointment bookings
- `message_outbox` - Async message queue for emails/SMS
- `podcast_episodes` - Podcast content management
- `profiles` - User authentication and authorization
- `event_log` - Application event tracking

#### WordPress Database
WordPress blog content managed through MySQL:
- `wp_posts` - Blog posts and pages
- `wp_users` - WordPress admin users
- `wp_postmeta` - Post metadata including CFM compliance status
- `wp_terms` - Categories and tags for content organization
- Custom tables for CFM compliance tracking and audit logs

### Testing Strategy
- **Unit Tests**: Component behavior with React Testing Library
- **Integration Tests**: API endpoints with Vitest and Supertest
- **E2E Tests**: Critical user flows (when applicable)
- **Coverage Target**: 80% minimum for core functionality

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
- ESLint configuration enforces consistent formatting
- TypeScript strict mode enabled
- Tailwind CSS for all styling (avoid inline styles)
- Prefer composition over inheritance for components

### Environment Configuration
- Development: `.env` file with local configurations
- Production: Environment variables on server
- Required vars defined in `src/lib/supabase.ts`

## Performance Considerations

### Bundle Optimization
- Lazy loading for route components
- Code splitting configured in `vite.config.js`
- Tree shaking enabled for production builds
- Chunk optimization for vendor dependencies

### Runtime Performance
- React.memo for expensive re-renders
- Debounced inputs for search/filter operations
- IntersectionObserver for lazy loading
- Service Worker for caching (development only)

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

### WordPress Blog Management
1. **Installation**: Run `docs/install-wordpress-blog.sh` as root
2. **Deployment**: Use `docs/deploy-wordpress-blog.sh` for updates
3. **Monitoring**: Run `docs/monitor-wordpress-blog.sh` for health checks
4. **Configuration**: Nginx and PHP-FPM configs in `docs/` directory

### Performance Monitoring
- Real-time metrics via `src/hooks/usePerformanceMonitor.js`
- Core Web Vitals tracking
- Error rate monitoring
- Bundle analysis tools available

## Deployment Configuration

### Unified Server Deployment

#### Server Configuration
The project is deployed on a single Linux server with Nginx:
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (served by Nginx)
- **Node.js Version**: 18.x minimum (as specified in package.json engines)
- **Location**: Brazilian data center for optimal local performance
- **SSL**: Let's Encrypt certificates managed by Nginx

#### Service Architecture
Native services running directly on the server:
- **Nginx**: Web server serving static files and proxying API requests
- **Node.js API**: Express.js application for backend services
- **MySQL**: Database server for data storage
- **Redis**: Cache server for performance optimization
- **PHP-FPM**: For WordPress CMS (if needed)

#### Deployment Process
- **Build**: `npm run build` creates production-ready static files in `dist/`
- **Deploy**: `npm run deploy:production` copies files to `/var/www/html/` and reloads nginx
- **Nginx**: Configured to serve static files and proxy API requests
- **Process Management**: PM2 or systemd for Node.js service management
- **Manual Deploy**: `sudo cp -r dist/* /var/www/html/ && sudo systemctl reload nginx`

### Environment Variables Required
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=

# WordPress Blog Integration
VITE_WORDPRESS_API_URL=https://blog.saraivavision.com.br/wp-json/wp/v2
WORDPRESS_DB_NAME=saraiva_blog
WORDPRESS_DB_USER=wp_blog_user
WORDPRESS_DB_PASSWORD=secure_password
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
- Check service logs with `journalctl` or PM2 logs
- Verify Node.js process and memory usage
- Test locally with `npm run dev`
- Check Nginx proxy configuration

This codebase prioritizes medical industry standards, accessibility compliance, and Brazilian market requirements while maintaining modern development practices and performance optimization.