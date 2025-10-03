export interface AudioSource {
  url: string;
  type?: 'audio/mpeg' | 'audio/mp3' | 'audio/wav' | 'audio/ogg';
}

export interface MediaTrack {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  src: string | AudioSource;
  cover?: string;
  description?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  tracks: MediaTrack[];
  cover?: string;
}

export interface MediaPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  buffered: number;
}

export interface MediaPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  restart: () => void;
}

export interface AudioPlayerEpisode {
  id: string;
  title: string;
  description?: string;
  src: string;
  cover?: string;
  duration?: string;
  category?: string;
  spotifyUrl?: string;
  applePodcastsUrl?: string;
  tags?: string[];
}

export interface SpotifyEpisode {
  id: string;
  title: string;
  description?: string;
  embedUrl?: string;
  spotifyUrl?: string;
  imageUrl?: string;
  publishedAt?: string;
  formattedDuration?: string;
}

export type PlayerMode = 'card' | 'inline' | 'modal' | 'compact';

export interface PlayerConfig {
  autoplay?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  playsInline?: boolean;
  volume?: number;
  playbackRate?: number;
  skipInterval?: number;
}

export interface MediaPlayerProps {
  episode: AudioPlayerEpisode;
  mode?: PlayerMode;
  config?: PlayerConfig;
  onPlay?: (episode: AudioPlayerEpisode) => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onClose?: () => void;
  className?: string;
}

export interface MediaControlsProps {
  state: MediaPlayerState;
  controls: MediaPlayerControls;
  episode: AudioPlayerEpisode;
  mode?: PlayerMode;
  showAdvancedControls?: boolean;
  className?: string;
}

export interface PlaybackRateOption {
  value: number;
  label: string;
}

export const PLAYBACK_RATES: PlaybackRateOption[] = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' }
];

export interface StoredPlayerState {
  episodeId: string;
  currentTime: number;
  volume: number;
  playbackRate: number;
  lastPlayed: string;
}
