import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../admin/auth.js';
import { supabaseAdmin } from '../../src/lib/supabase';

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(),
        rpc: vi.fn()
    }
}));

// Mock CORS config
vi.mock('../cors-config', () => ({
    corsHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
}));

describe('/api/admin/auth', () => {
    let req, res;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            method: 'POST',
            body: {}
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            setHeader: vi.fn().mockReturnThis(),
            end: vi.fn().mockReturnThis()
        };
    });

    it('handles OPTIONS request', async () => {
        req.method = 'OPTIONS';

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalled();
    });

    it('rejects non-POST requests', async () => {
        req.method = 'GET';

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'METHOD_NOT_ALLOWED',
                message: 'Method not allowed'
            }
        });
    });

    it('rejects invalid action', async () => {
        req.body = { action: 'invalid_action' };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'INVALID_ACTION',
                message: 'Invalid action specified'
            }
        });
    });

    describe('verify_admin action', () => {
        it('verifies admin access successfully', async () => {
            const mockProfile = {
                id: 'user-123',
                email: 'admin@test.com',
                role: 'admin',
                is_active: true,
                full_name: 'Admin User'
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockProfile,
                            error: null
                        })
                    })
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            });

            supabaseAdmin.rpc.mockResolvedValue({ error: null });

            req.body = {
                action: 'verify_admin',
                userId: 'user-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    hasAccess: true,
                    profile: mockProfile
                }
            });
        });

        it('denies access for inactive user', async () => {
            const mockProfile = {
                id: 'user-123',
                email: 'admin@test.com',
                role: 'admin',
                is_active: false,
                full_name: 'Admin User'
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockProfile,
                            error: null
                        })
                    })
                })
            });

            req.body = {
                action: 'verify_admin',
                userId: 'user-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    hasAccess: false,
                    profile: null
                }
            });
        });

        it('denies access for non-admin user', async () => {
            const mockProfile = {
                id: 'user-123',
                email: 'user@test.com',
                role: 'user',
                is_active: true,
                full_name: 'Regular User'
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockProfile,
                            error: null
                        })
                    })
                })
            });

            req.body = {
                action: 'verify_admin',
                userId: 'user-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    hasAccess: false,
                    profile: null
                }
            });
        });

        it('handles missing userId', async () => {
            req.body = {
                action: 'verify_admin'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'User ID is required'
                }
            });
        });

        it('handles user not found', async () => {
            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('User not found')
                        })
                    })
                })
            });

            req.body = {
                action: 'verify_admin',
                userId: 'nonexistent-user'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        });
    });

    describe('update_user_role action', () => {
        it('updates user role successfully', async () => {
            const mockRequester = {
                role: 'super_admin',
                is_active: true
            };

            const mockUpdatedUser = {
                id: 'user-123',
                role: 'admin',
                updated_at: new Date().toISOString()
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockRequester,
                            error: null
                        })
                    })
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockUpdatedUser,
                                error: null
                            })
                        })
                    })
                })
            });

            supabaseAdmin.rpc.mockResolvedValue({ error: null });

            req.body = {
                action: 'update_user_role',
                userId: 'user-123',
                newRole: 'admin',
                requesterId: 'requester-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    profile: mockUpdatedUser
                }
            });
        });

        it('denies access for non-super-admin', async () => {
            const mockRequester = {
                role: 'admin',
                is_active: true
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockRequester,
                            error: null
                        })
                    })
                })
            });

            req.body = {
                action: 'update_user_role',
                userId: 'user-123',
                newRole: 'admin',
                requesterId: 'requester-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Super admin access required'
                }
            });
        });

        it('rejects invalid role', async () => {
            const mockRequester = {
                role: 'super_admin',
                is_active: true
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockRequester,
                            error: null
                        })
                    })
                })
            });

            req.body = {
                action: 'update_user_role',
                userId: 'user-123',
                newRole: 'invalid_role',
                requesterId: 'requester-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Invalid role specified'
                }
            });
        });

        it('prevents self-demotion', async () => {
            const mockRequester = {
                role: 'super_admin',
                is_active: true
            };

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockRequester,
                            error: null
                        })
                    })
                })
            });

            req.body = {
                action: 'update_user_role',
                userId: 'requester-123',
                newRole: 'admin',
                requesterId: 'requester-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'SELF_DEMOTION',
                    message: 'Cannot change your own role'
                }
            });
        });
    });

    describe('list_users action', () => {
        it('lists users for admin', async () => {
            const mockRequester = {
                role: 'admin',
                is_active: true
            };

            const mockUsers = [
                { id: '1', email: 'user1@test.com', role: 'user' },
                { id: '2', email: 'user2@test.com', role: 'admin' }
            ];

            supabaseAdmin.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockRequester,
                            error: null
                        })
                    }),
                    order: vi.fn().mockResolvedValue({
                        data: mockUsers,
                        error: null
                    })
                })
            });

            req.body = {
                action: 'list_users',
                requesterId: 'requester-123'
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    users: mockUsers
                }
            });
        });

        it('applies role filter', async () => {
            const mockRequester = {
                role: 'admin',
                is_active: true
            };

            const mockUsers = [
                { id: '2', email: 'admin@test.com', role: 'admin' }
            ];

            const mockQuery = {
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: mockUsers,
                    error: null
                })
            };

            supabaseAdmin.from.mockImplementation((table) => {
                if (table === 'profiles') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: mockRequester,
                                    error: null
                                })
                            }),
                            order: vi.fn().mockReturnValue(mockQuery)
                        })
                    };
                }
                return mockQuery;
            });

            req.body = {
                action: 'list_users',
                requesterId: 'requester-123',
                filters: { role: 'admin' }
            };

            await handler(req, res);

            expect(mockQuery.eq).toHaveBeenCalledWith('role', 'admin');
        });
    });

    it('handles internal server errors', async () => {
        supabaseAdmin.from.mockImplementation(() => {
            throw new Error('Database connection failed');
        });

        req.body = {
            action: 'verify_admin',
            userId: 'user-123'
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'VERIFICATION_ERROR',
                message: 'Failed to verify admin access'
            }
        });
    });
});