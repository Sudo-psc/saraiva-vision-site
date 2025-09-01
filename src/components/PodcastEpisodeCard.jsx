import React from 'react';
import { Play, Calendar, Clock, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MedicalCard from '@/components/ui/MedicalCard';

/**
 * Podcast Episode Card component using unified MedicalCard interface
 * Optimized for podcast content with media controls and metadata
 */
const PodcastEpisodeCard = ({ 
  episode, 
  index = 0,
  onPlay,
  onClick,
  className 
}) => {
  const { t } = useTranslation();

  // Handle play button click
  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onPlay) {
      onPlay(episode);
    }
  };

  // Card header with category and featured badge
  const cardHeader = (
    <div className="flex items-center justify-between mb-3">
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
        {episode.category}
      </span>
      {episode.featured && (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Em Destaque
        </div>
      )}
    </div>
  );

  // Card body with title, description, and metadata
  const cardBody = (
    <>
      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {episode.title}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {episode.description}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(episode.date).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {episode.duration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{episode.duration}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {episode.tags.slice(0, 2).map(tag => (
          <span 
            key={tag} 
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
          >
            <Tag className="w-2 h-2" />
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  // Card actions with play and external link buttons
  const cardActions = [
    {
      label: 'Reproduzir',
      variant: 'primary',
      onClick: handlePlayClick,
      icon: <Play className="w-4 h-4" />,
      'aria-label': `Reproduzir episódio ${episode.title}`
    }
  ];

  // Add Spotify link if available
  if (episode.spotifyUrl) {
    cardActions.push({
      label: 'Spotify',
      variant: 'outline',
      href: episode.spotifyUrl,
      external: true,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
        </svg>
      ),
      'aria-label': `Ouvir ${episode.title} no Spotify`
    });
  }

  // Custom overlay for play button on hover
  const playOverlay = (
    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <button
        onClick={handlePlayClick}
        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        aria-label={`Reproduzir ${episode.title}`}
      >
        <Play className="w-6 h-6 text-blue-600 ml-0.5" />
      </button>
    </div>
  );

  return (
    <MedicalCard
      variant="episode"
      size="standard"
      glassMorphism={false}
      shadow3D={false}
      gradient="none"
      borderRadius="2xl"
      interactive
      clickable
      hoverEffects="pronounced"
      aria-label={`Episódio: ${episode.title}`}
      data-testid={`episode-card-${episode.id}`}
      
      // Media with play overlay
      media={{
        type: 'image',
        src: episode.cover,
        alt: episode.title,
        aspectRatio: '1:1',
        lazy: true,
        className: 'group-hover:scale-105 transition-transform'
      }}
      
      // Content structure
      header={cardHeader}
      body={cardBody}
      actions={cardActions}
      
      // Animation
      animationDelay={index * 0.1}
      motionPreset="entrance"
      stagger
      
      // Event handlers
      onClick={onClick}
      
      // Additional props
      className={className}
    >
      {/* Custom play overlay rendered after media */}
      <div className="absolute top-0 left-0 right-0 aspect-square">
        {playOverlay}
      </div>
    </MedicalCard>
  );
};

export default PodcastEpisodeCard;