/**
 * Configuration Validator
 * Validates configuration settings and environment setup
 * Requirements: 6.1, 6.2, 8.1 - Configuration validation and testing
 */

import { z } from 'zod';
import configManager from './configManager.js';
import featureFlagManager from './featureFlags.js';

class ConfigValidator {
    constructor() {
        this.validationRules = new Map();
        this.environmentChecks = new Map();
        this.securityChecks = new Map();
        this.complianceChecks = new Map();

        this.initializeValidationRules();
        this.initializeEnvironmentChecks();
        this.initializeSecurityChecks();
        this.initializeComplianceChecks();
    }

    initializeValidationRules() {
        // API Configuration Validation
        this.validationRules.set('api', {
            name: 'API Configuration',
            validate: (config) => {
                const schema = z.object({
                    baseUrl: z.string().url('Invalid API base URL'),
                    timeout: z.number().min(1000).max(60000, 'Timeout must be between 1-60 seconds'),
                    retries: z.number().min(1).max(10, 'Retries must be between 1-10'),
                    rateLimit: z.object({
                        windowMs: z.number().min(1000, 'Rate limit window must be at least 1 second'),
                        maxRequests: z.number().min(1, 'Max requests must be at least 1')
                    })
                });
                return schema.parse(config);
            }
        });

        // Gemini Configuration Validation
        this.validationRules.set('gemini', {
            name: 'Gemini AI Configuration',
            validate: (config) => {
                const schema = z.object({
                    model: z.string().min(1, 'Gemini model name is required'),
                    maxTokens: z.number().min(100).max(32768, 'Max tokens must be between 100-32768'),
                    temperature: z.number().min(0).max(2, 'Temperature must be between 0-2'),
                    safetySettings: z.array(z.object({
                        category: z.string(),
                        threshold: z.string()
                    })).min(1, 'At least one safety setting is required')
                });
                return schema.parse(config);
            }
        });

        // Database Configuration Validation
        this.validationRules.set('database', {
            name: 'Database Configuration',
            validate: (config) => {
                const schema = z.object({
                    connectionPool: z.object({
                        min: z.number().min(1, 'Minimum connections must be at least 1'),
                        max: z.number().min(1, 'Maximum connections must be at least 1'),
                        acquireTimeoutMillis: z.number().min(1000, 'Acquire timeout must be at least 1 second'),
                        idleTimeoutMillis: z.number().min(1000, 'Idle timeout must be at least 1 second')
                    }),
                    ssl: z.boolean(),
                    logging: z.boolean()
                });

                const result = schema.parse(config);

                // Additional validation
                if (result.connectionPool.min > result.connectionPool.max) {
                    throw new Error('Minimum connections cannot be greater than maximum connections');
                }

                return result;
            }
        });

        // Security Configuration Validation
        this.validationRules.set('security', {
            name: 'Security Configuration',
            validate: (config) => {
                const schema = z.object({
                    encryption: z.object({
                        algorithm: z.enum(['AES-256-GCM'], 'Only AES-256-GCM encryption is supported'),
                        keyRotationDays: z.number().min(1).max(365, 'Key rotation must be between 1-365 days')
                    }),
                    session: z.object({
                        maxAge: z.number().min(300000, 'Session max age must be at least 5 minutes'),
                        secure: z.boolean(),
                        httpOnly: z.boolean()
                    }),
                    cors: z.object({
                        origin: z.array(z.string().url()).min(1, 'At least one CORS origin is required'),
                        credentials: z.boolean()
                    })
                });
                return schema.parse(config);
            }
        });

        // Compliance Configuration Validation
        this.validationRules.set('compliance', {
            name: 'Compliance Configuration',
            validate: (config) => {
                const schema = z.object({
                    cfm: z.object({
                        strictMode: z.boolean(),
                        emergencyResponseTime: z.number().min(100).max(5000, 'Emergency response time must be between 100ms-5s'),
                        disclaimerRequired: z.boolean()
                    }),
                    lgpd: z.object({
                        consentRequired: z.boolean(),
                        dataRetentionDays: z.number().min(30).max(2555, 'Data retention must be between 30 days-7 years'),
                        auditLogging: z.boolean()
                    })
                });
                return schema.parse(config);
            }
        });
    }

