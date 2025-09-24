#!/usr/bin/env node

/**
 * Serverless Function Optimization Script for Vercel
 * 
 * This script optimizes serverless functions for better performance:
 * - Analyzes function bundle sizes
 * - Identifies cold start optimization opportunities
 * - Suggests memory and timeout configurations
 * - Validates function configurations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ServerlessOptimizer {
    constructor() {
        this.apiDir = path.join(process.cwd(), 'api');
        this.vercelConfig = this.loadVercelConfig();
    }

    loadVercelConfig() {
        try {
            const configPath = path.join(process.cwd(), 'vercel.json');
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('❌ Could not load vercel.json:', error.message);
            process.exit(1);
        }
    }

    analyzeFunction(functionPath) {
        const stats = fs.statSync(functionPath);
        const content = fs.readFileSync(functionPath, 'utf8');

        // Analyze imports and dependencies
        const imports = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
        const dynamicImports = content.match(/import\(['"]([^'"]+)['"]\)/g) || [];

        // Check for heavy dependencies
        const heavyDeps = [
            '@supabase/supabase-js',
            'openai',
            'resend',
            'axios',
            'node-fetch'
        ];

        const foundHeavyDeps = heavyDeps.filter(dep =>
            content.includes(dep) || imports.some(imp => imp.includes(dep))
        );

        // Estimate complexity
        const lines = content.split('\n').length;
        const complexity = this.estimateComplexity(content);

        return {
            path: functionPath,
            size: stats.size,
            lines,
            complexity,
            imports: imports.length,
            dynamicImports: dynamicImports.length,
            heavyDeps: foundHeavyDeps,
            hasAsyncOperations: content.includes('await') || content.includes('.then('),
            hasDatabase: content.includes('supabase') || content.includes('postgres'),
            hasExternalAPI: content.includes('fetch(') || content.includes('axios')
        };
    }

    estimateComplexity(content) {
        let score = 0;

        // Basic complexity indicators
        score += (content.match(/if\s*\(/g) || []).length * 1;
        score += (content.match(/for\s*\(/g) || []).length * 2;
        score += (content.match(/while\s*\(/g) || []).length * 2;
        score += (content.match(/switch\s*\(/g) || []).length * 3;
        score += (content.match(/try\s*{/g) || []).length * 2;
        score += (content.match(/await\s+/g) || []).length * 1;

        if (score < 10) return 'low';
        if (score < 25) return 'medium';
        return 'high';
    }

    recommendConfiguration(analysis) {
        const recommendations = {
            maxDuration: 10,
            memory: 256,
            reasons: []
        };

        // Adjust based on complexity
        if (analysis.complexity === 'high') {
            recommendations.maxDuration = Math.max(recommendations.maxDuration, 30);
            recommendations.memory = Math.max(recommendations.memory, 512);
            recommendations.reasons.push('High complexity detected');
        }

        // Adjust for heavy dependencies
        if (analysis.heavyDeps.length > 0) {
            recommendations.memory = Math.max(recommendations.memory, 512);
            recommendations.reasons.push(`Heavy dependencies: ${analysis.heavyDeps.join(', ')}`);
        }

        // Adjust for database operations
        if (analysis.hasDatabase) {
            recommendations.maxDuration = Math.max(recommendations.maxDuration, 15);
            recommendations.reasons.push('Database operations detected');
        }

        // Adjust for external API calls
        if (analysis.hasExternalAPI) {
            recommendations.maxDuration = Math.max(recommendations.maxDuration, 20);
            recommendations.reasons.push('External API calls detected');
        }

        // Adjust for file size
        if (analysis.size > 50000) { // 50KB
            recommendations.memory = Math.max(recommendations.memory, 512);
            recommendations.reasons.push('Large file size');
        }

        return recommendations;
    }

    findFunctions(dir) {
        const functions = [];

        const scan = (currentDir) => {
            const items = fs.readdirSync(currentDir);

            items.forEach(item => {
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    scan(itemPath);
                } else if (item.endsWith('.js') || item.endsWith('.ts')) {
                    functions.push(itemPath);
                }
            });
        };

        scan(dir);
        return functions;
    }

    validateDeployment() {
        console.log('🔍 Validating deployment configuration...\n');

        const issues = [];

        // Check vercel.json exists
        if (!fs.existsSync('vercel.json')) {
            issues.push('❌ vercel.json not found');
        }

        // Check for required cron jobs
        const requiredCrons = [
            '/api/outbox/drain',
            '/api/podcast/sync',
            '/api/appointments/reminders'
        ];

        const configuredCrons = this.vercelConfig.crons?.map(c => c.path) || [];

        requiredCrons.forEach(cronPath => {
            if (!configuredCrons.includes(cronPath)) {
                issues.push(`❌ Missing cron job: ${cronPath}`);
            } else {
                console.log(`✅ Cron job configured: ${cronPath}`);
            }
        });

        // Check function configurations
        const criticalFunctions = [
            'api/outbox/drain.js',
            'api/podcast/sync.js',
            'api/appointments/reminders.js'
        ];

        criticalFunctions.forEach(funcPath => {
            const config = this.vercelConfig.functions?.[funcPath];
            if (!config) {
                console.log(`⚠️  No specific configuration for critical function: ${funcPath}`);
            } else if (config.maxDuration < 30) {
                console.log(`⚠️  ${funcPath} may need longer maxDuration (current: ${config.maxDuration}s)`);
            } else {
                console.log(`✅ ${funcPath} properly configured`);
            }
        });

        if (issues.length === 0) {
            console.log('\n✅ Deployment configuration looks good!');
        } else {
            console.log('\n🚨 Issues found:');
            issues.forEach(issue => console.log(issue));
        }

        return issues.length === 0;
    }

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

    generateLoadTestScript() {
        const loadTestScript = `#!/bin/bash

# Serverless Function Load Testing Script
# Tests concurrent requests to validate function performance under load

DOMAIN="YOUR_DOMAIN_HERE"
CONCURRENT_REQUESTS=10
TEST_DURATION=30

echo "🚀 Starting load test for $CONCURRENT_REQUESTS concurrent requests over \${TEST_DURATION}s"

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
            echo "Request $i: \${duration}s (Status: $response)"
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

        fs.writeFileSync('scripts/load-test-functions.sh', loadTestScript);
        try {
            execSync('chmod +x scripts/load-test-functions.sh');
        } catch (error) {
            // Ignore chmod errors on Windows
        }
        console.log('📄 Generated scripts/load-test-functions.sh');
        console.log('   Update DOMAIN variable and run: ./scripts/load-test-functions.sh');
    }
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
    console.log(`
Serverless Function Optimization Script

Usage:
  node scripts/optimize-serverless-functions-fixed.js [options]

Options:
  --validate    Validate deployment configuration
  --performance Generate performance test commands
  --help        Show this help message

Examples:
  node scripts/optimize-serverless-functions-fixed.js --validate
  node scripts/optimize-serverless-functions-fixed.js --performance
  `);
    process.exit(0);
}

const optimizer = new ServerlessOptimizer();

if (args.includes('--validate')) {
    const isValid = optimizer.validateDeployment();
    process.exit(isValid ? 0 : 1);
} else if (args.includes('--performance')) {
    optimizer.performanceTest();
} else {
    console.log('Unknown option. Use --help for usage information.');
}