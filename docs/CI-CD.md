# CI/CD with GitHub Actions

This project ships with three GitHub Actions workflows under `.github/workflows/`:

- `ci.yml`: Runs on pushes to `main` and on PRs to `main`/`develop`.
  - Installs deps using Node from `.nvmrc` (Node 20.19.1)
  - Lints (`npx eslint src`), runs unit tests (Vitest), builds, and uploads coverage

- `performance-check.yml`: Runs the verification suite (`npm run verify`) on PRs and via manual dispatch. Uploads Lighthouse reports and comments PR results.

- `deploy.yml`: Builds, tests, and then deploys to production on pushes to `main` or manual dispatch.
  - Uploads `dist/` as an artifact and deploys over SSH using a release directory + atomic symlink switch
  - Runs a post-deploy smoke test using `scripts/smoke-test.sh`

## Required Secrets (Repository → Settings → Secrets and variables → Actions)

- `SSH_PRIVATE_KEY`: Private key for the deploy user (no passphrase recommended for CI)
- `SSH_USER`: SSH username
- `SSH_HOST`: SSH host
- `SSH_PORT`: SSH port (e.g., `22`)
- `DEPLOY_ROOT`: Base directory on the server, e.g., `/var/www/saraivavision`

## Server Layout (example)

```
$DEPLOY_ROOT/
  releases/
    <commit-short>-<run-number>/  # uploaded dist/
  saraivavision -> releases/<active-release>  # symlink switched by deploy
```

Nginx should serve from `$DEPLOY_ROOT/saraivavision`.

## Triggers

- CI (`ci.yml`): on `push` to `main` and on PRs to `main`/`develop`
- Performance (`performance-check.yml`): on PR and `workflow_dispatch`
- Deploy (`deploy.yml`): on `push` to `main` and `workflow_dispatch` (with optional `url` input)

## Notes

- Node version is pinned via `.nvmrc` and respected by all workflows.
- Linting is enforced in both CI and deploy paths.
- The deploy job expects the server user to be able to run `sudo nginx -t && sudo systemctl reload nginx`.

