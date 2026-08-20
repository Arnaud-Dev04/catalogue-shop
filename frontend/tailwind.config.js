/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Un thème clair professionnel
        primary: {
          50: '#f5f7fa',
          100: '#e4e9f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#0f172a', // ardoise très foncée/noir pro
          600: '#1e293b',
          700: '#334155',
          800: '#475569',
          900: '#5e718d',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981', // vert émeraude pour WhatsApp / dispo / succès
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
