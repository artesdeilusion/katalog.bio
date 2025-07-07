import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        peach: '#ffc091',
        eggplant: '#260a2f',
        ivory: '#f7f7f8',
        rose: '#d0879e',
        lavender: '#bfbacd',
      },
    },
  },
  plugins: [],
};

export default config; 