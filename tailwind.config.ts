import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        messiri: ['var(--font-messiri)', 'serif'],
      },
      colors: {
        // الألوان الأساسية - منصة جدير
        primary: {
          DEFAULT: '#2A6364', // الأخضر البترولي
          50: '#E8F0F0',
          100: '#C5D8D9',
          200: '#9CBCBE',
          300: '#73A0A2',
          400: '#508A8C',
          500: '#2A6364',
          600: '#235253',
          700: '#1B4142',
          800: '#143131',
          900: '#0C2020',
        },
        gold: {
          DEFAULT: '#C7B08C', // الذهبي الرملي
          50: '#FAF7F1',
          100: '#F1EADC',
          200: '#E4D5BC',
          300: '#D6C09B',
          400: '#C9AB7A',
          500: '#C7B08C',
          600: '#B09373',
          700: '#8A745B',
          800: '#645543',
          900: '#3F362B',
        },
        ivory: {
          DEFAULT: '#F9F9F9', // الأبيض المؤسسي
        },
        // الألوان الثانوية
        wine: '#73384B', // العنابي
        steelblue: '#2E6F8E', // الأزرق المؤسسي
        sage: '#4F8F7A', // الأخضر المتوسط
        umber: '#6B5A4A', // البني الداكن
        lightgray: '#DADBD9',
        midgray: '#B5BDBE',
        darkgray: '#5A5A5A',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
