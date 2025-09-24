import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check functions for external services
async function checkSupabase() {
    try {
        const { data, error } = await supabase
            .from('event_log')
            .select('id')
            .limit(1);

        return {
            service: 'Supabase',
            status: error ? 'down' : 'up',
            responseTime: Date.now(),
            error: error?.message
        };
    } catch (error) {
        return {
            service: 'Supabase',
            status: 'down',
            responseTime: null,
            error: error.message
        };
    }
}

async function checkWordPress() {
    try {
        const startTime = Date.now();
        const response = await fetch(process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: '{ generalSettings { title } }'
            }),
            timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        return {
            service: 'WordPress',
            status: response.ok ? 'up' : 'down',
            responseTime,
            error: response.ok ? null : `HTTP ${response.status}`
        };
    } catch (error) {
        return {
            service: 'WordPress',
            status: 'down',
            responseTime: null,
            error: error.message
        };
    }
}

async function checkResend() {
    try {
        const startTime = Date.now();
        const response = await fetch('https://api.resend.com/domains', {
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        return {
            service: 'Resend',
            status: response.ok ? 'up' : 'down',
            responseTime,
            error: response.ok ? null : `HTTP ${response.status}`
        };
    } catch (error) {
        return {
            service: 'Resend',
            status: 'down',
            responseTime: null,
            error: error.message
        };
    }
}

async function checkOpenAI() {
    try {
        const startTime = Date.now();
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        return {
            service: 'OpenAI',
            status: response.ok ? 'up' : 'down',
            responseTime,
            error: response.ok ? null : `HTTP ${response.status}`
        };
    } catch (error) {
        return {
            service: 'OpenAI',
            status: 'down',
            responseTime: null,
            error: error.message
        };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Run all health checks in parallel
        const healthChecks = await Promise.all([
            checkSupabase(),
            checkWordPress(),
            checkResend(),
            checkOpenAI()
        ]);

        // Calculate overall system health
        const totalServices = healthChecks.length;
        const upServices = healthChecks.filter(check => check.status === 'up').length;
        const overallStatus = upServices === totalServices ? 'healthy' :
            upServices >= totalServices / 2 ? 'degraded' : 'unhealthy';

        const healthReport = {
            overall: {
                status: overallStatus,
                upServices,
                totalServices,
                uptime: Math.round((upServices / totalServices) * 100)
            },
            services: healthChecks,
            timestamp: new Date().toISOString()
        };

        // Log health check results
        await supabase
            .from('event_log')
            .insert({
                event_type: 'health_check',
                event_data: healthReport,
                severity: overallStatus === 'healthy' ? 'info' : 'warn',
                source: 'dashboard_health_api'
            });

        res.status(200).json({
            success: true,
            data: healthReport
        });

    } catch (error) {
        console.error('Health check error:', error);

        // Log the error
        try {
            await supabase
                .from('event_log')
                .insert({
                    event_type: 'health_check_error',
                    event_data: { error: error.message },
                    severity: 'error',
                    source: 'dashboard_health_api'
                });
        } catch (logError) {
            console.error('Failed to log health check error:', logError);
        }

        res.status(500).json({
            success: false,
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
}