# Security Findings

## High – Production Resend API key exposed in repository
- **Location:** `docs/archive/deployment-reports/DEPLOY_SUCCESS_REPORT.md` and `docs/CONTACT_BACKEND_README.md` contain the live `RESEND_API_KEY` value used in production email delivery.
- **Issue:** Committed documentation stores a real production credential (`re_9J2D8if4_4PnmzERGxac3F2NuzLaCcdd2`), making it retrievable by anyone with repo access.
- **Impact:** Attackers can hijack transactional email, send phishing messages, or exhaust the quota of the Resend account, disrupting patient communications and risking brand damage.
- **Recommendation:** Rotate the exposed key immediately, purge secrets from git history, and replace documentation examples with redacted placeholders sourced from a secure secret manager.

## High – Unauthenticated telemetry APIs leak visitor data
- **Location:** `/api/bug-report` and `/api/track-404/analytics` expose stored reports without enforcing any authentication.
- **Issue:** Anyone can call these endpoints to download user-submitted bug reports (including emails, user agents, and IPs) and 404 analytics containing visitor IPs and navigation data.
- **Impact:** This violates privacy expectations (LGPD) and gives attackers reconnaissance data about internal tooling and site usage.
- **Recommendation:** Require strong authentication/authorization before returning stored diagnostics, or disable the read endpoints entirely in production.

## Medium – Appointment webhook CORS handler references undefined request object
- **Location:** `api/src/routes/webhook-appointment.js` uses `req.ip` inside the CORS `origin` callback where `req` is not in scope.
- **Issue:** When an unapproved origin triggers the rejection branch, the undefined `req` reference throws a runtime `ReferenceError`, causing the webhook preflight to fail before returning a controlled error.
- **Impact:** Legitimate integrations from unexpected origins or misconfigured partners receive 500 errors, making debugging difficult and potentially dropping webhook notifications.
- **Recommendation:** Switch to the CORS callback signature that includes `req` (e.g., `(req, origin, callback)`) or capture logging elsewhere so the rejection path no longer depends on an undefined variable.
