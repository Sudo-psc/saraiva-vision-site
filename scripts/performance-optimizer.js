#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Comprehensive performance analysis and optimization for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { performance } from 'perf_hooks';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class PerformanceOptimizer {
    constructor() {
        this.results = {
            vercel: { score: 0, issues: [], optimizations: [] },
            vps: { score: 0, issues: [], optimizations: [] },
            database: { score: 0, issues: [], optimizations: [] },
            frontend: { score: 0, issues: [], optimizations: [] }
        };
        this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta
        };

        console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async measureResponseTime(url, iterations = 3) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            try {
                await new Promise((resolve, reject) => {
                    const req = https.get(url, (res) => {
                        res.on('data', () => { }); // Consume response
                        res.on('end', resolve);
                    });

                    req.on('error', reject);
                    req.setTimeout(10000, () => {
                        req.destroy();
                        reject(new Error('Timeout'));
                    });
                });

                const end = performance.now();
                times.push(end - start);
            } catch (error) {
                times.push(10000); // Penalty for failed requests
            }
        }

        return {
            average: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            times
        };
    }

    async analyzeVercelPerformance() {
        this.log('⚡ Analyzing Vercel Performance...', 'header');

        // Check Vercel configuration
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        let score = 100;

        // Check function memory allocation
        if (vercelConfig.functions) {
            const functionsWithoutMemory = Object.entries(vercelConfig.functions)
                .filter(([_, config]) => !config.memory);

            if (functionsWithoutMemory.length > 0) {
                score -= 10;
                this.results.vercel.issues.push({
                    type: 'memory',
                    severity: 'medium',
                    description: `${functionsWithoutMemory.length} functions without explicit memory allocation`,
                    impact: 'May use default 1024MB, potentially wasting resources'
                });

                this.results.vercel.optimizations.push({
                    type: 'memory',
                    description: 'Set appropriate memory limits for functions',
                    implementation: 'Add memory configuration to vercel.json functions'
                });
            }

            // Check function timeouts
            const functionsWithLongTimeout = Object.entries(vercelConfig.functions)
                .filter(([_, config]) => config.maxDuration > 30);

            if (functionsWithLongTimeout.length > 0) {
                score -= 5;
                this.results.vercel.issues.push({
                    type: 'timeout',
                    severity: 'low',
                    description: `${functionsWithLongTimeout.length} functions with long timeouts`,
                    impact: 'May indicate inefficient operations'
                });
            }
        }

        // Check caching headers
        const cachingHeaders = vercelConfig.headers?.filter(h =>
            h.headers.some(header => header.key === 'Cache-Control')
        );

        if (!cachingHeaders || cachingHeaders.length === 0) {
            score -= 15;
            this.results.vercel.issues.push({
                type: 'caching',
                severity: 'high',
                description: 'No caching headers configured',
                impact: 'Static assets not cached, poor performance'
            });

            this.results.vercel.optimizations.push({
                type: 'caching',
                description: 'Add Cache-Control headers for static assets',
                implementation: 'Configure headers in vercel.json for images, CSS, JS'
            });
        }

        // Check regions
        if (!vercelConfig.regions || !vercelConfig.regions.includes('gru1')) {
            score -= 10;
            this.results.vercel.issues.push({
                type: 'region',
                severity: 'medium',
                description: 'Not optimized for Brazil region',
                impact: 'Higher latency for Brazilian users'
            });

            this.results.vercel.optimizations.push({
                type: 'region',
                description: 'Add gru1 (São Paulo) region for better performance in Brazil',
                implementation: 'Add "regions": ["gru1"] to vercel.json'
            });
        }

        // Test API endpoint performance
        const apiEndpoints = [
            '/api/health',
            '/api/ping'
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const timing = await this.measureResponseTime(`${this.baseUrl}${endpoint}`);

                if (timing.average > 1000) {
                    score -= 10;
                    this.results.vercel.issues.push({
                        type: 'api_performance',
                        severity: 'high',
                        description: `${endpoint} slow response time: ${timing.average.toFixed(0)}ms`,
                        impact: 'Poor user experience'
                    });
                } else if (timing.average > 500) {
                    score -= 5;
                    this.results.vercel.issues.push({
                        type: 'api_performance',
                        severity: 'medium',
                        description: `${endpoint} moderate response time: ${timing.average.toFixed(0)}ms`,
                        impact: 'Room for improvement'
                    });
                }

                this.log(`${endpoint}: ${timing.average.toFixed(0)}ms avg`, timing.average < 500 ? 'success' : 'warning');
            } catch (error) {
                score -= 20;
                this.results.vercel.issues.push({
                    type: 'api_availability',
                    severity: 'critical',
                    description: `${endpoint} not accessible: ${error.message}`,
                    impact: 'API endpoint failure'
                });
            }
        }

        this.results.vercel.score = Math.max(0, score);
    }

    async analyzeVPSPerformance() {
        this.log('🖥️  Analyzing VPS Performance...', 'header');

        let score = 100;

        // Check Docker Compose configuration
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            // Check for resource limits
            if (!content.includes('mem_limit') && !content.includes('cpus')) {
                score -= 15;
                this.results.vps.issues.push({
                    type: 'resources',
                    severity: 'medium',
                    description: 'No resource limits configured for containers',
                    impact: 'Potential resource exhaustion'
                });

                this.results.vps.optimizations.push({
                    type: 'resources',
                    description: 'Add memory and CPU limits to containers',
                    implementation: 'Add mem_limit and cpus to docker-compose.yml services'
                });
            }

            // Check for Redis configuration
            if (content.includes('redis:')) {
                this.log('✅ Redis caching configured', 'success');
            } else {
                score -= 20;
                this.results.vps.issues.push({
                    type: 'caching',
                    severity: 'high',
                    description: 'No Redis caching configured',
                    impact: 'Poor WordPress performance'
                });

                this.results.vps.optimizations.push({
                    type: 'caching',
                    description: 'Add Redis container for WordPress object caching',
                    implementation: 'Add Redis service to docker-compose.yml'
                });
            }

            // Check for health checks
            if (content.includes('healthcheck:')) {
                this.log('✅ Health checks configured', 'success');
            } else {
                score -= 10;
                this.results.vps.issues.push({
                    type: 'monitoring',
                    severity: 'medium',
                    description: 'No health checks configured',
                    impact: 'Cannot detect container failures'
                });
            }
        }

        // Test WordPress GraphQL performance
        const wpEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
        if (wpEndpoint) {
            try {
                const timing = await this.measureResponseTime(wpEndpoint);

                if (timing.average > 2000) {
                    score -= 15;
                    this.results.vps.issues.push({
                        type: 'wordpress_performance',
                        severity: 'high',
                        description: `WordPress GraphQL slow: ${timing.average.toFixed(0)}ms`,
                        impact: 'Slow content loading'
                    });

                    this.results.vps.optimizations.push({
                        type: 'wordpress_performance',
                        description: 'Optimize WordPress performance with caching and database tuning',
                        implementation: 'Enable Redis object cache, optimize MySQL configuration'
                    });
                }

                this.log(`WordPress GraphQL: ${timing.average.toFixed(0)}ms avg`, timing.average < 1000 ? 'success' : 'warning');
            } catch (error) {
                score -= 25;
                this.results.vps.issues.push({
                    type: 'wordpress_availability',
                    severity: 'critical',
                    description: `WordPress GraphQL not accessible: ${error.message}`,
                    impact: 'Content management system failure'
                });
            }
        }

        this.results.vps.score = Math.max(0, score);
    }

    async analyzeDatabasePerformance() {
        this.log('🗄️  Analyzing Database Performance...', 'header');

        let score = 100;

        // Check MySQL configuration
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            // Check for MySQL optimization
            if (!content.includes('innodb_buffer_pool_size')) {
                score -= 15;
                this.results.database.issues.push({
                    type: 'mysql_config',
                    severity: 'medium',
                    description: 'MySQL not optimized for performance',
                    impact: 'Suboptimal database performance'
                });

                this.results.database.optimizations.push({
                    type: 'mysql_config',
                    description: 'Add MySQL performance configuration',
                    implementation: 'Configure innodb_buffer_pool_size and other MySQL parameters'
                });
            }

            // Check for persistent volumes
            if (content.includes('volumes:') && content.includes('db_data')) {
                this.log('✅ Database persistence configured', 'success');
            } else {
                score -= 20;
                this.results.database.issues.push({
                    type: 'persistence',
                    severity: 'high',
                    description: 'Database data not persisted',
                    impact: 'Data loss on container restart'
                });
            }
        }

        // Check database backup strategy
        if (fs.existsSync('/usr/local/bin/wordpress-backup.sh')) {
            this.log('✅ Database backup script found', 'success');
        } else {
            score -= 10;
            this.results.database.issues.push({
                type: 'backup',
                severity: 'medium',
                description: 'No automated database backup',
                impact: 'Risk of data loss'
            });

            this.results.database.optimizations.push({
                type: 'backup',
                description: 'Implement automated database backups',
                implementation: 'Create backup script with cron job'
            });
        }

        this.results.database.score = Math.max(0, score);
    }

    async analyzeFrontendPerformance() {
        this.log('🎨 Analyzing Frontend Performance...', 'header');

        let score = 100;

        // Check build configuration
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // Check for build optimization
        if (!packageJson.scripts.build || !packageJson.scripts.build.includes('vite build')) {
            score -= 10;
            this.results.frontend.issues.push({
                type: 'build',
                severity: 'medium',
                description: 'Build process not optimized',
                impact: 'Larger bundle sizes'
            });
        }

        // Check for image optimization
        const publicDir = 'public';
        if (fs.existsSync(publicDir)) {
            const imageFiles = execSync(`find ${publicDir} -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" 2>/dev/null || true`, { encoding: 'utf8' })
                .split('\n').filter(f => f);

            const webpFiles = execSync(`find ${publicDir} -name "*.webp" 2>/dev/null || true`, { encoding: 'utf8' })
                .split('\n').filter(f => f);

            if (imageFiles.length > 0 && webpFiles.length === 0) {
                score -= 15;
                this.results.frontend.issues.push({
                    type: 'images',
                    severity: 'medium',
                    description: `${imageFiles.length} images without WebP optimization`,
                    impact: 'Slower page loading'
                });

                this.results.frontend.optimizations.push({
                    type: 'images',
                    description: 'Convert images to WebP format for better compression',
                    implementation: 'Use image optimization tools to generate WebP versions'
                });
            }
        }

        // Check for service worker
        if (fs.existsSync('public/sw.js')) {
            this.log('✅ Service worker found', 'success');
        } else {
            score -= 10;
            this.results.frontend.issues.push({
                type: 'pwa',
                severity: 'low',
                description: 'No service worker for offline functionality',
                impact: 'No offline support'
            });
        }

        // Test page load performance
        try {
            const timing = await this.measureResponseTime(this.baseUrl);

            if (timing.average > 3000) {
                score -= 20;
                this.results.frontend.issues.push({
                    type: 'page_load',
                    severity: 'high',
                    description: `Slow page load: ${timing.average.toFixed(0)}ms`,
                    impact: 'Poor user experience'
                });

                this.results.frontend.optimizations.push({
                    type: 'page_load',
                    description: 'Optimize page load performance',
                    implementation: 'Implement code splitting, lazy loading, and caching'
                });
            } else if (timing.average > 1500) {
                score -= 10;
                this.results.frontend.issues.push({
                    type: 'page_load',
                    severity: 'medium',
                    description: `Moderate page load: ${timing.average.toFixed(0)}ms`,
                    impact: 'Room for improvement'
                });
            }

            this.log(`Page load time: ${timing.average.toFixed(0)}ms avg`, timing.average < 1500 ? 'success' : 'warning');
        } catch (error) {
            score -= 30;
            this.results.frontend.issues.push({
                type: 'availability',
                severity: 'critical',
                description: `Site not accessible: ${error.message}`,
                impact: 'Complete service failure'
            });
        }

        this.results.frontend.score = Math.max(0, score);
    }

    async generateOptimizationPlan() {
        this.log('📋 Generating Optimization Plan...', 'header');

        const optimizationPlan = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };

        // Categorize optimizations by priority
        for (const category of Object.keys(this.results)) {
            const result = this.results[category];

            for (const issue of result.issues) {
                const optimization = result.optimizations.find(opt => opt.type === issue.type);

                if (optimization) {
                    const priority = issue.severity === 'critical' ? 'immediate' :
                        issue.severity === 'high' ? 'immediate' :
                            issue.severity === 'medium' ? 'shortTerm' : 'longTerm';

                    optimizationPlan[priority].push({
                        category,
                        issue: issue.description,
                        optimization: optimization.description,
                        implementation: optimization.implementation,
                        severity: issue.severity
                    });
                }
            }
        }

        return optimizationPlan;
    }

    async createOptimizedConfigurations() {
        this.log('⚙️  Creating Optimized Configurations...', 'header');

        // Create optimized Vercel configuration
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

        // Add performance optimizations
        if (!vercelConfig.headers) vercelConfig.headers = [];

        // Add caching headers if missing
        const hasCacheHeaders = vercelConfig.headers.some(h =>
            h.headers.some(header => header.key === 'Cache-Control')
        );

        if (!hasCacheHeaders) {
            vercelConfig.headers.push({
                source: '/images/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            });

            vercelConfig.headers.push({
                source: '/assets/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            });
        }

        // Add Brazil region if missing
        if (!vercelConfig.regions || !vercelConfig.regions.includes('gru1')) {
            vercelConfig.regions = ['gru1'];
        }

        // Optimize function memory allocation
        if (vercelConfig.functions) {
            const optimizedFunctions = {};

            for (const [path, config] of Object.entries(vercelConfig.functions)) {
                optimizedFunctions[path] = {
                    ...config,
                    memory: config.memory || (path.includes('sync') || path.includes('drain') ? 512 : 256)
                };
            }

            vercelConfig.functions = optimizedFunctions;
        }

        fs.writeFileSync('vercel.optimized.json', JSON.stringify(vercelConfig, null, 2));
        this.log('✅ Optimized Vercel configuration created: vercel.optimized.json', 'success');

        // Create optimized Docker Compose configuration
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            let content = fs.readFileSync(dockerComposePath, 'utf8');

            // Add resource limits if missing
            if (!content.includes('mem_limit')) {
                content = content.replace(
                    /wordpress:\s*\n(\s*)image:/g,
                    `wordpress:
$1image:`
                );

                // Add memory limits to services
                content = content.replace(
                    /(wordpress:[\s\S]*?)(volumes:)/g,
                    `$1    mem_limit: 512m
    cpus: 0.5
    $2`
                );

                content = content.replace(
                    /(db:[\s\S]*?)(volumes:)/g,
                    `$1    mem_limit: 256m
    cpus: 0.3
    $2`
                );
            }

            fs.writeFileSync('vps-wordpress/docker-compose.optimized.yml', content);
            this.log('✅ Optimized Docker Compose configuration created', 'success');
        }

        // Create MySQL optimization configuration
        const mysqlConfig = `
# MySQL Performance Optimization
[mysqld]
innodb_buffer_pool_size = 128M
innodb_log_file_size = 32M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_type = 1
query_cache_size = 32M
max_connections = 50
thread_cache_size = 8
table_open_cache = 400
tmp_table_size = 32M
max_heap_table_size = 32M
`;

        fs.writeFileSync('vps-wordpress/mysql-performance.cnf', mysqlConfig);
        this.log('✅ MySQL performance configuration created', 'success');
    }

    generatePerformanceReport() {
        this.log('📊 Performance Optimization Report', 'header');
        this.log('='.repeat(60), 'info');

        // Calculate overall score
        const categories = Object.keys(this.results);
        const overallScore = Math.round(
            categories.reduce((sum, cat) => sum + this.results[cat].score, 0) / categories.length
        );

        this.log(`Overall Performance Score: ${overallScore}%`,
            overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error');

        // Category scores
        for (const category of categories) {
            const result = this.results[category];
            const color = result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'error';
            this.log(`${category.toUpperCase()}: ${result.score}%`, color);
        }

        this.log('='.repeat(60), 'info');

        // Issues summary
        let totalIssues = 0;
        const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

        for (const category of categories) {
            for (const issue of this.results[category].issues) {
                totalIssues++;
                severityCounts[issue.severity]++;
            }
        }

        this.log(`Total Issues Found: ${totalIssues}`, 'info');
        for (const [severity, count] of Object.entries(severityCounts)) {
            if (count > 0) {
                const color = severity === 'critical' ? 'error' : severity === 'high' ? 'error' : 'warning';
                this.log(`${severity.toUpperCase()}: ${count}`, color);
            }
        }

        return overallScore >= 70 ? 0 : overallScore >= 50 ? 1 : 2;
    }

    async run() {
        this.log('🚀 Starting Performance Analysis...', 'header');

        await this.analyzeVercelPerformance();
        await this.analyzeVPSPerformance();
        await this.analyzeDatabasePerformance();
        await this.analyzeFrontendPerformance();

        const optimizationPlan = await this.generateOptimizationPlan();
        await this.createOptimizedConfigurations();

        // Display optimization plan
        this.log('\n🎯 OPTIMIZATION PLAN', 'header');

        if (optimizationPlan.immediate.length > 0) {
            this.log('\nIMMEDIATE ACTIONS:', 'error');
            for (const item of optimizationPlan.immediate) {
                this.log(`• ${item.optimization}`, 'warning');
                this.log(`  Implementation: ${item.implementation}`, 'info');
            }
        }

        if (optimizationPlan.shortTerm.length > 0) {
            this.log('\nSHORT-TERM IMPROVEMENTS:', 'warning');
            for (const item of optimizationPlan.shortTerm) {
                this.log(`• ${item.optimization}`, 'info');
            }
        }

        if (optimizationPlan.longTerm.length > 0) {
            this.log('\nLONG-TERM ENHANCEMENTS:', 'info');
            for (const item of optimizationPlan.longTerm) {
                this.log(`• ${item.optimization}`, 'info');
            }
        }

        return this.generatePerformanceReport();
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const optimizer = new PerformanceOptimizer();

    optimizer.run().then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('❌ Performance optimization failed:', error);
        process.exit(1);
    });
}

export default PerformanceOptimizer;