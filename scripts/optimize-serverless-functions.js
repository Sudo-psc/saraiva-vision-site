#!/usr/bin/env node

/**
 * Serverless Function Performance Optimization Script
 * 
 * This script optimizes Vercel serverless functions for better performance:
 * - Analyzes function bundle sizes
 * - Optimizes cold start times
 * - Configures memory and timeout settings
 * - Sets up function regions and failover
 * - Implements caching strategies
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

class ServerlessFunctionOptimizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.apiDir = join(this.projectRoot, 'api');
        this.optimizations = [];

        // Function performance profiles
        this.functionProfiles = {
            'api/contact/**': {
                maxDuration: 10,
                memory: 256,
                regions: ['gru1', 'iad1'],
                priority: 'high',
                caching: false
            },
            'api/appointments/**': {
                maxDuration: 15,
                memory: 512,
                regions: ['gru1', 'iad1'],
                priority: 'high',
                caching: true
            },
            'api/podcast/**': {
                maxDuration: 30,
                memory: 512,
                regions: ['gru1'],
                priority: 'medium',
                caching: true
            },
            'api/chatbot.js': {
                maxDuration: 20,
                memory: 512,
                regions: ['gru1', 'iad1'],
                priority: 'medium',
                caching: false
            },
            'api/dashboard/**': {
                maxDuration: 10,
                memory: 256,
                regions: ['gru1'],
                priority: 'low',
                caching: true
            },
            'api/outbox/**': {
                maxDuration: 30,
                memory: 512,
                regions: ['gru1'],
                priority: 'high',
                caching: false
            },
            'api/webhooks/**': {
                maxDuration: 10,
                memory: 256,
                regions: ['gru1', 'iad1'],
                priority: 'high',
                caching: false
            },
            'api/health.js': {
                maxDuration: 5,
                memory: 128,
                regions: ['gru1', 'iad1', 'cle1'],
                priority: 'critical',
                caching: true
            }
        };
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const levels = {
            info: '\x1b[36mINFO\x1b[0m',
            success: '\x1b[32mSUCCESS\x1b[0m',
            warning: '\x1b[33mWARNING\x1b[0m',
            error: '\x1b[31mERROR\x1b[0m'
        };
        console.log(`[${timestamp}] ${levels[level]}: ${message}`);
    }

    /**
     * Analyze function bundle sizes
     */
    analyzeBundleSizes() {
        this.log('Analyzing function bundle sizes...', 'info');

        if (!existsSync(this.apiDir)) {
            this.log('API directory not found', 'error');
            return [];
        }

        const functions = glob.sync('**/*.js', { cwd: this.apiDir });
        const analysis = [];

        functions.forEach(func => {
            const filePath = join(this.apiDir, func);
            const stats = statSync(filePath);
            const content = readFileSync(filePath, 'utf8');

            // Count imports and dependencies
            const imports = (content.match(/import .* from/g) || []).length;
            const requires = (content.match(/require\(/g) || []).length;
            const totalDeps = imports + requires;

            analysis.push({
                path: `api/${func}`,
                size: stats.size,
                dependencies: totalDeps,
                complexity: this.calculateComplexity(content)
            });
        });

        // Sort by size (largest first)
        analysis.sort((a, b) => b.size - a.size);

        this.log('Function bundle analysis:', 'info');
        analysis.forEach(func => {
            const sizeKB = (func.size / 1024).toFixed(2);
            const level = func.size > 50000 ? 'warning' : 'info';
            this.log(`  ${func.path}: ${sizeKB}KB, ${func.dependencies} deps, complexity: ${func.complexity}`, level);
        });

        return analysis;
    }

    /**
     * Calculate code complexity score
     */
    calculateComplexity(code) {
        const lines = code.split('\\n').length;
        const functions = (code.match(/function|=>/g) || []).length;
        const conditionals = (code.match(/if|switch|\\?/g) || []).length;
        const loops = (code.match(/for|while|forEach|map|filter/g) || []).length;

        return Math.round((lines + functions * 2 + conditionals * 1.5 + loops * 1.5) / 10);
    }

    /**
     * Generate optimized Vercel configuration
     */
    generateOptimizedConfig() {
        this.log('Generating optimized Vercel configuration...', 'info');

        const baseConfig = existsSync('vercel.json')
            ? JSON.parse(readFileSync('vercel.json', 'utf8'))
            : {};

        // Optimize function configurations
        const optimizedFunctions = {};

        Object.entries(this.functionProfiles).forEach(([pattern, profile]) => {
            optimizedFunctions[pattern] = {
                maxDuration: profile.maxDuration,
                memory: profile.memory
            };

            // Add regions for critical functions
            if (profile.priority === 'critical' || profile.priority === 'high') {
                optimizedFunctions[pattern].regions = profile.regions;
            }
        });

        // Merge with existing configuration
        const optimizedConfig = {
            ...baseConfig,
            functions: {
                ...baseConfig.functions,
                ...optimizedFunctions
            },
            regions: ['gru1'], // Primary region for Brazil

            // Add performance headers
            headers: [
                ...(baseConfig.headers || []),
                {
                    source: '/api/(.*)',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
                        },
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff'
                        },
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY'
                        },
                        {
                            key: 'X-XSS-Protection',
                            value: '1; mode=block'
                        }
                    ]
                }
            ]
        };

        // Add caching for cacheable endpoints
        const cacheableEndpoints = Object.entries(this.functionProfiles)
            .filter(([, profile]) => profile.caching)
            .map(([pattern]) => pattern.replace('/**', ''));

        cacheableEndpoints.forEach(endpoint => {
            optimizedConfig.headers.push({
                source: `/${endpoint}/(.*)`,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800'
                    }
                ]
            });
        });

        return optimizedConfig;
    }

    /**
     * Create function-specific optimization recommendations
     */
    generateOptimizationRecommendations(analysis) {
        this.log('Generating optimization recommendations...', 'info');

        const recommendations = [];

        analysis.forEach(func => {
            const recs = [];

            // Size optimizations
            if (func.size > 100000) { // > 100KB
                recs.push('Consider code splitting or reducing bundle size');
                recs.push('Move large dependencies to external services');
            }

            if (func.size > 50000) { // > 50KB
                recs.push('Review and minimize dependencies');
                recs.push('Use dynamic imports for non-critical code');
            }

            // Dependency optimizations
            if (func.dependencies > 10) {
                recs.push('Consider reducing number of dependencies');
                recs.push('Use tree-shaking to eliminate unused code');
            }

            // Complexity optimizations
            if (func.complexity > 20) {
                recs.push('Consider breaking down into smaller functions');
                recs.push('Implement caching for expensive operations');
            }

            if (recs.length > 0) {
                recommendations.push({
                    function: func.path,
                    recommendations: recs
                });
            }
        });

        return recommendations;
    }

    /**
     * Create cold start optimization guide
     */
    createColdStartOptimizations() {
        return {
            'Connection Pooling': {
                description: 'Reuse database connections across function invocations',
                implementation: `
// Use connection pooling for Supabase
let supabaseClient;

export function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                db: { schema: 'public' },
                auth: { persistSession: false }
            }
        );
    }
    return supabaseClient;
}
                `
            },
            'Module Initialization': {
                description: 'Initialize expensive modules outside the handler',
                implementation: `
// Initialize outside handler
const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimiter = new RateLimiter();

export default async function handler(req, res) {
    // Handler code here
}
                `
            },
            'Lazy Loading': {
                description: 'Load dependencies only when needed',
                implementation: `
// Lazy load heavy dependencies
let openai;

async function getOpenAI() {
    if (!openai) {
        const { OpenAI } = await import('openai');
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}
                `
            },
            'Response Caching': {
                description: 'Cache responses to reduce computation',
                implementation: `
// Simple in-memory cache
const cache = new Map();

export default async function handler(req, res) {
    const cacheKey = JSON.stringify(req.query);
    
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }
    
    const result = await expensiveOperation();
    cache.set(cacheKey, result);
    
    res.json(result);
}
                `
            }
        };
    }

    /**
     * Generate performance monitoring setup
     */
    createPerformanceMonitoring() {
        const monitoringCode = `
/**
 * Performance monitoring utilities for Vercel functions
 */

export class FunctionPerformanceMonitor {
    constructor(functionName) {
        this.functionName = functionName;
        this.startTime = Date.now();
        this.metrics = {};
    }

    startTimer(operation) {
        this.metrics[operation] = { start: Date.now() };
    }

    endTimer(operation) {
        if (this.metrics[operation]) {
            this.metrics[operation].duration = Date.now() - this.metrics[operation].start;
        }
    }

    logMetrics() {
        const totalDuration = Date.now() - this.startTime;
        
        console.log(JSON.stringify({
            function: this.functionName,
            totalDuration,
            operations: this.metrics,
            timestamp: new Date().toISOString()
        }));
    }

    async measureAsync(operation, asyncFn) {
        this.startTimer(operation);
        try {
            const result = await asyncFn();
            this.endTimer(operation);
            return result;
        } catch (error) {
            this.endTimer(operation);
            throw error;
        }
    }
}

// Usage example:
export async function monitoredHandler(req, res) {
    const monitor = new FunctionPerformanceMonitor('contact-api');
    
    try {
        const result = await monitor.measureAsync('database-query', async () => {
            return await supabase.from('contacts').insert(data);
        });
        
        monitor.logMetrics();
        res.json({ success: true });
    } catch (error) {
        monitor.logMetrics();
        res.status(500).json({ error: error.message });
    }
}
        `;

        writeFileSync('api/utils/performance-monitor.js', monitoringCode);
        this.log('Created performance monitoring utilities', 'success');
    }

    /**
     * Run complete optimization process
     */
    async optimize() {
        console.log('🚀 Serverless Function Optimization\n');

        // Analyze current functions
        const analysis = this.analyzeBundleSizes();

        // Generate optimized configuration
        const optimizedConfig = this.generateOptimizedConfig();

        // Create backup of current config
        if (existsSync('vercel.json')) {
            const backup = readFileSync('vercel.json', 'utf8');
            writeFileSync('vercel.json.backup', backup);
            this.log('Created backup of current vercel.json', 'success');
        }

        // Write optimized configuration
        writeFileSync('vercel.json', JSON.stringify(optimizedConfig, null, 2));
        this.log('Updated vercel.json with optimizations', 'success');

        // Generate recommendations
        const recommendations = this.generateOptimizationRecommendations(analysis);

        // Create optimization guides
        const coldStartOptimizations = this.createColdStartOptimizations();
        this.createPerformanceMonitoring();

        // Generate optimization report
        const report = {
            timestamp: new Date().toISOString(),
            analysis,
            recommendations,
            coldStartOptimizations,
            optimizedConfig
        };

        writeFileSync('function-optimization-report.json', JSON.stringify(report, null, 2));
        this.log('Generated optimization report', 'success');

        // Display summary
        this.displayOptimizationSummary(analysis, recommendations);

        return report;
    }

    /**
     * Display optimization summary
     */
    displayOptimizationSummary(analysis, recommendations) {
        console.log('\n📊 Optimization Summary');
        console.log('========================\n');

        console.log(`📁 Analyzed ${analysis.length} functions`);

        const largeFunctions = analysis.filter(f => f.size > 50000);
        if (largeFunctions.length > 0) {
            console.log(`⚠️  ${largeFunctions.length} functions are larger than 50KB`);
        }

        const complexFunctions = analysis.filter(f => f.complexity > 15);
        if (complexFunctions.length > 0) {
            console.log(`🔧 ${complexFunctions.length} functions have high complexity`);
        }

        console.log(`💡 Generated ${recommendations.length} optimization recommendations`);

        if (recommendations.length > 0) {
            console.log('\n🎯 Top Recommendations:');
            recommendations.slice(0, 3).forEach(rec => {
                console.log(`\n${rec.function}:`);
                rec.recommendations.forEach(r => console.log(`  • ${r}`));
            });
        }

        console.log('\n✅ Optimizations Applied:');
        console.log('  • Updated function memory and timeout settings');
        console.log('  • Configured regional deployment preferences');
        console.log('  • Added performance and security headers');
        console.log('  • Created performance monitoring utilities');
        console.log('  • Generated cold start optimization guide');

        console.log('\n📋 Next Steps:');
        console.log('  1. Review function-optimization-report.json');
        console.log('  2. Implement recommended optimizations');
        console.log('  3. Test deployment: vercel');
        console.log('  4. Monitor performance in production');
        console.log('  5. Use api/utils/performance-monitor.js in functions');
    }
}

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const optimizer = new ServerlessFunctionOptimizer();
    optimizer.optimize().catch(error => {
        console.error('Optimization failed:', error);
        process.exit(1);
    });
}

