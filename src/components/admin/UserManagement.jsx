import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useAdminOperations from '../../hooks/useAdminOperations';
import CreateUserModal from './CreateUserModal';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Shield,
    ShieldCheck,
    ShieldX,
    Search,
    Filter,
    MoreVertical,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

const UserManagement = () => {
    const { profile, isSuperAdmin } = useAuth();
    const {
        loading: adminLoading,
        error: adminError,
        listUsers,
        updateUserRole: adminUpdateUserRole,
        toggleUserStatus: adminToggleUserStatus,
        clearError
    } = useAdminOperations();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (adminError) {
            setError(adminError);
        }
    }, [adminError]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            clearError();

            const usersData = await listUsers();
            setUsers(usersData || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            setError('');
            clearError();

            const updatedProfile = await adminUpdateUserRole(userId, newRole);

            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? updatedProfile : user
            ));

        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role');
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            setError('');
            clearError();

            const updatedProfile = await adminToggleUserStatus(userId);

            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? updatedProfile : user
            ));

        } catch (error) {
            console.error('Error updating user status:', error);
            setError('Failed to update user status');
        }
    };

    const handleUserCreated = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        setShowCreateModal(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'super_admin':
                return <ShieldCheck className="h-4 w-4 text-red-600" />;
            case 'admin':
                return <Shield className="h-4 w-4 text-blue-600" />;
            default:
                return <ShieldX className="h-4 w-4 text-gray-400" />;
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            super_admin: 'bg-red-100 text-red-800 border-red-200',
            admin: 'bg-blue-100 text-blue-800 border-blue-200',
            user: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.user}`}>
                {getRoleIcon(role)}
                <span className="ml-1 capitalize">{(role || 'user').replace('_', ' ')}</span>
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                {isActive ? (
                    <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                    </>
                )}
            </span>
        );
    };

    if (loading || adminLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage admin users and permissions</p>
                </div>
                {isSuperAdmin() && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                {isSuperAdmin() && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.full_name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(user.is_active)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.last_login ? (
                                            new Date(user.last_login).toLocaleDateString()
                                        ) : (
                                            <span className="text-gray-400">Never</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    {isSuperAdmin() && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* Role Change */}
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={user.id === profile.id} // Can't change own role
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>

                                                {/* Status Toggle */}
                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                    disabled={user.id === profile.id} // Can't deactivate self
                                                    className={`p-1 rounded ${user.is_active
                                                        ? 'text-green-600 hover:text-green-800'
                                                        : 'text-red-600 hover:text-red-800'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title={user.is_active ? 'Deactivate user' : 'Activate user'}
                                                >
                                                    {user.is_active ? (
                                                        <Eye className="h-4 w-4" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Admins</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Active</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.is_active).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Recent Logins</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {users.filter(u => u.last_login &&
                                    new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
};

export default UserManagement;