/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'base-blue': '#0052FF',
                'base-black': '#020205',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'slide-up': 'slide-up 0.4s ease-out forwards',
                'orbit': 'orbit 2s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'confetti': 'confetti 3s ease-in-out forwards',
                'gradient-x': 'gradient-x 3s ease infinite',
                'sparkle': 'sparkle 2s ease-in-out infinite',
                'rotate-slow': 'rotate-slow 20s linear infinite',
            },
            keyframes: {
                'fade-in': {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
                'fade-in-up': {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    'from': { opacity: '0', transform: 'translateY(100%)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                'orbit': {
                    '0%': {
                        transform: 'translate(-50%, -50%) rotate(0deg) translateX(60px) rotate(0deg)',
                    },
                    '100%': {
                        transform: 'translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg)',
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'confetti': {
                    '0%': { transform: 'translateY(0) rotateZ(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(100vh) rotateZ(720deg)', opacity: '0' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'sparkle': {
                    '0%, 100%': { opacity: '0', transform: 'scale(0.5) rotate(0deg)' },
                    '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
                },
                'rotate-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                },
            },
            backgroundSize: {
                '200%': '200% 200%',
            },
        },
    },
    plugins: [],
}
