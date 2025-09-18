/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      backgroundColor: {
        dark: '#121212',
        light: '#ffffff',
      },
      textColor: {
        dark: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
        },
        light: {
          primary: '#1e293b',
          secondary: '#475569',
        },
      },
      borderColor: {
        dark: '#2d3748',
        light: '#e2e8f0',
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(255, 255, 255, 0.05)',
        'dark-md': '0 4px 6px -1px rgba(255, 255, 255, 0.05), 0 2px 4px -1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}