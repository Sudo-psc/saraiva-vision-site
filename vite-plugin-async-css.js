/**
 * Vite Plugin: Async CSS Loading
 *
 * Converts render-blocking CSS to non-blocking by using the media attribute swap technique.
 * Uses transformIndexHtml with order:'post' to run AFTER Vite core injects CSS/JS links.
 *
 * Note: No <noscript> fallbacks for local CSS - this is a React SPA that requires JS.
 * Google Fonts noscript fallback is handled in index.html source.
 *
 * @author Dr. Philipe Saraiva Cruz
 */

export default function asyncCssPlugin() {
  return {
    name: 'vite-plugin-async-css',
    enforce: 'post',

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let result = html;

        // Step 1: Remove blocking Google Fonts duplicates (keep async version only)
        const hasAsyncFont =
          result.includes('fonts.googleapis.com') &&
          result.includes('media="print"');

        if (hasAsyncFont) {
          result = result.replace(
            /[ \t]*<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com[^"]*"(?:\s+crossorigin)?\s*\/?>\s*\n?/gi,
            (match) => {
              if (match.includes('media=') || match.includes('noscript')) {
                return match;
              }
              return '';
            }
          );
        }

        // Step 2: Convert blocking local .css links to async, deduplicate
        const cssRegex = /<link\s+rel="stylesheet"([^>]*?)\s+href="([^"]+\.css)"([^>]*?)>/gi;
        const asyncHrefs = new Set();

        // First pass: identify which hrefs already have async versions
        let match;
        while ((match = cssRegex.exec(result)) !== null) {
          if (match[0].includes('media="print"')) {
            asyncHrefs.add(match[2]);
          }
        }

        // Second pass: remove blocking duplicates, convert remaining to async
        result = result.replace(cssRegex, (fullMatch, before, href, after) => {
          // Keep existing async and noscript versions
          if (fullMatch.includes('media=') || fullMatch.includes('noscript')) {
            return fullMatch;
          }

          if (asyncHrefs.has(href)) {
            // Remove blocking duplicate - async version already exists
            return '';
          }

          // Convert to async loading
          asyncHrefs.add(href);
          return `<link rel="stylesheet"${before} href="${href}"${after} media="print" onload="this.media='all';this.onload=null;">`;
        });

        // Step 3: Clean blank lines
        result = result.replace(/\n{3,}/g, '\n\n');

        // Step 4: Add css-loaded detection script
        if (!result.includes('css-loaded')) {
          const script = `
    <script>
      (function(){var l=document.querySelectorAll('link[rel="stylesheet"][media="print"]'),c=0,t=l.length;if(!t){document.documentElement.classList.add('css-loaded');return}function d(){c++;if(c>=t)document.documentElement.classList.add('css-loaded')}l.forEach(function(e){e.sheet?d():e.addEventListener('load',d)});setTimeout(function(){document.documentElement.classList.add('css-loaded')},3000)})();
    </script>`;
          result = result.replace('</head>', `${script}\n  </head>`);
        }

        return result;
      }
    }
  };
}
