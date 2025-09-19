# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏥 Project Overview

SaraivaVision is a React-based medical clinic website for an ophthalmology practice with strict requirements for accessibility, performance, and Brazilian medical compliance. The project uses modern web technologies with a focus on user experience, SEO optimization, and medical data handling.

## 🛠️ Development Commands

### Core Development
```bash
npm run dev          # Development server (localhost:5173)
npm run dev:full     # Full development with Docker services
npm run build        # Production build
npm run preview      # Preview production build
npm run start        # Vite dev server
npm run serve        # Preview server on port 3000
```

### Testing & Quality Assurance
```bash
npm test             # Run tests in watch mode (Vitest)
npm run test:ui      # Test UI dashboard
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
npm run test:gtm     # Test Google Tag Manager
```

### Verification & Linting
```bash
npm run verify       # Complete verification (build + tests + checks)
npm run verify:links # Check for broken links
npm run verify:html  # Validate HTML output
npm run verify:lighthouse # Lighthouse performance checks
npm run verify:gtm   # Verify GTM implementation
```

### Image & Asset Optimization
```bash
npm run images:build    # Build optimized images
npm run images:check    # Check image optimization
npm run images:optimize # Optimize images via script
npm run audio:duration  # Get audio file durations
```

### API & Backend
```bash
npm run start:api    # Start Node.js API server
```

