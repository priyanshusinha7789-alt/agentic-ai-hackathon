/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        olive: {
          deep: '#343B2B',      // #343B2B Deep Olive
          primary: '#68734A',   // #68734A Primary Olive
          muted: '#858B68',     // #858B68 Muted Olive
          surface: '#2B3124',   // Darker surface for contrast
          subtle: '#E8ECE0',    // Light tinted olive
          border: '#454E3A',    // Olive border
        },
        brown: {
          warm: '#80634B',      // #80634B Warm Brown
          dark: '#514234',      // #514234 Dark Brown
          light: '#A3846B',
          subtle: '#F2ECE5',
        },
        terracotta: {
          DEFAULT: '#B56F50',   // #B56F50 Terracotta (threat detection / alerts)
          subtle: '#F8EFEA',
          border: '#E8C9BD',
          dark: '#8F4F33',
        },
        gold: {
          DEFAULT: '#C49A52',   // #C49A52 Gold (analytics / performance)
          subtle: '#FBF6ED',
          border: '#E8D5B5',
          dark: '#997534',
        },
        sage: {
          DEFAULT: '#A6B18A',   // #A6B18A Sage Green (successful checks)
          light: '#EDF0E6',     // #EDF0E6 Light Sage Background
          subtle: '#EDF0E6',
          border: '#C8D3AE',
          dark: '#4F5E38',
        },
        beige: {
          DEFAULT: '#F0EBE1',   // #F0EBE1 Light Beige Background
          subtle: '#F7F4EE',
          border: '#E2D9CC',
          dark: '#6E624E',
        },
        taupe: {
          soft: '#B7A995',      // #B7A995 Soft Taupe
          light: '#D9D0C3',
        },
        ivory: {
          DEFAULT: '#F7F5EF',   // #F7F5EF Ivory Background
          surface: '#FDFCF9',
          border: '#E5E1D7',    // #E5E1D7 Light Border
          dark: '#EAE5D9',
        },
        charcoal: {
          DEFAULT: '#25271F',   // #25271F Charcoal
          soft: '#383B30',
          muted: '#77776C',     // #77776C Muted Text
        },
        // Semantic aliases for convenient styling
        card: {
          bg: '#FFFFFF',
          border: '#E5E1D7',
          dark: '#2E3526',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Newsreader', 'Playfair Display', 'serif']
      },
      boxShadow: {
        'card-subtle': '0 2px 8px -2px rgba(37, 39, 31, 0.05), 0 1px 4px -1px rgba(37, 39, 31, 0.03)',
        'card-elevated': '0 12px 32px -8px rgba(52, 59, 43, 0.08), 0 4px 12px -2px rgba(52, 59, 43, 0.04)',
        'card-hover': '0 20px 40px -12px rgba(52, 59, 43, 0.12), 0 6px 16px -4px rgba(52, 59, 43, 0.06)',
        'olive-glow': '0 0 25px rgba(104, 115, 74, 0.25)',
        'brown-glow': '0 0 25px rgba(128, 99, 75, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse-slow': 'spinReverse 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spinReverse: {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' }
        }
      }
    },
  },
  plugins: [],
}
