#!/usr/bin/env node

/**
 * WordPress GraphQL Endpoint Diagnostics
 * Tests WordPress GraphQL endpoint connectivity and provides detailed diagnostic information
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const WORDPRESS_GRAPHQL_ENDPOINT = process.env.WORDPRESS_GRAPHQL_ENDPOINT ||
                                  process.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
                                  'https://cms.saraivavision.com.br/graphql';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
}

// Test functions
async function testSSLCertificate(endpoint) {
  logSection('SSL Certificate Test');

  return new Promise((resolve) => {
    const url = new URL(endpoint);

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000,
      rejectUnauthorized: false, // Allow self-signed certs for testing
      agent: new https.Agent({ rejectUnauthorized: false })
    }, (res) => {
      const cert = res.socket.getPeerCertificate();

      if (cert.raw) {
        log('✓ SSL Certificate found', 'green');
        log(`  Subject: ${cert.subject.CN}`, 'blue');
        log(`  Issuer: ${cert.issuer.CN}`, 'blue');
        log(`  Valid From: ${new Date(cert.valid_from).toLocaleString()}`, 'blue');
        log(`  Valid Until: ${new Date(cert.valid_to).toLocaleString()}`, 'blue');

        // Check if certificate is expired
        const now = new Date();
        const validTo = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
          log(`  ⚠️  Certificate EXPIRED ${Math.abs(daysUntilExpiry)} days ago`, 'yellow');
        } else if (daysUntilExpiry < 30) {
          log(`  ⚠️  Certificate expires in ${daysUntilExpiry} days`, 'yellow');
        } else {
          log(`  ✓ Certificate valid for ${daysUntilExpiry} more days`, 'green');
        }

        resolve({ valid: true, cert, daysUntilExpiry });
      } else {
        log('✗ No SSL Certificate found', 'red');
        resolve({ valid: false, cert: null, daysUntilExpiry: -1 });
      }
    });

    req.on('error', (error) => {
      log(`✗ SSL Connection Error: ${error.message}`, 'red');
      resolve({ valid: false, cert: null, daysUntilExpiry: -1, error: error.message });
    });

    req.on('timeout', () => {
      log('✗ SSL Connection Timeout', 'red');
      req.destroy();
      resolve({ valid: false, cert: null, daysUntilExpiry: -1, error: 'timeout' });
    });

    req.end();
  });
}

async function testHTTPEndpoint(endpoint) {
  logSection('HTTP Endpoint Test');

  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'SaraivaVision-Diagnostics/1.0'
      }
    };

    if (isHttps) {
      options.rejectUnauthorized = false; // Allow self-signed certs for testing
      options.agent = new https.Agent({ rejectUnauthorized: false });
    }

    const req = client.request(options, (res) => {
      log(`✓ HTTP Response: ${res.statusCode} ${res.statusMessage}`, 'green');
      log(`  Server: ${res.headers.server || 'Unknown'}`, 'blue');
      log(`  Content-Type: ${res.headers['content-type'] || 'Not specified'}`, 'blue');

      if (res.headers['access-control-allow-origin']) {
        log(`  CORS Origin: ${res.headers['access-control-allow-origin']}`, 'blue');
      }

      if (res.headers['access-control-allow-methods']) {
        log(`  CORS Methods: ${res.headers['access-control-allow-methods']}`, 'blue');
      }

      resolve({
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
        accessible: true
      });
    });

    req.on('error', (error) => {
      log(`✗ HTTP Connection Error: ${error.message}`, 'red');
      resolve({
        statusCode: 0,
        statusMessage: error.message,
        headers: {},
        accessible: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      log('✗ HTTP Connection Timeout', 'red');
      req.destroy();
      resolve({
        statusCode: 0,
        statusMessage: 'timeout',
        headers: {},
        accessible: false,
        error: 'timeout'
      });
    });

    req.end();
  });
}

async function testGraphQLQuery(endpoint) {
  logSection('GraphQL Query Test');

  const testQuery = {
    query: `query HealthCheck {
      generalSettings {
        title
        url
        description
      }
      __typename
    }`
  };

  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaraivaVision-Diagnostics/1.0',
        'Origin': 'https://www.saraivavision.com.br'
      }
    };

    if (isHttps) {
      options.rejectUnauthorized = false;
      options.agent = new https.Agent({ rejectUnauthorized: false });
    }

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        log(`✓ GraphQL Response: ${res.statusCode} ${res.statusMessage}`, 'green');
        log(`  Content-Type: ${res.headers['content-type'] || 'Not specified'}`, 'blue');

        if (res.headers['access-control-allow-origin']) {
          log(`  CORS Origin: ${res.headers['access-control-allow-origin']}`, 'blue');
        }

        try {
          const response = JSON.parse(data);

          if (response.errors) {
            log('✗ GraphQL Query Errors:', 'red');
            response.errors.forEach((error, index) => {
              log(`  ${index + 1}. ${error.message}`, 'red');
            });
            resolve({
              success: false,
              statusCode: res.statusCode,
              errors: response.errors,
              response
            });
          } else if (response.data) {
            log('✓ GraphQL Query Successful', 'green');
            if (response.data.generalSettings) {
              log(`  Site Title: ${response.data.generalSettings.title || 'Not set'}`, 'blue');
              log(`  Site URL: ${response.data.generalSettings.url || 'Not set'}`, 'blue');
            }
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: response.data,
              response
            });
          } else {
            log('⚠️  Unexpected GraphQL Response Format', 'yellow');
            log(`  Response: ${JSON.stringify(response, null, 2)}`, 'blue');
            resolve({
              success: false,
              statusCode: res.statusCode,
              response,
              error: 'Unexpected response format'
            });
          }
        } catch (parseError) {
          // Check if response is HTML (404 page)
          if (res.headers['content-type']?.includes('text/html')) {
            log('✗ GraphQL endpoint returned HTML (404 page)', 'red');
            log('  This usually means WPGraphQL plugin is not installed', 'yellow');
            resolve({
              success: false,
              statusCode: res.statusCode,
              error: 'WPGraphQL plugin not found',
              isHtmlResponse: true
            });
          } else {
            log('✗ Failed to parse GraphQL response', 'red');
            log(`  Parse Error: ${parseError.message}`, 'red');
            log(`  Response Preview: ${data.substring(0, 200)}...`, 'blue');
            resolve({
              success: false,
              statusCode: res.statusCode,
              error: parseError.message,
              rawResponse: data
            });
          }
        }
      });
    });

    req.on('error', (error) => {
      log(`✗ GraphQL Query Error: ${error.message}`, 'red');
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      log('✗ GraphQL Query Timeout', 'red');
      req.destroy();
      resolve({
        success: false,
        error: 'timeout'
      });
    });

    req.write(JSON.stringify(testQuery));
    req.end();
  });
}

async function testCORSPreflight(endpoint) {
  logSection('CORS Preflight Test');

  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'OPTIONS',
      timeout: 10000,
      headers: {
        'Origin': 'https://www.saraivavision.com.br',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
        'User-Agent': 'SaraivaVision-Diagnostics/1.0'
      }
    };

    if (isHttps) {
      options.rejectUnauthorized = false;
      options.agent = new https.Agent({ rejectUnauthorized: false });
    }

    const req = client.request(options, (res) => {
      log(`✓ CORS Preflight Response: ${res.statusCode} ${res.statusMessage}`, 'green');

      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-max-age'
      ];

      corsHeaders.forEach(header => {
        const value = res.headers[header];
        if (value) {
          log(`  ${header}: ${value}`, 'blue');
        } else {
          log(`  ${header}: Not set`, 'yellow');
        }
      });

      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        corsConfigured: !!res.headers['access-control-allow-origin']
      });
    });

    req.on('error', (error) => {
      log(`✗ CORS Preflight Error: ${error.message}`, 'red');
      resolve({
        statusCode: 0,
        headers: {},
        corsConfigured: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      log('✗ CORS Preflight Timeout', 'red');
      req.destroy();
      resolve({
        statusCode: 0,
        headers: {},
        corsConfigured: false,
        error: 'timeout'
      });
    });

    req.end();
  });
}

function generateRecommendations(results) {
  logSection('Recommendations');

  const recommendations = [];

  // SSL Certificate recommendations
  if (!results.ssl.valid) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Fix SSL Certificate',
      description: 'SSL certificate is not properly configured on the WordPress server',
      steps: [
        'SSH to the WordPress server',
        'Run: certbot --nginx -d cms.saraivavision.com.br',
        'Reload nginx: systemctl reload nginx',
        'Test SSL configuration'
      ]
    });
  } else if (results.ssl.daysUntilExpiry < 30) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Renew SSL Certificate',
      description: `SSL certificate expires in ${results.ssl.daysUntilExpiry} days`,
      steps: [
        'SSH to the WordPress server',
        'Run: certbot renew --force-renewal',
        'Reload nginx: systemctl reload nginx'
      ]
    });
  }

  // HTTP accessibility recommendations
  if (!results.http.accessible) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Fix Server Accessibility',
      description: 'WordPress server is not accessible',
      steps: [
        'Check if WordPress server is running',
        'Verify firewall settings',
        'Check DNS configuration',
        'Test server connectivity'
      ]
    });
  } else if (results.http.statusCode === 403) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Fix 403 Forbidden Error',
      description: 'WordPress server returns 403 Forbidden',
      steps: [
        'Check file permissions on WordPress installation',
        'Verify .htaccess configuration',
        'Check WordPress security plugins',
        'Review server access logs'
      ]
    });
  }

  // GraphQL functionality recommendations
  if (!results.graphql.success) {
    if (results.graphql.isHtmlResponse) {
      recommendations.push({
        priority: 'CRITICAL',
        title: 'Install WPGraphQL Plugin',
        description: 'WPGraphQL plugin is not installed or activated',
        steps: [
          'Log in to WordPress admin: https://cms.saraivavision.com.br/wp-admin',
          'Go to Plugins → Add New',
          'Search for "WPGraphQL"',
          'Install and activate the plugin',
          'Test GraphQL endpoint'
        ]
      });
    } else if (results.graphql.error?.includes('SSL') || results.graphql.error?.includes('CORS')) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Fix SSL/CORS Issues',
        description: 'SSL or CORS issues preventing GraphQL access',
        steps: [
          'Fix SSL certificate issues (see above)',
          'Configure CORS headers in WordPress',
          'Check Nginx configuration',
          'Test with proper SSL configuration'
        ]
      });
    }
  }

  // CORS configuration recommendations
  if (!results.cors.corsConfigured) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Configure CORS Headers',
      description: 'CORS headers are not properly configured',
      steps: [
        'Install CORS plugin in WordPress',
        'Add CORS headers to Nginx configuration',
        'Test preflight requests',
        'Verify frontend access'
      ]
    });
  }

  // Display recommendations
  if (recommendations.length === 0) {
    log('✅ All tests passed! No recommendations needed.', 'green');
  } else {
    recommendations.forEach((rec, index) => {
      log(`\n${index + 1}. [${rec.priority}] ${rec.title}`, rec.priority === 'CRITICAL' ? 'red' : rec.priority === 'HIGH' ? 'yellow' : 'blue');
      log(`   ${rec.description}`, 'cyan');
      log('   Steps:', 'blue');
      rec.steps.forEach((step, stepIndex) => {
        log(`   ${stepIndex + 1}. ${step}`, 'blue');
      });
    });
  }

  return recommendations;
}

// Main execution
async function main() {
  log(`${colors.bright}${colors.magenta}WordPress GraphQL Endpoint Diagnostics${colors.reset}`);
  log(`Testing endpoint: ${WORDPRESS_GRAPHQL_ENDPOINT}`);
  log(`${colors.bright}${colors.magenta}=============================================${colors.reset}`);

  // Run all tests
  const results = {
    ssl: await testSSLCertificate(WORDPRESS_GRAPHQL_ENDPOINT),
    http: await testHTTPEndpoint(WORDPRESS_GRAPHQL_ENDPOINT),
    graphql: await testGraphQLQuery(WORDPRESS_GRAPHQL_ENDPOINT),
    cors: await testCORSPreflight(WORDPRESS_GRAPHQL_ENDPOINT)
  };

  // Generate recommendations
  const recommendations = generateRecommendations(results);

  // Summary
  logSection('Summary');
  log(`SSL Certificate: ${results.ssl.valid ? '✅ Valid' : '❌ Invalid'}`, results.ssl.valid ? 'green' : 'red');
  log(`HTTP Access: ${results.http.accessible ? '✅ Accessible' : '❌ Not Accessible'}`, results.http.accessible ? 'green' : 'red');
  log(`GraphQL Query: ${results.graphql.success ? '✅ Working' : '❌ Failed'}`, results.graphql.success ? 'green' : 'red');
  log(`CORS Headers: ${results.cors.corsConfigured ? '✅ Configured' : '❌ Not Configured'}`, results.cors.corsConfigured ? 'green' : 'red');

  log(`\n${colors.bright}${colors.cyan}Diagnostics complete!${colors.reset}`);
  process.exit(recommendations.some(r => r.priority === 'CRITICAL') ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Diagnostics failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testSSLCertificate,
  testHTTPEndpoint,
  testGraphQLQuery,
  testCORSPreflight,
  generateRecommendations,
  main
};