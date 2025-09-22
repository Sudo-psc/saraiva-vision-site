import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Info,
    Key,
    Database,
    Clock,
    BarChart3,
    Users,
    Shield,
    Activity,
    Trash2,
    Plus,
    Edit,
    Eye,
    EyeOff
} from 'lucide-react';
import GoogleBusinessConfig from '../services/googleBusinessConfig';
import CachedGoogleBusinessService from '../services/cachedGoogleBusinessService';
import ReviewCacheManager from '../services/reviewCacheManager';

/**
 * GoogleBusinessAdmin Component
 * Administrative interface for managing Google Business integration
 */
const GoogleBusinessAdmin = ({
    className = '',
    onSave,
    onTest,
    onError
}) => {
    // State management
    const [config, setConfig] = useState(null);
    const [service, setService] = useState(null);
    const [cacheManager, setCacheManager] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'cache', 'advanced', 'monitoring'

    // Form state
    const [formData, setFormData] = useState({
        locationId: '',
        apiKey: '',
        isActive: true,
        cacheEnabled: true,
        cacheTTL: 3600,
        autoRefresh: false,
        refreshInterval: 300000,
        maxReviews: 50,
        enableNotifications: true,
        enableAnalytics: true,
        debugMode: false
    });

    // Cache stats
    const [cacheStats, setCacheStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    // Initialize services
    useEffect(() => {
        const initializeServices = async () => {
            try {
                // Initialize configuration
                const googleConfig = new GoogleBusinessConfig();
                setConfig(googleConfig);

                // Initialize cached service
                const cachedService = new CachedGoogleBusinessService();
                setService(cachedService);

                // Initialize cache manager
                const cacheMgr = new ReviewCacheManager();
                setCacheManager(cacheMgr);

                // Load current configuration
                await loadConfiguration();

                // Load cache statistics
                await loadCacheStats();

                // Load recent activity
                await loadRecentActivity();

                setLoading(false);
            } catch (error) {
                console.error('Failed to initialize admin services:', error);
                setError('Falha ao inicializar serviços de administração');
                setLoading(false);
            }
        };

        initializeServices();
    }, []);

    // Load configuration
    const loadConfiguration = async () => {
        try {
            if (config) {
                const currentConfig = await config.getConfig();
                if (currentConfig) {
                    setFormData({
                        locationId: currentConfig.locationId || '',
                        apiKey: currentConfig.apiKey || '',
                        isActive: currentConfig.isActive !== false,
                        cacheEnabled: currentConfig.cacheEnabled !== false,
                        cacheTTL: currentConfig.cacheTTL || 3600,
                        autoRefresh: currentConfig.autoRefresh || false,
                        refreshInterval: currentConfig.refreshInterval || 300000,
                        maxReviews: currentConfig.maxReviews || 50,
                        enableNotifications: currentConfig.enableNotifications !== false,
                        enableAnalytics: currentConfig.enableAnalytics !== false,
                        debugMode: currentConfig.debugMode || false
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    };

    // Load cache statistics
    const loadCacheStats = async () => {
        try {
            if (cacheManager) {
                const stats = await cacheManager.getCacheStats();
                setCacheStats(stats);
            }
        } catch (error) {
            console.error('Failed to load cache stats:', error);
        }
    };

    // Load recent activity
    const loadRecentActivity = async () => {
        try {
            if (service) {
                const activity = await service.getRecentActivity();
                setRecentActivity(activity || []);
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    };

    // Handle form changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save configuration
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            if (config) {
                const saveResult = await config.saveConfig(formData);

                if (saveResult.success) {
                    setSuccess('Configuração salva com sucesso!');

                    if (onSave) {
                        onSave(formData);
                    }

                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    setError(saveResult.error || 'Falha ao salvar configuração');
                }
            }
        } catch (error) {
            console.error('Failed to save configuration:', error);
            setError(error.message || 'Erro ao salvar configuração');

            if (onError) {
                onError(error);
            }
        } finally {
            setSaving(false);
        }
    };

    // Test configuration
    const handleTest = async () => {
        try {
            setTesting(true);
            setError(null);
            setSuccess(null);

            if (service && formData.locationId) {
                const testResult = await service.testConnection(formData);

                if (testResult.success) {
                    setSuccess('Conexão testada com sucesso! A integração está funcionando corretamente.');

                    if (onTest) {
                        onTest(testResult);
                    }

                    // Clear success message after 5 seconds
                    setTimeout(() => setSuccess(null), 5000);
                } else {
                    setError(testResult.error || 'Falha ao testar conexão');
                }
            } else {
                setError('ID do local é necessário para testar a conexão');
            }
        } catch (error) {
            console.error('Failed to test configuration:', error);
            setError(error.message || 'Erro ao testar configuração');

            if (onError) {
                onError(error);
            }
        } finally {
            setTesting(false);
        }
    };

    // Clear cache
    const handleClearCache = async () => {
        try {
            if (cacheManager) {
                await cacheManager.clearCache();
                await loadCacheStats();
                setSuccess('Cache limpo com sucesso!');
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Failed to clear cache:', error);
            setError('Falha ao limpar cache');
        }
    };

    // Format bytes
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    // Loading skeleton
    const AdminSkeleton = () => (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
                        <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render general settings tab
    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location ID */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        ID do Local do Google Business *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.locationId}
                            onChange={(e) => handleInputChange('locationId', e.target.value)}
                            placeholder="accounts/123456789/locations/987654321"
                            className="w-full px-3 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        />
                        <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ID completo do local no Google Business Profile
                    </p>
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Chave da API Google Business
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            value={formData.apiKey}
                            onChange={(e) => handleInputChange('apiKey', e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full px-3 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        />
                        <Shield size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Chave de API com permissões para Google Business Profile Data API
                    </p>
                </div>

                {/* Active Status */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Status da Integração
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleInputChange('isActive', !formData.isActive)}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${formData.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                            {formData.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>

                {/* Max Reviews */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Máximo de Avaliações
                    </label>
                    <input
                        type="number"
                        value={formData.maxReviews}
                        onChange={(e) => handleInputChange('maxReviews', parseInt(e.target.value))}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Número máximo de avaliações a serem exibidas
                    </p>
                </div>
            </div>

            {/* Auto Refresh Settings */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Configurações de Atualização Automática
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Atualização Automática
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleInputChange('autoRefresh', !formData.autoRefresh)}
                                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${formData.autoRefresh ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                `}
                            >
                                <span
                                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${formData.autoRefresh ? 'translate-x-6' : 'translate-x-1'}
                  `}
                                />
                            </button>
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                {formData.autoRefresh ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Intervalo de Atualização (ms)
                        </label>
                        <input
                            type="number"
                            value={formData.refreshInterval}
                            onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value))}
                            min="60000"
                            step="60000"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Mínimo: 60 segundos (60000ms)
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Settings */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Recursos Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Notificações
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleInputChange('enableNotifications', !formData.enableNotifications)}
                                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${formData.enableNotifications ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}
                `}
                            >
                                <span
                                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${formData.enableNotifications ? 'translate-x-6' : 'translate-x-1'}
                  `}
                                />
                            </button>
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                {formData.enableNotifications ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Analytics
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleInputChange('enableAnalytics', !formData.enableAnalytics)}
                                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${formData.enableAnalytics ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}
                `}
                            >
                                <span
                                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${formData.enableAnalytics ? 'translate-x-6' : 'translate-x-1'}
                  `}
                                />
                            </button>
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                {formData.enableAnalytics ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Modo Debug
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleInputChange('debugMode', !formData.debugMode)}
                                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${formData.debugMode ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}
                `}
                            >
                                <span
                                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${formData.debugMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                                />
                            </button>
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                {formData.debugMode ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render cache settings tab
    const renderCacheSettings = () => (
        <div className="space-y-6">
            {/* Cache Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Cache Habilitado
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleInputChange('cacheEnabled', !formData.cacheEnabled)}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${formData.cacheEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${formData.cacheEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                            {formData.cacheEnabled ? 'Ativado' : 'Desativado'}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        TTL do Cache (segundos)
                    </label>
                    <input
                        type="number"
                        value={formData.cacheTTL}
                        onChange={(e) => handleInputChange('cacheTTL', parseInt(e.target.value))}
                        min="60"
                        max="86400"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tempo de vida do cache em segundos
                    </p>
                </div>
            </div>

            {/* Cache Statistics */}
            {cacheStats && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Estatísticas do Cache
                        </h3>
                        <button
                            onClick={handleClearCache}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 size={16} />
                            Limpar Cache
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {cacheStats.totalEntries || 0}
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                Total de Entradas
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {cacheStats.hitRate || 0}%
                            </div>
                            <div className="text-xs text-green-700 dark:text-green-300">
                                Taxa de Acerto
                            </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                {formatBytes(cacheStats.totalSize || 0)}
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-300">
                                Tamanho Total
                            </div>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                {cacheStats.staleEntries || 0}
                            </div>
                            <div className="text-xs text-orange-700 dark:text-orange-300">
                                Entradas Obsoletas
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render monitoring tab
    const renderMonitoring = () => (
        <div className="space-y-6">
            {/* Recent Activity */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Atividade Recente
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {recentActivity.length === 0 ? (
                        <div className="p-8 text-center">
                            <Activity size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">
                                Nenhuma atividade recente
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="p-4 flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                                            activity.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                                                'bg-blue-100 dark:bg-blue-900/20'
                                        }`}>
                                        {activity.type === 'success' && <CheckCircle size={16} className="text-green-600 dark:text-green-400" />}
                                        {activity.type === 'error' && <AlertCircle size={16} className="text-red-600 dark:text-red-400" />}
                                        {activity.type === 'info' && <Info size={16} className="text-blue-600 dark:text-blue-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {formatDate(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* System Health */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Saúde do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                API Google Business
                            </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Conectado e funcionando
                        </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                Cache
                            </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Operacional
                        </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                Banco de Dados
                            </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Sincronizado
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Settings size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            Administração Google Business
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Configure e gerencie a integração com Google Business Profile
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Error and success messages */}
                <div className="space-y-3 mb-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Erro
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Sucesso
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                                    {success}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {loading && <AdminSkeleton />}

                {/* Tab navigation */}
                {!loading && (
                    <div className="space-y-6">
                        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                            {[
                                { id: 'general', label: 'Geral', icon: Settings },
                                { id: 'cache', label: 'Cache', icon: Database },
                                { id: 'monitoring', label: 'Monitoramento', icon: BarChart3 }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === tab.id
                                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }
                  `}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div>
                            {activeTab === 'general' && renderGeneralSettings()}
                            {activeTab === 'cache' && renderCacheSettings()}
                            {activeTab === 'monitoring' && renderMonitoring()}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Salvar Configurações
                            </button>

                            <button
                                onClick={handleTest}
                                disabled={testing || !formData.locationId}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <CheckCircle size={16} />
                                )}
                                Testar Conexão
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleBusinessAdmin;
