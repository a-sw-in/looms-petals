import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[class~="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#ffffff',
        'light-text': '#111827',
        'dark-bg': '#111827',
        'dark-text': '#f3f4f6',
      },
    },
  },
  plugins: [],
};

export default config;
