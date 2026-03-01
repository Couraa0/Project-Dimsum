import type { Config } from 'tailwindcss';

export default {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                red: {
                    primary: '#C1121F',
                    hover: '#a50f1a',
                    light: '#fff0f1',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
            },
            boxShadow: {
                red: '0 8px 24px rgba(193, 18, 31, 0.2)',
                'red-sm': '0 4px 12px rgba(193, 18, 31, 0.15)',
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease forwards',
                'fade-in': 'fade-in 0.4s ease forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
