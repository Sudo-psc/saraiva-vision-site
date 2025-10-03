'use client';

import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import { useReducedMotion } from 'framer-motion';

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

export interface UseAutoplayCarouselParams {
  totalSlides?: number;
  config?: Partial<AutoplayConfig>;
  onSlideChange?: (index: number, direction: Direction) => void;
  initialIndex?: number;
}

interface AutoplayState {
  isPlaying: boolean;
  isPaused: boolean;
  isEnabled: boolean;
  currentIndex: number;
  totalSlides: number;
  direction: Direction;
  interval: number;
  lastTransition: number;
  lastUserNavigation: number;
  resumeDelay: number;
  userInteracting: boolean;
  manualNavigation: boolean;
  tabVisible: boolean;
  config: AutoplayConfig;
}

type AutoplayAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'NEXT'; manual?: boolean }
  | { type: 'PREVIOUS'; manual?: boolean }
  | { type: 'GO_TO'; index: number; manual?: boolean }
  | { type: 'SET_INTERACTION'; interacting: boolean }
  | { type: 'SET_ENABLED'; enabled: boolean }
  | { type: 'SET_TAB_VISIBLE'; visible: boolean }
  | { type: 'UPDATE_CONFIG'; config: Partial<AutoplayConfig> };

export interface CarouselHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
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

const DEFAULT_AUTOPLAY_CONFIG: AutoplayConfig = {
  defaultInterval: 4500,
  transitionDuration: 300,
  resumeDelay: 1000,
  manualResetDelay: 2000,
  pauseOnHover: true,
  pauseOnFocus: true,
  respectReducedMotion: true,
  resetOnManualNav: true,
  enableAriaLive: true,
  enableKeyboardControls: true,
  disableOnInactiveTab: true,
  useReducedMotion: false
};

const validateConfig = (config: AutoplayConfig): void => {
  if (config.defaultInterval < 1000) {
    throw new Error('defaultInterval must be >= 1000ms');
  }
  if (config.transitionDuration < 0) {
    throw new Error('transitionDuration must be >= 0');
  }
  if (config.resumeDelay > 10000) {
    throw new Error('resumeDelay must be <= 10000ms');
  }
};

const validateParams = (params: {
  totalSlides?: number;
  initialIndex?: number;
}): { totalSlides: number; initialIndex: number } => {
  let { totalSlides, initialIndex } = params;

  if (typeof totalSlides === 'number' && totalSlides <= 0) {
    console.warn('useAutoplayCarousel: totalSlides must be > 0, defaulting to 0');
    totalSlides = 0;
  }

  if (!totalSlides || totalSlides === null) {
    console.warn('useAutoplayCarousel: totalSlides is undefined or null, defaulting to 0');
    totalSlides = 0;
  }

  if (initialIndex !== undefined) {
    if (initialIndex < 0) {
      console.warn('useAutoplayCarousel: initialIndex must be >= 0, defaulting to 0');
      initialIndex = 0;
    }
    if (totalSlides && initialIndex >= totalSlides) {
      console.warn('useAutoplayCarousel: initialIndex must be < totalSlides, adjusting to', totalSlides - 1);
      initialIndex = Math.max(0, totalSlides - 1);
    }
  }

  return { totalSlides: totalSlides || 0, initialIndex: initialIndex || 0 };
};

