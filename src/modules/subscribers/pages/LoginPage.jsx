/**
 * Login Page
 *
 * Main login page for subscribers.
 * Provides authentication via Google or email/password.
 *
 * @module LoginPage
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

/**
 * Login Page Component
 * @returns {React.ReactElement} Login page
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/assinante';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Handle successful login
   * @param {Object} user - Authenticated user
   * @param {string} redirectPath - Path to redirect to
   */
  const handleLoginSuccess = (user, redirectPath) => {
    const from = location.state?.from?.pathname || redirectPath;
    navigate(from, { replace: true });
  };

  /**
   * Handle login error
   * @param {Error} error - Authentication error
   */
  const handleLoginError = (error) => {
    console.error('Login error:', error);
    // Error is handled by LoginForm component
  };

  return (
    <>
      <Helmet>
        <title>Login - Área do Assinante | Saraiva Vision</title>
        <meta
          name="description"
          content="Faça login na sua conta de assinante da Saraiva Vision. Acesse sua área exclusiva, consultas, histórico médico e muito mais."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img
              src="/logo.svg"
              alt="Saraiva Vision"
              className="h-16 w-auto"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Área do Assinante
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse sua conta para gerenciar suas consultas e informações
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            redirectPath="/assinante"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Precisa de ajuda?{' '}
            <a
              href="/contato"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
