import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import { useReducedMotion } from 'framer-motion';

// Default configuration
const DEFAULT_AUTOPLAY_CONFIG = {
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
  useReducedMotion: false // Detectado em runtime
};

// Validation functions
const validateConfig = (config) => {
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

const validateParams = (params) => {
  // Validate totalSlides only if it's a number
  if (typeof params.totalSlides === 'number' && params.totalSlides <= 0) {
    console.warn('useAutoplayCarousel: totalSlides must be > 0, defaulting to 0');
    return { ...params, totalSlides: 0 };
  }
  
  // Handle undefined or null totalSlides
  if (!params.totalSlides || params.totalSlides === null) {
    console.warn('useAutoplayCarousel: totalSlides is undefined or null, defaulting to 0');
    return { ...params, totalSlides: 0 };
  }
  
  if (params.initialIndex !== undefined) {
    if (params.initialIndex < 0) {
      console.warn('useAutoplayCarousel: initialIndex must be >= 0, defaulting to 0');
      return { ...params, initialIndex: 0 };
    }
    if (params.totalSlides && params.initialIndex >= params.totalSlides) {
      console.warn('useAutoplayCarousel: initialIndex must be < totalSlides, adjusting to', params.totalSlides - 1);
      return { ...params, initialIndex: Math.max(0, params.totalSlides - 1) };
    }
  }
  
  return params;
};

// Autoplay state reducer
const autoplayReducer = (state, action) => {
  switch (action.type) {
    case 'PLAY':
      if (!state.isEnabled) return state;
      return {
        ...state,
        isPlaying: true,
        isPaused: false
        // Don't set lastTransition on play - only on actual transitions
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

    case 'NEXT':
      const nextIndex = (state.currentIndex + 1) % state.totalSlides;
      return {
        ...state,
        currentIndex: nextIndex,
        direction: 'forward',
        lastTransition: Date.now(),
        manualNavigation: action.manual || false
      };

    case 'PREVIOUS':
      const prevIndex = state.currentIndex === 0 ? state.totalSlides - 1 : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        direction: 'backward',
        lastTransition: Date.now(),
        manualNavigation: action.manual || false
      };

    case 'GO_TO':
      if (action.index < 0 || action.index >= state.totalSlides) {
        return state; // Invalid index, no change
      }
      const direction = action.index > state.currentIndex ? 'forward' : 'backward';
      return {
        ...state,
        currentIndex: action.index,
        direction,
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

// Custom hook for page visibility
const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [visibilityState, setVisibilityState] = useState(document.visibilityState || 'visible');

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      setVisibilityState(document.visibilityState || 'visible');
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
}) => {
  // Validate and normalize parameters
  const validatedParams = validateParams({ totalSlides, initialIndex });
  const safeTotal = validatedParams.totalSlides || 0;
  const safeIndex = validatedParams.initialIndex || 0;

  // Merge and validate configuration
  const config = useMemo(() => {
    const mergedConfig = { ...DEFAULT_AUTOPLAY_CONFIG, ...userConfig };
    validateConfig(mergedConfig);
    return mergedConfig;
  }, [userConfig]);

  // Detect reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Page visibility
  const { isVisible } = usePageVisibility();

  // Initialize state with validated parameters
  const initialState = {
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

  // Timer management
  const timerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const progressStartRef = useRef(0);
  const progressDurationRef = useRef(0);
  const progressTimerIdRef = useRef(null);

  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(state.interval);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  // Start autoplay timer
  const startTimer = useCallback(() => {
    clearTimers();

    const startTime = Date.now();
    progressStartRef.current = startTime;
    progressDurationRef.current = state.interval;

    // Set initial progress values
    setProgress(0);
    setTimeRemaining(state.interval);

    // Progress update interval (using setTimeout instead of rAF for better test compatibility)
    const updateProgress = () => {
      // Check playing state from ref to avoid stale closure
      if (!state.isPlaying) return;
      
      const elapsed = Date.now() - progressStartRef.current;
      const newProgress = Math.min(elapsed / progressDurationRef.current, 1);
      const remaining = Math.max(progressDurationRef.current - elapsed, 0);
      
      setProgress(newProgress);
      setTimeRemaining(remaining);

      if (newProgress < 1 && state.isPlaying) {
        progressTimerIdRef.current = setTimeout(updateProgress, 50); // Update every 50ms
      }
    };

    // Start progress updates
    progressTimerIdRef.current = setTimeout(updateProgress, 50);

    // Main autoplay timer
    timerRef.current = setTimeout(() => {
      if (progressTimerIdRef.current) clearTimeout(progressTimerIdRef.current);
      // The useEffect cleanup function handles pausing, so we can dispatch directly.
      dispatch({ type: 'NEXT', manual: false });
    }, state.interval);
  }, [state.interval, state.isPlaying, clearTimers]);

  // Control methods
  const play = useCallback(() => {
    if (!state.isEnabled) return;
    dispatch({ type: 'PLAY' });
  }, [state.isEnabled]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
    clearTimers();
  }, [clearTimers]);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
    clearTimers();
    setProgress(0);
    setTimeRemaining(state.interval);
  }, [clearTimers, state.interval]);

  const next = useCallback(() => {
    dispatch({ type: 'NEXT', manual: true });
    // Manual navigation callbacks are handled by the dispatch immediately
    // so we don't need to call onSlideChange here as it would be duplicate
  }, []);

  const previous = useCallback(() => {
    dispatch({ type: 'PREVIOUS', manual: true });
    // Manual navigation callbacks are handled by the dispatch immediately  
  }, []);

  const goTo = useCallback((index) => {
    // Handle edge case where totalSlides is 0
    if (state.totalSlides === 0) {
      console.warn('useAutoplayCarousel: Cannot go to index when totalSlides is 0');
      return;
    }
    if (index < 0 || index >= state.totalSlides) {
      console.warn('useAutoplayCarousel: Invalid index', index, 'for totalSlides', state.totalSlides);
      return; // Invalid index
    }
    dispatch({ type: 'GO_TO', index, manual: true });
    // Manual navigation callbacks are handled by the dispatch immediately
  }, [state.totalSlides]);

  const updateConfig = useCallback((newConfig) => {
    const mergedConfig = { ...state.config, ...newConfig };
    validateConfig(mergedConfig);
    dispatch({ type: 'UPDATE_CONFIG', config: newConfig });
  }, [state.config]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!state.config.pauseOnHover) return;
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [state.config.pauseOnHover, pause]);

  const handleMouseLeave = useCallback(() => {
    if (!state.config.pauseOnHover) return;
    dispatch({ type: 'SET_INTERACTION', interacting: false });
    
    // Resume after delay
    clearTimers();
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.pauseOnHover, state.config.resumeDelay, state.isEnabled, state.userInteracting, clearTimers]);

  const handleFocus = useCallback(() => {
    if (!state.config.pauseOnFocus) return;
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [state.config.pauseOnFocus, pause]);

  const handleBlur = useCallback(() => {
    if (!state.config.pauseOnFocus) return;
    dispatch({ type: 'SET_INTERACTION', interacting: false });
    
    // Resume after delay
    clearTimers();
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.pauseOnFocus, state.config.resumeDelay, state.isEnabled, state.userInteracting, clearTimers]);

  const handleTouchStart = useCallback(() => {
    dispatch({ type: 'SET_INTERACTION', interacting: true });
    pause();
  }, [pause]);

  const handleTouchEnd = useCallback(() => {
    dispatch({ type: 'SET_INTERACTION', interacting: false });
    
    // Resume after delay
    clearTimers();
    resumeTimerRef.current = setTimeout(() => {
      if (state.isEnabled && !state.userInteracting) {
        dispatch({ type: 'PLAY' });
      }
    }, state.config.resumeDelay);
  }, [state.config.resumeDelay, state.isEnabled, state.userInteracting, clearTimers]);

  // Handle reduced motion changes
  useEffect(() => {
    const enabled = config.respectReducedMotion ? !prefersReducedMotion : true;
    dispatch({ type: 'SET_ENABLED', enabled });
  }, [prefersReducedMotion, config.respectReducedMotion]);

  // Handle page visibility changes
  useEffect(() => {
    if (config.disableOnInactiveTab) {
      dispatch({ type: 'SET_TAB_VISIBLE', visible: isVisible });
    }
  }, [isVisible, config.disableOnInactiveTab]);

  // Handle autoplay timer
  useEffect(() => {
    if (state.isPlaying && state.isEnabled && state.tabVisible) {
      startTimer();
    } else {
      clearTimers();
      // Clear progress state immediately when not playing
      if (progressTimerIdRef.current) {
        clearTimeout(progressTimerIdRef.current);
        progressTimerIdRef.current = null;
      }
      setProgress(0);
      setTimeRemaining(state.interval);
    }

    return () => {
      clearTimers();
      if (progressTimerIdRef.current) {
        clearTimeout(progressTimerIdRef.current);
        progressTimerIdRef.current = null;
      }
    };
  }, [state.isPlaying, state.isEnabled, state.tabVisible, state.interval, clearTimers, startTimer]);

  // Handle slide changes for callback - both manual and automatic
  const lastCallbackTransitionRef = useRef(0);
  const isInitializedRef = useRef(false);
  useEffect(() => {
    // Skip callback on initial render
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    
    // Call callback for any slide change (manual or automatic) if lastTransition changed
    if (onSlideChange && state.lastTransition > lastCallbackTransitionRef.current) {
      // Only call if this is a real transition, not just initialization
      if (state.lastTransition > 0) {
        onSlideChange(state.currentIndex, state.direction);
        lastCallbackTransitionRef.current = state.lastTransition;
      }
    }
  }, [state.currentIndex, state.direction, state.lastTransition, onSlideChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Event handlers object
  const handlers = useMemo(() => ({
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }), [handleMouseEnter, handleMouseLeave, handleFocus, handleBlur, handleTouchStart, handleTouchEnd]);

  return {
    // Current State
    currentIndex: state.currentIndex,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isEnabled: state.isEnabled,
    direction: state.direction,

    // Controls
    play,
    pause,
    toggle,
    stop,
    next,
    previous,
    goTo,

    // Event Handlers
    handlers,

    // Configuration
    updateConfig,
    config: state.config,

    // Progress Info
    progress,
    timeRemaining
  };
};

export default useAutoplayCarousel;