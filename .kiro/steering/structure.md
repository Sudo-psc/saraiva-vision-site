# Project Structure & Organization

## Root Directory Layout
```
saraivavision-site-v2/
├── src/                    # Frontend React application
├── api/                    # Backend Node.js API
├── public/                 # Static assets and media
├── docs/                   # Project documentation
├── specs/                  # Feature specifications
├── scripts/                # Deployment and utility scripts
├── tests/                  # Additional test files
└── dist/                   # Production build output
```

## Frontend Structure (`src/`)
```
src/
├── components/             # React components
│   ├── ui/                # Base UI components (Button, Toast, etc.)
│   ├── icons/             # Custom icon components
│   ├── admin/             # Admin dashboard components
│   ├── auth/              # Authentication components
│   ├── blog/              # Blog-related components
│   ├── compliance/        # LGPD compliance components
│   ├── instagram/         # Instagram integration
│   └── __tests__/         # Component tests
├── pages/                 # Route-level page components
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── lib/                   # Utility libraries and configurations
├── services/              # API service functions
├── utils/                 # Helper functions and utilities
├── locales/               # i18n translation files
├── styles/                # Global CSS and Tailwind config
└── types/                 # TypeScript type definitions
```

## Backend Structure (`api/`)
```
api/
├── src/                   # Main API source code
│   ├── lib/              # Shared libraries
│   ├── routes/           # API route handlers
│   └── server.js         # Express server entry point
├── appointments/          # Appointment booking system
├── contact/              # Contact form handling
├── instagram/            # Instagram API integration
├── monitoring/           # Health checks and metrics
├── security/             # Security middleware
├── utils/                # Backend utilities
├── webhooks/             # Webhook handlers
└── __tests__/            # API tests
```

## Asset Organization (`public/`)
```
public/
├── img/                  # General images and graphics
├── images/               # Optimized responsive images
├── icons_social/         # Social media icons
├── Blog/                 # Blog post images
├── Podcasts/             # Podcast audio files and covers
└── robots.txt, sitemap.xml  # SEO files
```

## Documentation (`docs/`)
- Architecture and system design documents
- API specifications and integration guides
- Deployment and configuration instructions
- Testing strategies and guidelines

## Configuration Files
- **package.json**: Dependencies and scripts
- **vite.config.js**: Build configuration
- **tailwind.config.js**: CSS framework setup
- **eslint.config.js**: Code linting rules
- **vitest.config.js**: Test configuration
- **.env files**: Environment variables

## Naming Conventions
- **Components**: PascalCase (e.g., `ContactForm.jsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Directories**: lowercase with hyphens (e.g., `contact-form/`)
- **CSS Classes**: Tailwind utility classes
- **API Routes**: kebab-case endpoints

## Import Patterns
- Use `@/` alias for src directory imports
- Relative imports for same-directory files
- Absolute imports for cross-directory dependencies
- Lazy loading for route components

## Component Organization
- **Base Components**: `src/components/ui/` (Button, Input, Toast)
- **Feature Components**: Grouped by functionality
- **Page Components**: `src/pages/` with lazy loading
- **Layout Components**: Navbar, Footer, wrappers

## State Management
- **React Context**: For global state (Auth, Theme)
- **Local State**: useState for component-specific state
- **URL State**: React Router for navigation state
- **Server State**: Direct API calls with error handling

## File Extensions
- **.jsx**: React components
- **.js**: Utility functions and configurations
- **.ts/.tsx**: TypeScript files (mixed codebase)
- **.test.js/.test.jsx**: Test files