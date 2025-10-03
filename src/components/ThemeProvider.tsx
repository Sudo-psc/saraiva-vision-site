/**
 * Theme Provider Component
 * Saraiva Vision - Multi-Profile Theme System
 *
 * Manages theme state, CSS variables, and profile switching
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ProfileType, getDesignTokens, generateCSSVariables } from '../lib/design-tokens';

interface ThemeContextValue {
  profile: ProfileType;
  setProfile: (profile: ProfileType) => void;
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (isHighContrast: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (isReduced: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultProfile?: ProfileType;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultProfile = 'familiar',
  storageKey = 'saraiva-theme-profile'
}) => {
  // Profile state
  const [profile, setProfileState] = useState<ProfileType>(defaultProfile);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['familiar', 'jovem', 'senior'].includes(stored)) {
        setProfileState(stored as ProfileType);
      }
    }
  }, [storageKey]);

  // Accessibility states
  const [isDarkMode, setDarkModeState] = useState(false);
  const [highContrastMode, setHighContrastModeState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [fontSize, setFontSizeState] = useState(100); // Percentage

  // Memoized tokens
  const tokens = useMemo(() => getDesignTokens(profile), [profile]);

  // Set profile with persistence
  const setProfile = (newProfile: ProfileType) => {
    setProfileState(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newProfile);
    }

    // Auto-enable high contrast for senior profile
    if (newProfile === 'senior') {
      setHighContrastModeState(true);
      setReducedMotionState(true);
    }
  };

  // Dark mode toggle (primarily for jovem profile)
  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  // High contrast mode toggle
  const setHighContrastMode = (isHighContrast: boolean) => {
    setHighContrastModeState(isHighContrast);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast', isHighContrast);
    }
  };

  // Reduced motion toggle
  const setReducedMotion = (isReduced: boolean) => {
    setReducedMotionState(isReduced);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('reduce-motion', isReduced);
    }
  };

  // Font size adjustment
  const setFontSize = (size: number) => {
    const clampedSize = Math.max(75, Math.min(200, size)); // 75% to 200%
    setFontSizeState(clampedSize);
    if (typeof window !== 'undefined') {
      document.documentElement.style.fontSize = `${clampedSize}%`;
    }
  };

  // Apply CSS variables on profile change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cssVars = generateCSSVariables(tokens);
    const root = document.documentElement;

    // Apply each CSS variable
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply profile-specific class
    root.setAttribute('data-profile', profile);

    // Apply accessibility settings
    root.classList.toggle('dark', isDarkMode);
    root.classList.toggle('high-contrast', highContrastMode);
    root.classList.toggle('reduce-motion', reducedMotion);
    root.style.fontSize = `${fontSize}%`;
  }, [profile, tokens, isDarkMode, highContrastMode, reducedMotion, fontSize]);

  // Listen for system prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotionState(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for system prefers-color-scheme changes (for jovem profile)
  useEffect(() => {
    if (typeof window === 'undefined' || profile !== 'jovem') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkModeState(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [profile]);

  const value: ThemeContextValue = {
    profile,
    setProfile,
    isDarkMode,
    setDarkMode,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook to get current design tokens
 */
export const useDesignTokens = () => {
  const { profile } = useTheme();
  return useMemo(() => getDesignTokens(profile), [profile]);
};

/**
 * Profile Selector Component
 */
export const ProfileSelector: React.FC<{
  className?: string;
  showLabels?: boolean;
}> = ({ className = '', showLabels = true }) => {
  const { profile, setProfile } = useTheme();

  const profiles: Array<{ value: ProfileType; label: string; icon: string }> = [
    { value: 'familiar', label: 'Família', icon: '👨‍👩‍👧‍👦' },
    { value: 'jovem', label: 'Jovem', icon: '🚀' },
    { value: 'senior', label: 'Sênior', icon: '♿' }
  ];

  return (
    <div className={`profile-selector ${className}`} role="radiogroup" aria-label="Selecionar perfil">
      {profiles.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setProfile(value)}
          className={`profile-option ${profile === value ? 'active' : ''}`}
          role="radio"
          aria-checked={profile === value}
          aria-label={`Perfil ${label}`}
        >
          <span className="profile-icon" aria-hidden="true">{icon}</span>
          {showLabels && <span className="profile-label">{label}</span>}
        </button>
      ))}
    </div>
  );
};

/**
 * Accessibility Controls Component
 */
export const AccessibilityControls: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const {
    profile,
    isDarkMode,
    setDarkMode,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize
  } = useTheme();

  return (
    <div className={`accessibility-controls ${className}`}>
      <h3>Preferências de Acessibilidade</h3>

      {/* Dark Mode (primarily for jovem profile) */}
      {profile === 'jovem' && (
        <div className="control-group">
          <label htmlFor="dark-mode-toggle">
            <input
              id="dark-mode-toggle"
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              role="switch"
              aria-checked={isDarkMode}
            />
            Modo Escuro
          </label>
        </div>
      )}

      {/* High Contrast */}
      <div className="control-group">
        <label htmlFor="high-contrast-toggle">
          <input
            id="high-contrast-toggle"
            type="checkbox"
            checked={highContrastMode}
            onChange={(e) => setHighContrastMode(e.target.checked)}
            role="switch"
            aria-checked={highContrastMode}
          />
          Alto Contraste
        </label>
      </div>

      {/* Reduced Motion */}
      <div className="control-group">
        <label htmlFor="reduced-motion-toggle">
          <input
            id="reduced-motion-toggle"
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            role="switch"
            aria-checked={reducedMotion}
          />
          Reduzir Animações
        </label>
      </div>

      {/* Font Size */}
      <div className="control-group">
        <label htmlFor="font-size-slider">
          Tamanho da Fonte: {fontSize}%
          <input
            id="font-size-slider"
            type="range"
            min="75"
            max="200"
            step="25"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-valuemin={75}
            aria-valuemax={200}
            aria-valuenow={fontSize}
            aria-label="Ajustar tamanho da fonte"
          />
        </label>
      </div>
    </div>
  );
};

export default ThemeProvider;
