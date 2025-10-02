# Copilot Instructions for Saraiva Vision Site

## Project Overview
- **Saraiva Vision** is a medical platform for ophthalmology, focused on CFM/LGPD compliance, static blog, and high accessibility.
- **Frontend**: React 18 + Vite + TypeScript + Tailwind (no CSS modules/inline styles).
- **Backend**: Node.js + Express (minimal, in `api/`), Redis cache, Nginx static server.
- **Data**: Blog posts and static data in `src/data/blogPosts.js` (no external CMS).
- **Deployment**: Native VPS (no Docker), automated scripts, Nginx + SSL.

## Architecture & Patterns
- **Components**: In `src/components/` (PascalCase.jsx), hooks in `src/hooks/` (use*.js), utils in `src/utils/` (camelCase.js).
- **Routing**: React Router v6, lazy-loaded routes in `src/pages/`.
- **State**: React Context for global state, custom hooks for complex logic.
- **Styling**: Tailwind CSS only, use `className` utilities.
- **Imports**: Always use `@/` alias for `src/` (e.g., `@/components/Foo`).
- **Testing**: Vitest + React Testing Library, tests co-located in `__tests__/`, mock external dependencies.
- **Error Handling**: Use global error boundaries, centralized tracking in `src/utils/errorTracking.js`.
- **SEO**: Schema.org markup in `src/lib/schemaMarkup.js`, SEO hooks in `src/hooks/useSEO.js`.

## Developer Workflows
- **Build**: `npm run build` (production), `npm run build:norender` (skip prerender)
- **Dev Server**: `npm run dev` (port 3002, HMR enabled)
- **Lint**: `npm run lint`, `npm run validate:api`
- **Test**: `npm run test:run` (all), `npx vitest run path/to/file.test.jsx` (single), `npm run test:coverage` (80%+)
- **Deploy**: `sudo bash DEPLOY_NOW.sh` (VPS), or `npm run deploy:quick`
- **Image Optimization**: `npm run optimize:images`, `npm run verify:blog-images`

## Conventions & Compliance
- **NO COMMENTS**: Do not add comments unless explicitly requested.
- **TypeScript**: Partial strict mode (noImplicitAny: true, strict: false).
- **Medical Compliance**: CFM/LGPD validation, medical disclaimers, PII detection, consent management.
- **Accessibility**: WCAG 2.1 AA, use Radix UI for accessible components.
- **Security**: Input validation (Zod), rate limiting, CORS, security headers.

## Key Files & Directories
- `src/components/` – UI components
- `src/hooks/` – Custom hooks
- `src/data/blogPosts.js` – Blog/static data
- `src/lib/schemaMarkup.js` – SEO/schema
- `src/utils/errorTracking.js` – Error tracking
- `api/` – Express backend
- `DEPLOY_NOW.sh` – VPS deploy script
- `docs/` – Full documentation

## Examples
- Add a blog post: Edit `src/data/blogPosts.js`, follow structure, run `npm run build` and deploy.
- Add a component: Place in `src/components/`, export, add test in `__tests__/`.
- Add API route: Create in `api/`, add test in `api/__tests__/`, use middleware/validation.

## References
- See `AGENTS.md`, `CLAUDE.md`, and `docs/README.md` for further details and up-to-date workflows.

---
For unclear or missing conventions, consult `docs/PROJECT_DOCUMENTATION.md` or ask for clarification.
