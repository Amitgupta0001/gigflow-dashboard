/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
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
          350: '#8f9ef9',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          650: '#4640d4',
          655: '#453fc9',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        slate: {
          55:  '#f6f7f9',
          250: '#c8ccd5',
          350: '#94a3b8',
          450: '#64748b',
          550: '#475569',
          650: '#334155',
          750: '#1e293b',
          850: '#0f172a',
          950: '#020617',
        },
        gray: {
          55:  '#f6f7f9',
          150: '#e8eaed',
          250: '#d1d5db',
          350: '#9ca3af',
          450: '#6b7280',
          505: '#6b7280',
          550: '#6b7280',
          650: '#4b5563',
          750: '#374151',
          850: '#1f2937',
          950: '#030712',
        },
        emerald: {
          450: '#34d399',
          550: '#059669',
          650: '#047857',
          655: '#047857',
        },
        red: {
          450: '#f87171',
          650: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
