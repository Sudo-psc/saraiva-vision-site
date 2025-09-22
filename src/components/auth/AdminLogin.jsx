import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Lock,
    User,
    Eye,
    EyeOff,
    LogIn,
    AlertCircle,
    ArrowLeft,
    Shield,
    Loader2
} from 'lucide-react';

const AdminLogin = () => {
    const { signIn, user, loading: authLoading, canAccessDashboard } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authenticated and has admin access
    useEffect(() => {
        if (user && canAccessDashboard()) {
            const from = location.state?.from || '/admin/dashboard';
            navigate(from, { replace: true });
        }
    }, [user, canAccessDashboard, navigate, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: signInError } = await signIn(credentials.email, credentials.password);

            if (signInError) {
                throw signInError;
            }

            // The useEffect will handle the redirect once auth state updates
        } catch (err) {
            console.error('Login error:', err);

            // Handle specific error cases
            if (err.message?.includes('Invalid login credentials')) {
                setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Email não confirmado. Verifique sua caixa de entrada e confirme seu email.');
            } else if (err.message?.includes('Too many requests')) {
                setError('Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.');
            } else {
                setError('Erro ao fazer login. Tente novamente em alguns instantes.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = credentials.email.trim() && credentials.password.trim();

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Login
                    </h2>
                    <p className="text-gray-600">
                        Acesse o painel administrativo da Saraiva Vision
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="admin@saraivavision.com.br"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                                <Lock className="w-4 h-4 mr-2" />
                                Acesso restrito a administradores
                            </div>
                            <p className="text-xs text-gray-400">
                                Este painel é protegido por autenticação segura e controle de acesso baseado em funções.
                            </p>
                        </div>
                    </div>

                    {/* Back to Site */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;