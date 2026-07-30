/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bouclier: {
          gold: '#b89a5a',
          dark: '#1a1a1a',
          darker: '#0d0d0d',
          light: '#f5f5f5',
          gray: '#2a2a2a',
        },
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
