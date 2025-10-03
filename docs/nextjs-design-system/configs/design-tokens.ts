/**
 * Design Tokens System
 * Saraiva Vision - Multi-Profile Design System
 *
 * Centralized design decisions that can be applied across all profiles
 * with profile-specific variations
 */

export type ProfileType = 'familiar' | 'jovem' | 'senior';

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  layout: LayoutTokens;
  motion: MotionTokens;
  accessibility: AccessibilityTokens;
}

interface ColorTokens {
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  surface: {
    background: string;
    foreground: string;
    card: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    default: string;
    focus: string;
    hover: string;
  };
}

interface TypographyTokens {
  fontFamily: {
    body: string;
    heading: string;
    display: string;
    mono?: string;
  };
  fontSize: {
    display: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
    caption: string;
  };
  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

interface SpacingTokens {
  scale: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  component: {
    padding: {
      button: string;
      card: string;
      input: string;
    };
    gap: {
      section: string;
      card: string;
      element: string;
    };
  };
}

interface LayoutTokens {
  container: {
    maxWidth: string;
    padding: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  zIndex: {
    modal: number;
    dropdown: number;
    header: number;
    overlay: number;
  };
}

interface MotionTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    smooth: string;
    bounce: string;
  };
  reducedMotion: boolean;
}

interface AccessibilityTokens {
  focusRing: {
    width: string;
    color: string;
    offset: string;
  };
  minTouchTarget: {
    width: string;
    height: string;
  };
  contrast: {
    ratio: number;
    mode: 'normal' | 'high';
  };
}

/**
 * Familiar Profile Tokens
 * Family-focused, trust, prevention
 */
