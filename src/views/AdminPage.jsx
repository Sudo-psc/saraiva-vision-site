import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeHelmet } from '@/components/SafeHelmet';
import BlockingRequests from '@/components/admin/BlockingRequests';

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <>
      <SafeHelmet
        title="Painel Administrativo - Saraiva Vision"
      >
        <meta name="robots" content="noindex, nofollow" />
      </SafeHelmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="ml-3 font-bold text-gray-900 text-lg">Painel Admin</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`${activeTab === 'requests' ? 'border-brand-blue text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Solicitações de Bloqueio
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`${activeTab === 'security' ? 'border-brand-blue text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Segurança
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                  <span className="sr-only">Sair</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'requests' && (
            <BlockingRequests />
          )}
          
          {activeTab === 'security' && (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status de Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-semibold">Firewall (WAF)</div>
                  <div className="mt-1 text-2xl font-bold text-green-800">Ativo</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-semibold">Rate Limit</div>
                  <div className="mt-1 text-2xl font-bold text-blue-800">100 req/min</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-600 font-semibold">IPs Bloqueados</div>
                  <div className="mt-1 text-2xl font-bold text-yellow-800">12</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminPage;