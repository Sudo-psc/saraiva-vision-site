/**
 * Feature Flags System
 * Enables gradual rollout and A/B testing of chatbot features
 * Requirements: 6.1, 6.2 - Feature management and gradual rollout
 */

import configManager from './configManager.js';

class FeatureFlagManager {
    constructor() {
        this.flags = new Map();
        this.userSegments = new Map();
        this.experiments = new Map();
        this.rolloutStrategies = new Map();

        this.initializeDefaultFlags();
        this.setupRolloutStrategies();
    }

    initializeDefaultFlags() {
        // Core chatbot features
        this.defineFlag('chatbot_enabled', {
            description: 'Enable/disable the entire chatbot system',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('real_time_chat', {
            description: 'Enable real-time WebSocket chat functionality',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('appointment_booking', {
            description: 'Enable appointment booking through chat',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        // Advanced features
        this.defineFlag('medical_referrals', {
            description: 'Enable medical referral management system',
            defaultValue: false,
            environments: {
                development: false,
                staging: false,
                production: false
            },
            rolloutStrategy: 'gradual_rollout',
            rolloutPercentage: 0
        });

        this.defineFlag('voice_input', {
            description: 'Enable voice input for chat messages',
            defaultValue: false,
            environments: {
                development: true,
                staging: false,
                production: false
            },
            rolloutStrategy: 'beta_users',
            rolloutPercentage: 10
        });

        this.defineFlag('file_upload', {
            description: 'Enable file upload functionality',
            defaultValue: false,
            environments: {
                development: true,
                staging: false,
                production: false
            },
            rolloutStrategy: 'beta_users',
            rolloutPercentage: 5
        });

        this.defineFlag('multi_language', {
            description: 'Enable multi-language support',
            defaultValue: false,
            environments: {
                development: false,
                staging: false,
                production: false
            },
            rolloutStrategy: 'gradual_rollout',
            rolloutPercentage: 0
        });

        // Experimental features
        this.defineFlag('ai_diagnosis_assistance', {
            description: 'AI-powered diagnosis assistance (experimental)',
            defaultValue: false,
            environments: {
                development: false,
                staging: false,
                production: false
            },
            rolloutStrategy: 'internal_only',
            rolloutPercentage: 0
        });

        this.defineFlag('smart_scheduling', {
            description: 'AI-powered smart appointment scheduling',
            defaultValue: false,
            environments: {
                development: true,
                staging: false,
                production: false
            },
            rolloutStrategy: 'gradual_rollout',
            rolloutPercentage: 25
        });

        this.defineFlag('conversation_analytics', {
            description: 'Advanced conversation analytics and insights',
            defaultValue: false,
            environments: {
                development: true,
                staging: true,
                production: false
            },
            rolloutStrategy: 'gradual_rollout',
            rolloutPercentage: 50
        });

        // Performance and optimization features
        this.defineFlag('response_caching', {
            description: 'Enable intelligent response caching',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('performance_monitoring', {
            description: 'Enable detailed performance monitoring',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('auto_scaling', {
            description: 'Enable automatic resource scaling',
            defaultValue: false,
            environments: {
                development: false,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        // Security and compliance features
        this.defineFlag('enhanced_security', {
            description: 'Enable enhanced security measures',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('audit_logging', {
            description: 'Enable comprehensive audit logging',
            defaultValue: true,
            environments: {
                development: true,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });

        this.defineFlag('data_anonymization', {
            description: 'Enable automatic data anonymization',
            defaultValue: true,
            environments: {
                development: false,
                staging: true,
                production: true
            },
            rolloutStrategy: 'all_users'
        });
    }

    setupRolloutStrategies() {
        this.rolloutStrategies.set('all_users', {
            name: 'All Users',
            evaluate: () => true
        });

        this.rolloutStrategies.set('internal_only', {
            name: 'Internal Only',
            evaluate: (user) => user?.isInternal || false
        });

        this.rolloutStrategies.set('beta_users', {
            name: 'Beta Users',
            evaluate: (user) => user?.isBetaUser || false
        });

        this.rolloutStrategies.set('gradual_rollout', {
            name: 'Gradual Rollout',
            evaluate: (user, flag) => {
                const percentage = flag.rolloutPercentage || 0;
                const userId = user?.id || 'anonymous';
                const hash = this.hashUserId(userId + flag.name);
                return (hash % 100) < percentage;
            }
        });

        this.rolloutStrategies.set('geographic', {
            name: 'Geographic Rollout',
            evaluate: (user, flag) => {
                const allowedRegions = flag.allowedRegions || [];
                return allowedRegions.includes(user?.region);
            }
        });

        this.rolloutStrategies.set('device_type', {
            name: 'Device Type Rollout',
            evaluate: (user, flag) => {
                const allowedDevices = flag.allowedDevices || [];
                return allowedDevices.includes(user?.deviceType);
            }
        });
    }

    defineFlag(name, config) {
        this.flags.set(name, {
            name,
            ...config,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    isEnabled(flagName, user = null, context = {}) {
        const flag = this.flags.get(flagName);

        if (!flag) {
            console.warn(`Feature flag not found: ${flagName}`);
            return false;
        }

        // Check environment-specific setting
        const environment = configManager.getEnvironment();
        const envValue = flag.environments?.[environment];

        if (envValue === false) {
            return false;
        }

        if (envValue === true) {
            return this.evaluateRolloutStrategy(flag, user, context);
        }

        // Fall back to default value and rollout strategy
        if (flag.defaultValue === false) {
            return false;
        }

        return this.evaluateRolloutStrategy(flag, user, context);
    }

    evaluateRolloutStrategy(flag, user, context) {
        const strategy = this.rolloutStrategies.get(flag.rolloutStrategy);

        if (!strategy) {
            console.warn(`Rollout strategy not found: ${flag.rolloutStrategy}`);
            return flag.defaultValue;
        }

        try {
            return strategy.evaluate(user, flag, context);
        } catch (error) {
            console.error(`Error evaluating rollout strategy for ${flag.name}:`, error);
            return flag.defaultValue;
        }
    }

    // Enable/disable flags dynamically
    enableFlag(flagName, environment = null) {
        const flag = this.flags.get(flagName);
        if (!flag) {
            throw new Error(`Feature flag not found: ${flagName}`);
        }

        if (environment) {
            flag.environments[environment] = true;
        } else {
            flag.defaultValue = true;
        }

        flag.updatedAt = new Date();
        this.notifyFlagChange(flagName, true);
    }

    disableFlag(flagName, environment = null) {
        const flag = this.flags.get(flagName);
        if (!flag) {
            throw new Error(`Feature flag not found: ${flagName}`);
        }

        if (environment) {
            flag.environments[environment] = false;
        } else {
            flag.defaultValue = false;
        }

        flag.updatedAt = new Date();
        this.notifyFlagChange(flagName, false);
    }

    // Update rollout percentage for gradual rollouts
    updateRolloutPercentage(flagName, percentage) {
        const flag = this.flags.get(flagName);
        if (!flag) {
            throw new Error(`Feature flag not found: ${flagName}`);
        }

        if (percentage < 0 || percentage > 100) {
            throw new Error('Rollout percentage must be between 0 and 100');
        }

        flag.rolloutPercentage = percentage;
        flag.updatedAt = new Date();
        this.notifyFlagChange(flagName, percentage);
    }

    // Get all flags with their current status
    getAllFlags(user = null, context = {}) {
        const result = {};

        for (const [name, flag] of this.flags) {
            result[name] = {
                enabled: this.isEnabled(name, user, context),
                description: flag.description,
                rolloutStrategy: flag.rolloutStrategy,
                rolloutPercentage: flag.rolloutPercentage,
                environments: flag.environments,
                updatedAt: flag.updatedAt
            };
        }

        return result;
    }

    // Get flags for a specific category
    getFlagsByCategory(category, user = null, context = {}) {
        const categoryFlags = {};

        for (const [name, flag] of this.flags) {
            if (flag.category === category) {
                categoryFlags[name] = this.isEnabled(name, user, context);
            }
        }

        return categoryFlags;
    }

    // A/B Testing support
    createExperiment(name, variants, trafficAllocation = {}) {
        this.experiments.set(name, {
            name,
            variants,
            trafficAllocation,
            createdAt: new Date(),
            active: true
        });
    }

    getExperimentVariant(experimentName, user) {
        const experiment = this.experiments.get(experimentName);

        if (!experiment || !experiment.active) {
            return null;
        }

        const userId = user?.id || 'anonymous';
        const hash = this.hashUserId(userId + experimentName);
        const variants = Object.keys(experiment.variants);
        const variantIndex = hash % variants.length;

        return variants[variantIndex];
    }

    // User segmentation
    defineUserSegment(name, criteria) {
        this.userSegments.set(name, {
            name,
            criteria,
            createdAt: new Date()
        });
    }

    isUserInSegment(segmentName, user) {
        const segment = this.userSegments.get(segmentName);

        if (!segment) {
            return false;
        }

        try {
            return segment.criteria(user);
        } catch (error) {
            console.error(`Error evaluating user segment ${segmentName}:`, error);
            return false;
        }
    }

    // Utility methods
    hashUserId(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    notifyFlagChange(flagName, value) {
        // This could integrate with monitoring systems
        console.log(`Feature flag changed: ${flagName} = ${value}`);
    }

    // Export/import for configuration management
    exportFlags() {
        const flags = {};
        for (const [name, flag] of this.flags) {
            flags[name] = {
                description: flag.description,
                defaultValue: flag.defaultValue,
                environments: flag.environments,
                rolloutStrategy: flag.rolloutStrategy,
                rolloutPercentage: flag.rolloutPercentage
            };
        }
        return flags;
    }

    importFlags(flagsData) {
        Object.entries(flagsData).forEach(([name, config]) => {
            this.defineFlag(name, config);
        });
    }

    // Health check
    healthCheck() {
        return {
            totalFlags: this.flags.size,
            enabledFlags: Array.from(this.flags.values()).filter(f => f.defaultValue).length,
            experiments: this.experiments.size,
            userSegments: this.userSegments.size,
            rolloutStrategies: this.rolloutStrategies.size,
            healthy: true,
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
const featureFlagManager = new FeatureFlagManager();

export default featureFlagManager;
export { FeatureFlagManager };