import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const SERVICES = ["nginx", "php8.1-fpm", "mysql", "redis-server"];
const WEBSITES = [
    "https://saraivavision.com.br",
    "https://blog.saraivavision.com.br",
    "http://cms.saraivavision.com.br"
];
const APIS = [
    "https://saraivavision.com.br/api/health",
    "https://blog.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1",
    "https://saraivavision.com.br/graphql"
];

async function checkService(service) {
    try {
        const { stdout } = await execAsync(`systemctl is-active ${service}`);
        const status = stdout.trim();
        return {
            status: status === 'active' ? 'running' : 'stopped',
            details: `Service is ${status === 'active' ? 'active and running' : 'enabled but not running'}`
        };
    } catch (error) {
        return {
            status: 'not_installed',
            details: 'Service not found or not installed'
        };
    }
}

async function checkWebsite(url) {
    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'SaraivaVision-HealthCheck/1.0'
            }
        });
        const responseTime = Date.now() - startTime;

        let status = 'unknown';
        let details = `HTTP ${response.status}, ${responseTime}ms response time`;

        if (response.status === 200) {
            status = 'healthy';
        } else if (response.status >= 300 && response.status < 400) {
            status = 'redirect';
        } else if (response.status >= 400) {
            status = 'error';
        } else {
            status = 'warning';
        }

        // Check SSL for HTTPS
        if (url.startsWith('https://')) {
            try {
                // Simple SSL check - in production you'd want more robust checking
                const sslResponse = await fetch(url.replace('https://', 'http://'), {
                    timeout: 5000
                });
                // If we can reach HTTP but not HTTPS, SSL might be an issue
                if (sslResponse.status >= 400) {
                    details += ', SSL certificate may have issues';
                    if (status === 'healthy') status = 'warning';
                }
            } catch (sslError) {
                // SSL check failed, but this might be expected
            }
        }

        return { status, details };
    } catch (error) {
        return {
            status: 'down',
            details: `Connection failed: ${error.message}`
        };
    }
}

async function checkAPI(url) {
    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'SaraivaVision-HealthCheck/1.0'
            }
        });
        const responseTime = Date.now() - startTime;

        let status = 'unknown';
        let details = `HTTP ${response.status}, ${responseTime}ms response time`;

        if (response.status === 200) {
            status = 'healthy';
        } else if (response.status >= 400) {
            status = 'error';
        } else {
            status = 'warning';
        }

        return { status, details };
    } catch (error) {
        return {
            status: 'down',
            details: `API unreachable: ${error.message}`
        };
    }
}

async function checkSystemResources() {
    try {
        // CPU usage
        const { stdout: cpuStdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed \"s/.*, *\\([0-9.]*\\)%* id.*/\\1/\" | awk '{print 100 - $1}'");
        const cpuUsage = parseFloat(cpuStdout.trim());

        // Memory usage
        const { stdout: memStdout } = await execAsync("free -m | awk 'NR==2{printf \"%.0f %.0f\", $2, $3}'");
        const [memTotal, memUsed] = memStdout.trim().split(' ').map(Number);
        const memPercent = Math.round((memUsed / memTotal) * 100);

        // Disk usage
        const { stdout: diskStdout } = await execAsync("df / | tail -1 | awk '{print $5}' | sed 's/%//'");
        const diskUsage = parseInt(diskStdout.trim());

        return {
            cpu: {
                status: cpuUsage < 80 ? 'healthy' : 'warning',
                details: `CPU usage: ${cpuUsage.toFixed(1)}%`
            },
            memory: {
                status: memPercent < 90 ? 'healthy' : 'warning',
                details: `Memory usage: ${memUsed}MB/${memTotal}MB (${memPercent}%)`
            },
            disk: {
                status: diskUsage < 90 ? 'healthy' : 'warning',
                details: `Disk usage: ${diskUsage}%`
            }
        };
    } catch (error) {
        return {
            cpu: { status: 'unknown', details: 'Unable to check CPU usage' },
            memory: { status: 'unknown', details: 'Unable to check memory usage' },
            disk: { status: 'unknown', details: 'Unable to check disk usage' }
        };
    }
}

async function checkDatabase() {
    try {
        await execAsync('mysql -e "SELECT 1;"');
        return {
            status: 'healthy',
            details: 'MySQL connection successful'
        };
    } catch (error) {
        return {
            status: 'error',
            details: 'MySQL connection failed'
        };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const timestamp = new Date().toISOString();
        const results = {};

        // Check services
        await Promise.all(
            SERVICES.map(async (service) => {
                const result = await checkService(service);
                results[`service_${service}`] = result;
            })
        );

        // Check websites
        await Promise.all(
            WEBSITES.map(async (website) => {
                const domain = website.replace('https://', '').replace('http://', '').split('/')[0];
                const result = await checkWebsite(website);
                results[`website_${domain}`] = result;
            })
        );

        // Check APIs
        await Promise.all(
            APIS.map(async (api) => {
                const apiName = api.replace('https://', '').replace('http://', '').split('/').slice(1).join('_').replace(/[^a-zA-Z0-9]/g, '_');
                const result = await checkAPI(api);
                results[`api_${apiName}`] = result;
            })
        );

        // Check system resources
        const systemResources = await checkSystemResources();
        Object.entries(systemResources).forEach(([resource, data]) => {
            results[`system_${resource}`] = data;
        });

        // Check database
        const databaseResult = await checkDatabase();
        results['database_mysql'] = databaseResult;

        // Determine overall status
        let overallStatus = 'healthy';
        let errorCount = 0;
        let warningCount = 0;

        Object.values(results).forEach(check => {
            if (check.status === 'error' || check.status === 'down') {
                overallStatus = 'error';
                errorCount++;
            } else if (check.status === 'warning' && overallStatus === 'healthy') {
                overallStatus = 'warning';
                warningCount++;
            }
        });

        const response = {
            timestamp,
            overall_status: overallStatus,
            checks: results
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            timestamp: new Date().toISOString(),
            overall_status: 'error',
            error: 'Health check failed',
            details: error.message
        });
    }
}