    initializeEnvironmentChecks() {
        // Required Environment Variables
        this.environmentChecks.set('required_env_vars', {
            name: 'Required Environment Variables',
            check: () => {
                const required = [
                    'GOOGLE_GEMINI_API_KEY',
                    'NEXT_PUBLIC_SUPABASE_URL',
                    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                    'SUPABASE_SERVICE_ROLE_KEY',
                    'ENCRYPTION_KEY'
                ];

                const missing = required.filter(envVar => !process.env[envVar]);

                if (missing.length > 0) {
                    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
                }

                return { status: 'passed', message: 'All required environment variables are present' };
            }
        });

        // API Key Validation
        this.environmentChecks.set('api_key_validation', {
            name: 'API Key Validation',
            check: () => {
                const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

                if (!geminiKey) {
                    throw new Error('GOOGLE_GEMINI_API_KEY is missing');
                }

                if (geminiKey.length < 20) {
                    throw new Error('GOOGLE_GEMINI_API_KEY appears to be invalid (too short)');
                }

                if (!geminiKey.startsWith('AI')) {
                    console.warn('GOOGLE_GEMINI_API_KEY format may be incorrect (should start with "AI")');
                }

                return { status: 'passed', message: 'API key validation passed' };
            }
        });

        // Encryption Key Validation
        this.environmentChecks.set('encryption_key_validation', {
            name: 'Encryption Key Validation',
            check: () => {
                const encryptionKey = process.env.ENCRYPTION_KEY;

                if (!encryptionKey) {
                    throw new Error('ENCRYPTION_KEY is missing');
                }

                if (encryptionKey.length < 32) {
                    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
                }

                return { status: 'passed', message: 'Encryption key validation passed' };
            }
        });

        // Database URL Validation
        this.environmentChecks.set('database_url_validation', {
            name: 'Database URL Validation',
            check: () => {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

                if (!supabaseUrl) {
                    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
                }

                try {
                    new URL(supabaseUrl);
                } catch (error) {
                    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
                }

                if (!supabaseUrl.includes('supabase')) {
                    console.warn('Database URL may not be a Supabase URL');
                }

                return { status: 'passed', message: 'Database URL validation passed' };
            }
        });
    }

    initializeSecurityChecks() {
        // Production Security Settings
        this.securityChecks.set('production_security', {
            name: 'Production Security Settings',
            check: () => {
                if (!configManager.isProduction()) {
                    return { status: 'skipped', message: 'Not in production environment' };
                }

                const securityConfig = configManager.getSecurityConfig();
                const issues = [];

                if (!securityConfig.session.secure) {
                    issues.push('Session cookies must be secure in production');
                }

                if (!securityConfig.session.httpOnly) {
                    issues.push('Session cookies must be httpOnly in production');
                }

                if (securityConfig.cors.origin.includes('http://')) {
                    issues.push('CORS origins should use HTTPS in production');
                }

                if (issues.length > 0) {
                    throw new Error(`Security issues found: ${issues.join(', ')}`);
                }

                return { status: 'passed', message: 'Production security settings are correct' };
            }
        });

        // SSL/TLS Configuration
        this.securityChecks.set('ssl_configuration', {
            name: 'SSL/TLS Configuration',
            check: () => {
                const dbConfig = configManager.getDatabaseConfig();

                if (configManager.isProduction() && !dbConfig.ssl) {
                    throw new Error('SSL must be enabled for database connections in production');
                }

                return { status: 'passed', message: 'SSL configuration is correct' };
            }
        });

        // Rate Limiting Configuration
        this.securityChecks.set('rate_limiting', {
            name: 'Rate Limiting Configuration',
            check: () => {
                const apiConfig = configManager.getApiConfig();

                if (apiConfig.rateLimit.maxRequests > 1000) {
                    console.warn('Rate limit is very high, consider reducing for better security');
                }

                if (apiConfig.rateLimit.windowMs < 60000) {
                    console.warn('Rate limit window is very short, consider increasing');
                }

                return { status: 'passed', message: 'Rate limiting configuration is acceptable' };
            }
        });
    }

    initializeComplianceChecks() {
        // CFM Compliance Settings
        this.complianceChecks.set('cfm_compliance', {
            name: 'CFM Compliance Settings',
            check: () => {
                const complianceConfig = configManager.getComplianceConfig();
                const issues = [];

                if (!complianceConfig.cfm.strictMode) {
                    issues.push('CFM strict mode should be enabled');
                }

                if (!complianceConfig.cfm.disclaimerRequired) {
                    issues.push('Medical disclaimers must be required');
                }

                if (complianceConfig.cfm.emergencyResponseTime > 1000) {
                    issues.push('Emergency response time should be under 1 second');
                }

                if (issues.length > 0) {
                    throw new Error(`CFM compliance issues: ${issues.join(', ')}`);
                }

                return { status: 'passed', message: 'CFM compliance settings are correct' };
            }
        });

        // LGPD Compliance Settings
        this.complianceChecks.set('lgpd_compliance', {
            name: 'LGPD Compliance Settings',
            check: () => {
                const complianceConfig = configManager.getComplianceConfig();
                const issues = [];

                if (!complianceConfig.lgpd.consentRequired) {
                    issues.push('LGPD consent must be required');
                }

                if (!complianceConfig.lgpd.auditLogging) {
                    issues.push('LGPD audit logging must be enabled');
                }

                if (complianceConfig.lgpd.dataRetentionDays > 2555) { // 7 years
                    issues.push('Data retention period exceeds LGPD recommendations');
                }

                if (issues.length > 0) {
                    throw new Error(`LGPD compliance issues: ${issues.join(', ')}`);
                }

                return { status: 'passed', message: 'LGPD compliance settings are correct' };
            }
        });

        // Feature Flag Compliance
        this.complianceChecks.set('feature_flag_compliance', {
            name: 'Feature Flag Compliance',
            check: () => {
                const issues = [];

                // Check that medical referrals are disabled if not properly implemented
                if (featureFlagManager.isEnabled('medical_referrals') && configManager.isProduction()) {
                    issues.push('Medical referrals should not be enabled in production without proper implementation');
                }

                // Check that experimental features are not enabled in production
                if (featureFlagManager.isEnabled('ai_diagnosis_assistance') && configManager.isProduction()) {
                    issues.push('AI diagnosis assistance should not be enabled in production');
                }

                if (issues.length > 0) {
                    throw new Error(`Feature flag compliance issues: ${issues.join(', ')}`);
                }

                return { status: 'passed', message: 'Feature flag compliance is correct' };
            }
        });
    }

