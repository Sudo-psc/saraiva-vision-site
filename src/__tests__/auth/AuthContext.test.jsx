import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock Supabase
const mockSupabase = {
    auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn()
    },
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn()
            }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        }))
    }))
};

vi.mock('../../lib/supabase', () => ({
    supabase: mockSupabase
}));

// Test component to access auth context
const TestComponent = () => {
    const auth = useAuth();
    return (
        <div>
            <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
            <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <div data-testid="user-email">{auth.user?.email || 'no-email'}</div>
            <div data-testid="user-role">{auth.profile?.role || 'no-role'}</div>
            <div data-testid="is-admin">{auth.isAdmin() ? 'is-admin' : 'not-admin'}</div>
            <div data-testid="can-access-dashboard">{auth.canAccessDashboard() ? 'can-access' : 'cannot-access'}</div>
            <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
            error: null
        });

        mockSupabase.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should provide initial loading state', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading')).toHaveTextContent('loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });

    it('should handle successful authentication', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'admin@example.com'
        };

        const mockProfile = {
            id: 'user-123',
            email: 'admin@example.com',
            role: 'admin',
            is_active: true,
            full_name: 'Admin User'
        };

        // Mock successful session
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        });

        // Mock profile fetch
        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null
                    })
                }))
            }))
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
        expect(screen.getByTestId('is-admin')).toHaveTextContent('is-admin');
        expect(screen.getByTestId('can-access-dashboard')).toHaveTextContent('can-access');
    });

    it('should handle sign in', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'admin@example.com'
        };

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        await act(async () => {
            screen.getByText('Sign In').click();
        });

        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password'
        });
    });

    it('should handle sign out', async () => {
        mockSupabase.auth.signOut.mockResolvedValue({ error: null });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        await act(async () => {
            screen.getByText('Sign Out').click();
        });

        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle role-based access control', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'user@example.com'
        };

        const mockProfile = {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user',
            is_active: true,
            full_name: 'Regular User'
        };

        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        });

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null
                    })
                }))
            }))
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('user');
        expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin');
        expect(screen.getByTestId('can-access-dashboard')).toHaveTextContent('cannot-access');
    });

    it('should handle super admin role', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'superadmin@example.com'
        };

        const mockProfile = {
            id: 'user-123',
            email: 'superadmin@example.com',
            role: 'super_admin',
            is_active: true,
            full_name: 'Super Admin'
        };

        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        });

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null
                    })
                }))
            }))
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        expect(screen.getByTestId('is-admin')).toHaveTextContent('is-admin');
        expect(screen.getByTestId('can-access-dashboard')).toHaveTextContent('can-access');
    });

    it('should handle inactive user', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'inactive@example.com'
        };

        const mockProfile = {
            id: 'user-123',
            email: 'inactive@example.com',
            role: 'admin',
            is_active: false,
            full_name: 'Inactive Admin'
        };

        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        });

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null
                    })
                }))
            }))
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        expect(screen.getByTestId('is-admin')).toHaveTextContent('is-admin');
        expect(screen.getByTestId('can-access-dashboard')).toHaveTextContent('cannot-access');
    });

    it('should handle authentication errors', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
            error: { message: 'Session error' }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        });

        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });
});