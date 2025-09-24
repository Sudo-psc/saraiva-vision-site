/**
 * LGPD Access Control System
 * Handles role-based permissions and data access controls
 */

import { supabase } from 'from 'from '../supabase.js'' ' ;

export class AccessControl {
    constructor() {
        this.roles = {
            ADMIN: 'admin',
            DOCTOR: 'doctor',
            STAFF: 'staff',
            PATIENT: 'patient',
            ANONYMOUS: 'anonymous'
        };

        this.permissions = {
            // Data access permissions
            READ_ALL_PATIENT_DATA: 'read_all_patient_data',
            READ_OWN_PATIENT_DATA: 'read_own_patient_data',
            WRITE_PATIENT_DATA: 'write_patient_data',
            DELETE_PATIENT_DATA: 'delete_patient_data',
            ANONYMIZE_PATIENT_DATA: 'anonymize_patient_data',

            // System permissions
            ACCESS_DASHBOARD: 'access_dashboard',
            MANAGE_USERS: 'manage_users',
            VIEW_AUDIT_LOGS: 'view_audit_logs',
            EXPORT_DATA: 'export_data',

            // LGPD specific permissions
            HANDLE_DATA_REQUESTS: 'handle_data_requests',
            VIEW_CONSENT_RECORDS: 'view_consent_records',
            MANAGE_PRIVACY_SETTINGS: 'manage_privacy_settings'
        };

        this.rolePermissions = {
            [this.roles.ADMIN]: [
                this.permissions.READ_ALL_PATIENT_DATA,
                this.permissions.WRITE_PATIENT_DATA,
                this.permissions.DELETE_PATIENT_DATA,
                this.permissions.ANONYMIZE_PATIENT_DATA,
                this.permissions.ACCESS_DASHBOARD,
                this.permissions.MANAGE_USERS,
                this.permissions.VIEW_AUDIT_LOGS,
                this.permissions.EXPORT_DATA,
                this.permissions.HANDLE_DATA_REQUESTS,
                this.permissions.VIEW_CONSENT_RECORDS,
                this.permissions.MANAGE_PRIVACY_SETTINGS
            ],

            [this.roles.DOCTOR]: [
                this.permissions.READ_ALL_PATIENT_DATA,
                this.permissions.WRITE_PATIENT_DATA,
                this.permissions.ACCESS_DASHBOARD,
                this.permissions.VIEW_CONSENT_RECORDS,
                this.permissions.HANDLE_DATA_REQUESTS
            ],

            [this.roles.STAFF]: [
                this.permissions.READ_ALL_PATIENT_DATA,
                this.permissions.WRITE_PATIENT_DATA,
                this.permissions.ACCESS_DASHBOARD
            ],

            [this.roles.PATIENT]: [
                this.permissions.READ_OWN_PATIENT_DATA,
                this.permissions.EXPORT_DATA
            ],

            [this.roles.ANONYMOUS]: []
        };
    }

    /**
     * Get user role from JWT token or session
     */
    async getUserRole(user) {
        try {
            if (!user) return this.roles.ANONYMOUS;

            // Check if user has admin role in JWT
            if (user.app_metadata?.role === 'admin') {
                return this.roles.ADMIN;
            }

            // Check user role in database
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            return userProfile?.role || this.roles.PATIENT;
        } catch (error) {
            console.error('Error getting user role:', error);
            return this.roles.ANONYMOUS;
        }
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(userRole, permission) {
        const rolePermissions = this.rolePermissions[userRole] || [];
        return rolePermissions.includes(permission);
    }

    /**
     * Check if user can access patient data
     */
    canAccessPatientData(userRole, patientId, userId = null) {
        // Admin and medical staff can access all patient data
        if (this.hasPermission(userRole, this.permissions.READ_ALL_PATIENT_DATA)) {
            return true;
        }

        // Patients can only access their own data
        if (userRole === this.roles.PATIENT && userId === patientId) {
            return this.hasPermission(userRole, this.permissions.READ_OWN_PATIENT_DATA);
        }

        return false;
    }

    /**
     * Validate API access with role-based permissions
     */
    async validateAPIAccess(req, requiredPermission) {
        try {
            // Get user from request (JWT token)
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    authorized: false,
                    error: 'Token de autorização necessário'
                };
            }

            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return {
                    authorized: false,
                    error: 'Token inválido ou expirado'
                };
            }

            const userRole = await this.getUserRole(user);
            const hasPermission = this.hasPermission(userRole, requiredPermission);

