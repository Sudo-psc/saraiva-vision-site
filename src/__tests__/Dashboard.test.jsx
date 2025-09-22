import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { useDashboardData } from '../hooks/useDashboardData';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
    Loader2: ({ className }) => <div data-testid="loader-icon" className={className} />,
    Activity: ({ className }) => <div data-testid="activity-icon" className={className} />,
    Users: ({ className }) => <div data-testid="users-icon" className={className} />,
    MessageSquare: ({ className }) => <div data-testid="message-icon" className={className} />,
    Calendar: ({ className }) => <div data-testid="calendar-icon" className={className} />,
    AlertTriangle: ({ className }) => <div data-testid="alert-icon" className={className} />,
    CheckCircle: ({ className }) => <div data-testid="check-icon" className={className} />,
    XCircle: ({ className }) => <div data-testid="x-icon" className={className} />,
    Clock: ({ className }) => <div data-testid="clock-icon" className={className} />,
    RefreshCw: ({ className }) => <div data-testid="refresh-icon" className={className} />
}));

// Mock the custom hook
vi.mock('../hooks/useDashboardData', () => ({
    useDashboardData: vi.fn()
}));

describe('Dashboard Component', () => {
    const mockMetricsData = {
        success: true,
        data: {
            contacts: {
                total24h: 15,
                hourlyRate: 0.6
            },
            appointments: {
                total24h: 8,
                confirmed: 6,
                pending: 2,
                cancelled: 0,
                conversionRate: 75
            },
            messaging: {
                totalMessages: 20,
                sent: 19,
                pending: 1,
                failed: 0,
                deliveryRate: 95
            },
            system: {
                errors24h: 2,
                errorRate: 0.1,
                uptime: 99.9
            }
        }
    };

    const mockHealthData = {
        success: true,
        data: {
            overall: {
                status: 'healthy',
                upServices: 4,
                totalServices: 4,
                uptime: 100
            },
            services: [
                { service: 'Supabase', status: 'up', responseTime: 120 },
                { service: 'WordPress', status: 'up', responseTime: 250 },
                { service: 'Resend', status: 'up', responseTime: 180 },
                { service: 'OpenAI', status: 'up', responseTime: 300 }
            ]
        }
    };

    const mockQueueData = {
        success: true,
        data: {
            metrics: {
                current: {
                    total: 5,
                    pending: 1,
                    processing: 0,
                    sent: 4,
                    failed: 0
                },
                recent24h: {
                    total: 20,
                    emails: 15,
                    sms: 5,
                    successful: 19,
                    failed: 1,
                    retries: 2
                },
                performance: {
                    averageProcessingTime: 45,
                    successRate: 95,
                    failureRate: 5
                }
            },
            failedMessages: [],
            stuckMessages: [],
            alerts: []
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default hook mock
        useDashboardData.mockReturnValue({
            data: {
                metrics: mockMetricsData.data,
                health: mockHealthData.data,
                queue: mockQueueData.data
            },
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isRefreshing: false,
            refresh: vi.fn()
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders loading state initially', () => {
        // Mock loading state
        useDashboardData.mockReturnValue({
            data: { metrics: null, health: null, queue: null },
            loading: true,
            error: null,
            lastUpdated: null,
            isRefreshing: false,
            refresh: vi.fn()
        });

        render(<Dashboard />);
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('renders dashboard with metrics after successful data fetch', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Operational Dashboard')).toBeInTheDocument();
        });

        // Check if key metrics are displayed
        expect(screen.getByText('Contacts (24h)')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument(); // contacts total
        expect(screen.getByText('Appointments (24h)')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument(); // appointments total
        expect(screen.getByText('Message Delivery')).toBeInTheDocument();
        expect(screen.getAllByText('95%')).toHaveLength(2); // delivery rate appears in metrics and queue
    });

    it('displays system health status correctly', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('System Health')).toBeInTheDocument();
        });

        expect(screen.getByText('healthy')).toBeInTheDocument();
        expect(screen.getByText('4/4 services operational')).toBeInTheDocument();
        expect(screen.getByText('100% uptime')).toBeInTheDocument();
    });

    it('displays service status for external dependencies', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('External Services')).toBeInTheDocument();
        });

        // Check if all services are listed
        expect(screen.getByText('Supabase')).toBeInTheDocument();
        expect(screen.getByText('WordPress')).toBeInTheDocument();
        expect(screen.getByText('Resend')).toBeInTheDocument();
        expect(screen.getByText('OpenAI')).toBeInTheDocument();

        // Check if all services show as online
        const onlineBadges = screen.getAllByText('Online');
        expect(onlineBadges).toHaveLength(4);
    });

    it('displays appointment status breakdown', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Appointment Status (24h)')).toBeInTheDocument();
        });

        // Check appointment status section specifically
        const appointmentSection = screen.getByText('Appointment Status (24h)').closest('.bg-white');
        expect(appointmentSection).toContainElement(screen.getByText('Confirmed'));
        expect(appointmentSection).toContainElement(screen.getByText('Conversion Rate'));
        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays message queue status', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Message Queue Status')).toBeInTheDocument();
        });

        // Check message queue section specifically
        const queueSection = screen.getByText('Message Queue Status').closest('.bg-white');
        expect(queueSection).toContainElement(screen.getByText('Sent (24h)'));
        expect(queueSection).toContainElement(screen.getByText('Success Rate'));
    });

    it('handles API errors gracefully', async () => {
        // Mock error state
        useDashboardData.mockReturnValue({
            data: { metrics: null, health: null, queue: null },
            loading: false,
            error: 'Failed to fetch dashboard data',
            lastUpdated: null,
            isRefreshing: false,
            refresh: vi.fn()
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load dashboard/)).toBeInTheDocument();
        });

        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('allows retry after error', async () => {
        const mockRefresh = vi.fn();

        // Mock error state initially
        useDashboardData.mockReturnValue({
            data: { metrics: null, health: null, queue: null },
            loading: false,
            error: 'Failed to fetch dashboard data',
            lastUpdated: null,
            isRefreshing: false,
            refresh: mockRefresh
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load dashboard/)).toBeInTheDocument();
        });

        // Click retry
        fireEvent.click(screen.getByText('Retry'));

        // Verify refresh function was called
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('displays alerts when present', async () => {
        const queueDataWithAlerts = {
            ...mockQueueData.data,
            alerts: [
                {
                    type: 'warning',
                    message: 'High queue backlog detected',
                    severity: 'medium'
                },
                {
                    type: 'error',
                    message: 'Email delivery failure rate above threshold',
                    severity: 'high'
                }
            ]
        };

        // Mock hook with alerts
        useDashboardData.mockReturnValue({
            data: {
                metrics: mockMetricsData.data,
                health: mockHealthData.data,
                queue: queueDataWithAlerts
            },
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isRefreshing: false,
            refresh: vi.fn()
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Active Alerts')).toBeInTheDocument();
        });

        expect(screen.getByText('High queue backlog detected')).toBeInTheDocument();
        expect(screen.getByText('Email delivery failure rate above threshold')).toBeInTheDocument();
    });

    it('shows degraded system status when services are down', async () => {
        const degradedHealthData = {
            ...mockHealthData.data,
            overall: {
                status: 'degraded',
                upServices: 3,
                totalServices: 4,
                uptime: 75
            },
            services: [
                { service: 'Supabase', status: 'up', responseTime: 120 },
                { service: 'WordPress', status: 'down', error: 'Connection timeout' },
                { service: 'Resend', status: 'up', responseTime: 180 },
                { service: 'OpenAI', status: 'up', responseTime: 300 }
            ]
        };

        // Mock hook with degraded health
        useDashboardData.mockReturnValue({
            data: {
                metrics: mockMetricsData.data,
                health: degradedHealthData,
                queue: mockQueueData.data
            },
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isRefreshing: false,
            refresh: vi.fn()
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('degraded')).toBeInTheDocument();
        });

        expect(screen.getByText('3/4 services operational')).toBeInTheDocument();
        expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('updates last updated timestamp', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
        });

        const timestampElement = screen.getByText(/Last updated:/);
        expect(timestampElement).toBeInTheDocument();
    });
});