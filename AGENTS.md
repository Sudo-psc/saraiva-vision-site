# AGENTS.md - Saraiva Vision Development Guide

## Build/Lint/Test Commands
- **Build**: `npm run build` (production)
- **Lint**: `npm run lint` (ESLint), `npm run validate:api` (API validation)
- **Test All**: `npm run test:run` (Vitest)
- **Single Test**: `npx vitest run path/to/file.test.jsx`
- **Test Types**: `npm run test:unit`, `npm run test:integration`, `npm run test:api`, `npm run test:frontend`
- **Coverage**: `npm run test:coverage`

## Code Style Guidelines
- **File Naming**: Components (PascalCase), Hooks/Utilities (camelCase), Constants (UPPER_SNAKE_CASE), Tests (.test.jsx)
- **Imports**: Use `@/` alias for `src/`, group React → external libs → internal modules
- **TypeScript**: Partial strict mode, prefer absolute imports over relative
- **Styling**: Tailwind CSS only, no inline styles
- **Components**: Prefer composition over inheritance
- **Error Handling**: Global error boundaries, centralized tracking in `src/utils/errorTracking.js`
- **State**: React Context for global state, custom hooks for complex logic
- **Performance**: React.memo, debounced inputs, lazy loading
- **ESLint**: React hooks rules-of-hooks (error), exhaustive-deps (warn), unused vars (warn)
- **Testing**: Vitest + React Testing Library, 80% coverage target, co-located tests in `__tests__/`