export default ServerlessFunctionOptimizer;

/**
  * Generate performance test commands for deployed functions
  */
performanceTest() {
    console.log('🚀 Generating performance test commands for serverless functions...\n');

    const testEndpoints = [
        { path: '/api/health', expectedTime: 1000, method: 'GET' },
        { path: '/api/ping', expectedTime: 500, method: 'GET' },
        {
            path: '/api/contact', method: 'POST', expectedTime: 3000,
            body: '{"name":"Test","email":"test@example.com","phone":"11999999999","message":"Test message","consent":true}'
        },
        { path: '/api/appointments/availability', expectedTime: 2000, method: 'GET' },
        { path: '/api/podcast/episodes', expectedTime: 1500, method: 'GET' },
        { path: '/api/dashboard/health', expectedTime: 2000, method: 'GET' },
        { path: '/api/outbox/drain', expectedTime: 5000, method: 'POST' }
    ];

    console.log('Performance test commands (replace YOUR_DOMAIN with actual domain):\n');

    testEndpoints.forEach(endpoint => {
        const url = `https://YOUR_DOMAIN${endpoint.path}`;

        console.log(`# Test ${endpoint.path} (expected: <${endpoint.expectedTime}ms)`);

        if (endpoint.method === 'GET') {
            console.log(`curl -w "\\nTime: %{time_total}s | Status: %{http_code}\\n" -s "${url}"`);
        } else if (endpoint.method === 'POST') {
            const headers = '-H "Content-Type: application/json"';
            const body = endpoint.body ? `-d '${endpoint.body}'` : '';
            console.log(`curl -X POST ${headers} ${body} -w "\\nTime: %{time_total}s | Status: %{http_code}\\n" -s "${url}"`);
        }
        console.log('');
    });

    // Generate load testing script
    this.generateLoadTestScript();
}

