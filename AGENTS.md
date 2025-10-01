# AGENTS.md - Saraiva Vision Development Guide

## Build/Lint/Test Commands
- **Build**: `npm run build` (production), `npm run build:norender` (skip prerender)
- **Lint**: `npm run lint` (ESLint), `npm run validate:api` (API syntax/encoding validation)
- **Test All**: `npm run test:run` (Vitest all tests)
- **Single Test**: `npx vitest run path/to/file.test.jsx` (specific test file)
- **Test Types**: `npm run test:unit`, `npm run test:integration`, `npm run test:api`, `npm run test:frontend`
- **Coverage**: `npm run test:coverage` (80% target: lines/statements, 75% functions, 70% branches)
- **Production Check**: `npm run production:check` (build + all tests)

## Code Style Guidelines
- **NO COMMENTS**: Do NOT add comments unless explicitly requested
- **File Naming**: Components (PascalCase.jsx), Hooks (use*.js), Utils (camelCase.js), Constants (UPPER_SNAKE_CASE), Tests (.test.jsx)
- **Imports**: Always use `@/` alias for `src/`, group: React → external libs → internal modules → styles
- **TypeScript**: Partial strict mode (noImplicitAny: true, strict: false), prefer absolute imports with `@/` over relative paths
- **Styling**: Tailwind CSS only, NO inline styles, NO CSS modules, use className utilities
- **Components**: Functional components only, prefer composition over inheritance, destructure props
- **Error Handling**: Use global error boundaries, centralized tracking in `src/utils/errorTracking.js`, NO silent failures
- **State Management**: React Context for global state, custom hooks for complex logic, avoid prop drilling
- **Performance**: Use React.memo for expensive renders, debounce user inputs, lazy load routes/components
- **ESLint Rules**: react-hooks/rules-of-hooks (error), react-hooks/exhaustive-deps (warn), no-unused-vars (warn), no-undef (error)
- **Testing**: Vitest + React Testing Library, co-locate tests in `__tests__/`, mock external dependencies, test user interactions not implementation
- **Architecture**: React 18 + Vite + React Router v6, components in `src/components/`, hooks in `src/hooks/`, utils in `src/utils/`