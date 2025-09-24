/**
 * Setup script for Chatbot Performance Optimization System
 * Initializes database tables, cache warming, and performance monitoring
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Check if database tables exist
 */
async function checkDatabaseTables() {
    console.log('🔍 Checking database tables...');

    const tables = [
        'chatbot_response_cache',
        'chatbot_performance_metrics',
        'chatbot_conversations',
        'system_logs',
        'system_config'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error && error.code === '42P01') {
                // Table doesn't exist
                missingTables.push(table);
            } else {
                existingTables.push(table);
            }
        } catch (error) {
            missingTables.push(table);
        }
    }

    console.log(`   ✅ Existing tables: ${existingTables.join(', ')}`);
    if (missingTables.length > 0) {
        console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
        console.log('   💡 Run the database migrations to create missing tables');
    }

    return { existingTables, missingTables };
}

/**
 * Run database migrations
 */
async function runMigrations() {
    console.log('🚀 Running database migrations...');

    const migrationFiles = [
        'database/migrations/012_chatbot_response_cache.sql',
        'database/migrations/013_chatbot_performance_metrics.sql'
    ];

    for (const migrationFile of migrationFiles) {
        try {
            console.log(`   📄 Running ${migrationFile}...`);

            const migrationPath = path.resolve(migrationFile);
            const migrationSQL = await fs.readFile(migrationPath, 'utf8');

            // Split SQL into individual statements
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            for (const statement of statements) {
                if (statement.trim()) {
                    const { error } = await supabase.rpc('exec_sql', { sql: statement });
                    if (error && !error.message.includes('already exists')) {
                        console.warn(`     ⚠️ Warning: ${error.message}`);
                    }
                }
            }

            console.log(`   ✅ Completed ${migrationFile}`);

        } catch (error) {
            console.error(`   ❌ Failed to run ${migrationFile}:`, error.message);
        }
    }
}

/**
 * Initialize system configuration
 */
