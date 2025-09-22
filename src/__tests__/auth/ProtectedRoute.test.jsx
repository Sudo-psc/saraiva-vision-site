import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock react-router-dom Navigate component
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: ({ to, state }) => (
            <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)}>
                Redirecting to {to}
            </div>
        )
    };
});

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading spinner when loading', () => {
        useAuth.mockReturnValue({
            loading: true,
            isAuthenticated: false,
            isProfileLoaded: false,
            profile: null,
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Verifying access...')).toBeInTheDocument();
    });

    it('should show loading when authenticated but profile not loaded', () => {
        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: false,
            profile: null,
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Verifying access...')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', () => {
        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: false,
            isProfileLoaded: false,
            profile: null,
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        const navigate = screen.getByTestId('navigate');
        expect(navigate).toHaveAttribute('data-to', '/admin/login');
    });

    it('should show account inactive message when profile is inactive', () => {
        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: { is_active: false, role: 'user' },
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Account Inactive')).toBeInTheDocument();
        expect(screen.getByText(/Your account is not active/)).toBeInTheDocument();
    });

    it('should show access denied when user lacks required role', () => {
        const mockHasRole = vi.fn().mockReturnValue(false);

        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: { is_active: true, role: 'user' },
            hasRole: mockHasRole,
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute requiredRole="admin">
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText(/You don't have the required permissions/)).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
            return element?.textContent === 'Required role: admin';
        })).toBeInTheDocument();
        expect(screen.getByText('Your current role: user')).toBeInTheDocument();
        expect(mockHasRole).toHaveBeenCalledWith('admin');
    });

    it('should show dashboard access restricted when requireDashboardAccess is true but user cannot access', () => {
        const mockHasRole = vi.fn().mockReturnValue(true);
        const mockCanAccessDashboard = vi.fn().mockReturnValue(false);

        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: { is_active: true, role: 'admin' },
            hasRole: mockHasRole,
            canAccessDashboard: mockCanAccessDashboard
        });

        renderWithRouter(
            <ProtectedRoute requiredRole="admin" requireDashboardAccess={true}>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Dashboard Access Restricted')).toBeInTheDocument();
        expect(screen.getByText(/You don't have access to the admin dashboard/)).toBeInTheDocument();
        expect(mockCanAccessDashboard).toHaveBeenCalled();
    });

    it('should render protected content when all checks pass', () => {
        const mockHasRole = vi.fn().mockReturnValue(true);
        const mockCanAccessDashboard = vi.fn().mockReturnValue(true);

        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: { is_active: true, role: 'admin' },
            hasRole: mockHasRole,
            canAccessDashboard: mockCanAccessDashboard
        });

        renderWithRouter(
            <ProtectedRoute requiredRole="admin" requireDashboardAccess={true}>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should work with default role requirement', () => {
        const mockHasRole = vi.fn().mockReturnValue(true);

        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: { is_active: true, role: 'user' },
            hasRole: mockHasRole,
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(mockHasRole).toHaveBeenCalledWith('user');
    });

    it('should use custom fallback path', () => {
        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: false,
            isProfileLoaded: false,
            profile: null,
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute fallbackPath="/custom/login">
                <TestComponent />
            </ProtectedRoute>
        );

        const navigate = screen.getByTestId('navigate');
        expect(navigate).toHaveAttribute('data-to', '/custom/login');
    });

    it('should handle missing profile gracefully', () => {
        useAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            isProfileLoaded: true,
            profile: null,
            hasRole: vi.fn(),
            canAccessDashboard: vi.fn()
        });

        renderWithRouter(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
        );

        expect(screen.getByText('Account Inactive')).toBeInTheDocument();
    });
});