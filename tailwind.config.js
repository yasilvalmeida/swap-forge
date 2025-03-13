// tailwind.config.js
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    /* extend: {
      colors: {
        primary: '#2d6987',
        'primary-hover': '#02466e',
        secundary: '#3e7870',
        'secundary-hover': '#365e59',
        warning: '#d97706',
        'warning-hover': '#f59e0b',
        danger: '#dc2626',
        'danger-hover': '#ef4444',
      },
    }, */
    fontSize: {
      sm: '0.8rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem',
    },
    screens: {
      sm: '800px',
      md: '1024px',
      lg: '1440px',
      xl: '2000px',
      '2xl': '2500px',
      '3xl': '3000px',
    },
  },
  plugins: [],
};
