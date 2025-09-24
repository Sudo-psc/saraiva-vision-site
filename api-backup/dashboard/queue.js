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
        // Get current queue status
        const { data: queueData, error: queueError } = await supabase
            .from('message_outbox')
            .select('*')
            .order('created_at', { ascending: false });

        if (queueError) throw queueError;

        // Get recent queue activity (last 24 hours)
        const { data: recentActivity, error: activityError } = await supabase
            .from('message_outbox')
            .select('status, message_type, retry_count, created_at, sent_at, error_message')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });

        if (activityError) throw activityError;

        // Calculate queue metrics
        const queueMetrics = {
            current: {
                total: queueData?.length || 0,
                pending: queueData?.filter(m => m.status === 'pending').length || 0,
                processing: queueData?.filter(m => m.status === 'processing').length || 0,
                sent: queueData?.filter(m => m.status === 'sent').length || 0,
                failed: queueData?.filter(m => m.status === 'failed').length || 0
            },
            recent24h: {
                total: recentActivity?.length || 0,
                emails: recentActivity?.filter(m => m.message_type === 'email').length || 0,
                sms: recentActivity?.filter(m => m.message_type === 'sms').length || 0,
                successful: recentActivity?.filter(m => m.status === 'sent').length || 0,
                failed: recentActivity?.filter(m => m.status === 'failed').length || 0,
                retries: recentActivity?.reduce((sum, m) => sum + (m.retry_count || 0), 0) || 0
            },
            performance: {
                averageProcessingTime: calculateAverageProcessingTime(recentActivity),
                successRate: recentActivity?.length > 0
                    ? Math.round((recentActivity.filter(m => m.status === 'sent').length / recentActivity.length) * 100)
                    : 100,
                failureRate: recentActivity?.length > 0
                    ? Math.round((recentActivity.filter(m => m.status === 'failed').length / recentActivity.length) * 100)
                    : 0
            }
        };

        // Get failed messages with error details
        const failedMessages = queueData
            ?.filter(m => m.status === 'failed')
            ?.slice(0, 10) // Limit to 10 most recent failures
            ?.map(m => ({
                id: m.id,
                type: m.message_type,
                recipient: m.recipient,
                error: m.error_message,
                retryCount: m.retry_count,
                createdAt: m.created_at
            })) || [];

        // Get pending messages that might be stuck
        const stuckMessages = queueData
            ?.filter(m =>
                m.status === 'pending' &&
                new Date(m.send_after) < new Date(Date.now() - 5 * 60 * 1000) // Older than 5 minutes
            )
            ?.slice(0, 10)
            ?.map(m => ({
                id: m.id,
                type: m.message_type,
                recipient: m.recipient,
                sendAfter: m.send_after,
                retryCount: m.retry_count,
                createdAt: m.created_at
            })) || [];

        const queueReport = {
            metrics: queueMetrics,
            failedMessages,
            stuckMessages,
            alerts: generateQueueAlerts(queueMetrics, stuckMessages.length),
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: queueReport
        });

    } catch (error) {
        console.error('Queue monitoring error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch queue status',
            timestamp: new Date().toISOString()
        });
    }
}

function calculateAverageProcessingTime(messages) {
    if (!messages || messages.length === 0) return 0;

    const processedMessages = messages.filter(m =>
        m.status === 'sent' && m.sent_at && m.created_at
    );

    if (processedMessages.length === 0) return 0;

    const totalTime = processedMessages.reduce((sum, m) => {
        const created = new Date(m.created_at);
        const sent = new Date(m.sent_at);
        return sum + (sent - created);
    }, 0);

    return Math.round(totalTime / processedMessages.length / 1000); // Return in seconds
}

function generateQueueAlerts(metrics, stuckCount) {
    const alerts = [];

    // High failure rate alert
    if (metrics.performance.failureRate > 10) {
        alerts.push({
            type: 'error',
            message: `High failure rate: ${metrics.performance.failureRate}%`,
            severity: 'high'
        });
    }

    // Stuck messages alert
    if (stuckCount > 0) {
        alerts.push({
            type: 'warning',
            message: `${stuckCount} messages appear to be stuck in queue`,
            severity: 'medium'
        });
    }

    // Large queue backlog alert
    if (metrics.current.pending > 50) {
        alerts.push({
            type: 'warning',
            message: `Large queue backlog: ${metrics.current.pending} pending messages`,
            severity: 'medium'
        });
    }

    // Low success rate alert
    if (metrics.performance.successRate < 90 && metrics.recent24h.total > 10) {
        alerts.push({
            type: 'warning',
            message: `Low success rate: ${metrics.performance.successRate}%`,
            severity: 'medium'
        });
    }

    return alerts;
}