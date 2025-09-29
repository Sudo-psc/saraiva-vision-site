# Development Environment Setup for External WordPress Integration

## Overview

This document provides comprehensive guidance for setting up the development environment for implementing the external WordPress integration feature. The setup includes local development configuration, database setup, API services, frontend environment, and testing infrastructure.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or 20.x (as specified in package.json engines)
- **npm**: 8.x or higher
- **Git**: 2.x or higher
- **VS Code**: Recommended with extensions
- **Docker**: Optional for containerized services
- **Redis**: For local caching (can use Docker)
- **PostgreSQL**: 14+ (can use Supabase cloud for development)

### Required Accounts
- **Supabase**: Database and auth services
- **WordPress**: External WordPress installation for testing
- **API Keys**: Google Maps, Resend, Instagram Graph API

## Local Development Setup

### 1. Project Setup

#### Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/saraiva-vision-site.git
cd saraiva-vision-site

# Install dependencies
npm install

# Install development dependencies
npm install --dev
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External APIs
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
RESEND_API_KEY=your-resend-api-key
INSTAGRAM_ACCESS_TOKEN=your-instagram-token

# WordPress Integration
VITE_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# Development Configuration
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_GRAPHQL_TIMEOUT=15000
VITE_GRAPHQL_MAX_RETRIES=3

# Redis Configuration (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database Configuration
SUPABASE_DB_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Database Setup

#### Supabase Local Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase services
supabase start

# Run migrations
supabase db push

# Link to remote project (optional)
supabase link --project-ref your-project-ref
```

#### Database Migration Scripts
```sql
-- migrations/001-create-external-wordpress-tables.sql
CREATE TABLE external_wordpress_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    api_key VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    sync_frequency INTERVAL DEFAULT '5 minutes',
    cache_ttl INTEGER DEFAULT 300,
    enable_compliance_filter BOOLEAN DEFAULT true,
    enable_ssl_verification BOOLEAN DEFAULT true,
    rate_limit_requests INTEGER DEFAULT 1000,
    rate_limit_window INTEGER DEFAULT 3600,
    health_check_interval INTEGER DEFAULT 300,
    health_status VARCHAR(20),
    wordpress_version VARCHAR(20),
    rest_api_version VARCHAR(10) DEFAULT 'v2',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE external_wordpress_content (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    external_id INTEGER NOT NULL,
    content JSONB NOT NULL,
    cache_key VARCHAR(255) UNIQUE,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP,
    etag VARCHAR(255),
    title TEXT,
    slug TEXT,
    author_id INTEGER,
    published_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'publish',
    compliance_score INTEGER DEFAULT 0,
    compliance_filtered BOOLEAN DEFAULT false,
    cache_hits INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    response_time INTEGER,
    CONSTRAINT unique_source_content UNIQUE (source_id, content_type, external_id)
);

CREATE TABLE external_wordpress_sync_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    error_code VARCHAR(100),
    error_message TEXT,
    stack_trace TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    response_size INTEGER,
    server_info JSONB,
    client_info JSONB
);

CREATE TABLE external_wordpress_media (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    external_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    media_details JSONB,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT unique_source_media UNIQUE (source_id, external_id)
);

