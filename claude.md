# Claude Contribution Guide

This repository hosts a Vite/React application served by Nginx. Follow
the guidelines below when contributing:

## Development
- Use Node `20.19.1` via `nvm use` and install dependencies with `npm install`.
- Run `npx eslint src` and `npm test` before committing code.
- Keep UI strings in `src/locales/en/translation.json` and
  `src/locales/pt/translation.json`.

## Custom Slash Commands
- `/dev` — run `npm run dev` to start the development server.
- `/lint` — run `npx eslint src` to check code style.
- `/test` — run `npm test` to execute unit tests.
- `/build` — run `npm run build` for a production build.
- `/preview` — run `npm run preview` to serve the build locally.
- `/coverage` — run `npm run test:coverage` to generate a coverage report.
- `/ci` — run `npx eslint src && npm test && npm run build` to mimic the CI pipeline.
- `/deploy` — run `./deploy.sh` to deploy the built app with Nginx.

## CI/CD
- GitHub Actions should lint, test, and build the app on every pull request.
- Protect the `main` branch with required status checks.
- Store secrets (API keys, tokens) in GitHub Secrets; never commit them.

## Deployment with Nginx
- Production, staging, and local configs live in `nginx.conf`,
  `nginx.staging.conf`, and `nginx.local.conf`.
- Validate configs using `nginx -t` in CI before deployment.
- Serve the `dist/` build with HTTPS, HTTP/2, and gzip or brotli compression.
- Use `ssl-setup.sh` to provision Let's Encrypt certificates and renew
  periodically.

## Pull Requests
- Use imperative commit messages (e.g., `docs: update deployment guide`).
- Provide context and screenshots or GIFs for UI changes.

