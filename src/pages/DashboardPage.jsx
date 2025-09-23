import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    Bell,
    Search,
    Flag
} from 'lucide-react';
import FeatureFlagsDemo from '../components/FeatureFlagsDemo';

const DashboardPage = () => {
    const { user, profile, signOut, isAdmin, isSuperAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/admin/dashboard'
        },
        ...(isSuperAdmin() ? [{
            name: 'User Management',
            href: '/admin/users',
            icon: Users,
            current: location.pathname === '/admin/users'
        }] : []),
        {
            name: 'Settings',
            href: '/admin/settings',
            icon: Settings,
            current: location.pathname === '/admin/settings'
        },
        {
            name: 'Feature Flags',
            href: '/admin/feature-flags',
            icon: Flag,
            current: location.pathname === '/admin/feature-flags'
        }
    ];

    return (
        <ProtectedRoute requiredRole="admin" requireDashboardAccess={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile sidebar */}
                <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <Sidebar navigation={navigation} profile={profile} onLogout={handleLogout} />
                    </div>
                </div>

                {/* Desktop sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                    <Sidebar navigation={navigation} profile={profile} onLogout={handleLogout} />
                </div>

                {/* Main content */}
                <div className="md:pl-64 flex flex-col flex-1">
                    {/* Top navigation */}
                    <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
                        <button
                            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Page header */}
                    <header className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-4">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Saraiva Vision - Admin Dashboard
                                    </h1>
                                    {profile?.role && (
                                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Shield className="h-3 w-3 mr-1" />
                                            {profile.role.replace('_', ' ').toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Notifications */}
                                    <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                                    </button>

                                    {/* User menu */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {profile?.full_name || 'Admin User'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user?.email}
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main content area */}
                    <main className="flex-1">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            <Routes>
                                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                {isSuperAdmin() && (
                                    <Route path="/users" element={<UserManagement />} />
                                )}
                                <Route path="/settings" element={<SettingsPlaceholder />} />
                                <Route path="/feature-flags" element={<FeatureFlagsDemo />} />
                                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
};

// Sidebar Component
const Sidebar = ({ navigation, profile, onLogout }) => {
    return (
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${item.current
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon
                                className={`mr-3 flex-shrink-0 h-5 w-5 ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User info and logout */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {profile?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                            {profile?.role?.replace('_', ' ')}
                        </p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Settings Placeholder Component
const SettingsPlaceholder = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600">System configuration and preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                    <p className="text-gray-500">
                        Settings configuration will be implemented in a future update.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;