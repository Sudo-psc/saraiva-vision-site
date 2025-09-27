/**
 * Analytics Funnel API
 * Fetches conversion funnel data from PostHog
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { startDate, endDate } = req.query;

        // PostHog API configuration
        const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
        const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

        if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
            console.error('PostHog API credentials not configured');
            return res.status(500).json({ error: 'Analytics service not configured' });
        }

        // Default to last 30 days if no date range provided
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);

        const start = startDate || defaultStartDate.toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        // PostHog API endpoint for funnel analysis
        const posthogUrl = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/insights/funnel/`;

        // Define funnel steps
        const funnelSteps = [
            {
                id: 'page_visit',
                name: 'Funnel: Page Visit',
                custom_name: 'Visita à Página'
            },
            {
                id: 'contact_form_view',
                name: 'Funnel: Contact Form Viewed',
                custom_name: 'Visualização do Formulário'
            },
            {
                id: 'contact_form_submit',
                name: 'Funnel: Contact Form Submitted',
                custom_name: 'Envio do Formulário'
            },
            {
                id: 'appointment_form_view',
                name: 'Funnel: Appointment Form Viewed',
                custom_name: 'Visualização do Agendamento'
            },
            {
                id: 'appointment_form_submit',
                name: 'Funnel: Appointment Submitted',
                custom_name: 'Envio do Agendamento'
            },
            {
                id: 'appointment_confirmed',
                name: 'Funnel: Appointment Confirmed',
                custom_name: 'Agendamento Confirmado'
            }
        ];

        // Prepare funnel query
        const funnelQuery = {
            events: funnelSteps.map(step => ({
                id: step.name,
                name: step.name,
                type: 'events',
                order: funnelSteps.indexOf(step)
            })),
            date_from: start,
            date_to: end,
            funnel_window_interval: 14,
            funnel_window_interval_unit: 'day',
            breakdown_type: null,
            display: 'FunnelViz'
        };

        // Make request to PostHog API
        const response = await fetch(posthogUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POSTHOG_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funnelQuery)
        });

        if (!response.ok) {
            console.error('PostHog API error:', response.status, response.statusText);

            // Return mock data for development/fallback
            return res.status(200).json({
                success: true,
                data: getMockFunnelData(),
                source: 'mock'
            });
        }

        const data = await response.json();

        // Process PostHog response
        const processedData = processFunnelData(data, funnelSteps);

        res.status(200).json({
            success: true,
            data: processedData,
            source: 'posthog'
        });

    } catch (error) {
        console.error('Analytics funnel error:', error);

        // Return mock data as fallback
        res.status(200).json({
            success: true,
            data: getMockFunnelData(),
            source: 'mock',
            error: 'Fallback to mock data'
        });
    }
}

/**
 * Process PostHog funnel data into our format
 */
function processFunnelData(posthogData, funnelSteps) {
    const results = posthogData.result || [];

    if (!results.length) {
        return getMockFunnelData();
    }

    const stepData = results.map((result, index) => ({
        step: index + 1,
        name: funnelSteps[index]?.custom_name || `Step ${index + 1}`,
        count: result.count || 0,
        conversion_rate: result.conversion_rate || 0
    }));

    const totalVisits = stepData[0]?.count || 0;
    const finalConversions = stepData[stepData.length - 1]?.count || 0;
    const overallConversionRate = totalVisits > 0 ? (finalConversions / totalVisits * 100) : 0;

    return {
        steps: stepData,
        overall_conversion_rate: parseFloat(overallConversionRate.toFixed(2)),
        total_visits: totalVisits,
        total_conversions: finalConversions,
        period: {
            start: posthogData.date_from,
            end: posthogData.date_to
        }
    };
}

/**
 * Mock funnel data for development/fallback
 */
function getMockFunnelData() {
    return {
        steps: [
            { step: 1, name: 'Visita à Página', count: 1250, conversion_rate: 100 },
            { step: 2, name: 'Visualização do Formulário', count: 180, conversion_rate: 14.4 },
            { step: 3, name: 'Envio do Formulário', count: 45, conversion_rate: 25.0 },
            { step: 4, name: 'Visualização do Agendamento', count: 85, conversion_rate: 188.9 },
            { step: 5, name: 'Envio do Agendamento', count: 32, conversion_rate: 37.6 },
            { step: 6, name: 'Agendamento Confirmado', count: 28, conversion_rate: 87.5 }
        ],
        overall_conversion_rate: 2.24,
        total_visits: 1250,
        total_conversions: 28,
        period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        }
    };
}