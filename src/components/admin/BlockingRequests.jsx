import React, { useState, useEffect } from 'react';

const BlockingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API fetch
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Mock data
        const mockData = [
          {
            id: 'req_1',
            timestamp: new Date().toISOString(),
            type: 'Security',
            source: '192.168.1.105',
            reason: 'Rate Limit Exceeded',
            status: 'Blocked',
            details: 'Exceeded 100 requests/minute'
          },
          {
            id: 'req_2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'Privacy (LGPD)',
            source: 'user_123 (Authenticated)',
            reason: 'Data Deletion Request',
            status: 'Pending Review',
            details: 'User requested deletion of account data'
          },
          {
            id: 'req_3',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'Security',
            source: '10.0.0.50',
            reason: 'Malicious Payload',
            status: 'Blocked',
            details: 'SQL Injection attempt detected'
          },
          {
            id: 'req_4',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            type: 'Privacy (LGPD)',
            source: 'patient@example.com',
            reason: 'Data Portability Request',
            status: 'Completed',
            details: 'Export generated and sent'
          }
        ];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setRequests(mockData);
      } catch (error) {
        console.error('Failed to fetch blocking requests', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = (id, action) => {
    console.log(`Action ${action} on request ${id}`);
    // Update local state to reflect action
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'Approved' : 'Dismissed' } : req
    ));
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Solicitações de Bloqueio e Segurança
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Gerenciamento de bloqueios de segurança e solicitações de privacidade (LGPD).
          </p>
        </div>
        <span className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            onClick={() => window.location.reload()}
          >
            Atualizar
          </button>
        </span>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo / Razão
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origem
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {request.type === 'Security' ? (
                          <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.reason}</div>
                        <div className="text-sm text-gray-500">{request.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.source}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{request.details}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${request.status === 'Blocked' ? 'bg-red-100 text-red-800' : 
                        request.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'Completed' || request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === 'Pending Review' && (
                      <button 
                        onClick={() => handleAction(request.id, 'approve')}
                        className="text-brand-blue hover:text-brand-blue/80 mr-4"
                      >
                        Aprovar
                      </button>
                    )}
                    {(request.status === 'Blocked' || request.status === 'Pending Review') && (
                      <button 
                        onClick={() => handleAction(request.id, 'dismiss')}
                        className="text-red-600 hover:text-red-900"
                      >
                        {request.status === 'Blocked' ? 'Desbloquear' : 'Rejeitar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockingRequests;
