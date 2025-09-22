/**
 * Exemplo de uso do Instagram Embed Widget
 * Demonstra diferentes configurações e casos de uso
 */

import React, { useState } from 'react';
import InstagramEmbedWidget, { InstagramMiniWidget } from '../components/InstagramEmbedWidget';
import { InstagramEmbedProvider, useInstagramEmbed, useInstagramMini, useInstagramByCategory } from '../hooks/useInstagramEmbed.jsx';

const InstagramEmbedExample = () => {
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [selectedHashtag, setSelectedHashtag] = useState('#SaraivaVision');

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Instagram Embed Widget - Exemplos
                    </h1>
                    <p className="text-lg text-gray-600">
                        Sistema de incorporação do Instagram sem API para @saraiva_vision
                    </p>
                </header>

                {/* Controles */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-semibold mb-4">Configurações</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <span>Tema:</span>
                            <select 
                                value={selectedTheme} 
                                onChange={(e) => setSelectedTheme(e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="light">Claro</option>
                                <option value="dark">Escuro</option>
                            </select>
                        </label>
                        
                        <label className="flex items-center gap-2">
                            <span>Hashtag:</span>
                            <select 
                                value={selectedHashtag} 
                                onChange={(e) => setSelectedHashtag(e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="#SaraivaVision">#SaraivaVision</option>
                                <option value="#SaudeOcular">#SaudeOcular</option>
                                <option value="#Oftalmologia">#Oftalmologia</option>
                                <option value="#PodcastSaude">#PodcastSaude</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Widget Principal */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Widget Principal</h3>
                        <InstagramEmbedWidget
                            maxPosts={6}
                            showHeader={true}
                            showCaption={true}
                            theme={selectedTheme}
                            height="500px"
                        />
                    </div>

                    {/* Widget Compacto */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Widget Compacto</h3>
                        <InstagramEmbedWidget
                            maxPosts={3}
                            showHeader={true}
                            showCaption={false}
                            theme={selectedTheme}
                            height="400px"
                        />
                    </div>

                    {/* Mini Widget */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Mini Widget</h3>
                        <InstagramMiniWidget maxPosts={3} />
                    </div>

                    {/* Widget com Hook Personalizado */}
                    <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Com Hook Personalizado</h3>
                        <CustomInstagramWidget theme={selectedTheme} />
                    </div>

                    {/* Widget por Categoria */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Por Hashtag</h3>
                        <HashtagWidget hashtag={selectedHashtag} theme={selectedTheme} />
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-8">
                    <InstagramStatsWidget />
                </div>

                {/* Documentação */}
                <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">Documentação</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Uso Básico</h3>
                            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import InstagramEmbedWidget from './InstagramEmbedWidget';

<InstagramEmbedWidget
  maxPosts={6}
  showHeader={true}
  showCaption={true}
  theme="light"
  height="500px"
/>`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Com Provider</h3>
                            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { InstagramEmbedProvider } from './hooks/useInstagramEmbed';

<InstagramEmbedProvider maxPosts={10}>
  <InstagramEmbedWidget />
</InstagramEmbedProvider>`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Hook Personalizado</h3>
                            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { useInstagramEmbed } from './hooks/useInstagramEmbed';

const { posts, loading, refreshPosts } = useInstagramEmbed({
  maxPosts: 6,
  enableAutoRefresh: true
});`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Mini Widget</h3>
                            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { InstagramMiniWidget } from './InstagramEmbedWidget';

<InstagramMiniWidget maxPosts={3} />`}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Características</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>✅ Funciona sem chave de API do Instagram</li>
                            <li>✅ Posts realistas do @saraiva_vision</li>
                            <li>✅ Cache offline com LocalStorage</li>
                            <li>✅ Temas claro e escuro</li>
                            <li>✅ Responsivo e acessível</li>
                            <li>✅ Auto-refresh opcional</li>
                            <li>✅ Filtragem por hashtags</li>
                            <li>✅ Estatísticas de engajamento</li>
                            <li>✅ Múltiplos tamanhos de widget</li>
                            <li>✅ Integração com React hooks</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Widget personalizado usando o hook
const CustomInstagramWidget = ({ theme }) => {
    const { 
        posts, 
        loading, 
        profileStats, 
        refreshPosts, 
        getStats,
        isOfflineMode 
    } = useInstagramEmbed({
        maxPosts: 4,
        enableAutoRefresh: false,
        enableOfflineMode: true
    });

    const stats = getStats();

    if (loading) {
        return <div className="text-center py-8">Carregando posts personalizados...</div>;
    }

    return (
        <div className={`border rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Posts Personalizados</h4>
                    <div className="flex gap-2">
                        {isOfflineMode && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                Modo Offline
                            </span>
                        )}
                        <button 
                            onClick={refreshPosts}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                        >
                            Atualizar
                        </button>
                    </div>
                </div>
                
                {stats && (
                    <div className="text-xs text-gray-600 mt-2 flex gap-4">
                        <span>Posts: {stats.totalPosts}</span>
                        <span>Likes: {stats.totalLikes}</span>
                        <span>Média: {stats.avgLikes} likes/post</span>
                    </div>
                )}
            </div>
            
            <div className="p-4 space-y-4">
                {posts.slice(0, 2).map(post => (
                    <div key={post.id} className="flex gap-3">
                        <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                            <p className="text-sm">{post.caption.substring(0, 100)}...</p>
                            <div className="text-xs text-gray-500 mt-1">
                                ❤️ {post.likes} • 💬 {post.comments} • {post.timeAgo}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Widget por hashtag
const HashtagWidget = ({ hashtag, theme }) => {
    const { posts, loading, error } = useInstagramByCategory(hashtag.replace('#', ''), 3);

    if (loading) return <div className="text-center py-4">Carregando {hashtag}...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Erro: {error}</div>;

    return (
        <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h4 className="font-semibold mb-3">{hashtag}</h4>
            <div className="space-y-3">
                {posts.map(post => (
                    <div key={post.id} className="flex gap-2">
                        <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 text-sm">
                            <p>{post.caption.substring(0, 80)}...</p>
                            <div className="text-xs text-gray-500 mt-1">
                                {post.likes} likes • {post.timeAgo}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Widget de estatísticas
const InstagramStatsWidget = () => {
    const { profileStats, getStats, posts } = useInstagramEmbed({ maxPosts: 10 });
    const stats = getStats();

    if (!stats) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">📊 Estatísticas @saraiva_vision</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profileStats?.followers}</div>
                    <div className="text-sm text-gray-600">Seguidores</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalPosts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.avgLikes}</div>
                    <div className="text-sm text-gray-600">Likes Médio</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profileStats?.engagementRate}%</div>
                    <div className="text-sm text-gray-600">Engajamento</div>
                </div>
            </div>
        </div>
    );
};

export default InstagramEmbedExample;