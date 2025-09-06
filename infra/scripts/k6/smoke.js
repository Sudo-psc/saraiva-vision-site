import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01']
  }
};

const BASE = __ENV.K6_TARGET || 'http://localhost:4173';

export default function () {
  const res = http.get(BASE);
  check(res, {
    'status is 2xx/3xx': r => r.status >= 200 && r.status < 400,
    'has html': r => (r.headers['Content-Type'] || '').includes('text/html')
  });
  sleep(1);
}

