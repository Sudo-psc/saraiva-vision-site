import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CreateUserModal from '../../components/admin/CreateUserModal';
import { supabaseAdmin } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
    supabaseAdmin: {
        auth: {
            admin: {
                createUser: vi.fn(),
                deleteUser: vi.fn()
            }
        },
        from: vi.fn(() => ({
            insert: vi.fn()
        })),
        rpc: vi.fn()
    }
}));

describe('CreateUserModal', () => {
    const mockOnClose = vi.fn();
    const mockOnUserCreated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderModal = (isOpen = true) => {
        return render(
            <CreateUserModal
                isOpen={isOpen}
                onClose={mockOnClose}
                onUserCreated={mockOnUserCreated}
            />
        );
    };

    it('does not render when closed', () => {
        renderModal(false);
        expect(screen.queryByText('Criar Novo Usuário Admin')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
        renderModal();
        expect(screen.getByText('Criar Novo Usuário Admin')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome Completo *')).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Função *')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha *')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirmar Senha *')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        renderModal();

        const submitButton = screen.getByText('Criar Usuário');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Todos os campos obrigatórios devem ser preenchidos')).toBeInTheDocument();
        });
    });

    it('validates password length', async () => {
        renderModal();

        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: '123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: '123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(screen.getByText('A senha deve ter pelo menos 8 caracteres')).toBeInTheDocument();
        });
    });

    it('validates password confirmation', async () => {
        renderModal();

        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: 'different123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
        });
    });

    it('validates email format', async () => {
        renderModal();

        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'invalid-email' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument();
        });
    });

    it('creates user successfully', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com'
        };

        supabaseAdmin.auth.admin.createUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });

        supabaseAdmin.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null })
        });

        supabaseAdmin.rpc.mockResolvedValue({ error: null });

        renderModal();

        // Fill form
        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: 'Test User'
                }
            });
        });

        await waitFor(() => {
            expect(screen.getByText('Usuário criado com sucesso!')).toBeInTheDocument();
        });

        expect(mockOnUserCreated).toHaveBeenCalled();
    });

    it('handles auth creation error', async () => {
        supabaseAdmin.auth.admin.createUser.mockResolvedValue({
            data: null,
            error: new Error('User already registered')
        });

        renderModal();

        // Fill form
        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'existing@example.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(screen.getByText('Este email já está registrado no sistema')).toBeInTheDocument();
        });
    });

    it('handles profile creation error and cleans up auth user', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com'
        };

        supabaseAdmin.auth.admin.createUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });

        supabaseAdmin.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({
                error: new Error('Profile creation failed')
            })
        });

        renderModal();

        // Fill form
        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText('Senha *'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirmar Senha *'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByText('Criar Usuário'));

        await waitFor(() => {
            expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
        });

        await waitFor(() => {
            expect(screen.getByText('Erro ao criar usuário. Tente novamente.')).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderModal();

        const passwordInput = screen.getByLabelText('Senha *');
        const confirmPasswordInput = screen.getByLabelText('Confirmar Senha *');

        expect(passwordInput.type).toBe('password');
        expect(confirmPasswordInput.type).toBe('password');

        // Find the password field container and its toggle button
        const passwordContainer = passwordInput.closest('div');
        const passwordToggle = passwordContainer.querySelector('button[type="button"]');

        // Find the confirm password field container and its toggle button
        const confirmPasswordContainer = confirmPasswordInput.closest('div');
        const confirmPasswordToggle = confirmPasswordContainer.querySelector('button[type="button"]');

        // Click password toggle
        fireEvent.click(passwordToggle);
        expect(passwordInput.type).toBe('text');

        // Click confirm password toggle
        fireEvent.click(confirmPasswordToggle);
        expect(confirmPasswordInput.type).toBe('text');
    });

    it('closes modal on cancel', () => {
        renderModal();

        fireEvent.click(screen.getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes modal on background click', () => {
        renderModal();

        const overlay = document.querySelector('.fixed.inset-0.bg-gray-500');
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('clears form on close', () => {
        renderModal();

        // Fill form
        fireEvent.change(screen.getByLabelText('Nome Completo *'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' }
        });

        // Close and reopen
        fireEvent.click(screen.getByText('Cancelar'));

        // Form should be cleared when reopened
        expect(screen.getByLabelText('Nome Completo *').value).toBe('');
        expect(screen.getByLabelText('Email *').value).toBe('');
    });
});