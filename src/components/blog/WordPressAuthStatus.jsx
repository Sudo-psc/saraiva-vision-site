/**
 * WordPress Authentication Status Component
 * Displays current WordPress authentication state and provides login/logout controls
 */

import React, { useState } from 'react';
import { useWordPressAuth } from '../../contexts/WordPressAuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const WordPressAuthStatus = ({ showControls = true, className = '' }) => {
    const {
        isAuthenticated,
        wordpressUser,
        loading,
        authStatus,
        error,
        login,
        logout,
        refreshToken,
        testConnection,
        canEditPosts,
        canPublishPosts,
        getTokenTimeRemaining,
        isTokenExpiringSoon
    } = useWordPressAuth();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginForm.username || !loginForm.password) {
            setLoginError('Por favor, preencha usuário e senha.');
            return;
        }

        setIsLoggingIn(true);
        setLoginError(null);

        try {
            const result = await login(loginForm.username, loginForm.password);

            if (result.success) {
                setShowLoginModal(false);
                setLoginForm({ username: '', password: '' });
            } else {
                setLoginError(result.error || 'Falha no login.');
            }
        } catch (err) {
            setLoginError('Erro ao conectar com o WordPress.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const formatTimeRemaining = (milliseconds) => {
        if (!milliseconds) return 'N/A';

        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    if (loading && !isAuthenticated) {
        return (
            <div className={`wordpress-auth-status ${className}`}>
                <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-600">Verificando autenticação WordPress...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`wordpress-auth-status ${className}`}>
            {/* Authentication Status Display */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                    {/* Status Indicator */}
                    <div className={`w-3 h-3 rounded-full ${
                        isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                    }`} />

                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                                WordPress Auth
                            </span>
                            {isAuthenticated ? (
                                <span className="text-green-600 text-sm">● Conectado</span>
                            ) : (
                                <span className="text-red-600 text-sm">● Desconectado</span>
                            )}
                        </div>

                        {isAuthenticated && wordpressUser && (
                            <div className="text-sm text-gray-600">
                                <span>{wordpressUser.name}</span>
                                {wordpressUser.email && (
                                    <span className="ml-2">({wordpressUser.email})</span>
                                )}
                            </div>
                        )}

                        {isAuthenticated && authStatus?.tokenExpiry && (
                            <div className="text-xs text-gray-500">
                                Token expira em: {formatTimeRemaining(getTokenTimeRemaining())}
                                {isTokenExpiringSoon() && (
                                    <span className="ml-2 text-orange-600">● Expirando em breve</span>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-600">
                                Erro: {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Control Buttons */}
                {showControls && (
                    <div className="flex items-center space-x-2">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => testConnection()}
                                    disabled={loading}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                >
                                    {loading ? 'Testando...' : 'Testar'}
                                </button>

                                {isTokenExpiringSoon() && (
                                    <button
                                        onClick={() => refreshToken()}
                                        disabled={loading}
                                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
                                    >
                                        {loading ? 'Atualizando...' : 'Renovar'}
                                    </button>
                                )}

                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                >
                                    {loading ? 'Saindo...' : 'Sair'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                disabled={loading}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Entrar
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Capabilities Display */}
            {isAuthenticated && wordpressUser?.capabilities && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Permissões:</div>
                    <div className="flex flex-wrap gap-2">
                        {canEditPosts() && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                Editar Posts
                            </span>
                        )}
                        {canPublishPosts() && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Publicar Posts
                            </span>
                        )}
                        {wordpressUser.capabilities.includes('manage_categories') && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                Gerenciar Categorias
                            </span>
                        )}
                        {wordpressUser.capabilities.includes('upload_files') && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                Upload de Arquivos
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Login WordPress</h3>
                            <button
                                onClick={() => {
                                    setShowLoginModal(false);
                                    setLoginError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usuário WordPress
                                    </label>
                                    <input
                                        type="text"
                                        value={loginForm.username}
                                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Digite seu usuário"
                                        disabled={isLoggingIn}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Digite sua senha"
                                        disabled={isLoggingIn}
                                    />
                                </div>

                                {loginError && (
                                    <ErrorMessage message={loginError} />
                                )}

                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLoginModal(false);
                                            setLoginError(null);
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                        disabled={isLoggingIn}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isLoggingIn}
                                    >
                                        {isLoggingIn ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordPressAuthStatus;