import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useAdminOperations = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (action, payload = {}) => {
        if (!user || !profile) {
            throw new Error('User not authenticated');
        }

        const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action,
                requesterId: user.id,
                ...payload
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Operation failed');
        }

        return data.data;
    }, [user, profile]);

    const verifyAdminAccess = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiCall('verify_admin', { userId });
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const getUserProfile = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiCall('get_user_profile', { userId });
            return result.profile;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const updateUserRole = useCallback(async (userId, newRole) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiCall('update_user_role', { userId, newRole });
            return result.profile;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const toggleUserStatus = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiCall('toggle_user_status', { userId });
            return result.profile;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const listUsers = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiCall('list_users', { filters });
            return result.users;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        clearError,
        verifyAdminAccess,
        getUserProfile,
        updateUserRole,
        toggleUserStatus,
        listUsers
    };
};

export default useAdminOperations;