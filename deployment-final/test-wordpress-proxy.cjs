#!/usr/bin/env node

/**
 * Saraiva Vision - WordPress GraphQL Proxy Test Suite
 * Tests all WordPress GraphQL integration components including proxy functionality
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const LOCAL_API_URL = 'http://localhost:3001';
const WORDPRESS_GRAPHQL_ENDPOINT = 'https://cms.saraivavision.com.br/graphql';
const LOCAL_PROXY_ENDPOINT = `${LOCAL_API_URL}/api/wordpress-graphql/graphql`;

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

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status}: ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

// Test functions
async function testLocalAPIServer() {
  logSection('Local API Server Test');

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          const isHealthy = health.status === 'healthy';
          logTest('Local API Server Health', isHealthy,
            `Status: ${health.status}, Uptime: ${health.uptime?.toFixed(2)}s`);
          resolve({ success: isHealthy, data: health });
        } catch (error) {
          logTest('Local API Server Health', false, `Invalid JSON response: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      logTest('Local API Server Health', false, `Connection failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('Local API Server Health', false, 'Connection timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function testWordPressGraphQLProxy() {
  logSection('WordPress GraphQL Proxy Test');

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
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/wordpress-graphql/graphql',
      method: 'POST',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.errors) {
            logTest('WordPress GraphQL Proxy Query', false,
              `GraphQL errors: ${JSON.stringify(response.errors)}`);
            resolve({ success: false, errors: response.errors, response });
          } else if (response.data) {
            logTest('WordPress GraphQL Proxy Query', true,
              `Site: ${response.data.generalSettings?.title || 'Unknown'}`);
            resolve({ success: true, data: response.data, response });
          } else {
            logTest('WordPress GraphQL Proxy Query', false, 'Invalid response format');
            resolve({ success: false, error: 'Invalid response format', response });
          }
        } catch (error) {
          logTest('WordPress GraphQL Proxy Query', false, `JSON parse error: ${error.message}`);
          resolve({ success: false, error: error.message, rawResponse: data });
        }
      });
    });

    req.on('error', (error) => {
      logTest('WordPress GraphQL Proxy Query', false, `Request failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('WordPress GraphQL Proxy Query', false, 'Request timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.write(JSON.stringify(testQuery));
    req.end();
  });
}

async function testProxyHealthEndpoint() {
  logSection('Proxy Health Endpoint Test');

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/wordpress-graphql/health',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          const isHealthy = health.status === 'healthy' || health.wordpress?.accessible;
          logTest('Proxy Health Check', isHealthy,
            `Status: ${health.status}, Response time: ${health.responseTime}ms`);
          resolve({ success: isHealthy, data: health });
        } catch (error) {
          logTest('Proxy Health Check', false, `Invalid JSON response: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      logTest('Proxy Health Check', false, `Connection failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('Proxy Health Check', false, 'Connection timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function testProxyServerStatus() {
  logSection('Proxy Server Status Test');

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/wordpress-graphql/server-status',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const status = JSON.parse(data);
          logTest('Proxy Server Status', status.accessible,
            `Endpoint: ${status.endpoint}, Status: ${status.statusCode} ${status.statusMessage}`);
          resolve({ success: true, data: status });
        } catch (error) {
          logTest('Proxy Server Status', false, `Invalid JSON response: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      logTest('Proxy Server Status', false, `Connection failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('Proxy Server Status', false, 'Connection timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function testCORSPreflight() {
  logSection('CORS Preflight Test');

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/wordpress-graphql/graphql',
      method: 'OPTIONS',
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      logTest('CORS Preflight', res.statusCode === 200,
        `Status: ${res.statusCode} ${res.statusMessage}`);

      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];

      const headersStatus = corsHeaders.map(header => {
        const value = res.headers[header];
        return `${header}: ${value || 'Not set'}`;
      }).join(', ');

      log(`   CORS Headers: ${headersStatus}`, 'blue');

      resolve({ success: res.statusCode === 200, headers: res.headers });
    });

    req.on('error', (error) => {
      logTest('CORS Preflight', false, `Request failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('CORS Preflight', false, 'Request timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function testDirectWordPressConnection() {
  logSection('Direct WordPress Connection Test');

  const testQuery = {
    query: `query HealthCheck {
      generalSettings {
        title
      }
    }`
  };

  return new Promise((resolve) => {
    const url = new URL(WORDPRESS_GRAPHQL_ENDPOINT);

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaraivaVision-Test/1.0'
      },
      rejectUnauthorized: false // Allow self-signed certs for testing
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        logTest('Direct WordPress Connection', res.statusCode === 200,
          `Status: ${res.statusCode} ${res.statusMessage}`);

        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.errors) {
              log(`   GraphQL Errors: ${JSON.stringify(response.errors)}`, 'yellow');
            } else if (response.data) {
              log(`   Site Title: ${response.data.generalSettings?.title || 'Unknown'}`, 'green');
            }
          } catch (error) {
            log(`   JSON Parse Error: ${error.message}`, 'yellow');
          }
        }

        resolve({ success: res.statusCode === 200, statusCode: res.statusCode, response: data });
      });
    });

    req.on('error', (error) => {
      logTest('Direct WordPress Connection', false, `Connection failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logTest('Direct WordPress Connection', false, 'Request timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.write(JSON.stringify(testQuery));
    req.end();
  });
}

function generateTestReport(results) {
  logSection('Test Summary Report');

  const tests = [
    { name: 'Local API Server', result: results.localAPI },
    { name: 'WordPress GraphQL Proxy', result: results.proxyGraphQL },
    { name: 'Proxy Health Endpoint', result: results.proxyHealth },
    { name: 'Proxy Server Status', result: results.proxyStatus },
    { name: 'CORS Preflight', result: results.cors },
    { name: 'Direct WordPress Connection', result: results.directWordPress }
  ];

  const passedTests = tests.filter(test => test.result.success).length;
  const totalTests = tests.length;

  log(`\n${colors.bright}${colors.magenta}Test Results Summary${colors.reset}`);
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  log(`\n${colors.bright}${colors.cyan}Detailed Results:${colors.reset}`);
  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    const color = test.result.success ? 'green' : 'red';
    log(`${status} ${test.name}: ${test.result.success ? 'PASS' : 'FAIL'}`, color);
  });

  // Recommendations
  log(`\n${colors.bright}${colors.yellow}Recommendations:${colors.reset}`);

  if (!results.localAPI.success) {
    log(`1. Start local API server: npm run dev (in api directory)`, 'yellow');
  }

  if (!results.proxyGraphQL.success && results.localAPI.success) {
    log(`2. Check WordPress GraphQL proxy configuration`, 'yellow');
    log(`3. Verify WordPress server is accessible: ${WORDPRESS_GRAPHQL_ENDPOINT}`, 'yellow');
  }

  if (!results.cors.success) {
    log(`4. Check CORS configuration in proxy server`, 'yellow');
  }

  if (!results.directWordPress.success) {
    log(`5. WordPress server connectivity issues - SSL certificate needs renewal`, 'yellow');
    log(`6. WPGraphQL plugin may not be installed on WordPress server`, 'yellow');
  }

  if (passedTests === totalTests) {
    log(`🎉 All tests passed! WordPress GraphQL integration is working correctly.`, 'green');
  }

  return {
    passed: passedTests,
    total: totalTests,
    successRate: (passedTests / totalTests) * 100,
    tests: tests
  };
}

// Main execution
async function main() {
  log(`${colors.bright}${colors.magenta}Saraiva Vision - WordPress GraphQL Integration Test Suite${colors.reset}`);
  log(`${colors.bright}${colors.magenta}===============================================================${colors.reset}`);

  log(`Local API URL: ${LOCAL_API_URL}`);
  log(`WordPress Endpoint: ${WORDPRESS_GRAPHQL_ENDPOINT}`);
  log(`Proxy Endpoint: ${LOCAL_PROXY_ENDPOINT}`);

  // Run all tests
  const results = {
    localAPI: await testLocalAPIServer(),
    proxyGraphQL: await testWordPressGraphQLProxy(),
    proxyHealth: await testProxyHealthEndpoint(),
    proxyStatus: await testProxyServerStatus(),
    cors: await testCORSPreflight(),
    directWordPress: await testDirectWordPressConnection()
  };

  // Generate report
  const report = generateTestReport(results);

  // Exit with appropriate code
  process.exit(report.successRate === 100 ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testLocalAPIServer,
  testWordPressGraphQLProxy,
  testProxyHealthEndpoint,
  testProxyServerStatus,
  testCORSPreflight,
  testDirectWordPressConnection,
  generateTestReport,
  main
};