### Docker Development
```bash
./docker-dev.sh      # Start development environment with Docker
docker-compose up    # Start all services (frontend, API, WordPress, nginx, db, redis)
```

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom medical design system
- **State Management**: React Context + Custom hooks
- **Routing**: React Router v6 with lazy loading
- **Testing**: Vitest + React Testing Library
- **Backend**: Node.js Express API + WordPress headless CMS
- **Database**: MySQL + Redis caching
- **Infrastructure**: Docker containerization + Nginx reverse proxy

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Base design system components
│   ├── icons/          # Custom SVG icons
│   └── __tests__/      # Component tests
├── pages/              # Route components (lazy-loaded)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── contexts/           # React contexts
├── locales/            # i18n translations (pt/en)
├── utils/              # Helper functions
└── styles/             # Global styles
```

### Key Architectural Patterns

#### Lazy Loading & Code Splitting
All pages use `React.lazy()` for optimal bundle splitting:
```javascript
const HomePage = lazy(() => import('@/pages/HomePage'));
```

#### Medical Design System
- Custom Tailwind configuration with medical-specific colors
- Accessibility-first component design (WCAG 2.1 AA compliant)
- Professional typography and spacing scales

#### State Management
- React Context for global state
- Custom hooks for complex state logic
- Local state for component-specific data

#### Performance Optimization
- Image optimization with WebP support
- Service Worker with Workbox
- Manual chunk splitting in Vite config
- Lazy loading for all non-critical components

## 🔄 Docker Development Environment

### Services Architecture
- **frontend**: React development server (ports 3002, 5173)
- **api**: Node.js Express API (port 3001)
- **wordpress**: WordPress headless CMS (port 8083)
- **nginx**: Reverse proxy (ports 80, 443, 8080)
- **db**: MySQL database
- **redis**: Caching layer
- **health-monitor**: Service health monitoring

### Service Dependencies
```
nginx → frontend, api, wordpress
frontend → api
api → wordpress, db, redis
wordpress → db
```

### Health Checks
All services include comprehensive health checks with 30s intervals. Monitor via:
```bash
docker-compose ps  # Check service status
docker logs saraiva-health-monitor  # View health monitoring
```

## 🧪 Testing Strategy

### Test Framework
- **Unit Tests**: Vitest + jsdom environment
- **Component Tests**: React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Manual verification via scripts

### Test Organization
```
src/__tests__/           # Integration tests
src/components/__tests__/ # Component unit tests
src/hooks/__tests__/     # Hook tests
```

### Running Specific Tests
```bash
npm test -- ComponentName     # Test specific component
npm test -- --run pages       # Test all pages
npm test -- --coverage        # Generate coverage report
```

## 🎨 Medical Design System

### Core Colors
- `brand-blue`: Primary medical blue
- `trust-green`: Success/trust indicators
- `soft-gray`: Neutral backgrounds
- `medical-*`: Specialized medical interface colors

### Typography
- `text-display-*`: Hero titles and large headings
- `text-heading-*`: Section headings
- `text-body-*`: Body text in various sizes
- `text-caption`: Small text and metadata

### Responsive Design
- Mobile-first approach
- Breakpoint classes: `sm:`, `md:`, `lg:`, `xl:`
- Fluid typography with `clamp()` values

## 📱 Key Features & Components

### Internationalization (i18n)
- Default: Portuguese (pt)
- Secondary: English (en)
- All user-facing strings use `useTranslation()` hook
- Medical content professionally translated

### Accessibility Features
- WCAG 2.1 AA compliant
- Screen reader optimized
- Keyboard navigation support
- High contrast support
- Reduced motion support

### Medical-Specific Components
- **ServiceDetail**: Medical procedure descriptions with schema markup
- **GoogleMap**: Clinic location with fallback handling
- **ContactForms**: LGPD-compliant patient inquiry forms
- **CompactServices**: Service overview carousel
- **Testimonials**: Patient testimonials with privacy protection

### WordPress Integration
- Headless CMS for blog content
- Custom health check endpoints
- CORS-enabled API access
- Real-time content syncing

## 🔐 Security & Compliance

### Brazilian Medical Compliance
- CFM (Conselho Federal de Medicina) regulations adherence
- LGPD (Brazilian GDPR) data protection compliance
- Professional medical content review process
- Patient privacy protection measures

### Security Measures
- Environment variable protection
- Input validation and sanitization
- XSS prevention
- CORS configuration
- Rate limiting on forms

### Data Handling
- No sensitive data logging
- Secure form submission with Resend integration
- Optional data storage with explicit consent
- Patient information encryption

## 🚀 Deployment & Production

### Build Optimization
- Vite production build with optimized chunks
- Service Worker for offline capability
- Image optimization pipeline
- CSS purging and minification

### Performance Targets
- Lighthouse score 90+ on all metrics
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

### Monitoring & Analytics
- Google Analytics 4 integration
- Core Web Vitals tracking
- Error boundary implementation
- Performance monitoring hooks

## 📋 Development Guidelines

### Code Style
- ESLint configuration for React/medical compliance
- Prettier for code formatting
- Functional components with hooks
- TypeScript for type safety

### Component Development
```javascript
// Preferred pattern for medical components
const MedicalComponent = ({ patientData }) => {
  const { t } = useTranslation();
  const [state, setState] = useState(initial);

  return (
    <div className="medical-card" role="region" aria-label={t('component.label')}>
      {/* Accessible content */}
    </div>
  );
};
```

### Form Handling
- Zod schema validation
- LGPD consent requirements
- Honeypot spam protection
- Professional error messaging

### API Integration
- Supabase for database operations
- Resend for email delivery
- Google Maps for location services
- WordPress REST API for content

## 🔧 Common Development Tasks

### Adding a New Component
1. Create component in `src/components/`
2. Add corresponding test file
3. Export from main components index
4. Add to Storybook if applicable

### Adding a New Page
1. Create page component in `src/pages/`
2. Add lazy import to `App.jsx`
3. Define route in routing configuration
4. Add i18n translations
5. Implement SEO metadata

### Updating Medical Content
1. Ensure medical accuracy review
2. Update i18n translations
3. Add schema markup for SEO
4. Include accessibility attributes
5. Test with screen readers

### Performance Optimization
1. Analyze bundle with `npm run build`
2. Optimize images with `npm run images:optimize`
3. Check lighthouse scores with `npm run verify:lighthouse`
4. Monitor Core Web Vitals

## 🆘 Troubleshooting

### Common Issues

**Port 5173 already in use**
```bash
npm run dev -- --port 3000
```

**Docker services not starting**
```bash
docker-compose down
docker system prune
docker-compose up --build
```

**WordPress connection issues**
```bash
./test-wordpress-integration-complete.sh  # Check WordPress connectivity
```

**Test failures**
```bash
npm run test:run -- --reporter=verbose  # Detailed test output
```

**Build size warnings**
- Acceptable: chunks up to 600kB
- Review manual chunk configuration in `vite.config.js`
- Use lazy loading for heavy components

### Health Check Debugging
```bash
# Check individual service health
curl http://localhost:3002/health  # Frontend
curl http://localhost:3001/api/health  # API
curl http://localhost:8083/wp-json/saraiva-vision/v1/health  # WordPress
```

## 📖 Additional Resources

### Key Documentation Files
- `DEVELOPER_QUICK_START.md` - Setup and first steps
- `.github/copilot-instructions.md` - Detailed development patterns
- `ROUTING_ANALYSIS_AND_RESOLUTION.md` - Route configuration
- `WORDPRESS_INTEGRATION_FIX_COMPLETE.md` - WordPress setup

### Medical Content Guidelines
- All medical terminology must be accurate
- Include professional disclaimers
- Display physician credentials (CFM registration)
- Follow medical website SEO best practices

### Performance Monitoring
- Use `npm run verify` before commits
- Monitor Lighthouse scores regularly
- Track Core Web Vitals in production
- Optimize images before deployment