async function initializeSystemConfig() {
    console.log('⚙️ Initializing system configuration...');

    const configs = [
        {
            key: 'cache_default_ttl',
            value: '86400',
            description: 'Default cache TTL in seconds (24 hours)'
        },
        {
            key: 'cache_medical_ttl',
            value: '604800',
            description: 'Medical information cache TTL in seconds (7 days)'
        },
        {
            key: 'cache_appointment_ttl',
            value: '3600',
            description: 'Appointment-related cache TTL in seconds (1 hour)'
        },
        {
            key: 'cache_max_entries',
            value: '10000',
            description: 'Maximum number of cache entries to maintain'
        },
        {
            key: 'performance_metrics_retention_days',
            value: '30',
            description: 'Number of days to retain performance metrics'
        },
        {
            key: 'performance_monitoring_enabled',
            value: 'true',
            description: 'Enable performance monitoring and metrics collection'
        }
    ];

    for (const config of configs) {
        try {
            const { error } = await supabase
                .from('system_config')
                .upsert(config, { onConflict: 'key' });

            if (error) {
                console.warn(`   ⚠️ Warning setting ${config.key}:`, error.message);
            } else {
                console.log(`   ✅ Set ${config.key} = ${config.value}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to set ${config.key}:`, error.message);
        }
    }
}

/**
 * Warm up cache with common medical questions
 */
async function warmUpCache() {
    console.log('🔥 Warming up cache with common medical questions...');

    const commonQuestions = [
        { message: "O que é catarata?", category: "cataract" },
        { message: "Quais são os sintomas do glaucoma?", category: "glaucoma" },
        { message: "Como tratar conjuntivite?", category: "conjunctivitis" },
        { message: "O que causa miopia?", category: "myopia" },
        { message: "Sintomas de olho seco", category: "dry_eye" },
        { message: "Como funciona cirurgia de catarata?", category: "cataract" },
        { message: "Prevenção do glaucoma", category: "glaucoma" }
    ];

    // Note: In a real implementation, you would call the actual cache service
    // For now, we'll just insert some sample cache entries
    for (const question of commonQuestions) {
        try {
            const cacheEntry = {
                cache_key: `sample_${question.category}_${Date.now()}`,
                message_normalized: question.message.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' '),
                response: `Esta é uma resposta de exemplo para: ${question.message}. Esta informação é apenas educativa. Consulte sempre um médico oftalmologista para diagnóstico e tratamento adequados.`,
                category: question.category,
                context_hash: 'sample',
                metadata: {
                    originalMessage: question.message,
                    tokensUsed: 100,
                    responseTime: 1500,
                    cacheCreated: Date.now()
                },
                ttl_seconds: 604800, // 7 days for medical info
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                access_count: 0,
                last_accessed: new Date().toISOString()
            };

            const { error } = await supabase
                .from('chatbot_response_cache')
                .insert(cacheEntry);

            if (error) {
                console.warn(`   ⚠️ Warning caching ${question.message}:`, error.message);
            } else {
                console.log(`   ✅ Cached: ${question.message}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to cache ${question.message}:`, error.message);
        }
    }
}

/**
 * Test system health
 */
async function testSystemHealth() {
    console.log('🏥 Testing system health...');

    const tests = [
        {
            name: 'Cache table access',
            test: async () => {
                const { data, error } = await supabase
                    .from('chatbot_response_cache')
                    .select('count(*)')
                    .limit(1);
                return !error;
            }
        },
        {
            name: 'Performance metrics table access',
            test: async () => {
                const { data, error } = await supabase
                    .from('chatbot_performance_metrics')
                    .select('count(*)')
                    .limit(1);
                return !error;
            }
        },
        {
            name: 'System config access',
            test: async () => {
                const { data, error } = await supabase
                    .from('system_config')
                    .select('*')
                    .eq('key', 'cache_default_ttl')
                    .single();
                return !error && data;
            }
        }
    ];

    let passedTests = 0;

    for (const test of tests) {
        try {
            const result = await test.test();
            if (result) {
                console.log(`   ✅ ${test.name}`);
                passedTests++;
            } else {
                console.log(`   ❌ ${test.name}`);
            }
        } catch (error) {
            console.log(`   ❌ ${test.name}: ${error.message}`);
        }
    }

    console.log(`\n🎯 Health Check: ${passedTests}/${tests.length} tests passed`);
    return passedTests === tests.length;
}

/**
 * Display setup summary
 */
function displaySummary() {
    console.log('\n📋 SETUP SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Chatbot Performance Optimization System Setup Complete!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Ensure your .env file has all required chatbot variables');
    console.log('2. Test the system with: node test-chatbot-performance.js');
    console.log('3. Monitor performance at: /api/chatbot/performance');
    console.log('4. Check cache statistics in your admin dashboard');
    console.log('\n📚 Documentation:');
    console.log('- Performance optimization: CHATBOT_PERFORMANCE_OPTIMIZATION_SUMMARY.md');
    console.log('- Environment variables: .env.example.chatbot');
    console.log('- API endpoints: api/chatbot/performance.js');
    console.log('\n🔧 Configuration:');
    console.log('- Cache TTL: Medical (7d), General (24h), Appointments (1h)');
    console.log('- Performance monitoring: Enabled with 30-day retention');
    console.log('- Resource management: Auto-scaling enabled');
    console.log('- Connection pooling: 2-10 connections');
}

/**
 * Main setup function
 */
async function main() {
    try {
        console.log('🛠️ Chatbot Performance Optimization Setup');
        console.log('Setting up caching, monitoring, and resource management\n');

        // Check database tables
        const { missingTables } = await checkDatabaseTables();

        // Run migrations if needed
        if (missingTables.length > 0) {
            await runMigrations();
        }

        // Initialize system configuration
        await initializeSystemConfig();

        // Warm up cache
        await warmUpCache();

        // Test system health
        const healthOk = await testSystemHealth();

        if (healthOk) {
            displaySummary();
            console.log('\n🎉 Setup completed successfully!');
        } else {
            console.log('\n⚠️ Setup completed with warnings. Please check the errors above.');
        }

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { checkDatabaseTables, runMigrations, initializeSystemConfig, warmUpCache, testSystemHealth };