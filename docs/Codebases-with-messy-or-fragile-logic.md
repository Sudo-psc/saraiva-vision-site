# Codebases with messy or fragile logic

## Monolithic routing container
- `src/App.jsx` centralizes dozens of lazy imports, subdomain checks, and widgets inside a single component, mixing routing, layout, and global concerns.【F:src/App.jsx†L1-L124】
- The component still exposes legacy deployment comments that make it harder to see functional changes in diffs and hint at manual production edits.【F:src/App.jsx†L133-L139】

**Risk:** Any change to routing or shared layout requires editing the same oversized component, increasing merge conflicts and regression risk. Testing isolated flows (e.g., checkout vs. marketing pages) is also complicated because there is no modular route configuration.

**Opportunities:** Break routes into domain-focused modules (public, payments, marketing), wrap them in layout-specific routers, and move widget mounting into a higher-level shell component so App.jsx only composes routes.

## Bootstrap overloaded with cross-cutting concerns
- `src/main.jsx` initializes analytics, error trackers, service workers, global event listeners, and even renders fallback UIs in one file.【F:src/main.jsx†L1-L185】
- It mutates `window` by exposing trackers and analytics singletons, which tightly couples runtime behavior to global state and complicates server-side rendering or testing.【F:src/main.jsx†L21-L185】
- Hard-coded GA/GTM fallbacks and console logging leak production-specific behavior into bootstrap code, making environment management fragile.【F:src/main.jsx†L73-L95】

**Risk:** With so many responsibilities tangled together, failures in non-critical integrations (analytics, service worker) can block the entire app from mounting. The global side effects also make it risky to refactor initialization or reuse components in other environments.

**Opportunities:** Extract observability setup into dedicated modules (e.g., `bootstrap/analytics.ts`, `bootstrap/serviceWorker.ts`) and pass dependencies via context. Guard global exposure behind feature flags or dependency injection to keep bootstrap lean.

## Analytics service tightly coupled to browser globals
- The analytics service directly depends on `window`, `document`, and console logging, mixing frontend tracking with backend retry logic in the same module.【F:src/services/analytics-service.js†L6-L138】
- Every tracker function performs side effects (dataLayer push, fetch fallback) without verifying availability of globals or surfacing errors to callers beyond `false`, making silent failures likely.【F:src/services/analytics-service.js†L13-L139】

**Risk:** Because analytics is intertwined with global DOM APIs, running the code in server-rendered contexts or unit tests requires heavy mocking. When globals change (e.g., dataLayer unavailable), events simply return `false` without a central handler, which can hide tracking outages.

**Opportunities:** Introduce an adapter layer that receives analytics clients via dependency injection, separate browser-specific logic from transport/retry code, and standardize error reporting so callers can react to failures.

## Inline fallbacks and duplicated presentation logic
- The bootstrap catch block renders inline-styled fallback markup instead of delegating to a reusable component, repeating presentation logic and violating styling conventions.【F:src/main.jsx†L172-L185】
- Multiple components include comments and debug artifacts that should live in documentation, increasing noise in critical files.【F:src/App.jsx†L6-L139】

**Risk:** Inline fallbacks are easy to forget when design tokens change, leading to inconsistent UX during failure scenarios. Comment clutter makes it harder to see logic changes during reviews.

**Opportunities:** Replace inline fallbacks with a dedicated error shell component that relies on Tailwind classes, and move deployment/debug notes to documentation or CHANGELOG entries.
