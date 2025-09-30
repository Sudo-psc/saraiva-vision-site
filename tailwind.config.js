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
    },
  },
  plugins: [],
}