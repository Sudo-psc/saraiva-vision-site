/**
 * SSL Health Monitoring API Endpoints
 * Provides REST endpoints for SSL certificate health monitoring
 */

import express from 'express';
import { validateSSLCertificate, simpleGraphQLSSLCheck } from '../lib/sslValidation.js';
import { SSLHealthMonitor, SSLHealthStatus } from '../lib/sslHealthMonitor.js';

const router = express.Router();

/**
 * Validate domain name format to prevent injection attacks
 * @param {string} domain - Domain name to validate
 * @returns {boolean} True if valid domain name format
 */
function isValidDomain(domain) {
    // Regex for domain name validation
    // Allows: letters, numbers, hyphens, and dots
    // Must have at least one dot, no consecutive dots, and valid TLD
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)+$/;

    // Additional security checks
    if (!domain || typeof domain !== 'string') return false;
    if (domain.length > 253) return false; // Max domain length
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.includes('..')) return false;
    if (domain.includes('://') || domain.includes('/') || domain.includes('\\')) return false;
    if (domain.includes(' ') || domain.includes(';') || domain.includes('&')) return false;
    if (domain.includes('|') || domain.includes('>') || domain.includes('<')) return false;

    return domainRegex.test(domain);
}

/**
 * Validate domain name and return error response if invalid
 * @param {string} domain - Domain name to validate
 * @param {string} operation - Operation name for error message
 * @returns {Object|null} Error response object or null if valid
 */
function validateDomainRequest(domain, operation) {
    if (!isValidDomain(domain)) {
        return {
            success: false,
            error: 'Invalid domain format',
            message: `Invalid domain name format: ${domain}`,
            timestamp: new Date().toISOString()
        };
    }
    return null;
}

/**
 * @route GET /api/ssl/health
 * @desc Get comprehensive SSL health status for all domains
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        const monitor = new SSLHealthMonitor();
        const domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br',
            'www.saraivavision.com.br'
        ];

        // Execute all SSL checks concurrently for better performance
        const healthPromises = domains.map(async (domain) => {
            try {
                const status = await monitor.checkHealth(domain);
                return { domain, status, healthy: status.healthy };
            } catch (error) {
                return {
                    domain,
                    status: {
                        healthy: false,
                        error: error.message,
                        lastCheck: new Date().toISOString()
                    },
                    healthy: false
                };
            }
        });

        const results = await Promise.all(healthPromises);

        // Build results object and calculate overall health
        const domainResults = {};
        let overallHealthy = true;

        for (const result of results) {
            domainResults[result.domain] = result.status;
            if (!result.healthy) {
                overallHealthy = false;
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            overallHealthy,
            domains: domainResults,
            summary: {
                totalDomains: domains.length,
                healthyDomains: Object.values(domainResults).filter(r => r.healthy).length,
                expiringDomains: Object.values(domainResults).filter(r =>
                    r.certificateInfo?.daysUntilExpiry < 30
                ).length,
                errorsCount: Object.values(domainResults).filter(r => !r.healthy).length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'SSL health check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ssl/health/:domain
 * @desc Get SSL health status for a specific domain
 * @access Public
 */
