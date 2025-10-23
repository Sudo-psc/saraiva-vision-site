/**
 * Protected Route Component
 *
 * Wrapper component for routes that require authentication.
 * Redirects to login page if user is not authenticated.
 *
 * @module ProtectedRoute
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/subscribers/contexts/AuthContext';

/**
 * Protected Route Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect if not authenticated
 * @returns {React.ReactElement} Protected content or redirect
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="Carregando..."
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Carregando...
            </span>
          </div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};
