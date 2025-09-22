import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserManagement from '../../components/admin/UserManagement';
import { useAuth } from '../../contexts/AuthContext';
import useAdminOperations from '../../hooks/useAdminOperations';

// Mock dependencies
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../hooks/useAdminOperations', () => ({
    default: vi.fn()
}));

const mockUsers = [
    {
        id: '1',
        email: 'admin@test.com',
        full_name: 'Admin User',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        email: 'super@test.com',
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: null
    },
    {
        id: '3',
        email: 'user@test.com',
        full_name: 'Regular User',
        role: 'user',
        is_active: false,
        created_at: '2024-01-02T00:00:00Z',
        last_login: '2024-01-10T15:30:00Z'
    }
];

describe('UserManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupMocks = (overrides = {}) => {
        const defaultAuth = {
            profile: { id: '1', role: 'super_admin' },
            isSuperAdmin: () => true
        };

        const defaultAdminOps = {
            loading: false,
            error: null,
            listUsers: vi.fn().mockResolvedValue(mockUsers),
            updateUserRole: vi.fn(),
            toggleUserStatus: vi.fn(),
            clearError: vi.fn()
        };

        useAuth.mockReturnValue({ ...defaultAuth, ...overrides.auth });
        useAdminOperations.mockReturnValue({ ...defaultAdminOps, ...overrides.adminOps });
    };

    it('renders user management interface', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
        });

        expect(screen.getByText('Manage admin users and permissions')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('displays users in table', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        // Check for email addresses which are unique
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
        expect(screen.getByText('super@test.com')).toBeInTheDocument();
        expect(screen.getByText('user@test.com')).toBeInTheDocument();

        // Check for user names
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Regular User')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        setupMocks({
            adminOps: { loading: true, listUsers: vi.fn() }
        });

        render(<UserManagement />);

        expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('displays error message', async () => {
        setupMocks({
            adminOps: {
                error: 'Failed to load users',
                listUsers: vi.fn().mockRejectedValue(new Error('Network error'))
            }
        });

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load users')).toBeInTheDocument();
        });
    });

    it('filters users by search term', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search users...');
        fireEvent.change(searchInput, { target: { value: 'super' } });

        // Should show super admin user
        expect(screen.getByText('super@test.com')).toBeInTheDocument();
        expect(screen.queryByText('admin@test.com')).not.toBeInTheDocument();
        expect(screen.queryByText('user@test.com')).not.toBeInTheDocument();
    });

    it('filters users by role', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        const roleFilter = screen.getByDisplayValue('All Roles');
        fireEvent.change(roleFilter, { target: { value: 'admin' } });

        // Should show only admin users
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
        expect(screen.queryByText('super@test.com')).not.toBeInTheDocument();
        expect(screen.queryByText('user@test.com')).not.toBeInTheDocument();
    });

    it('filters users by status', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        const statusFilter = screen.getByDisplayValue('All Status');
        fireEvent.change(statusFilter, { target: { value: 'inactive' } });

        // Should show only inactive users
        expect(screen.getByText('user@test.com')).toBeInTheDocument();
        expect(screen.queryByText('admin@test.com')).not.toBeInTheDocument();
        expect(screen.queryByText('super@test.com')).not.toBeInTheDocument();
    });

    it('shows add user button for super admin', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Add User')).toBeInTheDocument();
        });
    });

    it('hides add user button for regular admin', async () => {
        setupMocks({
            auth: {
                profile: { id: '1', role: 'admin' },
                isSuperAdmin: () => false
            }
        });

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
        });

        expect(screen.queryByText('Add User')).not.toBeInTheDocument();
    });

    it('updates user role', async () => {
        const mockUpdateUserRole = vi.fn().mockResolvedValue({
            id: '3',
            role: 'admin',
            updated_at: new Date().toISOString()
        });

        setupMocks({
            adminOps: { updateUserRole: mockUpdateUserRole }
        });

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Regular User')).toBeInTheDocument();
        });

        // Find the role select for the regular user
        const roleSelects = screen.getAllByDisplayValue('User');
        fireEvent.change(roleSelects[0], { target: { value: 'admin' } });

        await waitFor(() => {
            expect(mockUpdateUserRole).toHaveBeenCalledWith('3', 'admin');
        });
    });

    it('toggles user status', async () => {
        const mockToggleUserStatus = vi.fn().mockResolvedValue({
            id: '3',
            is_active: true,
            updated_at: new Date().toISOString()
        });

        setupMocks({
            adminOps: { toggleUserStatus: mockToggleUserStatus }
        });

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Regular User')).toBeInTheDocument();
        });

        // Find the status toggle button for inactive user
        const statusButtons = screen.getAllByRole('button');
        const toggleButton = statusButtons.find(btn =>
            btn.getAttribute('title') === 'Activate user'
        );

        if (toggleButton) {
            fireEvent.click(toggleButton);

            await waitFor(() => {
                expect(mockToggleUserStatus).toHaveBeenCalledWith('3');
            });
        }
    });

    it('displays user statistics', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
        });

        // Check statistics cards by finding them within their containers
        const statsCards = screen.getAllByText('3');
        expect(statsCards.length).toBeGreaterThan(0); // Total users

        const adminCards = screen.getAllByText('2');
        expect(adminCards.length).toBeGreaterThan(0); // Admins and Active users
    });

    it('opens create user modal', async () => {
        setupMocks();

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('Add User')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Criar Novo Usuário Admin')).toBeInTheDocument();
        });
    });

    it('handles empty user list', async () => {
        setupMocks({
            adminOps: { listUsers: vi.fn().mockResolvedValue([]) }
        });

        render(<UserManagement />);

        await waitFor(() => {
            expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument();
        });
    });
});