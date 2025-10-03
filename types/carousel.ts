export interface AutoplayConfig {
  defaultInterval: number;
  transitionDuration: number;
  resumeDelay: number;
  manualResetDelay: number;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
  respectReducedMotion: boolean;
  resetOnManualNav: boolean;
  enableAriaLive: boolean;
  enableKeyboardControls: boolean;
  disableOnInactiveTab: boolean;
  useReducedMotion: boolean;
}

export type Direction = 'forward' | 'backward';

export interface CarouselHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

export interface UseAutoplayCarouselParams {
  totalSlides?: number;
  config?: Partial<AutoplayConfig>;
  onSlideChange?: (index: number, direction: Direction) => void;
  initialIndex?: number;
}

export interface UseAutoplayCarouselReturn {
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isEnabled: boolean;
  direction: Direction;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  handlers: CarouselHandlers;
  updateConfig: (newConfig: Partial<AutoplayConfig>) => void;
  config: AutoplayConfig;
  progress: number;
  timeRemaining: number;
}
