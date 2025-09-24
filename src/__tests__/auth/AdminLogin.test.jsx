import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminLogin from '../../components/auth/AdminLogin';
import { useAuth } from '../../contexts/AuthContext';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: null })
    };
});

const renderAdminLogin = () => {
    return render(
        <BrowserRouter>
            <AdminLogin />
        </BrowserRouter>
    );
};

describe('AdminLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        useAuth.mockReturnValue({
            signIn: vi.fn(),
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        expect(screen.getByText('Admin Login')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('shows loading state when auth is loading', () => {
        useAuth.mockReturnValue({
            signIn: vi.fn(),
            user: null,
            loading: true,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
    });

    it('redirects authenticated admin users', () => {
        useAuth.mockReturnValue({
            signIn: vi.fn(),
            user: { id: '123', email: 'admin@test.com' },
            loading: false,
            canAccessDashboard: vi.fn(() => true)
        });

        renderAdminLogin();

        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    });

    it('validates form inputs', async () => {
        const mockSignIn = vi.fn();
        useAuth.mockReturnValue({
            signIn: mockSignIn,
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        const submitButton = screen.getByRole('button', { name: /entrar/i });

        // Button should be disabled when form is empty
        expect(submitButton).toBeDisabled();

        // Fill email only
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'admin@test.com' }
        });
        expect(submitButton).toBeDisabled();

        // Fill password too
        fireEvent.change(screen.getByLabelText('Senha'), {
            target: { value: 'password123' }
        });
        expect(submitButton).not.toBeDisabled();
    });

    it('handles successful login', async () => {
        const mockSignIn = vi.fn().mockResolvedValue({
            data: { user: { id: '123' } },
            error: null
        });

        useAuth.mockReturnValue({
            signIn: mockSignIn,
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'admin@test.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('admin@test.com', 'password123');
        });
    });

    it('handles login errors', async () => {
        const mockSignIn = vi.fn().mockRejectedValue(
            new Error('Invalid login credentials')
        );

        useAuth.mockReturnValue({
            signIn: mockSignIn,
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'admin@test.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha'), {
            target: { value: 'wrongpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        useAuth.mockReturnValue({
            signIn: vi.fn(),
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        const passwordInput = screen.getByLabelText('Senha');
        const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

        expect(passwordInput.type).toBe('password');

        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');

        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });

    it('clears error when user starts typing', async () => {
        const mockSignIn = vi.fn().mockRejectedValue(
            new Error('Invalid login credentials')
        );

        useAuth.mockReturnValue({
            signIn: mockSignIn,
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        // Trigger error
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'admin@test.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha'), {
            target: { value: 'wrongpassword' }
        });
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument();
        });

        // Start typing should clear error
        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'admin@test.co' }
        });

        expect(screen.queryByText(/email ou senha incorretos/i)).not.toBeInTheDocument();
    });

    it('navigates back to home page', () => {
        useAuth.mockReturnValue({
            signIn: vi.fn(),
            user: null,
            loading: false,
            canAccessDashboard: vi.fn(() => false)
        });

        renderAdminLogin();

        fireEvent.click(screen.getByText('Voltar ao site'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});