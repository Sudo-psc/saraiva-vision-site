# Saraiva Vision Project Context - Session Activation

## Project Overview
**Saraiva Vision** is a modern medical clinic website for ophthalmology services in Caratinga, Minas Gerais, Brazil. Built with React 18, TypeScript, and Supabase, featuring comprehensive patient management, appointment scheduling, and telemedicine capabilities.

## Current Development State
- **Branch**: `vps-deployment-optimization`
- **Last Major Update**: VPS deployment optimization with complete Docker containerization
- **Status**: Production-ready with medical-grade compliance
- **Architecture**: Hybrid Vercel frontend + VPS backend with Docker containerization

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript and Vite build system
- **Tailwind CSS** with custom design system
- **Radix UI** for accessible component primitives
- **Framer Motion** for animations and interactions
- **React Router** with lazy loading for performance
- **Supabase** for authentication and real-time data

### Backend Architecture
- **Vercel Functions** (Serverless) for API endpoints
- **Supabase** as primary database (PostgreSQL)
- **Node.js 22+** runtime with ES modules
- **Redis** for caching and session management
- **Message queue system** for async operations

### Key Features Implemented
- **Patient Management**: Complete registration and profile management
- **Appointment System**: Online booking with confirmation and reminders
- **Contact Forms**: Multi-channel communication (email, SMS, WhatsApp)
- **Podcast Integration**: Medical content distribution via Spotify
- **Google Reviews**: Patient testimonial management
- **Instagram Feed**: Social media integration
- **LGPD Compliance**: Brazilian data protection regulations
- **Accessibility**: WCAG 2.1 AA compliance

## Database Schema (Supabase)
Key tables with comprehensive TypeScript types:
- `contact_messages` - Patient inquiries and communications
- `appointments` - Booking system with status management
- `message_outbox` - Async email/SMS queue
- `podcast_episodes` - Content management
- `profiles` - User authentication and roles
- `event_log` - Comprehensive audit trail

## API Endpoints Structure
```
api/
├── contact/          # Contact form and communication
├── appointments/     # Booking and management
├── podcast/          # Content management
├── analytics/       # Performance tracking
├── monitoring/      # Health checks
├── security/         # Authentication and auth
├── webhooks/         # External integrations
└── utils/           # Shared utilities
```

## Development Environment

### Essential Commands
```bash
# Development
npm run dev              # Start dev server (port 3002)
npm run build            # Production build
npm run preview          # Preview build

# Testing
npm test                 # Run tests
npm run test:coverage    # Coverage report
npm run test:comprehensive  # Full test suite

# Deployment
npm run deploy:vps       # VPS deployment
./deploy-docker.sh       # Docker deployment
./deploy-prod.sh         # Production deployment
```

### Environment Configuration
Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `RESEND_API_KEY` - Email service API
- `GOOGLE_MAPS_API_KEY` - Maps integration
- `VITE_GOOGLE_PLACES_API_KEY` - Places API

## Compliance Requirements

### Medical Industry Standards
- **HIPAA**: Patient data protection implemented
- **LGPD**: Brazilian data protection compliance
- **WCAG 2.1 AA**: Full accessibility compliance
- **ISO 27001**: Security best practices

### Data Protection Features
- Consent management system
- Data anonymization utilities
- Audit logging for all operations
- Secure data transmission
- Role-based access control

## Current Development Focus Areas

### 1. Performance Optimization
- Core Web Vitals monitoring
- Image optimization and lazy loading
- Bundle splitting and code splitting
- Service Worker implementation

### 2. Security Enhancements
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure headers implementation
- Regular security audits

### 3. User Experience
- Mobile-first responsive design
- Accessibility improvements
- Performance optimization
- Error handling and recovery

## Deployment Infrastructure

### VPS Configuration
- **Server**: 31.97.129.78 (Brazil)
- **Stack**: Docker containers with Nginx reverse proxy
- **Database**: Supabase (hosted PostgreSQL)
- **Cache**: Redis for session management
- **Monitoring**: Comprehensive health checks

### Docker Services
1. **Frontend**: React/Vite application
2. **API**: Node.js backend services
3. **Nginx**: Reverse proxy and static file serving
4. **Redis**: Caching and session storage
5. **MySQL**: Primary database
6. **Monitoring**: Health check services
7. **Logging**: Fluent-bit for audit trails

## Recent Technical Accomplishments

### VPS Migration (Complete)
- ✅ Removed all Vercel dependencies
- ✅ Created comprehensive VPS deployment infrastructure
- ✅ Implemented Docker containerization
- ✅ Set up health monitoring and backup systems
- ✅ Fixed ES module compatibility issues
- ✅ Enhanced security configuration

### Feature Additions
- ✅ AI chatbot integration (Pulse.live)
- ✅ Enhanced Google Reviews management
- ✅ Improved Instagram feed functionality
- ✅ Podcast content management system
- ✅ Advanced appointment scheduling
- ✅ Multi-channel contact system

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled for type safety
- Path aliases with `@/` for clean imports
- Comprehensive type definitions for database
- ES module imports throughout

### Testing Strategy
- Unit tests with Vitest and React Testing Library
- Integration tests for API endpoints
- E2E tests for critical user flows
- Coverage target: 80% minimum

### Linting and Formatting
- ESLint for code quality
- Prettier for consistent formatting
- Pre-commit hooks for quality control
- Automated code reviews

## Known Technical Debt

### Resolved Issues
- ✅ Vercel dependency removal
- ✅ Docker containerization complete
- ✅ ES module compatibility fixed
- ✅ Security vulnerabilities addressed
- ✅ Performance optimizations implemented

### Future Enhancements
- Kubernetes migration for scalability
- CI/CD pipeline automation
- Advanced monitoring integration
- Backup system automation

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `vps-deployment-optimization` - Current deployment optimization
- Feature branches for new developments
- Hotfix branches for urgent fixes

### Code Review Process
- Pull requests for all changes
- Automated testing integration
- Security scanning before deployment
- Performance monitoring post-deployment

## External Integrations

### Third-Party Services
- **Supabase**: Database and authentication
- **Resend**: Email delivery service
- **Google Maps**: Location services
- **Instagram**: Social media feed
- **Spotify**: Podcast distribution
- **WhatsApp Business**: Patient communication
- **Google Reviews**: Patient testimonials

### API Management
- Rate limiting for all endpoints
- Error handling and logging
- Request validation and sanitization
- Response caching strategies

## Session Management

### Current Session Status
- **Project**: Fully activated and ready for development
- **Context**: Complete understanding of architecture and requirements
- **Tools**: All development tools configured and ready
- **Environment**: Production-ready with comprehensive testing

### Next Development Priorities
1. **Performance Monitoring**: Enhanced metrics and alerting
2. **Security Audits**: Regular vulnerability assessments
3. **Feature Enhancements**: Patient portal improvements
4. **Infrastructure**: CI/CD pipeline implementation

## Success Metrics

### Technical Performance
- Page load time < 3 seconds
- Core Web Vitals scores > 90
- Uptime > 99.9%
- Security compliance 100%

### User Experience
- Mobile responsiveness 100%
- Accessibility compliance 100%
- Error rate < 0.1%
- User satisfaction > 95%

This project context establishes a complete development-ready environment for the Saraiva Vision medical clinic website, with comprehensive understanding of the architecture, requirements, and current development state.