/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub-inspired neutral palette
        gitboard: {
          // Light theme
          light: {
            bg: {
              default: '#ffffff',
              muted: '#f6f8fa',
              subtle: '#f0f3f6',
              inset: '#eff2f5',
            },
            border: {
              default: '#d0d7de',
              muted: '#d8dee4',
            },
            text: {
              primary: '#1f2328',
              secondary: '#656d76',
              tertiary: '#8c959f',
              link: '#0969da',
            },
            accent: {
              emphasis: '#0969da',
              muted: '#ddf4ff',
              subtle: '#b6e3ff',
            },
          },
          // Dark theme
          dark: {
            bg: {
              default: '#0d1117',
              muted: '#161b22',
              subtle: '#1c2128',
              inset: '#22272e',
            },
            border: {
              default: '#30363d',
              muted: '#21262d',
            },
            text: {
              primary: '#e6edf3',
              secondary: '#8d96a0',
              tertiary: '#6e7681',
              link: '#4493f8',
            },
            accent: {
              emphasis: '#4493f8',
              muted: '#003d7a',
              subtle: '#0055a1',
            },
          },
        },
      },
      spacing: {
        'gitboard-xs': '0.25rem',
        'gitboard-sm': '0.5rem',
        'gitboard-md': '0.75rem',
        'gitboard-lg': '1rem',
        'gitboard-xl': '1.5rem',
      },
      borderRadius: {
        gitboard: '0.375rem',
      },
    },
  },
  plugins: [],
};
