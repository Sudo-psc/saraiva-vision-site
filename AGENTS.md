# Agent Guidelines - SaraivaVision Medical Website

## Build & Development Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build to `dist/`
- `npm run preview` - Serve built app locally
- `npm run start:api` - Start API server
- `npm run lint` - Run ESLint (via `npx eslint src`)

## Testing Commands
- `npm test` - Run all tests (Vitest)
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Tests with coverage
- `npm run test:ui` - Run tests with UI
- `npx vitest run src/components/__tests__/ComponentName.test.jsx` - Run single test file

## Code Style Guidelines
- **React**: Functional components with hooks, no class components
- **Imports**: Group by React, external libs, internal components, utils
- **Naming**: PascalCase for components, camelCase for hooks/utils, kebab-case for routes
- **Formatting**: 2 spaces, max 120 chars/line, semicolons required
- **Accessibility**: WCAG 2.1 AA, ARIA labels, semantic HTML, keyboard navigation
- **i18n**: Use `t()` for all user-facing text, update both `pt` and `en` locales
- **Styling**: Tailwind utilities first, custom CSS in `src/index.css`

## Medical Compliance Requirements
- **LGPD**: Patient data privacy, explicit consent for data collection
- **CFM**: Brazilian medical standards, accurate medical terminology
- **Security**: No sensitive data logging, input validation, XSS prevention
- **Performance**: Lighthouse 90+ scores, lazy loading, image optimization

## Testing Standards
- **Framework**: Vitest + Testing Library + jsdom
- **Location**: `src/**/__tests__/*.(test|spec).(js|jsx)`
- **Coverage**: Focus on behavior, mock APIs, test accessibility
- **Patterns**: Contract tests for critical features, integration tests for user flows

## GitHub Copilot Instructions
- Follow `.github/copilot-instructions.md` for detailed medical website guidelines
- Prioritize accessibility, privacy, and Brazilian medical compliance
- Use schema markup for medical services, lazy load components
- Include error boundaries, professional error messages, LGPD consent

## Commit Standards
- Imperative mood: `feat(services): add appointment booking`
- Scope prefixes: `feat()`, `fix()`, `docs()`, `test()`, `refactor()`
- Include UI screenshots for visual changes, test coverage for code changes