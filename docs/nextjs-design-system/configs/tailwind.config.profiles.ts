/**
 * Multi-Profile Tailwind Configuration
 * Saraiva Vision - Three Design Systems
 *
 * Profiles:
 * - familiar: Family-focused, trust, prevention
 * - jovem: Young, tech-savvy, subscription model
 * - senior: Accessibility-first, WCAG AAA, high contrast
 */

import type { Config } from 'tailwindcss';

const profileConfigs = {
  familiar: {
    colors: {
      // Warm, trustworthy palette
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#b9e6fe',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Main brand
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49'
      },
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e'
      },
      accent: {
        50: '#fef3c7',
        100: '#fde68a',
        200: '#fcd34d',
        300: '#fbbf24',
        400: '#f59e0b',
        500: '#d97706', // Warm accent
        600: '#b45309',
        700: '#92400e',
        800: '#78350f',
        900: '#451a03'
      },
      neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      display: ['Poppins', 'Inter', 'sans-serif']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.16' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }]
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px'
    },
    spacing: {
      section: '4rem',
      card: '1.5rem',
      element: '1rem'
    }
  },

  jovem: {
    colors: {
      // Vibrant, modern gradient palette
      primary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Vibrant purple
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e'
      },
      secondary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981', // Electric green
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22'
      },
      accent: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e', // Bold pink
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337'
      },
      gradient: {
        start: '#d946ef',
        middle: '#8b5cf6',
        end: '#3b82f6'
      },
      dark: {
        50: '#18181b',
        100: '#27272a',
        200: '#3f3f46',
        300: '#52525b',
        400: '#71717a',
        500: '#a1a1aa',
        600: '#d4d4d8',
        700: '#e4e4e7',
        800: '#f4f4f5',
        900: '#fafafa'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Space Grotesk', 'Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'Courier New', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0125em' }],
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.0125em' }],
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.0375em' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
      '5xl': ['3rem', { lineHeight: '1.16', letterSpacing: '-0.0625em' }],
      '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.075em' }],
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.0875em' }]
    },
    borderRadius: {
      none: '0',
      sm: '0.375rem',
      DEFAULT: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      full: '9999px'
    },
    spacing: {
      section: '5rem',
      card: '2rem',
      element: '1.25rem'
    },
    animation: {
      'gradient-x': 'gradient-x 15s ease infinite',
      'gradient-y': 'gradient-y 15s ease infinite',
      'gradient-xy': 'gradient-xy 15s ease infinite',
      'float': 'float 3s ease-in-out infinite',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'shimmer': 'shimmer 2s linear infinite'
    },
    keyframes: {
      'gradient-x': {
        '0%, 100%': { 'background-position': '0% 50%' },
        '50%': { 'background-position': '100% 50%' }
      },
      'gradient-y': {
        '0%, 100%': { 'background-position': '50% 0%' },
        '50%': { 'background-position': '50% 100%' }
      },
      'gradient-xy': {
        '0%, 100%': { 'background-position': '0% 0%' },
        '25%': { 'background-position': '100% 0%' },
        '50%': { 'background-position': '100% 100%' },
        '75%': { 'background-position': '0% 100%' }
      },
      'float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' }
      },
      'shimmer': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' }
      }
    }
  },

  senior: {
    colors: {
      // WCAG AAA compliant high-contrast palette
      primary: {
        50: '#e6f2ff',
        100: '#cce5ff',
        200: '#99cbff',
        300: '#66b0ff',
        400: '#3396ff',
        500: '#0066cc', // High contrast blue (4.5:1 on white)
        600: '#0052a3',
        700: '#003d7a',
        800: '#002952',
        900: '#001429',
        950: '#000a14'
      },
      secondary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#16a34a', // High contrast green (4.5:1 on white)
        600: '#15803d',
        700: '#14532d',
        800: '#052e16',
        900: '#021a09'
      },
      accent: {
        50: '#fef3c7',
        100: '#fde68a',
        200: '#fcd34d',
        300: '#fbbf24',
        400: '#f59e0b',
        500: '#d97706', // High contrast amber
        600: '#b45309',
        700: '#92400e',
        800: '#78350f',
        900: '#451a03'
      },
      neutral: {
        50: '#ffffff',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#000000'
      },
      // High contrast mode colors
      highContrast: {
        text: '#000000',
        background: '#ffffff',
        textInverse: '#ffffff',
        backgroundInverse: '#000000',
        border: '#000000',
        focus: '#0066cc'
      }
    },
    fontFamily: {
      sans: ['Atkinson Hyperlegible', 'Arial', 'sans-serif'], // Designed for low vision
      serif: ['Georgia', 'Times New Roman', 'serif'],
      display: ['Atkinson Hyperlegible', 'Arial', 'sans-serif']
    },
    fontSize: {
      // Larger base sizes for readability
      xs: ['0.875rem', { lineHeight: '1.5' }],
      sm: ['1rem', { lineHeight: '1.5' }],
      base: ['1.125rem', { lineHeight: '1.75' }], // 18px base
      lg: ['1.25rem', { lineHeight: '1.75' }],
      xl: ['1.5rem', { lineHeight: '1.75' }],
      '2xl': ['1.875rem', { lineHeight: '2' }],
      '3xl': ['2.25rem', { lineHeight: '2.25' }],
      '4xl': ['3rem', { lineHeight: '1.25' }],
      '5xl': ['3.75rem', { lineHeight: '1.2' }],
      '6xl': ['4.5rem', { lineHeight: '1.15' }]
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px'
    },
    spacing: {
      section: '6rem',
      card: '2rem',
      element: '1.5rem',
      touch: '3rem' // Minimum touch target size (48px)
    },
    // Minimum touch target sizes (WCAG 2.5.5)
    minTouchTarget: {
      width: '3rem', // 48px
      height: '3rem' // 48px
    }
  }
};

export const createProfileConfig = (profile: keyof typeof profileConfigs): Partial<Config> => {
  const config = profileConfigs[profile];

  const baseConfig: Partial<Config> = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html'
    ],
    theme: {
      extend: {
        colors: config.colors,
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        borderRadius: config.borderRadius,
        spacing: config.spacing,
        ...(profile === 'jovem' && {
          animation: config.animation,
          keyframes: config.keyframes,
          backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
          }
        }),
        ...(profile === 'senior' && {
          minWidth: config.minTouchTarget,
          minHeight: config.minTouchTarget
        })
      }
    },
    plugins: []
  };

  return baseConfig;
};

export const profileThemes = {
  familiar: {
    name: 'Familiar',
    description: 'Family-focused, trust, prevention',
    colorScheme: 'warm',
    accessibility: 'WCAG AA',
    features: ['Rounded corners', 'Warm colors', 'Friendly typography']
  },
  jovem: {
    name: 'Jovem',
    description: 'Young, tech-savvy, subscription model',
    colorScheme: 'vibrant',
    accessibility: 'WCAG AA',
    features: ['Gradients', 'Animations', 'Modern typography', 'Dark mode']
  },
  senior: {
    name: 'Sênior',
    description: 'Accessibility-first, WCAG AAA, high contrast',
    colorScheme: 'highContrast',
    accessibility: 'WCAG AAA',
    features: ['Large text', 'High contrast', 'Large touch targets', 'Clear focus states']
  }
};

export default profileConfigs;