/**
 * Generate a load testing script using curl
 */
generateLoadTestScript() {
    const loadTestScript = `#!/bin/bash

# Serverless Function Load Testing Script
# Tests concurrent requests to validate function performance under load

DOMAIN="YOUR_DOMAIN_HERE"
CONCURRENT_REQUESTS=10
TEST_DURATION=30

echo "🚀 Starting load test for $CONCURRENT_REQUESTS concurrent requests over ${TEST_DURATION}s"

# Test critical endpoints
ENDPOINTS=(
    "GET /api/health"
    "GET /api/ping" 
    "GET /api/appointments/availability"
    "GET /api/podcast/episodes"
)

# Function to test single endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local url="https://$DOMAIN$path"
    
    echo "Testing $method $path..."
    
    # Run concurrent requests
    for i in $(seq 1 $CONCURRENT_REQUESTS); do
        (
            start_time=$(date +%s.%N)
            if [ "$method" = "GET" ]; then
                response=$(curl -s -w "%{http_code}" -o /dev/null "$url")
            else
                response=$(curl -s -w "%{http_code}" -o /dev/null -X "$method" "$url")
            fi
            end_time=$(date +%s.%N)
            duration=$(echo "$end_time - $start_time" | bc)
            echo "Request $i: ${duration}s (Status: $response)"
        ) &
    done
    
    # Wait for all background jobs to complete
    wait
    echo "Completed testing $method $path"
    echo "---"
}

# Run tests for each endpoint
for endpoint in "\${ENDPOINTS[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)
    test_endpoint "$method" "$path"
    sleep 2
done

echo "✅ Load testing completed!"
echo "Review the response times and status codes above."
echo "Expected response times:"
echo "- /api/health: <1s"
echo "- /api/ping: <0.5s"
echo "- /api/appointments/availability: <2s"
echo "- /api/podcast/episodes: <1.5s"
`;

    writeFileSync('scripts/load-test-functions.sh', loadTestScript);
    execSync('chmod +x scripts/load-test-functions.sh');
    console.log('📄 Generated scripts/load-test-functions.sh');
    console.log('   Update DOMAIN variable and run: ./scripts/load-test-functions.sh');
}
}

// Add performance testing to CLI
if (process.argv.includes('--performance')) {
    const optimizer = new ServerlessFunctionOptimizer();
    optimizer.performanceTest();
}