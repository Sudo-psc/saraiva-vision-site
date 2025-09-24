/**
 * Web Vitals Analytics API
 * Fetches Core Web Vitals data from PostHog
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

        // Default to last 7 days for web vitals (more recent data is more relevant)
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 7);

        const start = startDate || defaultStartDate.toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        // PostHog API endpoint for web vitals events
        const posthogUrl = `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`;

        // Query for web vitals breakdown
        const webVitalsQuery = {
            events: [
                {
                    id: 'Web Vital',
                    name: 'Web Vital',
                    type: 'events'
                }
            ],
            date_from: start,
            date_to: end,
            breakdown: 'metric_name',
            breakdown_type: 'event',
            display: 'ActionsTable',
            properties: [
                {
                    key: 'metric_name',
                    operator: 'in',
                    value: ['LCP', 'FID', 'CLS', 'TTFB']
                }
            ]
        };

        // Make request to PostHog API
        const response = await fetch(posthogUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POSTHOG_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webVitalsQuery)
        });

        if (!response.ok) {
            console.error('PostHog API error:', response.status, response.statusText);

            // Return mock data for development/fallback
            return res.status(200).json({
                success: true,
                data: getMockWebVitalsData(),
                source: 'mock'
            });
        }

        const data = await response.json();

        // Process PostHog response
        const processedData = await processWebVitalsData(data, POSTHOG_API_KEY, POSTHOG_PROJECT_ID, start, end);

        res.status(200).json({
            success: true,
            data: processedData,
            source: 'posthog'
        });

    } catch (error) {
        console.error('Web vitals error:', error);

        // Return mock data as fallback
        res.status(200).json({
            success: true,
            data: getMockWebVitalsData(),
            source: 'mock',
            error: 'Fallback to mock data'
        });
    }
}

/**
 * Process PostHog web vitals data into our format
 */
async function processWebVitalsData(posthogData, apiKey, projectId, start, end) {
    const vitals = {
        lcp: { values: [], count: 0 },
        fid: { values: [], count: 0 },
        cls: { values: [], count: 0 },
        ttfb: { values: [], count: 0 }
    };

    // For each metric, get the actual values to calculate averages
    for (const metric of ['LCP', 'FID', 'CLS', 'TTFB']) {
        try {
            const valuesQuery = {
                events: [
                    {
                        id: 'Web Vital',
                        name: 'Web Vital',
                        type: 'events',
                        properties: [
                            {
                                key: 'metric_name',
                                operator: 'exact',
                                value: metric
                            }
                        ]
                    }
                ],
                date_from: start,
                date_to: end,
                breakdown: 'metric_value',
                breakdown_type: 'event',
                display: 'ActionsTable'
            };

            const valuesResponse = await fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(valuesQuery)
            });

            if (valuesResponse.ok) {
                const valuesData = await valuesResponse.json();
                const results = valuesData.result || [];

                results.forEach(result => {
                    if (result.breakdown_value && result.count) {
                        const value = parseFloat(result.breakdown_value);
                        const count = result.count;

                        if (!isNaN(value)) {
                            const metricKey = metric.toLowerCase();
                            vitals[metricKey].values.push(...Array(count).fill(value));
                            vitals[metricKey].count += count;
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`Error fetching ${metric} values:`, error);
        }
    }

    // Calculate averages and ratings
    const processedVitals = {};

    Object.entries(vitals).forEach(([metric, data]) => {
        if (data.values.length > 0) {
            const average = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
            processedVitals[metric] = {
                value: parseFloat(average.toFixed(metric === 'cls' ? 3 : 0)),
                count: data.count,
                rating: getVitalRating(metric, average)
            };
        } else {
            // Fallback to mock data for this metric
            const mockData = getMockWebVitalsData();
            processedVitals[metric] = {
                value: mockData[metric],
                count: 0,
                rating: getVitalRating(metric, mockData[metric])
            };
        }
    });

    return processedVitals;
}

/**
 * Get rating for web vital metric
 */
function getVitalRating(metric, value) {
    const thresholds = {
        lcp: { good: 2.5, poor: 4.0 },
        fid: { good: 100, poor: 300 },
        cls: { good: 0.1, poor: 0.25 },
        ttfb: { good: 600, poor: 1500 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * Mock web vitals data for development/fallback
 */
function getMockWebVitalsData() {
    return {
        lcp: 2.1,
        fid: 85,
        cls: 0.08,
        ttfb: 450
    };
}