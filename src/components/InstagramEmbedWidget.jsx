/**
 * Instagram Embed Widget - Sem API
 * Componente React para exibir posts do @saraiva_vision
 */

import React, { useState, useEffect } from 'react';
import instagramEmbedService from '../services/instagramEmbedService.js';
import './InstagramEmbedWidget.css';

const InstagramEmbedWidget = ({ 
    maxPosts = 6, 
    showHeader = true, 
    showCaption = true,
    theme = 'light',
    className = '',
    height = 'auto'
}) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileStats, setProfileStats] = useState(null);

    useEffect(() => {
        loadInstagramPosts();
        loadProfileStats();
    }, [maxPosts]);

    const loadInstagramPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await instagramEmbedService.fetchPosts(maxPosts);
            
            if (response.success) {
                setPosts(response.posts);
            } else {
                setError('Não foi possível carregar os posts');
            }
        } catch (err) {
            setError('Erro ao carregar posts do Instagram');
            console.error('Instagram widget error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProfileStats = async () => {
        try {
            const stats = instagramEmbedService.getProfileStats();
            setProfileStats(stats);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    };

    const handlePostClick = (post) => {
        // Abrir Instagram do @saraiva_vision
        window.open('https://www.instagram.com/saraiva_vision/', '_blank');
    };

    const handleFollowClick = () => {
        window.open('https://www.instagram.com/saraiva_vision/', '_blank');
    };

    if (loading) {
        return (
            <div className={`instagram-widget loading ${className}`} data-theme={theme}>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`instagram-widget error ${className}`} data-theme={theme}>
                <div className="error-container">
                    <div className="error-icon">📸</div>
                    <h3>Instagram @saraiva_vision</h3>
                    <p>{error}</p>
                    <button onClick={handleFollowClick} className="follow-btn">
                        Ver no Instagram
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`instagram-widget ${className}`} data-theme={theme}>
            {showHeader && (
                <WidgetHeader 
                    profileStats={profileStats}
                    onFollowClick={handleFollowClick}
                />
            )}
            
            <div className="posts-container" style={{ height }}>
                {posts.map((post) => (
                    <InstagramPost
                        key={post.id}
                        post={post}
                        showCaption={showCaption}
                        onClick={() => handlePostClick(post)}
                    />
                ))}
            </div>
            
            <WidgetFooter onViewMoreClick={handleFollowClick} />
        </div>
    );
};

const WidgetHeader = ({ profileStats, onFollowClick }) => (
    <div className="widget-header">
        <div className="profile-info">
            <img 
                src="/images/drphilipe_perfil.webp" 
                alt="@saraiva_vision" 
                className="profile-picture"
            />
            <div className="profile-details">
                <h3 className="username">
                    @saraiva_vision
                    <span className="verified-badge">✓</span>
                </h3>
                {profileStats && (
                    <div className="profile-stats">
                        <span>{profileStats.followers} seguidores</span>
                        <span>•</span>
                        <span>{profileStats.posts} posts</span>
                    </div>
                )}
            </div>
        </div>
        <button onClick={onFollowClick} className="follow-btn">
            Seguir
        </button>
    </div>
);

const InstagramPost = ({ post, showCaption, onClick }) => (
    <div className="instagram-post" onClick={onClick} role="button" tabIndex={0}>
        <div className="post-header">
            <img 
                src={post.profilePicture} 
                alt={`@${post.username}`} 
                className="post-profile-pic"
            />
            <div className="post-info">
                <span className="post-username">@{post.username}</span>
                <span className="post-time">{post.timeAgo}</span>
            </div>
        </div>
        
        <div className="post-image-container">
            <img 
                src={post.imageUrl} 
                alt="Post do Instagram"
                className="post-image"
                loading="lazy"
            />
        </div>
        
        <div className="post-actions">
            <div className="engagement-stats">
                <span className="likes">
                    <span className="emoji">❤️</span>
                    {post.likes.toLocaleString('pt-BR')}
                </span>
                <span className="comments">
                    <span className="emoji">💬</span>
                    {post.comments}
                </span>
                <span className="engagement-rate">
                    {post.engagementRate}% engagement
                </span>
            </div>
        </div>
        
        {showCaption && post.caption && (
            <div className="post-caption">
                <span className="caption-username">@{post.username}</span>
                {' '}
                <span className="caption-text">
                    {instagramEmbedService.truncateCaption(post.caption, 150)}
                </span>
            </div>
        )}
    </div>
);

const WidgetFooter = ({ onViewMoreClick }) => (
    <div className="widget-footer">
        <button onClick={onViewMoreClick} className="view-more-btn">
            Ver mais no Instagram →
        </button>
    </div>
);

// Hook para usar em outros componentes
export const useInstagramPosts = (maxPosts = 6) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await instagramEmbedService.fetchPosts(maxPosts);
                if (response.success) {
                    setPosts(response.posts);
                } else {
                    setError('Erro ao carregar posts');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [maxPosts]);

    return { posts, loading, error };
};

// Componente simplificado para uso em cards
export const InstagramMiniWidget = ({ maxPosts = 3, className = '' }) => {
    const { posts, loading } = useInstagramPosts(maxPosts);

    if (loading) {
        return (
            <div className={`instagram-mini-widget loading ${className}`}>
                <div className="mini-loading">Carregando...</div>
            </div>
        );
    }

    return (
        <div className={`instagram-mini-widget ${className}`}>
            <div className="mini-header">
                <h4>📸 @saraiva_vision</h4>
            </div>
            <div className="mini-grid">
                {posts.slice(0, 3).map((post) => (
                    <div 
                        key={post.id} 
                        className="mini-post"
                        onClick={() => window.open('https://www.instagram.com/saraiva_vision/', '_blank')}
                    >
                        <img 
                            src={post.imageUrl} 
                            alt="Post Instagram" 
                            loading="lazy"
                        />
                        <div className="mini-overlay">
                            <span>❤️ {post.likes}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstagramEmbedWidget;