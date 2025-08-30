# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/` (React 18 + Vite):
  - `components/` reusable UI (e.g., `Navbar.jsx`, `Hero.jsx`)
  - `pages/` route views
  - `hooks/`, `contexts/`, `utils/` logic helpers
  - `locales/` i18n JSON (`en/translation.json`, `pt/translation.json`)
- Tests: `src/**/__tests__/*.(test|spec).(js|jsx)`.
- Static assets: `public/`. Local API stubs: `api/`. App shell/SEO: `index.html`. Build output: `dist/`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `nvm use` (Node `20.19.1` via `.nvmrc`).
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve built app locally.
- `npm test`: Run unit tests (Vitest + jsdom).
- `npm run test:coverage`: Tests with coverage report.
- `npx eslint src`: Lint before PRs.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; modern functional React components and hooks.
- Components: `PascalCase.jsx` (e.g., `ServiceCard.jsx`).
- Hooks: `useThing.js`; utils: `camelCase.js`.
- Routes/anchors: kebab-case (e.g., `/services/consultas-oftalmologicas`, `#contact`).
- Styling: Tailwind utilities preferred; custom utilities in `src/index.css`.
- i18n: Add keys to both locales; avoid hardcoded UI text.

## Testing Guidelines
- Framework: Vitest + Testing Library (React) with `jsdom`.
- Location/pattern: `src/**/__tests__/*.(test|spec).(js|jsx)`.
- Focus on behavior; mock network/time when needed.
- Maintain stable coverage; add tests for changed paths.

## Commit & Pull Request Guidelines
- Commits: Imperative subject; conventional scopes when useful.
  - Examples: `feat(services): add reviews widget`, `fix(seo): correct JSON‑LD`.
- PRs: Clear description, rationale, linked issue, and UI screenshots/GIFs when applicable.
- Keep i18n/SEO/Accessibility intact; update both locales and preserve ARIA/alt/meta behavior.

## Security & Configuration
- Secrets: Never commit. Use `.env`/`.env.local` with `VITE_` prefix for client exposure.
- Respect consent: Keep analytics/marketing behind consent (see `index.html`/ConsentManager).
- Node version via `.nvmrc`; run `nvm use` before installing/running.
