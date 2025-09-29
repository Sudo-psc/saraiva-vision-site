# AGENTS.md - Saraiva Vision Development Guide

## Build/Lint/Test Commands
- **Build**: `npm run build` (production build)
- **Lint**: `npm run lint` (ESLint), `npm run validate:api` (API syntax + encoding)
- **Test All**: `npm run test:run` (Vitest)
- **Single Test**: `npx vitest run path/to/file.test.jsx` (e.g., `npx vitest run src/components/ContactForm.test.jsx`)
- **Test Types**: `npm run test:unit`, `npm run test:integration`, `npm run test:api`, `npm run test:frontend`
- **Coverage**: `npm run test:coverage`

## Code Style Guidelines

### File Naming
- Components: PascalCase (`ContactForm.jsx`)
- Hooks/Utilities: camelCase (`useAuth.js`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)
- Tests: `.test.jsx` or `.test.js` suffix

### Imports & Structure
- Use `@/` alias for `src/` imports (absolute preferred over relative)
- Group: React → external libs → internal modules
- TypeScript: Partial strict mode for legacy compatibility
- Components: Prefer composition over inheritance

### Styling & Patterns
- **Styling**: Tailwind CSS only (no inline styles)
- **Error Handling**: Global error boundaries, centralized tracking in `src/utils/errorTracking.js`
- **State**: React Context for global state, custom hooks for complex logic
- **Performance**: React.memo, debounced inputs, lazy loading

### ESLint Rules
- React hooks: `rules-of-hooks` error, `exhaustive-deps` warn
- Unused vars: warn level
- No prop-types (TypeScript used)
- API directory excluded from main linting

### Testing
- Framework: Vitest + React Testing Library
- Coverage: 80% target (branches/functions/lines/statements)
- Setup: `src/__tests__/setup.js`
- Co-located tests in `__tests__/` directories