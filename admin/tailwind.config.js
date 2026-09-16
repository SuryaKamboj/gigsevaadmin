/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#12355B',
          navyDark: '#0B223B',
          navyLight: '#1C4E80',
          blue: '#1C4E80',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          border: '#D5DCE3',
          borderDark: '#BAC7D5',
          text: '#1F2933',
          muted: '#5B6573',
          lightMuted: '#8795A5',
          success: '#2E7D32',
          successBg: '#E8F5E9',
          successBorder: '#C8E6C9',
          warning: '#B26A00',
          warningBg: '#FFF8E1',
          warningBorder: '#FFE082',
          danger: '#B42318',
          dangerBg: '#FFEBEE',
          dangerBorder: '#FFCDD2',
          lightBlue: '#EAF2F8',
          saffron: '#E67E22',
        },
        brand: {
          primary: '#12355B',
          hover: '#0B223B',
          light: '#EAF2F8',
          dark: '#0B223B',
          info: '#1C4E80',
        },
        admin: {
          bg: '#F4F6F8',
          card: '#FFFFFF',
          text: '#1F2933',
          muted: '#5B6573',
          border: '#D5DCE3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Noto Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'gov-card': '0 1px 2px 0 rgba(18, 53, 91, 0.05)',
        'gov-dropdown': '0 4px 12px 0 rgba(18, 53, 91, 0.12)',
        'admin-card': '0 1px 2px 0 rgba(18, 53, 91, 0.05)',
        'admin-dropdown': '0 4px 12px 0 rgba(18, 53, 91, 0.12)',
      }
    },
  },
  plugins: [],
}