CREATE TABLE external_wordpress_user_preferences (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    user_id INTEGER,
    content_types TEXT[], -- array of preferred content types
    sync_enabled BOOLEAN DEFAULT true,
    cache_enabled BOOLEAN DEFAULT true,
    compliance_enabled BOOLEAN DEFAULT true,
    notification_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_source_user UNIQUE (source_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_external_content_cache_key ON external_wordpress_content(cache_key);
CREATE INDEX idx_external_content_expires_at ON external_wordpress_content(expires_at);
CREATE INDEX idx_external_content_source_type ON external_wordpress_content(source_id, content_type);
CREATE INDEX idx_external_sync_logs_source_created ON external_wordpress_sync_logs(source_id, started_at);
CREATE INDEX idx_external_media_source_id ON external_wordpress_media(source_id);
CREATE INDEX idx_external_media_external_id ON external_wordpress_media(external_id);

-- Create views for common queries
CREATE VIEW active_external_sources AS
SELECT * FROM external_wordpress_sources
WHERE status = 'active' AND health_status = 'healthy';

CREATE VIEW external_content_summary AS
SELECT
    s.id as source_id,
    s.name as source_name,
    s.base_url,
    COUNT(c.id) as total_items,
    COUNT(CASE WHEN c.expires_at > NOW() THEN 1 END) as cached_items,
    AVG(c.response_time) as avg_response_time,
    MAX(c.cached_at) as last_cached
FROM external_wordpress_sources s
LEFT JOIN external_wordpress_content c ON s.id = c.source_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.base_url;

-- Enable Row Level Security (RLS)
ALTER TABLE external_wordpress_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_wordpress_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_wordpress_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_wordpress_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_wordpress_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sources" ON external_wordpress_sources
    FOR SELECT USING (true); -- Public for now, adjust based on auth needs

CREATE POLICY "Users can insert sources" ON external_wordpress_sources
    FOR INSERT WITH CHECK (true); -- Adjust based on auth needs

CREATE POLICY "Users can update their own sources" ON external_wordpress_sources
    FOR UPDATE USING (true); -- Adjust based on auth needs

-- Add RLS policies for other tables as needed
```

### 3. API Service Setup

#### Local API Server Setup
```bash
# Create API service directory
mkdir -p api/src/routes/external-wordpress

# Install API dependencies
cd api
npm install express cors helmet morgan axios zod rate-limiter-flexible ioredis
npm install --dev nodemon supertest jest

# Create API server entry point
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// External WordPress routes
app.use('/api/external-wordpress', require('./src/routes/external-wordpress'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
EOF

# Create API development script
cat > package.json << 'EOF'
{
  "name": "saraiva-vision-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "axios": "^1.5.0",
    "zod": "^3.22.2",
    "rate-limiter-flexible": "^2.4.1",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3",
    "jest": "^29.7.0"
  }
}
EOF

cd ..
```

#### Redis Setup for Local Development
```bash
# Using Docker for Redis
docker run -d --name redis-dev \
  -p 6379:6379 \
  redis:7-alpine

# Or install Redis locally (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 4. Frontend Development Setup

#### Development Server Configuration
```javascript
// vite.config.js updates for external WordPress development
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      // Proxy API requests to local API server
      '/api/external-wordpress': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WordPress API requests (for testing)
      '/wp-json': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      // Proxy GraphQL requests
      '/graphql': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          external: ['axios', 'zod', '@tanstack/react-query'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});
```

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  }
}
```

#### VS Code Extensions Recommendations
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-node-debug-pack",
    "ms-vscode.vscode-react-preview"
  ]
}
```

### 5. Testing Environment Setup

#### Test Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/setup.js',
        '**/*.test.{js,jsx}',
        '**/*.config.{js,ts}'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Test Setup File
```javascript
// src/__tests__/setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    getEntriesByType: vi.fn().mockReturnValue([]),
    getEntriesByName: vi.fn().mockReturnValue([]),
    now: vi.fn().mockReturnValue(Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    setResourceTimingBufferSize: vi.fn(),
    toJSON: vi.fn(),
  },
});

// Mock performance observer
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}));

// Supabase mock
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
      insert: vi.fn().mockReturnValue({
        data: [{ id: 1 }],
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        data: [{ id: 1 }],
        error: null,
      }),
      delete: vi.fn().mockReturnValue({
        error: null,
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
      signIn: vi.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({}),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } }),
      }),
    },
  }),
}));
```

### 6. Development Tools and Scripts

#### Development Scripts
```json
// package.json scripts updates
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite",

    // Testing
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",

    // API Development
    "api:dev": "nodemon api/server.js",
    "api:start": "node api/server.js",
    "api:test": "cd api && npm test",

    // Database
    "db:setup": "supabase db push",
    "db:reset": "supabase db reset",
    "db:seed": "node scripts/seed-database.js",

    // Development tools
    "lint": "eslint . --ext js,jsx,ts,tsx",
    "lint:fix": "eslint . --ext js,jsx,ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "validate:api": "npm run lint:syntax-api && npm run lint:encoding-api",
    "lint:syntax-api": "find api/ -name '*.js' -exec node -c {} \\;",
    "lint:encoding-api": "find api/ -name '*.js' -exec file {} \\; | grep -v 'UTF-8'",

    // External WordPress development
    "wp:dev": "npm run dev & npm run api:dev",
    "wp:test": "npm run test && npm run api:test",
    "wp:build": "npm run build"
  }
}
```

#### Database Seed Script
```javascript
// scripts/seed-database.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  try {
    // Seed external WordPress sources
    const { data: sources, error: sourcesError } = await supabase
      .from('external_wordpress_sources')
      .insert([
        {
          name: 'Test WordPress Site',
          base_url: 'https://test-wordpress.com',
          api_key: 'test-api-key',
          status: 'active',
          sync_frequency: '5 minutes',
          cache_ttl: 300,
          enable_compliance_filter: true,
          health_status: 'healthy',
          wordpress_version: '6.3',
          rest_api_version: 'v2',
        },
        {
          name: 'Demo WordPress Blog',
          base_url: 'https://demo-blog.com',
          api_key: 'demo-api-key',
          status: 'active',
          sync_frequency: '10 minutes',
          cache_ttl: 600,
          enable_compliance_filter: true,
          health_status: 'healthy',
          wordpress_version: '6.2',
          rest_api_version: 'v2',
        }
      ])
      .select();

    if (sourcesError) throw sourcesError;
    console.log('✅ Seeded external WordPress sources');

    // Seed sample content
    const { data: content, error: contentError } = await supabase
      .from('external_wordpress_content')
      .insert([
        {
          source_id: sources[0].id,
          content_type: 'post',
          external_id: 1,
          content: {
            id: 1,
            title: { rendered: 'Sample Post' },
            content: { rendered: '<p>This is a sample post content.</p>' },
            excerpt: { rendered: '<p>Sample excerpt</p>' },
            status: 'publish',
            date: new Date().toISOString(),
            modified: new Date().toISOString(),
          },
          cache_key: 'source_1_post_1',
          expires_at: new Date(Date.now() + 300 * 1000),
          title: 'Sample Post',
          slug: 'sample-post',
          status: 'publish',
          published_at: new Date().toISOString(),
          compliance_score: 100,
        }
      ])
      .select();

    if (contentError) throw contentError;
    console.log('✅ Seeded sample content');

    console.log('🎉 Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### 7. Docker Development Environment (Optional)

#### Docker Compose for Development
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3002:3002"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    depends_on:
      - redis
      - api

  api:
    build:
      context: ./api
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./api:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  wordpress:
    image: wordpress:6.3-php8.1-fpm-alpine
    ports:
      - "8083:80"
    volumes:
      - ./tests/wordpress:/var/www/html
    environment:
      - WORDPRESS_DB_HOST=mysql
      - WORDPRESS_DB_USER=wordpress
      - WORDPRESS_DB_PASSWORD=wordpress
      - WORDPRESS_DB_NAME=wordpress

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wordpress
      - MYSQL_PASSWORD=wordpress

volumes:
  redis_data:
  mysql_data:
```

#### Dockerfile for Development
```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Start development server
CMD ["npm", "run", "dev"]
```

### 8. Environment-Specific Configurations

#### Development Environment Variables
```env
# .env.development
NODE_ENV=development
VITE_APP_ENV=development

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3

# Cache Configuration
VITE_CACHE_ENABLED=true
VITE_CACHE_TTL=300

# Debug Configuration
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# External WordPress Development
VITE_WP_DEV_MODE=true
VITE_WP_MOCK_DATA=true
VITE_WP_CACHE_BYPASS=true
```

#### Testing Environment Variables
```env
# .env.test
NODE_ENV=test
VITE_APP_ENV=test

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=5000
VITE_API_RETRIES=1

# Cache Configuration
VITE_CACHE_ENABLED=false

# Testing Configuration
VITE_TEST_MODE=true
VITE_MOCK_EXTERNAL_SERVICES=true
```

### 9. Development Workflow

#### Daily Development Setup
```bash
# 1. Start Redis (if not running)
sudo systemctl start redis

# 2. Start Supabase local services
supabase start

# 3. Start API server in separate terminal
npm run api:dev

# 4. Start frontend development server
npm run dev

# 5. Run tests in watch mode (optional)
npm run test:watch
```

#### Database Operations
```bash
# Reset database
npm run db:reset

# Run migrations
npm run db:setup

# Seed test data
npm run db:seed

# View database logs
supabase logs db
```

#### Code Quality Checks
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Validate API
npm run validate:api
```

### 10. Common Development Issues and Solutions

#### Port Conflicts
```bash
# Check what's using port 3002
lsof -i :3002

# Kill process on port 3002
kill -9 <PID>

# Change development port
VITE_PORT=3003 npm run dev
```

#### Database Connection Issues
```bash
# Reset Supabase
supabase stop
supabase start

# Check database status
supabase status

# Reset database
supabase db reset
```

#### Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis

# Test Redis connection
redis-cli ping
```

#### Environment Variable Issues
```bash
# Validate environment variables
node -e "console.log(process.env.VITE_SUPABASE_URL)"

# Load environment variables manually
export $(cat .env | xargs)
```

### 11. Performance Monitoring Setup

#### Local Development Monitoring
```javascript
// src/utils/performance-monitor.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiResponseTimes: [],
      cacheHitRates: [],
      errorRates: [],
    };
  }

  trackApiCall(endpoint, duration, success) {
    this.metrics.apiResponseTimes.push({ endpoint, duration, success });

    if (this.metrics.apiResponseTimes.length > 100) {
      this.metrics.apiResponseTimes = this.metrics.apiResponseTimes.slice(-50);
    }
  }

  trackCacheOperation(hit) {
    this.metrics.cacheHitRates.push(hit);

    if (this.metrics.cacheHitRates.length > 100) {
      this.metrics.cacheHitRates = this.metrics.cacheHitRates.slice(-50);
    }
  }

  getMetrics() {
    return {
      avgApiResponseTime: this.calculateAverage(this.metrics.apiResponseTimes.map(m => m.duration)),
      cacheHitRate: this.calculateHitRate(),
      errorRate: this.calculateErrorRate(),
    };
  }

  calculateAverage(times) {
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  calculateHitRate() {
    const hits = this.metrics.cacheHitRates.filter(hit => hit).length;
    return hits / this.metrics.cacheHitRates.length;
  }

  calculateErrorRate() {
    const errors = this.metrics.apiResponseTimes.filter(call => !call.success).length;
    return errors / this.metrics.apiResponseTimes.length;
  }
}

// Initialize in main application
export const performanceMonitor = new PerformanceMonitor();
```

This comprehensive development environment setup provides everything needed to develop, test, and debug the external WordPress integration feature locally. The setup includes all necessary services, tools, and configurations to ensure a smooth development experience.

## Quick Start Checklist

- [ ] Clone repository and install dependencies
- [ ] Set up environment variables
- [ ] Configure Supabase local development
- [ ] Set up Redis for local caching
- [ ] Configure API service
- [ ] Set up frontend development server
- [ ] Configure testing environment
- [ ] Seed database with test data
- [ ] Verify all services are running
- [ ] Run initial tests to validate setup

## Validation Commands

```bash
# Validate API service
curl http://localhost:3001/health

# Validate database connection
npm run db:setup

# Validate Redis connection
redis-cli ping

# Validate frontend development
curl http://localhost:3002

# Run test suite
npm test
```

This setup provides a complete local development environment that mirrors the production architecture while enabling efficient development and testing of the external WordPress integration feature.