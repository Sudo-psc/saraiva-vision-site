/**
 * Environment-Specific Configuration Management
 * Requirements: 6.1, 6.2, 8.1 - Configuration management and security
 */

const environments = {
    development: {
        name: 'development',
        api: {
            baseUrl: 'http://localhost:3000',
            timeout: 30000,
            retries: 3,
            rateLimit: {
                windowMs: 60000, // 1 minute
                maxRequests: 100
            }
        },
        gemini: {
            model: 'gemini-2.0-flash-exp',
            maxTokens: 8192,
            temperature: 0.7,
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_MEDICAL_ADVICE',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        },
        database: {
            connectionPool: {
                min: 2,
                max: 10,
                acquireTimeoutMillis: 30000,
                idleTimeoutMillis: 30000
            },
            ssl: false,
            logging: true
        },
        cache: {
            ttl: 300, // 5 minutes
            maxSize: 1000,
            enabled: true
        },
        security: {
            encryption: {
                algorithm: 'AES-256-GCM',
                keyRotationDays: 30
            },
            session: {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                secure: false,
                httpOnly: true
            },
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001'],
                credentials: true
            }
        },
        compliance: {
            cfm: {
                strictMode: true,
                emergencyResponseTime: 1000, // 1 second
                disclaimerRequired: true
            },
            lgpd: {
                consentRequired: true,
                dataRetentionDays: 365,
                auditLogging: true
            }
        },
        monitoring: {
            enabled: true,
            logLevel: 'debug',
            metricsInterval: 60000, // 1 minute
            healthCheckInterval: 30000 // 30 seconds
        },
        features: {
            realTimeChat: true,
            appointmentBooking: true,
            medicalReferrals: false, // Not implemented yet
            voiceInput: false,
            fileUpload: false,
            multiLanguage: false
        }
    },

    staging: {
        name: 'staging',
        api: {
            baseUrl: 'https://staging-api.saraivavision.com',
            timeout: 30000,
            retries: 3,
            rateLimit: {
                windowMs: 60000,
                maxRequests: 200
            }
        },
        gemini: {
            model: 'gemini-2.0-flash-exp',
            maxTokens: 8192,
            temperature: 0.6,
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_MEDICAL_ADVICE',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        },
        database: {
            connectionPool: {
                min: 5,
                max: 20,
                acquireTimeoutMillis: 30000,
                idleTimeoutMillis: 30000
            },
            ssl: true,
            logging: false
        },
        cache: {
            ttl: 600, // 10 minutes
            maxSize: 5000,
            enabled: true
        },
        security: {
            encryption: {
                algorithm: 'AES-256-GCM',
                keyRotationDays: 15
            },
            session: {
                maxAge: 12 * 60 * 60 * 1000, // 12 hours
                secure: true,
                httpOnly: true
            },
            cors: {
                origin: ['https://staging.saraivavision.com'],
                credentials: true
            }
        },
        compliance: {
            cfm: {
                strictMode: true,
                emergencyResponseTime: 500,
                disclaimerRequired: true
            },
            lgpd: {
                consentRequired: true,
                dataRetentionDays: 365,
                auditLogging: true
            }
        },
        monitoring: {
            enabled: true,
            logLevel: 'info',
            metricsInterval: 30000,
            healthCheckInterval: 15000
        },
        features: {
            realTimeChat: true,
            appointmentBooking: true,
            medicalReferrals: false,
            voiceInput: false,
            fileUpload: false,
            multiLanguage: false
        }
    },

    production: {
        name: 'production',
        api: {
            baseUrl: 'https://api.saraivavision.com',
            timeout: 30000,
            retries: 5,
            rateLimit: {
                windowMs: 60000,
                maxRequests: 500
            }
        },
        gemini: {
            model: 'gemini-2.0-flash-exp',
            maxTokens: 8192,
            temperature: 0.5,
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_MEDICAL_ADVICE',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        },
        database: {
            connectionPool: {
                min: 10,
                max: 50,
                acquireTimeoutMillis: 30000,
                idleTimeoutMillis: 30000
            },
            ssl: true,
            logging: false
        },
        cache: {
            ttl: 1800, // 30 minutes
            maxSize: 10000,
            enabled: true
        },
        security: {
            encryption: {
                algorithm: 'AES-256-GCM',
                keyRotationDays: 7
            },
            session: {
                maxAge: 8 * 60 * 60 * 1000, // 8 hours
                secure: true,
                httpOnly: true
            },
            cors: {
                origin: ['https://saraivavision.com', 'https://www.saraivavision.com'],
                credentials: true
            }
        },
        compliance: {
            cfm: {
                strictMode: true,
                emergencyResponseTime: 300,
                disclaimerRequired: true
            },
            lgpd: {
                consentRequired: true,
                dataRetentionDays: 365,
                auditLogging: true
            }
        },
        monitoring: {
            enabled: true,
            logLevel: 'warn',
            metricsInterval: 15000,
            healthCheckInterval: 10000
        },
        features: {
            realTimeChat: true,
            appointmentBooking: true,
            medicalReferrals: true,
            voiceInput: false,
            fileUpload: false,
            multiLanguage: false
        }
    }
};

export default environments;