const autoplayReducer = (state: AutoplayState, action: AutoplayAction): AutoplayState => {
  switch (action.type) {
    case 'PLAY':
      if (!state.isEnabled) return state;
      return {
        ...state,
        isPlaying: true,
        isPaused: false
      };

    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
        isPaused: true
      };

    case 'STOP':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentIndex: 0,
        direction: 'forward'
      };

    case 'NEXT': {
      const nextIndex = (state.currentIndex + 1) % state.totalSlides;
      return {
        ...state,
        currentIndex: nextIndex,
        direction: 'forward',
        lastTransition: Date.now(),
        manualNavigation: action.manual || false
      };
    }

    case 'PREVIOUS': {
      const prevIndex = state.currentIndex === 0 ? state.totalSlides - 1 : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        direction: 'backward',
        lastTransition: Date.now(),
        manualNavigation: action.manual || false
      };
    }

    case 'GO_TO':
      if (action.index < 0 || action.index >= state.totalSlides) {
        return state;
      }
      return {
        ...state,
        currentIndex: action.index,
        direction: action.index > state.currentIndex ? 'forward' : 'backward',
        lastTransition: Date.now(),
        manualNavigation: action.manual || false
      };

    case 'SET_INTERACTION':
      return {
        ...state,
        userInteracting: action.interacting,
        lastUserNavigation: action.interacting ? Date.now() : state.lastUserNavigation
      };

    case 'SET_ENABLED':
      return {
        ...state,
        isEnabled: action.enabled,
        isPlaying: action.enabled ? state.isPlaying : false
      };

    case 'SET_TAB_VISIBLE':
      return {
        ...state,
        tabVisible: action.visible,
        isPlaying: action.visible && state.isEnabled ? state.isPlaying : false
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.config }
      };

    default:
      return state;
  }
};

const usePageVisibility = (): { isVisible: boolean; visibilityState: DocumentVisibilityState } => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(
    (document.visibilityState as DocumentVisibilityState) || 'visible'
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      setVisibilityState((document.visibilityState as DocumentVisibilityState) || 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isVisible, visibilityState };
};

