/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          accent: '#10b981',
        },
        chat: {
          lightBg: '#f0f2f5',
          lightSidebar: '#ffffff',
          lightBubbleIn: '#ffffff',
          lightBubbleOut: '#d9fdd3',
          darkBg: '#0b141a',
          darkSidebar: '#111b21',
          darkHeader: '#202c33',
          darkBubbleIn: '#202c33',
          darkBubbleOut: '#005c4b',
          darkHover: '#2a3942',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
