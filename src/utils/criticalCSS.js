/**
 * Critical CSS extraction and inlining for above-the-fold content
 * Optimizes initial page load performance by inlining essential styles
 */

// Critical styles for immediate rendering (hero, navbar, CTA)
export const criticalCSS = `
/* Critical Variables */
:root {
  --background: 0 0% 100%;
  --primary: 210 100% 46%;
  --text-primary: 217 33% 17%;
  --text-secondary: 215 16% 47%;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-section-lg: 6rem;
  --font-size-display-md: 2.5rem;
  --font-size-body-xl: 1.125rem;
  --line-height-snug: 1.2;
  --line-height-loose: 1.6;
  --letter-spacing-tight: -0.02em;
}

/* Critical Base Styles */
*,*::before,*::after{box-sizing:border-box}
html{line-height:1.15;-webkit-text-size-adjust:100%}
body{margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:17px;line-height:1.6;color:hsl(var(--text-primary));overflow-x:hidden;background:hsl(var(--background))}

/* Critical Layout */
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
@media(min-width:768px){.container{padding:0 2rem}}

/* Critical Hero Styles */
.hero-section{position:relative;padding:calc(6rem + 2rem) 0 6rem;background:linear-gradient(135deg,#e0f2fe 0%,#dbeafe 100%);overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1fr;gap:2rem;align-items:center}
@media(min-width:1024px){.hero-grid{grid-template-columns:1fr 1fr;gap:6rem}}

/* Critical Typography */
h1{font-size:2.25rem;font-weight:700;line-height:var(--line-height-snug);letter-spacing:var(--letter-spacing-tight);color:hsl(var(--text-primary));margin:0 0 1rem}
@media(min-width:768px){h1{font-size:var(--font-size-display-md)}}
p{font-size:1rem;line-height:var(--line-height-loose);color:hsl(var(--text-secondary));margin:0 0 1rem;max-width:70ch}
@media(min-width:768px){p{font-size:var(--font-size-body-xl)}}

/* Critical CTA Button */
.cta-primary{display:inline-flex;align-items:center;justify-content:center;gap:1rem;padding:1.25rem 2rem;font-size:1.125rem;font-weight:700;color:white;background:linear-gradient(90deg,#10b981,#059669);border:none;border-radius:1.5rem;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 8px 24px rgba(16,185,129,0.3)}
.cta-primary:hover{transform:scale(1.05);box-shadow:0 12px 32px rgba(16,185,129,0.4)}

/* Critical Navbar */
.navbar{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,0.1)}
.navbar-container{display:flex;align-items:center;justify-content:between;padding:1rem;max-width:1200px;margin:0 auto}

/* Critical Image Styles */
img{max-width:100%;height:auto}
.hero-image{width:100%;height:auto;border-radius:1.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.08)}

/* Critical Utilities */
.text-center{text-align:center}
.text-gradient{background:linear-gradient(90deg,#0052D4,#4364F7,#6FB1FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}

/* Critical Responsive */
@media(max-width:768px){
  .hero-section{padding:calc(4rem + 2rem) 0 4rem}
  h1{font-size:2rem}
  .cta-primary{width:100%;font-size:1rem;padding:1rem 1.5rem}
}
`;

// Function to inline critical CSS
export function inlineCriticalCSS() {
  if (typeof document === 'undefined') return;
  
  // Check if critical CSS is already inlined
  if (document.querySelector('#critical-css')) return;
  
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.type = 'text/css';
  style.appendChild(document.createTextNode(criticalCSS));
  
  // Insert before any other stylesheets
  const head = document.head;
  const firstLink = head.querySelector('link[rel="stylesheet"]');
  
  if (firstLink) {
    head.insertBefore(style, firstLink);
  } else {
    head.appendChild(style);
  }
}

// Function to preload non-critical CSS
export function preloadNonCriticalCSS() {
  if (typeof document === 'undefined') return;
  // In production, Vite injects final CSS links with hashed filenames (assets/styles/*).
  // Preloading a hardcoded '/assets/index.css' causes a 404. Skip in PROD.
  if (import.meta && import.meta.env && import.meta.env.PROD) return;
  
  // Preload main stylesheet after critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/src/index.css';
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
  
  // Fallback for browsers that don't support preload
  const noscript = document.createElement('noscript');
  const fallbackLink = document.createElement('link');
  fallbackLink.rel = 'stylesheet';
  fallbackLink.href = '/src/index.css';
  noscript.appendChild(fallbackLink);
  document.head.appendChild(noscript);
}

// Auto-initialize critical CSS
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inlineCriticalCSS);
  } else {
    inlineCriticalCSS();
  }
  
  // Preload non-critical CSS after initial render
  window.addEventListener('load', preloadNonCriticalCSS);
}

export default { criticalCSS, inlineCriticalCSS, preloadNonCriticalCSS };
