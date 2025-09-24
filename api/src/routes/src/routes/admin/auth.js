import { supabaseAdmin } from 'from 'from '../../../../../../..../../../../src/lib/supabase.js'' ' ;
import { corsHeaders } from '../cors-config';

export default async function handler(req, res) {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: {
                code: 'METHOD_NOT_ALLOWED',
                message: 'Method not allowed'
            }
        });
    }

    try {
        const { action, ...payload } = req.body;

        switch (action) {
            case 'verify_admin':
                return await verifyAdminAccess(req, res, payload);
            case 'get_user_profile':
                return await getUserProfile(req, res, payload);
            case 'update_user_role':
                return await updateUserRole(req, res, payload);
            case 'toggle_user_status':
                return await toggleUserStatus(req, res, payload);
            case 'list_users':
                return await listUsers(req, res, payload);
            default:
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: 'Invalid action specified'
                    }
                });
        }
    } catch (error) {
        console.error('Admin auth API error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
}

// Verify admin access for a user
async function verifyAdminAccess(req, res, { userId }) {
    try {
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'User ID is required'
                }
            });
        }

        // Check if user exists and has admin role
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role, is_active, full_name')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const hasAdminAccess = profile.is_active &&
            (profile.role === 'admin' || profile.role === 'super_admin');

        // Update last login timestamp
        if (hasAdminAccess) {
            await supabaseAdmin
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            // Log admin access
            await supabaseAdmin.rpc('log_event', {
                p_event_type: 'admin_access_verified',
                p_event_data: {
                    user_id: userId,
                    role: profile.role
                },
                p_severity: 'info',
                p_source: 'admin_auth_api',
                p_user_id: userId
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                hasAccess: hasAdminAccess,
                profile: hasAdminAccess ? profile : null
            }
        });

    } catch (error) {
        console.error('Error verifying admin access:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'VERIFICATION_ERROR',
                message: 'Failed to verify admin access'
            }
        });
    }
}

// Get user profile with admin check
async function getUserProfile(req, res, { userId, requesterId }) {
    try {
        // Verify requester is admin
        const { data: requester } = await supabaseAdmin
            .from('profiles')
            .select('role, is_active')
            .eq('id', requesterId)
            .single();

        if (!requester?.is_active || !['admin', 'super_admin'].includes(requester.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Admin access required'
                }
            });
        }

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: { profile }
        });

    } catch (error) {
        console.error('Error getting user profile:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_ERROR',
                message: 'Failed to get user profile'
            }
        });
    }
}

// Update user role (super admin only)
async function updateUserRole(req, res, { userId, newRole, requesterId }) {
    try {
        // Verify requester is super admin
        const { data: requester } = await supabaseAdmin
            .from('profiles')
            .select('role, is_active')
            .eq('id', requesterId)
            .single();

        if (!requester?.is_active || requester.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Super admin access required'
                }
            });
        }

        // Validate new role
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Invalid role specified'
                }
            });
        }

        // Prevent self-demotion
        if (userId === requesterId && newRole !== 'super_admin') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SELF_DEMOTION',
                    message: 'Cannot change your own role'
                }
            });
        }

        // Update user role
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                role: newRole,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user role:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: 'Failed to update user role'
                }
            });
        }

        // Log role change
        await supabaseAdmin.rpc('log_event', {
            p_event_type: 'user_role_changed',
            p_event_data: {
                user_id: userId,
                old_role: data.role,
                new_role: newRole,
                changed_by: requesterId
            },
            p_severity: 'info',
            p_source: 'admin_auth_api',
            p_user_id: requesterId
        });

        return res.status(200).json({
            success: true,
            data: { profile: data }
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'ROLE_UPDATE_ERROR',
                message: 'Failed to update user role'
            }
        });
    }
}

// Toggle user active status (super admin only)
async function toggleUserStatus(req, res, { userId, requesterId }) {
    try {
        // Verify requester is super admin
        const { data: requester } = await supabaseAdmin
            .from('profiles')
            .select('role, is_active')
            .eq('id', requesterId)
            .single();

        if (!requester?.is_active || requester.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Super admin access required'
                }
            });
        }

        // Prevent self-deactivation
        if (userId === requesterId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SELF_DEACTIVATION',
                    message: 'Cannot deactivate your own account'
                }
            });
        }

        // Get current status
        const { data: currentUser } = await supabaseAdmin
            .from('profiles')
            .select('is_active')
            .eq('id', userId)
            .single();

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Toggle status
        const newStatus = !currentUser.is_active;
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                is_active: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user status:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: 'Failed to update user status'
                }
            });
        }

        // Log status change
        await supabaseAdmin.rpc('log_event', {
            p_event_type: 'user_status_changed',
            p_event_data: {
                user_id: userId,
                new_status: newStatus ? 'active' : 'inactive',
                changed_by: requesterId
            },
            p_severity: 'info',
            p_source: 'admin_auth_api',
            p_user_id: requesterId
        });

        return res.status(200).json({
            success: true,
            data: { profile: data }
        });

    } catch (error) {
        console.error('Error toggling user status:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'STATUS_UPDATE_ERROR',
                message: 'Failed to update user status'
            }
        });
    }
}

// List all users (admin only)
async function listUsers(req, res, { requesterId, filters = {} }) {
    try {
        // Verify requester is admin
        const { data: requester } = await supabaseAdmin
            .from('profiles')
            .select('role, is_active')
            .eq('id', requesterId)
            .single();

        if (!requester?.is_active || !['admin', 'super_admin'].includes(requester.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Admin access required'
                }
            });
        }

        let query = supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.role && filters.role !== 'all') {
            query = query.eq('role', filters.role);
        }

        if (filters.status && filters.status !== 'all') {
            const isActive = filters.status === 'active';
            query = query.eq('is_active', isActive);
        }

        const { data: users, error } = await query;

        if (error) {
            console.error('Error listing users:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'LIST_ERROR',
                    message: 'Failed to list users'
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: { users }
        });

    } catch (error) {
        console.error('Error listing users:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'LIST_USERS_ERROR',
                message: 'Failed to list users'
            }
        });
    }
}