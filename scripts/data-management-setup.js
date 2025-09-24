#!/usr/bin/env node

/**
 * Data Management System Setup Script
 * Initializes and configures the automated data management system
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import DataManagementService from '../src/services/dataManagementService.js';
import DataManagementScheduler from '../src/services/dataManagementScheduler.js';
import { supabase } from '../api/utils/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DataManagementSetup {
    constructor() {
        this.dataManagementService = new DataManagementService();
        this.scheduler = new DataManagementScheduler();
        this.configPath = join(__dirname, '..', '.env.data-management');
    }

    /**
     * Main setup function
     */
    async setup() {
        console.log('🚀 Setting up Data Management System...\n');

        try {
            // Step 1: Verify database schema
            await this.verifyDatabaseSchema();

            // Step 2: Create configuration file
            await this.createConfigurationFile();

            // Step 3: Initialize services
            await this.initializeServices();

            // Step 4: Run initial data assessment
            await this.runInitialAssessment();

            // Step 5: Setup scheduled jobs
            await this.setupScheduledJobs();

            // Step 6: Create monitoring dashboard
            await this.createMonitoringDashboard();

            console.log('✅ Data Management System setup completed successfully!\n');
            this.printNextSteps();

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Verifies database schema is properly set up
     */
    async verifyDatabaseSchema() {
        console.log('📊 Verifying database schema...');

        const requiredTables = [
            'chatbot_conversations',
            'user_consents',
            'medical_referrals',
            'chatbot_sessions',
            'chatbot_audit_logs',
            'chatbot_metrics'
        ];

        for (const table of requiredTables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error && error.code === 'PGRST116') {
                throw new Error(`Table ${table} does not exist. Please run database migrations first.`);
            }
        }

        console.log('✅ Database schema verified\n');
    }

    /**
     * Creates configuration file with default settings
     */
    async createConfigurationFile() {
        console.log('⚙️  Creating configuration file...');

        const config = `# Data Management System Configuration
# Generated on ${new Date().toISOString()}

# Enable/Disable Features
DATA_RETENTION_ENABLED=true
ANONYMIZATION_ENABLED=true
EXPORT_ENABLED=true

# Scheduled Jobs
DATA_RETENTION_SCHEDULE_ENABLED=true
DATA_RETENTION_CRON=0 2 * * *
DATA_ANONYMIZATION_SCHEDULE_ENABLED=true
DATA_ANONYMIZATION_CRON=0 3 * * 0
EXPORT_CLEANUP_SCHEDULE_ENABLED=true
EXPORT_CLEANUP_CRON=0 4 * * *
COMPLIANCE_REPORTING_SCHEDULE_ENABLED=true
COMPLIANCE_REPORTING_CRON=0 6 * * 1

# Retention Periods (in days)
CONVERSATION_DATA_RETENTION=365
MEDICAL_DATA_RETENTION=1825
CONSENT_RECORDS_RETENTION=2555
AUDIT_LOGS_RETENTION=1095
APPOINTMENT_DATA_RETENTION=1095
MARKETING_DATA_RETENTION=730

# Processing Configuration
RETENTION_BATCH_SIZE=100
ANONYMIZATION_BATCH_SIZE=50
ANONYMIZATION_THRESHOLD=365
MAX_PROCESSING_TIME=1800000

# Export Configuration
EXPORT_STORAGE_PATH=./exports
EXPORT_EXPIRY_DAYS=7
MAX_EXPORT_SIZE=104857600

# Security
ADMIN_API_KEY=${this.generateSecureKey()}

# Monitoring
COMPLIANCE_THRESHOLD_WARNING=90
COMPLIANCE_THRESHOLD_CRITICAL=80
NOTIFICATION_EMAIL=dpo@saraivavisao.com.br
`;

        await fs.writeFile(this.configPath, config);
        console.log(`✅ Configuration file created: ${this.configPath}\n`);
    }

    /**
     * Initializes data management services
     */
    async initializeServices() {
        console.log('🔧 Initializing services...');

        // Initialize scheduler
        await this.scheduler.initialize();

        // Test data management service
        const stats = await this.dataManagementService.getDataManagementStatistics();
        console.log('📈 Service statistics:', {
            retention: stats.retention?.scheduledItems || 0,
            anonymization: stats.anonymization?.anonymizedRecords || 0,
            exports: stats.exports?.totalExports || 0
        });

        console.log('✅ Services initialized\n');
    }

    /**
     * Runs initial data assessment
     */
    async runInitialAssessment() {
        console.log('🔍 Running initial data assessment...');

        try {
            // Get current data statistics
            const { data: conversationCount } = await supabase
                .from('chatbot_conversations')
                .select('*', { count: 'exact', head: true });

            const { data: consentCount } = await supabase
                .from('user_consents')
                .select('*', { count: 'exact', head: true });

            const { data: sessionCount } = await supabase
                .from('chatbot_sessions')
                .select('*', { count: 'exact', head: true });

            // Assess data that needs retention processing
            const retentionDate = new Date();
            retentionDate.setDate(retentionDate.getDate() - 365);

            const { data: expiredConversations } = await supabase
                .from('chatbot_conversations')
                .select('*', { count: 'exact', head: true })
                .lt('created_at', retentionDate.toISOString())
                .eq('anonymized', false);

            const assessment = {
                totalConversations: conversationCount?.length || 0,
                totalConsents: consentCount?.length || 0,
                totalSessions: sessionCount?.length || 0,
                expiredConversations: expiredConversations?.length || 0,
                assessmentDate: new Date().toISOString()
            };

            console.log('📊 Data Assessment Results:');
            console.log(`   Total Conversations: ${assessment.totalConversations}`);
            console.log(`   Total Consents: ${assessment.totalConsents}`);
            console.log(`   Total Sessions: ${assessment.totalSessions}`);
            console.log(`   Expired Conversations: ${assessment.expiredConversations}`);

            // Store assessment results
            await this.storeAssessmentResults(assessment);

            console.log('✅ Initial assessment completed\n');

        } catch (error) {
            console.warn('⚠️  Assessment completed with warnings:', error.message);
        }
    }

    /**
     * Sets up scheduled jobs
     */
    async setupScheduledJobs() {
        console.log('⏰ Setting up scheduled jobs...');

        const schedulerStatus = this.scheduler.getSchedulerStatus();

        console.log('📅 Scheduled Jobs:');
        for (const [jobName, schedule] of Object.entries(schedulerStatus.schedules)) {
            if (schedule.enabled) {
                console.log(`   ${jobName}: ${schedule.cron} (next: ${schedule.nextRun})`);
            } else {
                console.log(`   ${jobName}: disabled`);
            }
        }

        console.log('✅ Scheduled jobs configured\n');
    }

    /**
     * Creates monitoring dashboard configuration
     */
    async createMonitoringDashboard() {
        console.log('📊 Creating monitoring dashboard...');

        const dashboardConfig = {
            title: 'Data Management System Dashboard',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            widgets: [
                {
                    type: 'metric',
                    title: 'Data Retention Compliance',
                    query: 'SELECT AVG(compliance_score) FROM retention_metrics WHERE date >= NOW() - INTERVAL \'30 days\'',
                    threshold: { warning: 90, critical: 80 }
                },
                {
                    type: 'chart',
                    title: 'Daily Data Processing',
                    query: 'SELECT date, processed_items, anonymized_items FROM daily_processing_stats ORDER BY date DESC LIMIT 30'
                },
                {
                    type: 'table',
                    title: 'Recent User Rights Requests',
                    query: 'SELECT * FROM user_rights_requests ORDER BY created_at DESC LIMIT 10'
                },
                {
                    type: 'alert',
                    title: 'Overdue Retention Items',
                    query: 'SELECT COUNT(*) FROM retention_schedule WHERE scheduled_deletion < NOW() AND status = \'SCHEDULED\''
                }
            ],
            alerts: [
                {
                    name: 'Low Compliance Score',
                    condition: 'compliance_score < 80',
                    severity: 'critical',
                    notification: 'email'
                },
                {
                    name: 'High Processing Errors',
                    condition: 'error_rate > 0.05',
                    severity: 'warning',
                    notification: 'slack'
                }
            ]
        };

        const dashboardPath = join(__dirname, '..', 'monitoring', 'dashboard-config.json');
        await fs.mkdir(join(__dirname, '..', 'monitoring'), { recursive: true });
        await fs.writeFile(dashboardPath, JSON.stringify(dashboardConfig, null, 2));

        console.log(`✅ Dashboard configuration created: ${dashboardPath}\n`);
    }

    /**
     * Stores assessment results in database
     */
    async storeAssessmentResults(assessment) {
        const { error } = await supabase
            .from('chatbot_audit_logs')
            .insert({
                event_type: 'INITIAL_DATA_ASSESSMENT',
                event_data: assessment,
                compliance_category: 'system',
                severity_level: 'info'
            });

        if (error) {
            console.warn('Warning: Could not store assessment results:', error.message);
        }
    }

    /**
     * Generates a secure API key
     */
    generateSecureKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Prints next steps for the user
     */
    printNextSteps() {
        console.log('🎯 Next Steps:');
        console.log('');
        console.log('1. Review and update the configuration file:');
        console.log(`   ${this.configPath}`);
        console.log('');
        console.log('2. Add the configuration to your environment:');
        console.log('   source .env.data-management');
        console.log('');
        console.log('3. Test the system with a dry run:');
        console.log('   curl -X POST "http://localhost:3000/api/data-management?action=run-retention" \\');
        console.log('        -H "Content-Type: application/json" \\');
        console.log('        -H "X-Admin-Key: YOUR_ADMIN_KEY" \\');
        console.log('        -d \'{"dryRun": true}\'');
        console.log('');
        console.log('4. Monitor the system:');
        console.log('   curl "http://localhost:3000/api/data-management?action=get-statistics" \\');
        console.log('        -H "X-Admin-Key: YOUR_ADMIN_KEY"');
        console.log('');
        console.log('5. Set up monitoring alerts and notifications');
        console.log('');
        console.log('📚 Documentation: docs/DATA_MANAGEMENT_SYSTEM.md');
        console.log('🔧 Configuration: .env.data-management');
        console.log('📊 Dashboard: monitoring/dashboard-config.json');
        console.log('');
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'setup';

    const setup = new DataManagementSetup();

    switch (command) {
        case 'setup':
            await setup.setup();
            break;

        case 'verify':
            await setup.verifyDatabaseSchema();
            console.log('✅ Database schema verification completed');
            break;

        case 'assess':
            await setup.runInitialAssessment();
            console.log('✅ Data assessment completed');
            break;

        case 'config':
            await setup.createConfigurationFile();
            console.log('✅ Configuration file created');
            break;

        default:
            console.log('Usage: node scripts/data-management-setup.js [command]');
            console.log('');
            console.log('Commands:');
            console.log('  setup   - Complete setup (default)');
            console.log('  verify  - Verify database schema');
            console.log('  assess  - Run data assessment');
            console.log('  config  - Create configuration file');
            process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

export default DataManagementSetup;