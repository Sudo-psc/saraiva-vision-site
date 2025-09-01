# Security Key Rotation & Git History Purge

This playbook guides safe rotation of API keys and removal of `.env` from Git history.

## 1) Prepare New Keys (with Restrictions)

Generate new keys and restrict them by domain/IP in their consoles:

- Google reCAPTCHA v3
  - Site key (public, client): restrict by domain `saraivavision.com.br` (+ staging)
  - Secret (server-only): keep on server, never in client bundle
- Google Maps / Places
  - Browser key: HTTP referrers → domains only; scopes only required APIs
  - Server key: restrict by server IP/service account; scopes limited
- Supabase
  - Rotate `anon` key; ensure RLS enabled
- Optional: rotate any other exposed tokens

## 2) Update Environment Variables

- Production/Staging: set env vars in the hosting provider (no `.env` committed)
- Development: `.env.local` only, never committed

Required variables:

- Client (safe to expose):
  - `VITE_RECAPTCHA_SITE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, etc.
- Server (secret):
  - `RECAPTCHA_SECRET`, `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACES_API_KEY`, etc.

## 3) Remove `.env` from Repo History

WARNING: This rewrites history. Coordinate with the team.

Option A – git filter-repo (recommended):

```
# Install (one-time)
pip install git-filter-repo  # or brew install git-filter-repo

# From repo root
git filter-repo --invert-paths --path .env --force

# Push rewritten history
git push origin --force --all
git push origin --force --tags
```

Option B – BFG Repo-Cleaner:

```
java -jar bfg.jar --delete-files .env
# Cleanup refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive
# Force push
git push origin --force --all
git push origin --force --tags
```

Post-purge:
- Ask collaborators to re-clone or hard-reset to the new history
- Verify in the remote UI that `.env` no longer appears in historical commits

## 4) Guardrails

- Ensure `.gitignore` contains `.env` (already configured)
- Enable the pre-commit secret guard:

```
# From repo root
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit tools/pre-commit-guard.sh
```

## 5) Monitor & Validate

- Rotate keys → deploy → verify endpoints
- Monitor provider dashboards for abnormal usage 48–72h
- Set calendar reminders for periodic rotation (e.g., quarterly)

## 6) Canonical Domain

- Domain unified in code: `saraivavision.com.br` (SEOHead)
- Ensure robots.txt and DNS/redirects align with the canonical domain

