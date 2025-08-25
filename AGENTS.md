# Repository Guidelines

## Project Structure & Modules
- `src/`: React 18 app (Vite)
  - `components/`: Reusable UI (e.g., `Navbar.jsx`, `Hero.jsx`)
  - `pages/`: Route-level views
  - `hooks/`, `contexts/`, `utils/`: Logic and helpers
  - `locales/`: i18n JSON (`en/translation.json`, `pt/translation.json`)
- `public/`: Static assets
- `api/`: Lightweight local API/proxy stubs
- `index.html`: App shell, SEO/meta
- `dist/`: Production build output

## Build, Test, and Development
- `npm install`: Install dependencies
- `npm run dev`: Start Vite dev server with HMR
- `npm run build`: Create production build in `dist/`
- `npm run preview`: Serve the built app locally
- `npm test`: Run unit tests (Vitest + jsdom)
- `npm run test:coverage`: Test with coverage report

## Coding Style & Naming
- Indentation: 2 spaces; modern functional React components and hooks
- Components: `PascalCase.jsx` (e.g., `ServiceCard.jsx`); hooks: `useThing.js`; utils: `camelCase.js`
- Routes/anchors: `kebab-case` (e.g., `/services/consultas-oftalmologicas`, `#contact`)
- Styling: Prefer Tailwind utility classes; custom utilities in `src/index.css`
- Linting: ESLint via `react-app` config; run `npx eslint src` before PRs
- i18n: Add keys to both `en` and `pt`; avoid hardcoded UI text

## Testing Guidelines
- Framework: Vitest + Testing Library (React)
- Location: `src/**/__tests__/*.(test|spec).(js|jsx)`
- Write behavior-focused tests; mock network and time when needed
- Target changed code paths and ensure coverage stays stable

## Commit & Pull Requests
- Commits: Imperative subject; use conventional scopes when helpful
  - Examples: `feat(services): add reviews widget`, `fix(seo): correct JSON‑LD`
- PRs: Clear description, rationale, linked issue, and screenshots/GIFs for UI
- i18n/SEO/Accessibility: Update both locales; preserve ARIA/alt/meta behavior

## Security & Configuration
- Secrets: Never commit; use `.env`/`.env.local` (Vite requires `VITE_` prefix)
- Node: Use `.nvmrc` (Node `20.19.1`); `nvm use`
- Consent: Keep analytics/marketing behind consent (see `index.html`/ConsentManager)