export const useAutoplayCarousel = ({
  totalSlides = 0,
  config: userConfig = {},
  onSlideChange,
  initialIndex = 0
}: UseAutoplayCarouselParams = {}): UseAutoplayCarouselReturn => {
  const validatedParams = validateParams({ totalSlides, initialIndex });
  const safeTotal = validatedParams.totalSlides;
  const safeIndex = validatedParams.initialIndex;

  const config = useMemo(() => {
    const mergedConfig = { ...DEFAULT_AUTOPLAY_CONFIG, ...userConfig };
    validateConfig(mergedConfig);
    return mergedConfig;
  }, [userConfig]);

  const prefersReducedMotion = useReducedMotion();
  const { isVisible } = usePageVisibility();

  const initialState: AutoplayState = {
    isPlaying: false,
    isPaused: false,
    isEnabled: config.respectReducedMotion ? !prefersReducedMotion : true,
    currentIndex: safeIndex,
    totalSlides: safeTotal,
    direction: 'forward',
    interval: config.defaultInterval,
    lastTransition: 0,
    lastUserNavigation: 0,
    resumeDelay: config.resumeDelay,
    userInteracting: false,
    manualNavigation: false,
    tabVisible: isVisible,
    config
  };

  const [state, dispatch] = useReducer(autoplayReducer, initialState);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressStartRef = useRef(0);
  const progressDurationRef = useRef(0);
  const progressTimerIdRef = useRef<NodeJS.Timeout | null>(null);

  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(state.interval);

  const play = useCallback(() => {
    if (!state.isEnabled) return;
    dispatch({ type: 'PLAY' });
  }, [state.isEnabled]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (progressTimerIdRef.current) {
      clearTimeout(progressTimerIdRef.current);
      progressTimerIdRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (progressTimerIdRef.current) {
      clearTimeout(progressTimerIdRef.current);
      progressTimerIdRef.current = null;
    }
    setProgress(0);
    setTimeRemaining(state.interval);
  }, [state.interval]);

  const next = useCallback(() => {
    dispatch({ type: 'NEXT', manual: true });
  }, []);

  const previous = useCallback(() => {
    dispatch({ type: 'PREVIOUS', manual: true });
  }, []);

  const goTo = useCallback((index: number) => {
    if (state.totalSlides === 0) {
      console.warn('useAutoplayCarousel: Cannot go to index when totalSlides is 0');
      return;
    }
    if (index < 0 || index >= state.totalSlides) {
      console.warn('useAutoplayCarousel: Invalid index', index, 'for totalSlides', state.totalSlides);
      return;
    }
    dispatch({ type: 'GO_TO', index, manual: true });
  }, [state.totalSlides]);

  const updateConfig = useCallback((newConfig: Partial<AutoplayConfig>) => {
    const mergedConfig = { ...state.config, ...newConfig };
    validateConfig(mergedConfig);
    dispatch({ type: 'UPDATE_CONFIG', config: newConfig });
  }, [state.config]);

  const handleMouseEnter = useCallback(() => {
    if (!state.config.pauseOnHover) return;
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [state.config.pauseOnHover, pause]);

  const handleMouseLeave = useCallback(() => {
    if (!state.config.pauseOnHover) return;
    dispatch({ type: 'SET_INTERACTION', interacting: false });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (progressTimerIdRef.current) {
      clearTimeout(progressTimerIdRef.current);
      progressTimerIdRef.current = null;
    }
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.pauseOnHover, state.config.resumeDelay, state.isEnabled, state.userInteracting]);

  const handleFocus = useCallback(() => {
    if (!state.config.pauseOnFocus) return;
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [state.config.pauseOnFocus, pause]);

  const handleBlur = useCallback(() => {
    if (!state.config.pauseOnFocus) return;
    dispatch({ type: 'SET_INTERACTION', interacting: false });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (progressTimerIdRef.current) {
      clearTimeout(progressTimerIdRef.current);
      progressTimerIdRef.current = null;
    }
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.pauseOnFocus, state.config.resumeDelay, state.isEnabled, state.userInteracting]);

  const handleTouchStart = useCallback(() => {
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [pause]);

  const handleTouchEnd = useCallback(() => {
    dispatch({ type: 'SET_INTERACTION', interacting: false });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (progressTimerIdRef.current) {
      clearTimeout(progressTimerIdRef.current);
      progressTimerIdRef.current = null;
    }
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.resumeDelay, state.isEnabled, state.userInteracting]);

  useEffect(() => {
    const enabled = config.respectReducedMotion ? !prefersReducedMotion : true;
    dispatch({ type: 'SET_ENABLED', enabled });
  }, [prefersReducedMotion, config.respectReducedMotion]);

  useEffect(() => {
    if (config.disableOnInactiveTab) {
      dispatch({ type: 'SET_TAB_VISIBLE', visible: isVisible });
    }
  }, [isVisible, config.disableOnInactiveTab]);

  useEffect(() => {
    if (state.isPlaying && state.isEnabled && state.tabVisible && state.totalSlides > 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }

      const startTime = Date.now();
      progressStartRef.current = startTime;
      progressDurationRef.current = state.interval;

      setProgress(0);
      setTimeRemaining(state.interval);

      timerRef.current = setTimeout(() => {
        if (progressTimerIdRef.current) clearTimeout(progressTimerIdRef.current);
        dispatch({ type: 'NEXT', manual: false });
      }, state.interval);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (progressTimerIdRef.current) {
        clearTimeout(progressTimerIdRef.current);
        progressTimerIdRef.current = null;
      }
      setProgress(0);
      setTimeRemaining(state.interval);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (progressTimerIdRef.current) {
        clearTimeout(progressTimerIdRef.current);
        progressTimerIdRef.current = null;
      }
    };
  }, [state.isPlaying, state.isEnabled, state.tabVisible, state.interval, state.totalSlides]);

  const lastCallbackTransitionRef = useRef(0);
  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    if (onSlideChange && state.lastTransition > lastCallbackTransitionRef.current) {
      if (state.lastTransition > 0) {
        onSlideChange(state.currentIndex, state.direction);
        lastCallbackTransitionRef.current = state.lastTransition;
      }
    }
  }, [state.currentIndex, state.direction, state.lastTransition, onSlideChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (progressTimerIdRef.current) {
        clearTimeout(progressTimerIdRef.current);
        progressTimerIdRef.current = null;
      }
    };
  }, []);

  const handlers = useMemo<CarouselHandlers>(() => ({
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }), [handleMouseEnter, handleMouseLeave, handleFocus, handleBlur, handleTouchStart, handleTouchEnd]);

  return {
    currentIndex: state.currentIndex,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isEnabled: state.isEnabled,
    direction: state.direction,
    play,
    pause,
    toggle,
    stop,
    next,
    previous,
    goTo,
    handlers,
    updateConfig,
    config: state.config,
    progress,
    timeRemaining
  };
};

export default useAutoplayCarousel;
