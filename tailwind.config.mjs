/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: 'selector',
  plugins: [],
  theme: {
    borderRadius: {
      DEFAULT: '0.5625rem',
      full: '9999px',
      lg: '0.8125rem',
      md: '0.6875rem',
      sm: '0.375rem'
    },
    extend: {
      colors: {
        primary: '#6E62E5'
      }
    }
  }
}
