import React, { useState } from 'react';
import GoogleReviewsWidget from '../components/GoogleReviewsWidget';
import BusinessStats from '../components/BusinessStats';
import GoogleBusinessAdmin from '../components/GoogleBusinessAdmin';
import ReviewCard from '../components/ReviewCard';
import ReviewsContainer from '../components/ReviewsContainer';

/**
 * GoogleBusinessDemo Component
 * Comprehensive demonstration of all Google Business components
 */
const GoogleBusinessDemo = () => {
    const [activeDemo, setActiveDemo] = useState('widget'); // 'widget', 'stats', 'admin', 'cards', 'container'
    const [showAdmin, setShowAdmin] = useState(false);

    // Mock review data for demonstration
    const mockReview = {
        reviewId: 'demo-review-123',
        reviewer: {
            displayName: 'João Silva',
            profilePhotoUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        starRating: 5,
        comment: 'Excelente serviço! A equipe é muito profissional e atenciosa. Recomendo fortemente para todos que buscam qualidade e confiabilidade. O atendimento foi rápido e resolveram meu problema com muita eficiência.',
        updateTime: '2024-01-15T10:30:00Z',
        reviewerComment: null,
        createTime: '2024-01-15T10:30:00Z'
    };

    // Handle review actions
    const handleReviewShare = (review) => {
        console.log('Sharing review:', review);
        alert('Compartilhando avaliação: ' + review.reviewer.displayName);
    };

    const handleReviewLike = (review, isLiked) => {
        console.log('Review like:', review, isLiked);
        alert(isLiked ? 'Você curtiu esta avaliação!' : 'Você removeu o like desta avaliação');
    };

    const handleSaveConfig = (config) => {
        console.log('Configuration saved:', config);
        alert('Configuração salva com sucesso!');
    };

    const handleTestConnection = (result) => {
        console.log('Connection test result:', result);
        alert('Conexão testada com sucesso!');
    };

    const handleError = (error) => {
        console.error('Error:', error);
        alert('Erro: ' + error.message);
    };

    // Demo navigation
    const renderDemoNavigation = () => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Demonstração Google Business Reviews
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
                Explore todos os componentes e funcionalidades da integração com Google Business Profile
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => setActiveDemo('widget')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeDemo === 'widget'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    Widget Principal
                </button>

                <button
                    onClick={() => setActiveDemo('stats')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeDemo === 'stats'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    Estatísticas
                </button>

                <button
                    onClick={() => setActiveDemo('cards')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeDemo === 'cards'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    Review Cards
                </button>

                <button
                    onClick={() => setActiveDemo('container')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeDemo === 'container'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    Container
                </button>

                <button
                    onClick={() => setShowAdmin(!showAdmin)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${showAdmin
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    {showAdmin ? 'Ocultar Admin' : 'Mostrar Admin'}
                </button>
            </div>
        </div>
    );

    // Render widget demo
    const renderWidgetDemo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                GoogleReviewsWidget - Versão Completa
            </h3>

            <GoogleReviewsWidget
                locationId="accounts/123456789/locations/987654321"
                variant="full"
                displayCount={5}
                showStats={true}
                showFilters={true}
                autoRefresh={false}
                refreshInterval={300000}
                onReviewShare={handleReviewShare}
                onReviewLike={handleReviewLike}
                onError={handleError}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Versão Compacta
                    </h4>
                    <GoogleReviewsWidget
                        locationId="accounts/123456789/locations/987654321"
                        variant="compact"
                        displayCount={3}
                        showStats={false}
                        showFilters={false}
                        onReviewShare={handleReviewShare}
                        onReviewLike={handleReviewLike}
                        onError={handleError}
                    />
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Versão Apenas Estatísticas
                    </h4>
                    <GoogleReviewsWidget
                        locationId="accounts/123456789/locations/987654321"
                        variant="stats"
                        onReviewShare={handleReviewShare}
                        onReviewLike={handleReviewLike}
                        onError={handleError}
                    />
                </div>
            </div>
        </div>
    );

    // Render stats demo
    const renderStatsDemo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                BusinessStats - Componente de Estatísticas
            </h3>

            <BusinessStats
                locationId="accounts/123456789/locations/987654321"
                showTrends={true}
                showDistribution={true}
                showRecentActivity={true}
                autoRefresh={false}
                refreshInterval={300000}
                onError={handleError}
            />

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Recursos do BusinessStats
                </h4>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Média de avaliações em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Total de avaliações e crescimento
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Distribuição detalhada por estrelas
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Informações do negócio
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Atividade recente e tendências
                    </li>
                </ul>
            </div>
        </div>
    );

    // Render cards demo
    const renderCardsDemo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                ReviewCard - Componente de Avaliação Individual
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReviewCard
                    review={mockReview}
                    variant="default"
                    showActions={true}
                    enableSharing={true}
                    enableLiking={true}
                    onShare={handleReviewShare}
                    onLike={handleReviewLike}
                />

                <ReviewCard
                    review={{
                        ...mockReview,
                        reviewId: 'demo-review-456',
                        reviewer: {
                            displayName: 'Maria Santos',
                            profilePhotoUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
                        },
                        starRating: 4,
                        comment: 'Muito bom! O serviço é de qualidade e os funcionários são educados. Só sugiro melhorar o tempo de espera em horários de pico.'
                    }}
                    variant="compact"
                    showActions={true}
                    enableSharing={false}
                    enableLiking={true}
                    onLike={handleReviewLike}
                />

                <ReviewCard
                    review={{
                        ...mockReview,
                        reviewId: 'demo-review-789',
                        reviewer: {
                            displayName: 'Carlos Oliveira',
                            profilePhotoUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
                        },
                        starRating: 5,
                        comment: 'Perfeito! Atendimento impecável, preços justos e qualidade excepcional. Voltarei com certeza!'
                    }}
                    variant="detailed"
                    showActions={true}
                    enableSharing={true}
                    enableLiking={true}
                    onShare={handleReviewShare}
                    onLike={handleReviewLike}
                />
            </div>

            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                    Variações do ReviewCard
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Default
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Layout completo com todas as informações
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Compact
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Versão simplificada para espaços reduzidos
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Detailed
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Layout expandido com detalhes adicionais
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render container demo
    const renderContainerDemo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                ReviewsContainer - Gerenciador de Avaliações
            </h3>

            <ReviewsContainer
                locationId="accounts/123456789/locations/987654321"
                displayCount={6}
                showStats={true}
                enableFiltering={true}
                enableSorting={true}
                autoRefresh={false}
                refreshInterval={300000}
                onReviewShare={handleReviewShare}
                onReviewLike={handleReviewLike}
                onError={handleError}
            />

            <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Funcionalidades do ReviewsContainer
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Filtros
                        </h5>
                        <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                            <li>• Por classificação (estrelas)</li>
                            <li>• Por período (recentes, antigas)</li>
                            <li>• Por conteúdo (com resposta, sem resposta)</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Ordenação
                        </h5>
                        <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                            <li>• Mais recentes</li>
                            <li>• Mais relevantes</li>
                            <li>• Melhor avaliadas</li>
                            <li>• Pior avaliadas</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Interações
                        </h5>
                        <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                            <li>• Compartilhamento</li>
                            <li>• Curtidas</li>
                            <li>• Respostas do proprietário</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Estatísticas
                        </h5>
                        <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                            <li>• Média geral</li>
                            <li>• Total de avaliações</li>
                            <li>• Distribuição por estrelas</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                        Google Business Reviews Integration
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        Sistema completo para exibição e gerenciamento de avaliações do Google Business Profile
                    </p>
                </div>

                {/* Demo Navigation */}
                {renderDemoNavigation()}

                {/* Admin Panel */}
                {showAdmin && (
                    <div className="mb-12">
                        <GoogleBusinessAdmin
                            onSave={handleSaveConfig}
                            onTest={handleTestConnection}
                            onError={handleError}
                        />
                    </div>
                )}

                {/* Demo Content */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                    {activeDemo === 'widget' && renderWidgetDemo()}
                    {activeDemo === 'stats' && renderStatsDemo()}
                    {activeDemo === 'cards' && renderCardsDemo()}
                    {activeDemo === 'container' && renderContainerDemo()}
                </div>

                {/* Features Overview */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                            Dados em Tempo Real
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Sincronização automática com Google Business Profile
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                            Alta Performance
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Cache avançado e otimizações para carregamento rápido
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                            Totalmente Customizável
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Múltiplos temas e layouts para diferentes necessidades
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                            Analytics Completo
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Estatísticas detalhadas e monitoramento de desempenho
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        Desenvolvido com React, TypeScript e as melhores práticas de desenvolvimento web
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>•</span>
                        <span>Responsive Design</span>
                        <span>•</span>
                        <span>Dark Mode Support</span>
                        <span>•</span>
                        <span>Accessibility First</span>
                        <span>•</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleBusinessDemo;
