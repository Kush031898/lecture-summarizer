/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#3b82f6',
        primaryHover: '#2563eb'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
