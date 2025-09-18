import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Activity, Database, Globe, Server, Shield, Clock } from 'lucide-react';
import SEOHead from '../components/SEOHead';

// Card components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const StatusPage = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/check', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatusData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching status:', err);
      setError(err.message);
      // Create fallback status data
      setStatusData({
        overall_status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Unable to fetch complete status data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 120 seconds (increased from 30s as requested)
    const interval = autoRefresh ? setInterval(fetchStatus, 120000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
      case 'healthy':
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
      case 'healthy':
      case 'active':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  return (
    <>
      <SEOHead 
        title="Status do Sistema | Clínica Saraiva Vision"
        description="Verifique o status em tempo real dos serviços da Clínica Saraiva Vision"
        canonical="https://saraivavision.com.br/status"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-blue-600" />
                  Status do Sistema
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitoramento em tempo real dos serviços da Clínica Saraiva Vision
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-refresh (120s)</span>
                </label>
                <button
                  onClick={fetchStatus}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {statusData && getStatusIcon(statusData.overall_status)}
                  <div>
                    <h2 className="text-xl font-semibold">
                      Status Geral: 
                      <span className={`ml-2 ${statusData ? getStatusColor(statusData.overall_status) : ''}`}>
                        {statusData?.overall_status === 'healthy' ? 'Operacional' : 
                         statusData?.overall_status === 'degraded' ? 'Parcial' : 
                         statusData?.overall_status === 'error' ? 'Com Problemas' : 'Verificando...'}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Última atualização: {formatUptime(lastRefresh)}
                    </p>
                  </div>
                </div>
                {statusData?.performance && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tempo de resposta</p>
                    <p className="text-lg font-semibold">{statusData.performance.response_time}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Website Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Website Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData?.services?.website?.status)}
                      <span className={getStatusColor(statusData?.services?.website?.status)}>
                        {statusData?.services?.website?.status === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">URL</span>
                    <a href={statusData?.services?.website?.url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline text-sm">
                      Visitar →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blog Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Blog WordPress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData?.services?.blog?.status)}
                      <span className={getStatusColor(statusData?.services?.blog?.status)}>
                        {statusData?.services?.blog?.status === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts publicados</span>
                    <span className="font-semibold">
                      {statusData?.checks?.database?.published_posts || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  API REST
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData?.services?.api?.status)}
                      <span className={getStatusColor(statusData?.services?.api?.status)}>
                        {statusData?.services?.api?.status === 'active' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Endpoints</span>
                    <span className="font-semibold">
                      {statusData?.checks?.api_endpoints ? Object.keys(statusData.checks.api_endpoints).length : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Checks */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-600" />
                  Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conexão</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData?.checks?.database?.status)}
                      <span className={getStatusColor(statusData?.checks?.database?.status)}>
                        {statusData?.checks?.database?.message || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts publicados</span>
                    <span className="font-semibold">{statusData?.checks?.database?.published_posts || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-600" />
                  Servidor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">PHP Version</span>
                    <span className="font-semibold">{statusData?.checks?.php_config?.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Espaço livre</span>
                    <span className="font-semibold">{statusData?.checks?.server?.disk_free_space || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory Limit</span>
                    <span className="font-semibold">{statusData?.checks?.php_config?.memory_limit || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PHP Extensions */}
          {statusData?.checks?.php_config?.extensions && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-600" />
                  Extensões PHP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(statusData.checks.php_config.extensions).map(([ext, enabled]) => (
                    <div key={ext} className="flex items-center gap-2">
                      {enabled ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                        {ext}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Endpoints Status */}
          {statusData?.checks?.api_endpoints && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(statusData.checks.api_endpoints).map(([endpoint, data]) => (
                    <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(data.status)}
                        <div>
                          <p className="font-medium capitalize">{endpoint}</p>
                          {data.count !== undefined && (
                            <p className="text-sm text-gray-600">{data.count} items</p>
                          )}
                        </div>
                      </div>
                      {data.has_content !== undefined && (
                        <span className={`text-sm ${data.has_content ? 'text-green-600' : 'text-yellow-600'}`}>
                          {data.has_content ? 'Com conteúdo' : 'Vazio'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">Erro ao carregar status</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Sistema de monitoramento da Clínica Saraiva Vision</p>
            <p className="mt-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Atualização automática a cada 120 segundos
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusPage;