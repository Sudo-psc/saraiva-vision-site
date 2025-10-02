/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul Petróleo - Primária
        primary: {
          50: '#F1F5F4',   // Off-white com tom petróleo
          100: '#E0EBE9',  // Muito claro
          200: '#C1D7D3',  // Claro
          300: '#8FB5AD',  // Médio-claro
          400: '#5D9387',  // Médio
          500: '#1E4D4C',  // Azul petróleo base
          600: '#173F3E',  // Escuro
          700: '#0F3B3A',  // Muito escuro
          800: '#0B2E2D',  // Quase preto
          900: '#071F1E',  // Mais escuro
        },
        // Teal/Slate - Secundária (complemento suave)
        secondary: {
          50: '#F6F7F5',   // Off-white base
          100: '#ECEFF1',  // Cinza frio muito claro
          200: '#CBD5D1',  // Borda padrão
          300: '#9BABAC',  // Cinza meio
          400: '#647A78',  // Slate médio
          500: '#2C5F5B',  // Teal complementar
          600: '#244E4A',  // Teal escuro
          700: '#1C3D3A',  // Teal muito escuro
          800: '#142D2B',  // Quase preto teal
          900: '#0C1E1D',  // Preto teal
        },
        // Acentos Neutros Quentes
        accent: {
          warm: '#D9D3C7',    // Areia/bege suave
          sand: '#E8E3D8',    // Areia clara
          stone: '#C9C3B8',   // Pedra
        },
        // Textos
        text: {
          primary: '#0B0E0F',   // Quase preto (alto contraste)
          secondary: '#4B5563', // Cinza ardósia
          muted: '#6B7280',     // Cinza médio
          light: '#9CA3AF',     // Cinza claro
        },
        // Fundos
        bg: {
          primary: '#F6F7F5',   // Off-white base
          secondary: '#F1F5F4', // Off-white com leve tom petróleo
          tertiary: '#ECEFF1',  // Cinza frio muito claro
          card: 'rgba(255, 255, 255, 0.7)', // Glass card
        },
        // Bordas
        border: {
          light: '#CBD5D1',     // Borda padrão
          medium: '#9BABAC',    // Borda média
          dark: '#647A78',      // Borda escura
        },
        // Spotify Green Theme for Podcasts
        'spotify-green': {
          50: '#F0FDF4',     // Very light green
          100: '#DCFCE7',    // Light green
          200: '#BBF7D0',    // Medium light green
          300: '#86EFAC',    // Medium green
          400: '#4ADE80',    // Bright green
          500: '#22C55E',    // Spotify Green base
          600: '#16A34A',    // Spotify Green (standard)
          700: '#15803D',    // Spotify Green dark
          800: '#166534',    // Spotify Green darker
          900: '#14532D',    // Spotify Green darkest
          light: '#BBF7D0',   // Light variant
          DEFAULT: '#1DB954', // Official Spotify Green
          dark: '#166534',    // Dark variant
        },
        // Cores Semânticas (harmonizadas)
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#065F46',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#92400E',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#991B1B',
        },
        info: {
          light: '#E0EBE9',
          DEFAULT: '#1E4D4C',
          dark: '#0F3B3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        relaxed: '0.2px',
      },
      borderRadius: {
        'soft': '8px',
        'medium': '10px',
        'comfortable': '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(30, 77, 76, 0.08)',
        'glass-lg': '0 12px 40px rgba(30, 77, 76, 0.12)',
        'glass-xl': '0 20px 60px rgba(30, 77, 76, 0.16)',
        '3d': '0 20px 60px rgba(30, 77, 76, 0.2), 0 10px 20px rgba(30, 77, 76, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)',
        '3d-hover': '0 30px 80px rgba(30, 77, 76, 0.25), 0 15px 30px rgba(30, 77, 76, 0.2), 0 6px 12px rgba(0, 0, 0, 0.12)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Base colors aligned with Saraiva Vision theme
            '--tw-prose-body': theme('colors.text.primary'),
            '--tw-prose-headings': theme('colors.primary.700'),
            '--tw-prose-lead': theme('colors.text.secondary'),
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-bold': theme('colors.primary.800'),
            '--tw-prose-counters': theme('colors.primary.500'),
            '--tw-prose-bullets': theme('colors.primary.400'),
            '--tw-prose-hr': theme('colors.border.light'),
            '--tw-prose-quotes': theme('colors.primary.700'),
            '--tw-prose-quote-borders': theme('colors.primary.300'),
            '--tw-prose-captions': theme('colors.text.muted'),
            '--tw-prose-code': theme('colors.primary.800'),
            '--tw-prose-pre-code': theme('colors.bg.primary'),
            '--tw-prose-pre-bg': theme('colors.primary.800'),
            '--tw-prose-th-borders': theme('colors.border.medium'),
            '--tw-prose-td-borders': theme('colors.border.light'),

            // Typography styling
            maxWidth: 'none',
            fontSize: '1.0625rem',
            lineHeight: '1.75',

            // Headings
            h1: {
              fontWeight: '700',
              letterSpacing: '-0.025em',
              color: theme('colors.primary.700'),
            },
            h2: {
              fontWeight: '600',
              letterSpacing: '-0.015em',
              color: theme('colors.primary.700'),
              marginTop: '2em',
              marginBottom: '1em',
            },
            h3: {
              fontWeight: '600',
              color: theme('colors.primary.600'),
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h4: {
              fontWeight: '600',
              color: theme('colors.primary.600'),
            },

            // Links with medical theme
            a: {
              color: theme('colors.primary.600'),
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: `1px solid ${theme('colors.primary.300')}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme('colors.primary.700'),
                borderBottomColor: theme('colors.primary.600'),
              },
            },

            // Strong/Bold
            strong: {
              color: theme('colors.primary.800'),
              fontWeight: '600',
            },

            // Blockquotes
            blockquote: {
              fontStyle: 'normal',
              borderLeftColor: theme('colors.primary.500'),
              backgroundColor: theme('colors.bg.secondary'),
              padding: '1rem 1.5rem',
              borderRadius: theme('borderRadius.soft'),
              quotes: 'none',
            },

            // Code
            code: {
              color: theme('colors.primary.800'),
              backgroundColor: theme('colors.primary.50'),
              padding: '0.25rem 0.375rem',
              borderRadius: theme('borderRadius.soft'),
              fontWeight: '500',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },

            // Pre/Code blocks
            pre: {
              backgroundColor: theme('colors.primary.800'),
              color: theme('colors.bg.primary'),
              borderRadius: theme('borderRadius.medium'),
              padding: '1rem 1.5rem',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
            },

            // Lists
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },

            // Images
            img: {
              borderRadius: theme('borderRadius.medium'),
              boxShadow: theme('boxShadow.soft'),
            },

            // Tables
            table: {
              fontSize: '0.9375rem',
            },
            thead: {
              borderBottomColor: theme('colors.border.medium'),
            },
            'thead th': {
              color: theme('colors.primary.700'),
              fontWeight: '600',
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.75',
            h1: {
              fontSize: '2.5rem',
            },
            h2: {
              fontSize: '2rem',
            },
            h3: {
              fontSize: '1.5rem',
            },
          },
        },
        xl: {
          css: {
            fontSize: '1.25rem',
            lineHeight: '1.8',
            h1: {
              fontSize: '3rem',
            },
            h2: {
              fontSize: '2.25rem',
            },
            h3: {
              fontSize: '1.75rem',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}