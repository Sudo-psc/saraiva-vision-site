# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saraiva Vision is a modern medical clinic website built with React 18, Vite, and TypeScript. It's a full-stack application featuring a healthcare-focused frontend with comprehensive backend API integration using Vercel Functions and Supabase as the database.

## Tech Stack & Architecture

### Frontend
- **React 18** with Vite for build tooling and development server
- **TypeScript 5.x** for type safety
- **Tailwind CSS** for styling with design system
- **Framer Motion** for animations and micro-interactions
- **React Router** for client-side routing with lazy loading
- **Radix UI** for accessible component primitives

### Backend & APIs
- **Vercel Functions** (Serverless) for API endpoints
- **Supabase** as primary database and auth provider
- **Node.js 22+** runtime with ES modules
- **Edge Functions** for performance-critical operations

### Key Integration Points
- Instagram Graph API for social feed
- WhatsApp Business API for patient communication
- Google Maps API for clinic location
- Resend API for email services
- Spotify Web API for podcast content

## Commands

### Development
```bash
npm run dev              # Start development server (port 3002)
npm run build            # Build for production
npm run preview          # Preview production build
npm run dev:vercel       # Start Vercel dev environment
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:run         # Run all tests once
npm run test:coverage    # Generate coverage report
npm run test:comprehensive  # Run full test suite including integration
npm run test:api         # Test API functions only
npm run test:frontend    # Test React components only
```

### Deployment
```bash
npm run deploy:simple       # Quick Vercel deployment
npm run deploy:intelligent  # Smart deployment with health checks
npm run production:check    # Production readiness validation
npm run production:deploy   # Full production deployment
```

### Linting & Type Checking
```bash
npm run lint             # Run ESLint (when available)
npm run typecheck        # Run TypeScript compiler check (when available)
```

## Project Architecture

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Base design system components
│   ├── icons/          # Custom icon components
│   └── __tests__/      # Component tests
├── pages/              # Route-level page components
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and configurations
├── contexts/           # React context providers
├── utils/              # Helper functions
└── styles/             # Global CSS files

api/                    # Vercel Functions (backend)
├── contact/            # Contact form endpoints
├── appointments/       # Appointment booking system
├── podcast/            # Podcast management
└── __tests__/          # API tests
```

### Key Architectural Patterns

#### Component Organization
- Page components in `src/pages/` handle routing and layout
- Reusable UI components in `src/components/` with test co-location
- Design system components in `src/components/ui/`
- Custom hooks in `src/hooks/` for shared stateful logic

#### API Architecture
- RESTful APIs in `api/` directory using Vercel Functions
- Database operations through Supabase client with TypeScript types
- Authentication handled via Supabase Auth with role-based access control
- Message queue system using Supabase `message_outbox` table

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

### Database Schema (Supabase)
Key tables defined in `src/lib/supabase.ts`:
- `contact_messages` - Contact form submissions
- `appointments` - Patient appointment bookings
- `message_outbox` - Async message queue for emails/SMS
- `podcast_episodes` - Podcast content management
- `profiles` - User authentication and authorization
- `event_log` - Application event tracking

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
- Production: Vercel environment variables
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

### Data Privacy (LGPD Compliance)
- Consent management system in `src/components/ConsentManager.jsx`
- Data anonymization utilities in `src/lib/lgpd/`
- Audit logging for data access
- User data deletion capabilities

### API Security
- Input validation using Zod schemas
- Rate limiting on contact forms
- CORS configuration in `vercel.json`
- Security headers for production

## Common Development Tasks

### Adding New API Endpoint
1. Create function in `api/` directory
2. Add corresponding test in `api/__tests__/`
3. Update TypeScript types if needed
4. Configure function limits in `vercel.json`

### Creating New Component
1. Add component file in appropriate `src/components/` subdirectory
2. Create test file in same directory
3. Export from component if reusable
4. Add to design system if it's a UI primitive

### Database Schema Changes
1. Update types in `src/lib/supabase.ts`
2. Add migration to `database/migrations/`
3. Update related API functions
4. Add corresponding tests

### Performance Monitoring
- Real-time metrics via `src/hooks/usePerformanceMonitor.js`
- Core Web Vitals tracking
- Error rate monitoring
- Bundle analysis tools available

## Deployment Configuration

The project uses Vercel with specific configurations:
- **Framework**: Vite detection
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 22.x (specified in package.json)
- **Functions**: Configured per endpoint in `vercel.json`
- **Regions**: São Paulo (gru1) for Brazilian audience

### Environment Variables Required
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=
```

## Troubleshooting Common Issues

### Build Failures
- Check Node.js version (requires 22+)
- Verify environment variables are set
- Clear node_modules and npm cache if needed

### Database Connection Issues
- Verify Supabase environment variables
- Check RLS policies for data access
- Ensure database migrations are applied

### API Function Errors
- Check function logs in Vercel dashboard
- Verify timeout and memory limits
- Test locally with `npm run dev:vercel`

This codebase prioritizes medical industry standards, accessibility compliance, and Brazilian market requirements while maintaining modern development practices and performance optimization.