# CORS Configuration Examples - Multi-Framework

## 📚 Table of Contents

1. [Node.js/Express](#nodejs--express) ✅ (Current Stack)
2. [NestJS](#nestjs)
3. [Fastify](#fastify)
4. [Next.js API Routes](#nextjs-api-routes)
5. [Nginx Reverse Proxy](#nginx-reverse-proxy)
6. [Frontend Proxy (Vite/Webpack)](#frontend-proxy-development)

---

## Node.js / Express

### ✅ **Current Configuration (Recommended)**

**`api/src/server.js`**:
```javascript
import express from 'express';
import cors from 'cors';

const app = express();

// CORS Configuration - Single source of truth
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://saraivavision.com.br',
        'https://www.saraivavision.com.br'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours preflight cache
}));

// ... rest of middleware and routes
```

### Dynamic Origin with Validation

```javascript
const allowedOrigins = [
  'https://saraivavision.com.br',
  'https://www.saraivavision.com.br',
  'http://localhost:3002'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
```

### Manual CORS (Not Recommended)

```javascript
// Only use if cors package unavailable
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3002', 'https://saraivavision.com.br'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});
```

---

## NestJS

### Module Configuration

**`src/main.ts`**:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? [
          'https://saraivavision.com.br',
          'https://www.saraivavision.com.br'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3002'
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  });

  await app.listen(3001);
}
bootstrap();
```

### Custom CORS Options

**`src/config/cors.config.ts`**:
```typescript
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://saraivavision.com.br',
      'http://localhost:3002'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
```

**`src/main.ts`**:
```typescript
import { corsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);
  await app.listen(3001);
}
```

---

## Fastify

### Using @fastify/cors

**Installation**:
```bash
npm install @fastify/cors
```

**`server.js`**:
```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Register CORS plugin
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://saraivavision.com.br',
        'https://www.saraivavision.com.br'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3002'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Routes
fastify.get('/api/google-reviews', async (request, reply) => {
  return { success: true, data: [] };
});

await fastify.listen({ port: 3001, host: '0.0.0.0' });
```

### Dynamic Origin

```javascript
await fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://saraivavision.com.br',
      'http://localhost:3002'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
});
```

### Hook-based CORS (Alternative)

```javascript
fastify.addHook('onRequest', async (request, reply) => {
  const allowedOrigins = ['http://localhost:3002', 'https://saraivavision.com.br'];
  const origin = request.headers.origin;

  if (allowedOrigins.includes(origin)) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
  }

  if (request.method === 'OPTIONS') {
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.status(204).send();
  }
});
```

---

## Next.js API Routes

### App Router (Next.js 13+)

**`app/api/google-reviews/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

// CORS configuration
const allowedOrigins = [
  'https://saraivavision.com.br',
  'https://www.saraivavision.com.br',
  'http://localhost:3002'
];

const corsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
};

// Preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

// GET handler
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const data = { success: true, reviews: [] };

    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
```

### Middleware for All Routes

**`middleware.ts`** (root level):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://saraivavision.com.br',
  'http://localhost:3002'
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  return response;
}

// Apply to API routes only
export const config = {
  matcher: '/api/:path*'
};
```

---

## Nginx Reverse Proxy

### Basic Configuration

**`/etc/nginx/sites-available/saraivavision`**:
```nginx
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # API Backend
    location /api/ {
        # CORS Headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
            add_header 'Access-Control-Max-Age' 1728000; # 20 days
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Proxy to backend
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend static files
    location / {
        root /var/www/saraivavision;
        try_files $uri $uri/ /index.html;
    }
}
```

### Restricted Origins

```nginx
# Define allowed origins
map $http_origin $cors_origin {
    default "";
    "~^https://saraivavision\.com\.br$" "$http_origin";
    "~^https://www\.saraivavision\.com\.br$" "$http_origin";
    "~^http://localhost:3002$" "$http_origin";
}

server {
    location /api/ {
        # Only set CORS if origin is allowed
        add_header 'Access-Control-Allow-Origin' '$cors_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # ... rest of config
    }
}
```

### With SSL/HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name saraivavision.com.br;

    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;

    location /api/ {
        # CORS for HTTPS
        add_header 'Access-Control-Allow-Origin' 'https://saraivavision.com.br' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # ... proxy config
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}
```

---

## Frontend Proxy (Development)

### Vite

**`vite.config.js`**:
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Rewrite path if needed
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

**Frontend code**:
```javascript
// Use relative URL - Vite proxies to backend
fetch('/api/google-reviews?placeId=test&limit=3')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Create React App (Webpack)

**`package.json`**:
```json
{
  "proxy": "http://localhost:3001"
}
```

**Or with custom proxy**:

**`src/setupProxy.js`**:
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false
    })
  );
};
```

### Next.js (Dev Server)

**`next.config.js`**:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  }
};
```

---

## 🧪 Testing CORS

### Browser Console

```javascript
// Test from http://localhost:3002 console
fetch('http://localhost:3001/api/google-reviews?placeId=test', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include' // If using cookies
})
.then(res => {
  console.log('Headers:', res.headers.get('Access-Control-Allow-Origin'));
  return res.json();
})
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ CORS Error:', err));
```

### curl Commands

**Preflight**:
```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3001/api/google-reviews
```

**GET Request**:
```bash
curl -i -X GET \
  -H "Origin: http://localhost:3002" \
  http://localhost:3001/api/google-reviews
```

### Expected Response

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3002
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## 🔐 Security Best Practices

### ✅ Do's

1. **Use explicit origins in production**:
   ```javascript
   origin: ['https://saraivavision.com.br']
   ```

2. **Validate origins dynamically**:
   ```javascript
   origin: (origin, callback) => {
     const allowed = process.env.ALLOWED_ORIGINS.split(',');
     callback(null, allowed.includes(origin));
   }
   ```

3. **Set credentials only when needed**:
   ```javascript
   credentials: true // Only if using cookies/auth
   ```

4. **Cache preflight requests**:
   ```javascript
   maxAge: 86400 // 24 hours
   ```

### ❌ Don'ts

1. **Never use wildcard with credentials**:
   ```javascript
   // ❌ WRONG
   { origin: '*', credentials: true }
   ```

2. **Don't set CORS in multiple places**:
   ```javascript
   // ❌ WRONG - Conflicts
   app.use(cors({...}));
   res.setHeader('Access-Control-Allow-Origin', '*');
   ```

3. **Don't skip preflight handling**:
   ```javascript
   // ❌ WRONG
   if (req.method === 'OPTIONS') {
     res.status(405).send(); // Should be 204
   }
   ```

4. **Don't expose sensitive headers**:
   ```javascript
   // ❌ WRONG
   allowedHeaders: ['*'] // Too permissive
   ```

---

## 📊 Comparison Table

| Framework | Setup Complexity | Performance | Flexibility |
|-----------|-----------------|-------------|-------------|
| Express   | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Very High |
| NestJS    | ⭐⭐⭐⭐ Simple | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐ High |
| Fastify   | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐ High |
| Next.js   | ⭐⭐⭐ Moderate | ⭐⭐⭐ Good | ⭐⭐⭐ Moderate |
| Nginx     | ⭐⭐ Complex | ⭐⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐⭐ Very High |

---

## 🆘 Further Reading

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [Fastify CORS Plugin](https://github.com/fastify/fastify-cors)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