    // Main validation methods
    validateConfiguration() {
        const results = {
            overall: { status: 'passed', errors: [], warnings: [] },
            sections: {}
        };

        // Validate each configuration section
        for (const [section, rule] of this.validationRules) {
            try {
                const config = configManager.get(section);
                rule.validate(config);
                results.sections[section] = { status: 'passed', message: `${rule.name} validation passed` };
            } catch (error) {
                results.sections[section] = { status: 'failed', error: error.message };
                results.overall.errors.push(`${rule.name}: ${error.message}`);
                results.overall.status = 'failed';
            }
        }

        return results;
    }

    validateEnvironment() {
        const results = {
            overall: { status: 'passed', errors: [], warnings: [] },
            checks: {}
        };

        // Run environment checks
        for (const [checkName, check] of this.environmentChecks) {
            try {
                const result = check.check();
                results.checks[checkName] = result;
            } catch (error) {
                results.checks[checkName] = { status: 'failed', error: error.message };
                results.overall.errors.push(`${check.name}: ${error.message}`);
                results.overall.status = 'failed';
            }
        }

        return results;
    }

    validateSecurity() {
        const results = {
            overall: { status: 'passed', errors: [], warnings: [] },
            checks: {}
        };

        // Run security checks
        for (const [checkName, check] of this.securityChecks) {
            try {
                const result = check.check();
                results.checks[checkName] = result;

                if (result.status === 'warning') {
                    results.overall.warnings.push(`${check.name}: ${result.message}`);
                }
            } catch (error) {
                results.checks[checkName] = { status: 'failed', error: error.message };
                results.overall.errors.push(`${check.name}: ${error.message}`);
                results.overall.status = 'failed';
            }
        }

        return results;
    }

    validateCompliance() {
        const results = {
            overall: { status: 'passed', errors: [], warnings: [] },
            checks: {}
        };

        // Run compliance checks
        for (const [checkName, check] of this.complianceChecks) {
            try {
                const result = check.check();
                results.checks[checkName] = result;
            } catch (error) {
                results.checks[checkName] = { status: 'failed', error: error.message };
                results.overall.errors.push(`${check.name}: ${error.message}`);
                results.overall.status = 'failed';
            }
        }

        return results;
    }

    // Comprehensive validation
    validateAll() {
        const results = {
            timestamp: new Date().toISOString(),
            environment: configManager.getEnvironment(),
            overall: { status: 'passed', errors: [], warnings: [] },
            configuration: null,
            environment_checks: null,
            security: null,
            compliance: null
        };

        // Run all validations
        results.configuration = this.validateConfiguration();
        results.environment_checks = this.validateEnvironment();
        results.security = this.validateSecurity();
        results.compliance = this.validateCompliance();

        // Aggregate results
        const allResults = [results.configuration, results.environment_checks, results.security, results.compliance];

        allResults.forEach(result => {
            if (result.overall.status === 'failed') {
                results.overall.status = 'failed';
                results.overall.errors.push(...result.overall.errors);
            }
            results.overall.warnings.push(...(result.overall.warnings || []));
        });

        return results;
    }

    // Test configuration with mock data
    testConfiguration(testConfig = {}) {
        const originalConfig = configManager.exportConfig();

        try {
            // Apply test configuration
            Object.entries(testConfig).forEach(([path, value]) => {
                configManager.set(path, value);
            });

            // Run validation
            const results = this.validateAll();

            return {
                success: results.overall.status === 'passed',
                results,
                testConfig
            };
        } finally {
            // Restore original configuration
            configManager.importConfig(originalConfig);
        }
    }

    // Generate configuration report
    generateReport() {
        const validation = this.validateAll();
        const config = configManager.exportConfig();
        const flags = featureFlagManager.getAllFlags();

        return {
            timestamp: new Date().toISOString(),
            environment: configManager.getEnvironment(),
            validation,
            configuration: config,
            featureFlags: flags,
            summary: {
                configurationValid: validation.overall.status === 'passed',
                totalErrors: validation.overall.errors.length,
                totalWarnings: validation.overall.warnings.length,
                enabledFeatures: Object.values(flags).filter(f => f.enabled).length,
                totalFeatures: Object.keys(flags).length
            }
        };
    }
}

// Create singleton instance
const configValidator = new ConfigValidator();

export default configValidator;
export { ConfigValidator };