# Agent Guide - Saraiva Vision

## Build Commands
- **Build**: `npm run build:vite` (production, Vite-based)
- **Dev**: `npm run dev:vite` (port 3002, HMR enabled)
- **Lint**: `npm run lint` or `npm run validate:api`
- **Test All**: `npm run test:run`
- **Test Single**: `npx vitest run path/to/file.test.jsx`
- **Test Coverage**: `npm run test:coverage` (target: 80%+)

## Code Style
- **NO COMMENTS** unless explicitly requested
- **Components**: PascalCase.jsx in `src/components/` (e.g., `SEOHead.jsx`)
- **Hooks**: camelCase.js with `use*` prefix in `src/hooks/` (e.g., `useAnalytics.js`)
- **Utils**: camelCase.js in `src/utils/`
- **Imports**: Use `@/` alias for `src/` (e.g., `import Foo from '@/components/Foo'`)
- **Styling**: Tailwind CSS only, no CSS modules or inline styles
- **Types**: TypeScript partial strict (`noImplicitAny: true`, `strict: false`)
- **React**: Functional components with hooks, no class components, React Router v6, lazy-loaded routes

## Error Handling
- Use global error boundaries
- Centralized tracking in `src/utils/errorTracking.js`
- Input validation with Zod schemas
- No try-catch without proper logging

## Key Conventions
- **Medical Compliance**: CFM/LGPD validation required, PII detection, consent management
- **Accessibility**: WCAG 2.1 AA mandatory, use Radix UI for accessible components
- **Security**: Rate limiting, CORS, security headers, DOMPurify for sanitization
- **Blog**: Static data in `src/data/blogPosts.js` (no CMS)
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.), max 100 chars
