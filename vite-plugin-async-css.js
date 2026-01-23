/**
 * Vite Plugin: Async CSS Loading
 *
 * Converts render-blocking CSS to non-blocking by using the media attribute swap technique.
 * This technique uses media="print" initially, then switches to media="all" on load.
 *
 * Benefits:
 * - Eliminates render-blocking CSS
 * - Improves LCP (Largest Contentful Paint)
 * - Maintains progressive enhancement (works without JS via noscript fallback)
 *
 * @author Dr. Philipe Saraiva Cruz
 */

export default function asyncCssPlugin() {
  return {
    name: 'vite-plugin-async-css',
    enforce: 'post',

    transformIndexHtml(html) {
      // Match CSS link tags injected by Vite
      const cssLinkRegex = /<link\s+rel="stylesheet"([^>]*)\s+href="([^"]+\.css)"([^>]*)>/gi;

      let transformedHtml = html;
      let match;

      // Find all CSS links and transform them
      while ((match = cssLinkRegex.exec(html)) !== null) {
        const fullMatch = match[0];
        const beforeHref = match[1] || '';
        const href = match[2];
        const afterHref = match[3] || '';

        // Skip if already has media attribute, is a preload, or is Google Fonts (already handled in index.html)
        if (fullMatch.includes('media=') || fullMatch.includes('rel="preload"') || href.includes('fonts.googleapis.com')) {
          continue;
        }

        // Create async CSS link with media swap technique
        // This loads CSS without blocking render, then applies it once loaded
        const asyncLink = `<link rel="stylesheet"${beforeHref} href="${href}"${afterHref} media="print" onload="this.media='all';this.onload=null;">`;

        // Add noscript fallback for users without JavaScript
        const noscriptFallback = `<noscript><link rel="stylesheet"${beforeHref} href="${href}"${afterHref}></noscript>`;

        // Also add a preload hint for faster discovery
        const preloadLink = `<link rel="preload" as="style" href="${href}">`;

        // Replace the original blocking CSS with async version
        transformedHtml = transformedHtml.replace(
          fullMatch,
          `${preloadLink}\n    ${asyncLink}\n    ${noscriptFallback}`
        );
      }

      // Add script to mark when CSS is loaded (for potential below-fold animations)
      const cssLoadedScript = `
    <script>
      // Mark document as CSS-loaded when stylesheets are ready
      (function() {
        var links = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
        var loaded = 0;
        var total = links.length;

        if (total === 0) {
          document.documentElement.classList.add('css-loaded');
          return;
        }

        function checkLoaded() {
          loaded++;
          if (loaded >= total) {
            document.documentElement.classList.add('css-loaded');
          }
        }

        links.forEach(function(link) {
          if (link.sheet) {
            checkLoaded();
          } else {
            link.addEventListener('load', checkLoaded);
          }
        });

        // Fallback: mark as loaded after 3 seconds regardless
        setTimeout(function() {
          document.documentElement.classList.add('css-loaded');
        }, 3000);
      })();
    </script>`;

      // Insert the CSS loaded script before closing head tag
      transformedHtml = transformedHtml.replace('</head>', `${cssLoadedScript}\n  </head>`);

      return transformedHtml;
    }
  };
}
