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
                brand: {
                    primary: 'var(--color-primary)',
                    hover: 'var(--color-hover)',
                    light: 'var(--color-light)',
                    50: 'var(--color-50)',
                    100: 'var(--color-100)',
                    200: 'var(--color-200)',
                    300: 'var(--color-300)',
                },
                // Keep red alias for backward compatibility during migration
                red: {
                    primary: 'var(--color-primary)',
                    hover: 'var(--color-hover)',
                    light: 'var(--color-light)',
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
                brand: '0 8px 24px rgba(var(--color-rgb), 0.2)',
                'brand-sm': '0 4px 12px rgba(var(--color-rgb), 0.15)',
                red: '0 8px 24px rgba(var(--color-rgb), 0.2)',
                'red-sm': '0 4px 12px rgba(var(--color-rgb), 0.15)',
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease forwards',
                'fade-in': 'fade-in 0.4s ease forwards',
                'scan-line': 'scan-line 2s ease-in-out infinite',
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
                'scan-line': {
                    '0%': { top: '8%', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { top: '92%', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
