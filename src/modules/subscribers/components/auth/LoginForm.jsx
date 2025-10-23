/**
 * Login Form Component
 *
 * Provides login form with email/password and Google Sign-In options.
 * Integrates with AuthContext for authentication.
 *
 * @module LoginForm
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

/**
 * Login Form Component
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback on successful login
 * @param {Function} props.onError - Callback on error
 * @param {string} props.redirectPath - Path to redirect after login
 * @returns {React.ReactElement} Login form
 */
export default function LoginForm({ onSuccess, onError, redirectPath = '/assinante' }) {
  const { signInWithEmail, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  /**
   * Handle email/password login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.user, redirectPath);
        }
      } else {
        setError(result.error?.message || 'Erro ao fazer login');
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password reset
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setResetEmailSent(true);
        setShowResetForm(false);
      } else {
        setError(result.error?.message || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google Sign-In success
   */
  const handleGoogleSuccess = (user) => {
    if (onSuccess) {
      onSuccess(user, redirectPath);
    }
  };

  /**
   * Handle Google Sign-In error
   */
  const handleGoogleError = (err) => {
    setError(err.message || 'Erro ao fazer login com Google');
    if (onError) {
      onError(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {showResetForm ? 'Recuperar Senha' : 'Entrar na sua conta'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {resetEmailSent && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Email de recuperação enviado! Verifique sua caixa de entrada.
          </div>
        )}

        {showResetForm ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
                aria-label="Digite seu email para recuperação"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setError(null);
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voltar para login
            </button>
          </form>
        ) : (
          <>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              className="mb-6"
            />

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                  aria-label="Digite seu email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    aria-label="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(true);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  redirectPath: PropTypes.string,
};
