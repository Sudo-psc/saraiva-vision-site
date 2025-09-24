import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({
    children,
    requiredRole = 'user',
    requireDashboardAccess = false,
    fallbackPath = '/admin/login'
}) => {
    const {
        user,
        profile,
        loading,
        hasRole,
        canAccessDashboard,
        isAuthenticated,
        isProfileLoaded
    } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading || (isAuthenticated && !isProfileLoaded)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <Navigate
                to={fallbackPath}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // Check if profile is loaded and active
    if (!profile || !profile.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Account Inactive
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Your account is not active or could not be loaded.
                        Please contact an administrator for assistance.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Check role-based access
    if (!hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-4">
                        You don't have the required permissions to access this page.
                        Required role: <span className="font-medium">{requiredRole}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Your current role: <span className="font-medium">{profile.role}</span>
                    </p>
                    <Navigate to="/" replace />
                </div>
            </div>
        );
    }

    // Check dashboard-specific access
    if (requireDashboardAccess && !canAccessDashboard()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Dashboard Access Restricted
                    </h2>
                    <p className="text-gray-600 mb-4">
                        You don't have access to the admin dashboard.
                        Admin role is required.
                    </p>
                    <Navigate to="/" replace />
                </div>
            </div>
        );
    }

    // All checks passed, render the protected content
    return children;
};

export default ProtectedRoute;