/**
 * Dashboard Page
 *
 * Main dashboard for authenticated subscribers.
 * Shows subscription status, upcoming appointments, and quick actions.
 *
 * @module DashboardPage
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard Page Component
 * @returns {React.ReactElement} Dashboard page
 */
export default function DashboardPage() {
  const { user, subscriber, signOut } = useAuth();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      // Redirect handled by AuthContext
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Área do Assinante | Saraiva Vision</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex-shrink-0">
                  <img
                    src="/logo.svg"
                    alt="Saraiva Vision"
                    className="h-10 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Área do Assinante
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user?.displayName || user?.email}
                </span>
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Foto de perfil"
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Olá, {user?.displayName?.split(' ')[0] || 'Assinante'}!
            </h2>
            <p className="mt-2 text-gray-600">
              Bem-vindo à sua área exclusiva da Saraiva Vision
            </p>
          </div>

          {/* Subscription Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {subscriber?.subscriptionStatus === 'active' ? (
                      <span className="text-green-600">Ativo</span>
                    ) : (
                      <span className="text-red-600">Inativo</span>
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plano</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 capitalize">
                    {subscriber?.subscriptionPlan || 'Básico'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consultas</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {subscriber?.appointments?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              to="/assinante/consultas"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Minhas Consultas
              </h3>
              <p className="text-gray-600 text-sm">
                Veja suas consultas agendadas e histórico
              </p>
            </Link>

            <Link
              to="/assinante/perfil"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Meu Perfil
              </h3>
              <p className="text-gray-600 text-sm">
                Atualize suas informações pessoais
              </p>
            </Link>

            <Link
              to="/agendamento"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agendar Consulta
              </h3>
              <p className="text-gray-600 text-sm">
                Agende uma nova consulta com Dr. Philipe
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Atividade Recente
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 text-sm">
                Nenhuma atividade recente para exibir.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
