// K6 Performance Test for SaraivaVision Medical Website
// Tests WordPress API, Admin Panel, and Frontend performance
import http from 'k6/http';
import { group, check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 5 },   // Ramp up to 5 users
    { duration: '20s', target: 10 },  // Stay at 10 users  
    { duration: '10s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
  },
};

const BASE_URL = 'http://localhost';

export default function () {
  // Test medical website frontend
  group('Frontend React App', () => {
    let response = http.get(`${BASE_URL}/`);
    check(response, {
      'frontend status 200': (r) => r.status === 200,
      'frontend response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  // Test WordPress API (Blog integration)
  group('WordPress API', () => {
    let response = http.get(`${BASE_URL}/wp-json/wp/v2/posts`);
    check(response, {
      'API status 200': (r) => r.status === 200,
      'API response time < 200ms': (r) => r.timings.duration < 200,
      'API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    });
  });

  // Test WordPress Admin (Medical staff access)
  group('WordPress Admin Panel', () => {
    let response = http.get(`${BASE_URL}/wp-admin/`, {
      headers: { 'Accept': 'text/html' }
    });
    check(response, {
      'admin panel accessible': (r) => r.status === 200 || r.status === 302,
      'admin response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  // Test static medical assets
  group('Static Assets (Medical Images)', () => {
    let response = http.get(`${BASE_URL}/wp-content/themes/`, {
      headers: { 'Accept': 'text/html' }
    });
    check(response, {
      'static assets accessible': (r) => r.status === 200 || r.status === 403, // 403 is OK for directory listing
      'static response time < 100ms': (r) => r.timings.duration < 100,
    });
  });

  sleep(1);
}