export const familiarTokens: DesignTokens = {
  colors: {
    brand: {
      primary: '#0ea5e9', // Sky blue - trustworthy
      secondary: '#d946ef', // Purple - caring
      accent: '#d97706' // Amber - warmth
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    surface: {
      background: '#ffffff',
      foreground: '#f8fafc',
      card: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff'
    },
    border: {
      default: '#e2e8f0',
      focus: '#0ea5e9',
      hover: '#cbd5e1'
    }
  },
  typography: {
    fontFamily: {
      body: "'Inter', system-ui, -apple-system, sans-serif",
      heading: "'Poppins', 'Inter', sans-serif",
      display: "'Poppins', 'Inter', sans-serif"
    },
    fontSize: {
      display: '3rem',
      h1: '2.25rem',
      h2: '1.875rem',
      h3: '1.5rem',
      h4: '1.25rem',
      body: '1rem',
      small: '0.875rem',
      caption: '0.75rem'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    scale: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    component: {
      padding: {
        button: '0.75rem 1.5rem',
        card: '1.5rem',
        input: '0.75rem 1rem'
      },
      gap: {
        section: '4rem',
        card: '1.5rem',
        element: '1rem'
      }
    }
  },
  layout: {
    container: {
      maxWidth: '1280px',
      padding: '1rem'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    zIndex: {
      modal: 1000,
      dropdown: 900,
      header: 800,
      overlay: 999
    }
  },
  motion: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    reducedMotion: false
  },
  accessibility: {
    focusRing: {
      width: '2px',
      color: '#0ea5e9',
      offset: '2px'
    },
    minTouchTarget: {
      width: '44px',
      height: '44px'
    },
    contrast: {
      ratio: 4.5,
      mode: 'normal'
    }
  }
};

/**
 * Jovem Profile Tokens
 * Young, tech-savvy, subscription model
 */
export const jovemTokens: DesignTokens = {
  colors: {
    brand: {
      primary: '#d946ef', // Vibrant purple
      secondary: '#10b981', // Electric green
      accent: '#f43f5e' // Bold pink
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',
      info: '#8b5cf6'
    },
    surface: {
      background: '#ffffff',
      foreground: '#18181b',
      card: '#27272a',
      overlay: 'rgba(24, 24, 27, 0.8)'
    },
    text: {
      primary: '#18181b',
      secondary: '#52525b',
      tertiary: '#a1a1aa',
      inverse: '#ffffff'
    },
    border: {
      default: '#3f3f46',
      focus: '#d946ef',
      hover: '#52525b'
    }
  },
  typography: {
    fontFamily: {
      body: "'Inter', system-ui, -apple-system, sans-serif",
      heading: "'Space Grotesk', 'Inter', sans-serif",
      display: "'Space Grotesk', 'Inter', sans-serif",
      mono: "'JetBrains Mono', 'Courier New', monospace"
    },
    fontSize: {
      display: '4.5rem',
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      h4: '1.5rem',
      body: '1rem',
      small: '0.875rem',
      caption: '0.75rem'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    scale: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1.25rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
      '3xl': '5rem'
    },
    component: {
      padding: {
        button: '1rem 2rem',
        card: '2rem',
        input: '1rem 1.25rem'
      },
      gap: {
        section: '5rem',
        card: '2rem',
        element: '1.25rem'
      }
    }
  },
  layout: {
    container: {
      maxWidth: '1440px',
      padding: '1.5rem'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    zIndex: {
      modal: 1000,
      dropdown: 900,
      header: 800,
      overlay: 999
    }
  },
  motion: {
    duration: {
      fast: '100ms',
      normal: '250ms',
      slow: '400ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    reducedMotion: false
  },
  accessibility: {
    focusRing: {
      width: '2px',
      color: '#d946ef',
      offset: '2px'
    },
    minTouchTarget: {
      width: '44px',
      height: '44px'
    },
    contrast: {
      ratio: 4.5,
      mode: 'normal'
    }
  }
};

/**
 * Sênior Profile Tokens
 * Accessibility-first, WCAG AAA, high contrast
 */
export const seniorTokens: DesignTokens = {
  colors: {
    brand: {
      primary: '#0066cc', // High contrast blue
      secondary: '#16a34a', // High contrast green
      accent: '#d97706' // High contrast amber
    },
    semantic: {
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0066cc'
    },
    surface: {
      background: '#ffffff',
      foreground: '#f5f5f5',
      card: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.75)'
    },
    text: {
      primary: '#000000',
      secondary: '#262626',
      tertiary: '#525252',
      inverse: '#ffffff'
    },
    border: {
      default: '#000000',
      focus: '#0066cc',
      hover: '#404040'
    }
  },
  typography: {
    fontFamily: {
      body: "'Atkinson Hyperlegible', Arial, sans-serif",
      heading: "'Atkinson Hyperlegible', Arial, sans-serif",
      display: "'Atkinson Hyperlegible', Arial, sans-serif"
    },
    fontSize: {
      display: '4.5rem',
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      h4: '1.5rem',
      body: '1.125rem', // 18px base for readability
      small: '1rem',
      caption: '0.875rem'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.75,
      relaxed: 2
    }
  },
  spacing: {
    scale: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
      '3xl': '6rem'
    },
    component: {
      padding: {
        button: '1.25rem 2rem',
        card: '2rem',
        input: '1.25rem 1.5rem'
      },
      gap: {
        section: '6rem',
        card: '2rem',
        element: '1.5rem'
      }
    }
  },
  layout: {
    container: {
      maxWidth: '1200px',
      padding: '2rem'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    zIndex: {
      modal: 1000,
      dropdown: 900,
      header: 800,
      overlay: 999
    }
  },
  motion: {
    duration: {
      fast: '0ms', // No animation for reduced motion
      normal: '0ms',
      slow: '0ms'
    },
    easing: {
      default: 'linear',
      smooth: 'linear',
      bounce: 'linear'
    },
    reducedMotion: true
  },
  accessibility: {
    focusRing: {
      width: '3px',
      color: '#0066cc',
      offset: '3px'
    },
    minTouchTarget: {
      width: '48px', // WCAG 2.5.5
      height: '48px'
    },
    contrast: {
      ratio: 7.0, // WCAG AAA
      mode: 'high'
    }
  }
};

/**
 * Token getter by profile
 */
export const getDesignTokens = (profile: ProfileType): DesignTokens => {
  const tokens = {
    familiar: familiarTokens,
    jovem: jovemTokens,
    senior: seniorTokens
  };

  return tokens[profile];
};

/**
 * CSS Variable generator for runtime theme switching
 */
export const generateCSSVariables = (tokens: DesignTokens): Record<string, string> => {
  return {
    // Colors
    '--color-primary': tokens.colors.brand.primary,
    '--color-secondary': tokens.colors.brand.secondary,
    '--color-accent': tokens.colors.brand.accent,
    '--color-success': tokens.colors.semantic.success,
    '--color-warning': tokens.colors.semantic.warning,
    '--color-error': tokens.colors.semantic.error,
    '--color-info': tokens.colors.semantic.info,
    '--color-background': tokens.colors.surface.background,
    '--color-foreground': tokens.colors.surface.foreground,
    '--color-card': tokens.colors.surface.card,
    '--color-text-primary': tokens.colors.text.primary,
    '--color-text-secondary': tokens.colors.text.secondary,
    '--color-border': tokens.colors.border.default,
    '--color-focus': tokens.colors.border.focus,

    // Typography
    '--font-body': tokens.typography.fontFamily.body,
    '--font-heading': tokens.typography.fontFamily.heading,
    '--font-display': tokens.typography.fontFamily.display,
    '--font-size-body': tokens.typography.fontSize.body,
    '--line-height-normal': tokens.typography.lineHeight.normal.toString(),

    // Spacing
    '--spacing-section': tokens.spacing.component.gap.section,
    '--spacing-card': tokens.spacing.component.gap.card,
    '--spacing-element': tokens.spacing.component.gap.element,

    // Motion
    '--duration-normal': tokens.motion.duration.normal,
    '--easing-default': tokens.motion.easing.default,

    // Accessibility
    '--focus-ring-width': tokens.accessibility.focusRing.width,
    '--focus-ring-color': tokens.accessibility.focusRing.color,
    '--min-touch-width': tokens.accessibility.minTouchTarget.width,
    '--min-touch-height': tokens.accessibility.minTouchTarget.height
  };
};

export default {
  familiar: familiarTokens,
  jovem: jovemTokens,
  senior: seniorTokens,
  getDesignTokens,
  generateCSSVariables
};
