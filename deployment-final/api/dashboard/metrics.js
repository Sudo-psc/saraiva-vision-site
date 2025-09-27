import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get contact messages metrics
        const { data: contactStats, error: contactError } = await supabase
            .from('contact_messages')
            .select('created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (contactError) throw contactError;

        // Get appointments metrics
        const { data: appointmentStats, error: appointmentError } = await supabase
            .from('appointments')
            .select('created_at, status')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (appointmentError) throw appointmentError;

        // Get message outbox metrics
        const { data: outboxStats, error: outboxError } = await supabase
            .from('message_outbox')
            .select('status, retry_count, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (outboxError) throw outboxError;

        // Get error logs
        const { data: errorLogs, error: errorLogError } = await supabase
            .from('event_log')
            .select('severity, created_at')
            .eq('severity', 'error')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (errorLogError) throw errorLogError;

        // Calculate KPIs
        const metrics = {
            contacts: {
                total24h: contactStats?.length || 0,
                hourlyRate: Math.round((contactStats?.length || 0) / 24 * 10) / 10
            },
            appointments: {
                total24h: appointmentStats?.length || 0,
                confirmed: appointmentStats?.filter(a => a.status === 'confirmed').length || 0,
                pending: appointmentStats?.filter(a => a.status === 'pending').length || 0,
                cancelled: appointmentStats?.filter(a => a.status === 'cancelled').length || 0,
                conversionRate: appointmentStats?.length > 0
                    ? Math.round((appointmentStats.filter(a => a.status === 'confirmed').length / appointmentStats.length) * 100)
                    : 0
            },
            messaging: {
                totalMessages: outboxStats?.length || 0,
                sent: outboxStats?.filter(m => m.status === 'sent').length || 0,
                pending: outboxStats?.filter(m => m.status === 'pending').length || 0,
                failed: outboxStats?.filter(m => m.status === 'failed').length || 0,
                deliveryRate: outboxStats?.length > 0
                    ? Math.round((outboxStats.filter(m => m.status === 'sent').length / outboxStats.length) * 100)
                    : 100
            },
            system: {
                errors24h: errorLogs?.length || 0,
                errorRate: Math.round((errorLogs?.length || 0) / 24 * 10) / 10,
                uptime: 99.9, // This would be calculated from actual monitoring data
                lastUpdated: new Date().toISOString()
            }
        };

        res.status(200).json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard metrics',
            timestamp: new Date().toISOString()
        });
    }
}