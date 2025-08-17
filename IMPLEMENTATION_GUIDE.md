# Saraiva Vision Refinement – Implementation Guide

Date: 2025-08-16

## Overview
This document summarizes code changes applied to focus the primary conversion (Agendar Consulta), reduce cognitive load, improve perceived performance, and strengthen robustness. It also outlines the remaining steps for design (Figma), asset optimization, and Lighthouse validation.

## Objectives & Status
1. Persistent primary CTA – Implemented via `FloatingCTA` modal (single funnel) replacing scattered WhatsApp links.
2. Scroll depth reduction – Homepage now uses teasers (lentes + limited testimonials). Full content moved to new pages `/lentes` and `/depoimentos`. Further pruning suggestions below.
3. Micro-copy reassurance – Added roadmap line under hero: “Preencha seus dados e receba confirmação em 1 minuto. 100% seguro.”
4. Progress indicators – Testimonials carousel now shows dots + numeric slide counter.
5. Mobile performance – Foundations added (lazy loading, hero preload). Image compression & Lighthouse audit still required (see Performance To‑Dos).
6. Dead-end interactions removed – Direct WhatsApp links replaced by unified modal with WhatsApp/Telefone/E-mail options + fallback instructions. Inline form validation added with real-time hints.

## Code Changes (Key Files)
| Area | File | Change |
|------|------|--------|
| Floating CTA modal | `src/components/FloatingCTA.jsx` | New component (sticky bottom-right) with modal + custom event listener. |
| Remove legacy WhatsApp widget | `HomePage.jsx` | Replaced `<WhatsappWidget/>` with `<FloatingCTA/>`. |
| Unified CTA triggers | `Hero.jsx`, `Services.jsx`, `Contact.jsx` | Dispatch `open-floating-cta` event instead of opening WhatsApp directly. |
| Micro-roadmap copy | `Hero.jsx` | Added reassurance line below buttons. |
| Testimonials progress | `Testimonials.jsx` | Numeric counter + optional `limit` prop + lazy-loaded images + “view all” link. |
| Homepage scroll reduction | `HomePage.jsx` | Added lenses teaser section + limited testimonials (3). |
| New pages | `pages/TestimonialsPage.jsx`, `pages/LensesPage.jsx`, `App.jsx` | Routes for full content. |
| Contact validation | `Contact.jsx` | Real-time validators, accessibility attributes, error hints, submit state. |
| Performance hints | `index.html`, multiple components | Preload hero image, added `loading="lazy"`, `decoding="async"`. |
| Image optimizations groundwork | Various | Added lazy attributes to blog/testimonial/lens images. |

## Additional Recommendations (Optional Enhancements)
1. Collapse or defer Blog + FAQ sections (accordion closed by default) to further reduce initial scroll & layout shift.
2. Convert teaser sections into smaller cards with max ~240px height to confidently stay within 3 viewport rule on common devices (e.g. 390×844, 430×932).
3. Use route-level code splitting (dynamic imports for low-priority pages) to cut initial JS.
4. Replace Google Fonts link with `font-display: swap` (already implicit with modern browsers) or self-host subset.

## Performance To-Dos
| Task | Tool / Command | Target |
|------|----------------|--------|
| Compress hero & clinic images | `cwebp image.png -q 80 -o image.webp` | ≤150 KB each |
| Generate multiple sizes (hero) | `sharp hero.png -resize 800 -o hero-800.webp` etc. | 800 / 1200 / 1600 widths |
| Replace `<img src="…png">` with WebP + fallback | `<picture>` element | Better LCP |
| Lighthouse (mobile) | Chrome DevTools / CLI (`lighthouse https://... --preset=desktop/mobile`) | ≥90 Performance |
| Bundle analysis | `vite build --report` (add plugin if needed) | JS < 200KB gzipped first load |
| Preconnect critical origins | Already for Google Fonts; add `dns-prefetch` if external APIs added later | Reduce connect time |

Suggested script to bulk convert (macOS):
```bash
brew install webp
mkdir -p public/optimized
for f in hero.png clinic.png lenses.png; do \
  cwebp -q 80 "$f" -o "public/optimized/${f%.png}.webp"; \
done
```

Integrate with `<picture>`:
```html
<picture>
  <source type="image/webp" srcset="/optimized/hero.webp" />
  <img src="/fallback/hero.png" alt="Médico oftalmologista" width="1600" height="900" loading="eager" fetchpriority="high" />
</picture>
```

## Form Validation Details
Validation logic (`Contact.jsx`):
| Field | Rule | Error Message |
|-------|------|---------------|
| name | ≥3 chars | “Informe pelo menos 3 caracteres.” |
| email | Basic regex | “E-mail inválido.” |
| phone | 10–13 digits (Brazil) | “Use apenas números...” |
| message | ≥10 chars | “Mensagem muito curta...” |

ARIA attributes (`aria-invalid`, `aria-describedby`) added for accessibility. `Esc` key closes modal.

## Event Contract
Dispatch `open-floating-cta` on `window` to open the scheduling modal universally:
```js
window.dispatchEvent(new Event('open-floating-cta'));
```

## Remaining Deliverables
1. Figma: Update responsive mockups reflecting (a) sticky CTA, (b) trimmed homepage, (c) modal flows, (d) testimonial pagination. Mark removed sections with annotation “Moved to /lentes” etc.
2. Optimized Assets: Produce WebP + fallback, maintain manifest listing source → optimized path + size reduction (%). Commit to `public/optimized/`.
3. Lighthouse Report: Capture mobile (Moto G4 / 4G throttling & CPU 4x slowdown). Export JSON + screenshot, store under `performance/`.
4. (This file) Implementation guide – DONE.
 5. Configure Google Maps/Places: create `.env.local` with `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_PLACE_ID` (never commit real key).

## QA Checklist
- [ ] Modal opens from all CTA triggers (Hero primary, Services button, Contact phone/WhatsApp labels).
- [ ] Modal focus trap (optional future improvement) & `Esc` closes.
- [ ] Page still navigable via keyboard (tab order for fixed button).
- [ ] Validation prevents submit until all fields valid; green border states appear.
- [ ] Testimonials counter matches slide changes (incl. auto-play pause after manual interaction).
- [ ] Homepage content height within ~3 scrolls on 390×844 (verify with dev tools) – adjust spacing if needed.

## Potential Future Enhancements
1. Add analytics events for modal open, preferred channel click.
2. Server-side form submission + spam protection (hCaptcha or time-based honeypot).
3. Persist user language & partial form data in `sessionStorage` for resilience.
4. A/B test copy variant for micro-roadmap line.

---
Maintained by: (Add maintainer)
Version: 1.0