            if (!hasPermission) {
                // Log unauthorized access attempt
                await this.logAccessAttempt(user.id, requiredPermission, false);

                return {
                    authorized: false,
                    error: 'Permissão insuficiente para esta operação'
                };
            }

            // Log successful access
            await this.logAccessAttempt(user.id, requiredPermission, true);

            return {
                authorized: true,
                user,
                userRole
            };
        } catch (error) {
            console.error('API access validation error:', error);
            return {
                authorized: false,
                error: 'Erro na validação de acesso'
            };
        }
    }

    /**
     * Create data access filter based on user role
     */
    createDataFilter(userRole, userId = null) {
        switch (userRole) {
            case this.roles.ADMIN:
            case this.roles.DOCTOR:
            case this.roles.STAFF:
                // Can access all data
                return {};

            case this.roles.PATIENT:
                // Can only access own data
                return {
                    patient_id: userId,
                    // Alternative filters for different table structures
                    user_id: userId,
                    email: userId // If using email as identifier
                };

            default:
                // No access
                return { id: null };
        }
    }

    /**
     * Log access attempts for audit purposes
     */
    async logAccessAttempt(userId, permission, success) {
        try {
            await supabase
                .from('access_audit_log')
                .insert({
                    user_id: userId,
                    permission_requested: permission,
                    access_granted: success,
                    timestamp: new Date().toISOString(),
                    ip_address: 'server', // In production, get from request
                    user_agent: 'api' // In production, get from request
                });
        } catch (error) {
            console.error('Error logging access attempt:', error);
        }
    }

    /**
     * Create middleware for protecting API routes
     */
    createAuthMiddleware(requiredPermission) {
        return async (req, res, next) => {
            const validation = await this.validateAPIAccess(req, requiredPermission);

            if (!validation.authorized) {
                return res.status(403).json({
                    success: false,
                    error: validation.error
                });
            }

            // Add user info to request
            req.user = validation.user;
            req.userRole = validation.userRole;

            next();
        };
    }

    /**
     * Check data retention policies
     */
    checkDataRetention(recordDate, dataType) {
        const retentionPolicies = {
            contact_messages: 365 * 2, // 2 years
            appointments: 365 * 5, // 5 years (medical records)
            audit_logs: 365 * 7, // 7 years (legal requirement)
            consent_records: 365 * 3 // 3 years after withdrawal
        };

        const retentionDays = retentionPolicies[dataType] || 365;
        const recordAge = (new Date() - new Date(recordDate)) / (1000 * 60 * 60 * 24);

        return {
            shouldRetain: recordAge <= retentionDays,
            daysRemaining: Math.max(0, retentionDays - recordAge),
            retentionPolicy: `${retentionDays} dias`
        };
    }

    /**
     * Generate access control report
     */
    async generateAccessReport(startDate, endDate) {
        try {
            const { data: accessLogs } = await supabase
                .from('access_audit_log')
                .select('*')
                .gte('timestamp', startDate)
                .lte('timestamp', endDate)
                .order('timestamp', { ascending: false });

            const report = {
                period: { start: startDate, end: endDate },
                total_attempts: accessLogs?.length || 0,
                successful_attempts: accessLogs?.filter(log => log.access_granted).length || 0,
                failed_attempts: accessLogs?.filter(log => !log.access_granted).length || 0,
                unique_users: new Set(accessLogs?.map(log => log.user_id)).size,
                most_requested_permissions: this.getMostRequestedPermissions(accessLogs),
                security_incidents: accessLogs?.filter(log =>
                    !log.access_granted &&
                    this.isSecurityIncident(log)
                ) || []
            };

            return report;
        } catch (error) {
            console.error('Error generating access report:', error);
            throw error;
        }
    }

    /**
     * Get most requested permissions from logs
     */
    getMostRequestedPermissions(logs) {
        const permissionCounts = {};

        logs?.forEach(log => {
            const permission = log.permission_requested;
            permissionCounts[permission] = (permissionCounts[permission] || 0) + 1;
        });

        return Object.entries(permissionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([permission, count]) => ({ permission, count }));
    }

    /**
     * Determine if access attempt is a security incident
     */
    isSecurityIncident(log) {
        // Define criteria for security incidents
        const sensitivePermissions = [
            this.permissions.DELETE_PATIENT_DATA,
            this.permissions.ANONYMIZE_PATIENT_DATA,
            this.permissions.MANAGE_USERS
        ];

        return sensitivePermissions.includes(log.permission_requested);
    }
}

// Singleton instance
export const accessControl = new AccessControl();