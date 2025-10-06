# AGENTS.md - Saraiva Vision Development Guide

## 🚨 CRITICAL BUILD RULE
**THIS PROJECT USES VITE, NOT NEXT.JS IN PRODUCTION!**
- ✅ **Production Build**: `npm run build:vite` (generates `dist/` - ALWAYS use this for deploy)
- ❌ **NEVER** use `npm run build` for production (generates `.next/` which is NOT served)
- **Deploy Path**: `/var/www/saraivavision/current/` (Nginx serves from here)

## Build/Lint/Test Commands
- **Dev Server**: `npm run dev:vite` (local development with HMR on port 3002)
- **Production Build**: `npm run build:vite` (Vite build + prerender), `npm run build:norender` (skip prerender)
- **Preview Build**: `npm run preview` (test production build locally)
- **Lint**: `npm run lint` (ESLint), `npm run validate:api` (API syntax/encoding validation)
- **Test All**: `npm run test:run` (Vitest all tests)
- **Single Test**: `npx vitest run path/to/file.test.jsx` (specific test file, e.g., `npx vitest run src/__tests__/Header.test.jsx`)
- **Test Watch**: `npm run test:watch` (watch mode for TDD)
- **Test Types**: `npm run test:unit`, `npm run test:integration`, `npm run test:api`, `npm run test:frontend`
- **Coverage**: `npm run test:coverage` (targets: 80% lines/statements, 75% functions, 70% branches)
- **Production Check**: `npm run production:check` (build + all tests - run before deploy)
- **Deploy**: `sudo npm run deploy:quick` (quick deploy), `sudo ./scripts/deploy-atomic.sh` (atomic deploy from GitHub)

## Code Style Guidelines
- **NO COMMENTS**: Do NOT add comments unless explicitly requested by the user
- **File Naming**: Components (PascalCase.jsx), Hooks (use*.js), Utils (camelCase.js), Constants (UPPER_SNAKE_CASE), Tests (.test.jsx)
- **Imports**: ALWAYS use `@/` alias for `src/` (e.g., `@/components/Foo`), group order: React → external libs → internal modules → styles
- **TypeScript**: Partial strict mode (noImplicitAny: true, strict: false, strictNullChecks: true), prefer absolute imports with `@/` over relative paths
- **Styling**: Tailwind CSS only, NO inline styles, NO CSS modules, use className utilities (see `tailwind.config.js` for custom colors/theme)
- **Components**: Functional components only, prefer composition over inheritance, destructure props, use React 18 features
- **Error Handling**: Use global error boundaries, centralized tracking in `src/utils/errorTracking.js`, NO silent failures, always log errors
- **State Management**: React Context for global state, custom hooks for complex logic, avoid prop drilling (max 2 levels)
- **Performance**: Use React.memo for expensive renders, debounce user inputs (300ms default), lazy load routes/components with React.lazy
- **ESLint Rules**: react-hooks/rules-of-hooks (error), react-hooks/exhaustive-deps (warn), no-unused-vars (warn), no-undef (error)
- **Testing**: Vitest + React Testing Library, co-locate tests in `__tests__/`, mock external dependencies, test user interactions not implementation, 30s timeout for integration tests
- **Architecture**: React 18 + Vite + React Router v6, components in `src/components/`, hooks in `src/hooks/`, utils in `src/utils/`, API in `api/`
- **Medical Compliance**: CFM/LGPD validation required, medical disclaimers mandatory, PII detection, consent management (see `.github/copilot-instructions.md`)
- **Accessibility**: WCAG 2.1 AA compliance required, use Radix UI for accessible components, semantic HTML, ARIA labels where needed