router.get('/health/:domain', async (req, res) => {
    try {
        const { domain } = req.params;

        // Validate domain name to prevent injection attacks
        const validationError = validateDomainRequest(domain, 'SSL health check');
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const monitor = new SSLHealthMonitor();

        const status = await monitor.checkHealth(domain);

        res.json({
            success: true,
            domain,
            timestamp: new Date().toISOString(),
            status
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            domain: req.params.domain,
            error: 'SSL health check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ssl/certificate/:domain
 * @desc Get detailed SSL certificate information
 * @access Public
 */
router.get('/certificate/:domain', async (req, res) => {
    try {
        const { domain } = req.params;

        // Validate domain name to prevent injection attacks
        const validationError = validateDomainRequest(domain, 'certificate validation');
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const certificateInfo = await validateSSLCertificate(domain);

        res.json({
            success: true,
            domain,
            timestamp: new Date().toISOString(),
            certificate: certificateInfo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            domain: req.params.domain,
            error: 'Certificate validation failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ssl/graphql-status
 * @desc Check GraphQL endpoint SSL status
 * @access Public
 */
router.get('/graphql-status', async (req, res) => {
    try {
        const graphqlStatus = await simpleGraphQLSSLCheck();

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            graphql: graphqlStatus
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'GraphQL status check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/ssl/refresh
 * @desc Refresh SSL health monitoring data
 * @access Public
 */
router.post('/refresh', async (req, res) => {
    try {
        const monitor = new SSLHealthMonitor();
        const domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br',
            'www.saraivavision.com.br'
        ];

        // Execute all SSL checks concurrently for better performance
        const healthPromises = domains.map(async (domain) => {
            try {
                const status = await monitor.checkHealth(domain);
                return { domain, status, healthy: status.healthy };
            } catch (error) {
                return {
                    domain,
                    status: {
                        healthy: false,
                        error: error.message,
                        lastCheck: new Date().toISOString()
                    },
                    healthy: false
                };
            }
        });

        const results = await Promise.all(healthPromises);

        // Build results object and calculate overall health
        const domainResults = {};
        let overallHealthy = true;

        for (const result of results) {
            domainResults[result.domain] = result.status;
            if (!result.healthy) {
                overallHealthy = false;
            }
        }

        // Log refresh event
        console.log(`SSL health monitoring refreshed - Overall: ${overallHealthy ? 'Healthy' : 'Issues detected'}`);

        res.json({
            success: true,
            message: 'SSL health monitoring refreshed successfully',
            timestamp: new Date().toISOString(),
            overallHealthy,
            domains: domainResults
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'SSL refresh failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ssl/alerts
 * @desc Get active SSL alerts and warnings
 * @access Public
 */
router.get('/alerts', async (req, res) => {
    try {
        const monitor = new SSLHealthMonitor();
        const domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br',
            'www.saraivavision.com.br'
        ];

        // Execute all SSL checks concurrently for better performance
        const healthPromises = domains.map(async (domain) => {
            try {
                const status = await monitor.checkHealth(domain);
                return { domain, status, error: null };
            } catch (error) {
                return { domain, status: null, error: error.message };
            }
        });

        const results = await Promise.all(healthPromises);

        // Generate alerts based on SSL check results
        const alerts = [];

        for (const result of results) {
            const { domain, status, error } = result;

            if (error) {
                alerts.push({
                    type: 'error',
                    domain,
                    message: `SSL monitoring failed: ${error}`,
                    timestamp: new Date().toISOString(),
                    action: 'investigate'
                });
                continue;
            }

            // Certificate expiration alerts
            if (status.certificateInfo?.daysUntilExpiry < 7) {
                alerts.push({
                    type: 'critical',
                    domain,
                    message: `SSL certificate expires in ${status.certificateInfo.daysUntilExpiry} days`,
                    timestamp: new Date().toISOString(),
                    action: 'renew_immediately'
                });
            } else if (status.certificateInfo?.daysUntilExpiry < 30) {
                alerts.push({
                    type: 'warning',
                    domain,
                    message: `SSL certificate expires in ${status.certificateInfo.daysUntilExpiry} days`,
                    timestamp: new Date().toISOString(),
                    action: 'renew_soon'
                });
            }

            // Certificate validation errors
            if (!status.healthy && status.errors.length > 0) {
                alerts.push({
                    type: 'error',
                    domain,
                    message: `SSL certificate validation failed: ${status.errors[0]}`,
                    timestamp: new Date().toISOString(),
                    action: 'investigate'
                });
            }

            // GraphQL endpoint issues
            if (status.endpointStatus && !status.endpointStatus.ok) {
                alerts.push({
                    type: 'error',
                    domain,
                    message: `GraphQL endpoint SSL error: ${status.endpointStatus.error}`,
                    timestamp: new Date().toISOString(),
                    action: 'troubleshoot'
                });
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            alerts,
            summary: {
                totalAlerts: alerts.length,
                criticalAlerts: alerts.filter(a => a.type === 'critical').length,
                warningAlerts: alerts.filter(a => a.type === 'warning').length,
                errorAlerts: alerts.filter(a => a.type === 'error').length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch SSL alerts',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ssl/metrics
 * @desc Get SSL monitoring metrics for dashboard
 * @access Public
 */
router.get('/metrics', async (req, res) => {
    try {
        const monitor = new SSLHealthMonitor();
        const domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br',
            'www.saraivavision.com.br'
        ];

        const metrics = {
            domains: {},
            overall: {
                healthy: 0,
                warning: 0,
                error: 0,
                total: domains.length
            },
            certificates: {
                valid: 0,
                expiringSoon: 0,
                expired: 0,
                total: domains.length
            }
        };

        // Execute all SSL checks concurrently for better performance
        const healthPromises = domains.map(async (domain) => {
            try {
                const status = await monitor.checkHealth(domain);
                return { domain, status, error: null };
            } catch (error) {
                return { domain, status: null, error: error.message };
            }
        });

        const results = await Promise.all(healthPromises);

        // Process results and calculate metrics
        for (const result of results) {
            const { domain, status, error } = result;

            if (error) {
                metrics.domains[domain] = {
                    healthy: false,
                    error: error,
                    hasErrors: true
                };
                metrics.overall.error++;
                metrics.certificates.expired++;
                continue;
            }

            metrics.domains[domain] = {
                healthy: status.healthy,
                daysUntilExpiry: status.certificateInfo?.daysUntilExpiry || null,
                hasErrors: status.errors.length > 0,
                hasWarnings: status.warnings.length > 0,
                graphqlOk: status.endpointStatus?.ok || false
            };

            // Count overall status
            if (status.healthy) {
                metrics.overall.healthy++;
            } else if (status.errors.length > 0) {
                metrics.overall.error++;
            } else {
                metrics.overall.warning++;
            }

            // Count certificate status
            if (status.certificateInfo?.isValid) {
                metrics.certificates.valid++;

                if (status.certificateInfo.daysUntilExpiry < 0) {
                    metrics.certificates.expired++;
                } else if (status.certificateInfo.daysUntilExpiry < 30) {
                    metrics.certificates.expiringSoon++;
                }
            } else {
                metrics.certificates.expired++;
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            metrics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch SSL metrics',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;