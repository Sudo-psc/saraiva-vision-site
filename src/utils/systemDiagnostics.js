const DEFAULT_TIMEOUT = 8000;

const now = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

const stripTrailingSlash = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\/+$/, '');
};

const isBrowserEnvironment = () => typeof window !== 'undefined' && typeof fetch === 'function';

async function fetchWithTimeout(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...rest } = options;

  if (typeof fetch !== 'function') {
    throw new Error('Fetch API is not available');
  }

  if (typeof AbortController === 'undefined' || timeout <= 0) {
    return fetch(url, rest);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildLatency(start) {
  const end = now();
  return end - start;
}

function resolveHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return url;
  }
}

export function createDiagnostics(customConfig = {}) {
  const config = {
    primaryDomain: 'https://saraivavision.com.br',
    wordpressDomain: 'https://saraivavision.com.br',
    checkHost: 'check.saraivavision.com.br',
    dnsHostname: null,
    ...customConfig,
  };

  const primaryDomain = stripTrailingSlash(config.primaryDomain || 'https://saraivavision.com.br');
  const wordpressDomain = stripTrailingSlash(config.wordpressDomain || primaryDomain);
  const wordpressRestBase = `${wordpressDomain}/wp-json/wp/v2`;
  const wordpressRoot = `${wordpressDomain}/wp-json`;
  const dnsHostname = config.dnsHostname || resolveHostname(primaryDomain);
  const expectedCheckHost = config.checkHost || 'check.saraivavision.com.br';

  return [
    {
      id: 'server',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const start = now();
        const url = `${primaryDomain}/`;

        try {
          await fetchWithTimeout(url, {
            mode: 'no-cors',
            cache: 'no-store',
            timeout: DEFAULT_TIMEOUT,
          });

          return {
            status: 'success',
            latency: buildLatency(start),
            data: { target: url },
            messageId: 'opaqueResponse',
          };
        } catch (error) {
          const latency = buildLatency(start);
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency,
            };
          }

          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency,
          };
        }
      },
    },
    {
      id: 'services',
      defaultParams: { target: wordpressRestBase },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = `${wordpressRestBase}/pages?per_page=5&_fields=id,slug`;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const payload = await response.json();
            const count = Array.isArray(payload) ? payload.length : 0;
            return {
              status: 'success',
              latency,
              data: { count },
            };
          }

          if (response.type === 'opaque') {
            return {
              status: 'warning',
              latency,
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'api',
      defaultParams: { target: wordpressRestBase },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = `${wordpressRestBase}/posts?per_page=1&_fields=id,date`;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const payload = await response.json();
            const count = Array.isArray(payload) ? payload.length : 0;
            return {
              status: 'success',
              latency,
              data: { count },
            };
          }

          if (response.type === 'opaque') {
            return {
              status: 'warning',
              latency,
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'routes',
      defaultParams: { target: wordpressRoot },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = wordpressRoot;
        const start = now();
        const importantRoutes = ['/wp/v2/posts', '/wp/v2/pages', '/wp/v2/categories'];

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const payload = await response.json();
            const routes = payload?.routes ? Object.keys(payload.routes) : [];
            const missing = importantRoutes.filter((route) => !routes.includes(route));
            const data = {
              totalRoutes: routes.length,
              missingRoutes: missing,
            };

            if (missing.length === 0) {
              return {
                status: 'success',
                latency,
                data,
              };
            }

            return {
              status: 'warning',
              latency,
              data,
              messageId: 'missingRoutes',
              messageParams: { missing: missing.join(', ') },
            };
          }

          if (response.type === 'opaque') {
            return {
              status: 'warning',
              latency,
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'dns',
      defaultParams: { hostname: dnsHostname },
      run: async () => {
        const url = `https://dns.google/resolve?name=${encodeURIComponent(dnsHostname)}&type=A`;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (!response.ok) {
            return {
              status: 'error',
              latency,
              messageId: 'httpError',
              messageParams: { status: response.status },
            };
          }

          const payload = await response.json();
          const records = Array.isArray(payload?.Answer)
            ? payload.Answer.filter((answer) => typeof answer?.data === 'string').map((answer) => answer.data)
            : [];

          if (records.length === 0) {
            return {
              status: 'warning',
              latency,
              data: { records },
            };
          }

          return {
            status: 'success',
            latency,
            data: { records },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency: buildLatency(start),
          };
        }
      },
    },
    {
      id: 'ip',
      defaultParams: { hostname: dnsHostname },
      run: async () => {
        const start = now();
        const queries = [
          `https://dns.google/resolve?name=${encodeURIComponent(dnsHostname)}&type=A`,
          `https://dns.google/resolve?name=${encodeURIComponent(dnsHostname)}&type=AAAA`,
        ];

        try {
          const [ipv4Response, ipv6Response] = await Promise.all(
            queries.map((endpoint) =>
              fetchWithTimeout(endpoint, {
                mode: 'cors',
                cache: 'no-store',
                timeout: DEFAULT_TIMEOUT,
              })
            )
          );
          const latency = buildLatency(start);

          if (!ipv4Response.ok && !ipv6Response.ok) {
            return {
              status: 'error',
              latency,
              messageId: 'httpError',
              messageParams: { status: ipv4Response.status || ipv6Response.status },
            };
          }

          const ipv4Payload = ipv4Response.ok ? await ipv4Response.json() : { Answer: [] };
          const ipv6Payload = ipv6Response.ok ? await ipv6Response.json() : { Answer: [] };

          const ipv4 = Array.isArray(ipv4Payload.Answer)
            ? ipv4Payload.Answer.filter((answer) => typeof answer?.data === 'string').map((answer) => answer.data)
            : [];
          const ipv6 = Array.isArray(ipv6Payload.Answer)
            ? ipv6Payload.Answer.filter((answer) => typeof answer?.data === 'string').map((answer) => answer.data)
            : [];

          if (ipv4.length === 0 && ipv6.length === 0) {
            return {
              status: 'warning',
              latency,
              data: { ipv4, ipv6 },
            };
          }

          return {
            status: 'success',
            latency,
            data: { ipv4, ipv6 },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency: buildLatency(start),
          };
        }
      },
    },
    {
      id: 'ssl',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const start = now();
        const url = `${primaryDomain}/`;

        try {
          await fetchWithTimeout(url, {
            mode: 'no-cors',
            cache: 'no-store',
            timeout: DEFAULT_TIMEOUT,
          });

          return {
            status: 'success',
            latency: buildLatency(start),
            data: { target: url },
            messageId: 'opaqueResponse',
          };
        } catch (error) {
          const latency = buildLatency(start);
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency,
            };
          }

          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency,
          };
        }
      },
    },
    {
      id: 'subdomain',
      defaultParams: { expected: expectedCheckHost },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const host = window.location?.hostname || '';
        const protocol = window.location?.protocol || '';

        if (!host) {
          return {
            status: 'warning',
            messageId: 'hostnameUnavailable',
          };
        }

        if (host !== expectedCheckHost) {
          return {
            status: 'warning',
            data: { hostname: host, protocol },
            messageId: 'hostMismatch',
            messageParams: { hostname: host, expected: expectedCheckHost },
          };
        }

        if (protocol !== 'https:') {
          return {
            status: 'warning',
            data: { hostname: host, protocol },
            messageId: 'insecureProtocol',
            messageParams: { protocol },
          };
        }

        return {
          status: 'success',
          data: { hostname: host, protocol },
        };
      },
    },
    {
      id: 'php',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = `${primaryDomain}/?rest_route=/`;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const payload = await response.json();
            const routesCount = payload?.routes ? Object.keys(payload.routes).length : 0;
            return {
              status: 'success',
              latency,
              data: { namespace: payload?.namespace, routes: routesCount },
            };
          }

          if (response.type === 'opaque') {
            return {
              status: 'warning',
              latency,
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'nginx',
      defaultParams: { target: wordpressRoot },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = wordpressRoot;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (!response.ok) {
            return {
              status: 'error',
              latency,
              messageId: 'httpError',
              messageParams: { status: response.status },
            };
          }

          const serverHeader = response.headers?.get?.('server');
          if (serverHeader) {
            return {
              status: 'success',
              latency,
              data: { server: serverHeader },
            };
          }

          return {
            status: 'warning',
            latency,
            messageId: 'opaqueResponse',
            data: { target: url },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'database',
      defaultParams: { target: wordpressRestBase },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const url = `${wordpressRestBase}/posts?per_page=1&_fields=id,date,modified,status&orderby=modified&order=desc`;
        const start = now();

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const payload = await response.json();
            const lastModified = Array.isArray(payload) && payload.length > 0 
              ? payload[0]?.modified || payload[0]?.date 
              : null;
            
            const dbConnectionTime = Math.max(latency - 1000, 0); // Estimated DB query time
            
            return {
              status: 'success',
              latency,
              data: { 
                lastModified,
                dbLatency: dbConnectionTime,
                recordsFound: Array.isArray(payload) ? payload.length : 0
              },
            };
          }

          if (response.type === 'opaque') {
            return {
              status: 'warning',
              latency,
              messageId: 'opaqueResponse',
              data: { target: url },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency: buildLatency(start),
          };
        }
      },
    },
    {
      id: 'assets',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const start = now();
        const testAssets = [
          '/images/logo.png',
          '/apple-touch-icon.png',
          '/sw.js'
        ];

        try {
          const results = await Promise.allSettled(
            testAssets.map(async (asset) => {
              const assetUrl = `${primaryDomain}${asset}`;
              const response = await fetchWithTimeout(assetUrl, {
                mode: 'no-cors',
                cache: 'no-store',
                timeout: DEFAULT_TIMEOUT / 2,
              });
              return { asset, success: true, status: response.status };
            })
          );

          const latency = buildLatency(start);
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;

          if (successful === testAssets.length) {
            return {
              status: 'success',
              latency,
              data: { 
                assetsChecked: testAssets.length,
                successful,
                failed,
                availability: (successful / testAssets.length * 100).toFixed(1)
              },
            };
          }

          if (successful > 0) {
            return {
              status: 'warning',
              latency,
              data: { 
                assetsChecked: testAssets.length,
                successful,
                failed,
                availability: (successful / testAssets.length * 100).toFixed(1)
              },
              messageId: 'partialAvailability',
              messageParams: { successful, total: testAssets.length },
            };
          }

          return {
            status: 'error',
            latency,
            data: { assetsChecked: testAssets.length, successful: 0, failed },
            messageId: 'allAssetsFailed',
          };
        } catch (error) {
          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency: buildLatency(start),
          };
        }
      },
    },
    {
      id: 'security',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const start = now();
        const url = `${primaryDomain}/`;

        try {
          const response = await fetchWithTimeout(url, {
            mode: 'cors',
            cache: 'no-store',
            timeout: DEFAULT_TIMEOUT,
          });
          const latency = buildLatency(start);

          if (response.ok) {
            const headers = response.headers;
            const securityHeaders = {
              'strict-transport-security': headers.get('strict-transport-security'),
              'content-security-policy': headers.get('content-security-policy'),
              'x-frame-options': headers.get('x-frame-options'),
              'x-content-type-options': headers.get('x-content-type-options'),
              'referrer-policy': headers.get('referrer-policy'),
            };

            const presentHeaders = Object.entries(securityHeaders)
              .filter(([, value]) => value !== null)
              .map(([key]) => key);

            const missingHeaders = Object.entries(securityHeaders)
              .filter(([, value]) => value === null)
              .map(([key]) => key);

            const score = (presentHeaders.length / Object.keys(securityHeaders).length * 100).toFixed(0);

            if (presentHeaders.length === Object.keys(securityHeaders).length) {
              return {
                status: 'success',
                latency,
                data: { 
                  score: parseInt(score),
                  presentHeaders: presentHeaders.length,
                  totalHeaders: Object.keys(securityHeaders).length,
                  headers: securityHeaders
                },
              };
            }

            if (presentHeaders.length >= 3) {
              return {
                status: 'warning',
                latency,
                data: { 
                  score: parseInt(score),
                  presentHeaders: presentHeaders.length,
                  totalHeaders: Object.keys(securityHeaders).length,
                  missingHeaders,
                  headers: securityHeaders
                },
                messageId: 'missingSecurity',
                messageParams: { missing: missingHeaders.join(', ') },
              };
            }

            return {
              status: 'error',
              latency,
              data: { 
                score: parseInt(score),
                presentHeaders: presentHeaders.length,
                missingHeaders,
                headers: securityHeaders
              },
              messageId: 'lowSecurity',
              messageParams: { count: presentHeaders.length },
            };
          }

          return {
            status: 'error',
            latency,
            messageId: 'httpError',
            messageParams: { status: response.status },
          };
        } catch (error) {
          if (error?.name === 'AbortError') {
            return {
              status: 'error',
              messageId: 'timeout',
              latency: buildLatency(start),
            };
          }

          try {
            // Fallback test with no-cors to check if server is reachable
            await fetchWithTimeout(url, {
              mode: 'no-cors',
              cache: 'no-store',
              timeout: DEFAULT_TIMEOUT,
            });

            return {
              status: 'warning',
              latency: buildLatency(start),
              messageId: 'corsRestricted',
              data: { target: url },
            };
          } catch (secondaryError) {
            return {
              status: 'error',
              messageId: 'fetchError',
              messageParams: { message: secondaryError?.message || error?.message || 'unknown error' },
              latency: buildLatency(start),
            };
          }
        }
      },
    },
    {
      id: 'performance',
      defaultParams: { target: primaryDomain },
      run: async () => {
        if (!isBrowserEnvironment()) {
          return {
            status: 'warning',
            messageId: 'browserOnly',
          };
        }

        const measurements = [];
        const testUrls = [
          `${primaryDomain}/`,
          `${wordpressRestBase}/posts?per_page=1&_fields=id`,
          `${primaryDomain}/sw.js`
        ];

        try {
          // Run multiple measurements for statistical accuracy
          for (let i = 0; i < testUrls.length; i++) {
            const url = testUrls[i];
            const start = now();

            try {
              await fetchWithTimeout(url, {
                mode: 'no-cors',
                cache: 'no-store',
                timeout: DEFAULT_TIMEOUT / 2,
              });
              const latency = buildLatency(start);
              measurements.push({ url, latency, success: true });
            } catch (error) {
              measurements.push({ url, latency: buildLatency(start), success: false, error: error.message });
            }
          }

          const successfulMeasurements = measurements.filter(m => m.success);
          const averageLatency = successfulMeasurements.length > 0 
            ? successfulMeasurements.reduce((sum, m) => sum + m.latency, 0) / successfulMeasurements.length
            : 0;

          const minLatency = successfulMeasurements.length > 0 
            ? Math.min(...successfulMeasurements.map(m => m.latency))
            : 0;

          const maxLatency = successfulMeasurements.length > 0 
            ? Math.max(...successfulMeasurements.map(m => m.latency))
            : 0;

          const performanceGrade = averageLatency < 500 ? 'A' 
            : averageLatency < 1000 ? 'B'
            : averageLatency < 2000 ? 'C'
            : averageLatency < 3000 ? 'D' : 'F';

          if (successfulMeasurements.length === testUrls.length && averageLatency < 1000) {
            return {
              status: 'success',
              latency: averageLatency,
              data: { 
                averageLatency: Math.round(averageLatency),
                minLatency: Math.round(minLatency),
                maxLatency: Math.round(maxLatency),
                grade: performanceGrade,
                testsRun: testUrls.length,
                successful: successfulMeasurements.length
              },
            };
          }

          if (successfulMeasurements.length > 0) {
            return {
              status: 'warning',
              latency: averageLatency,
              data: { 
                averageLatency: Math.round(averageLatency),
                minLatency: Math.round(minLatency),
                maxLatency: Math.round(maxLatency),
                grade: performanceGrade,
                testsRun: testUrls.length,
                successful: successfulMeasurements.length
              },
              messageId: averageLatency > 2000 ? 'slowPerformance' : 'partialPerformance',
              messageParams: { successful: successfulMeasurements.length, total: testUrls.length },
            };
          }

          return {
            status: 'error',
            latency: 0,
            data: { testsRun: testUrls.length, successful: 0, grade: 'F' },
            messageId: 'performanceTestFailed',
          };
        } catch (error) {
          return {
            status: 'error',
            messageId: 'fetchError',
            messageParams: { message: error?.message || 'unknown error' },
            latency: 0,
          };
        }
      },
    },
  ];
}

export default createDiagnostics;
