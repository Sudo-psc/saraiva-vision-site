import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminLogin from '../components/auth/AdminLogin';
import DashboardPage from '../pages/DashboardPage';

const AdminRoutes = () => {
    return (
        <AuthProvider>
            <Routes>
                {/* Admin login route */}
                <Route path="/login" element={<AdminLogin />} />

                {/* Protected admin routes */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute
                            requiredRole="admin"
                            requireDashboardAccess={true}
                            fallbackPath="/admin/login"
                        >
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
};

export default AdminRoutes;