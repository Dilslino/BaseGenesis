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
            animation: {
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'orbit': 'orbit 2s linear infinite',
                'float': 'float 3s ease-in-out infinite',
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
                'orbit': {
                    '0%': {
                        transform: 'translate(-50%, -50%) rotate(0deg) translateX(60px) rotate(0deg)',
                    },
                    '100%': {
                        transform: 'translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg)',
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
                    '25%': { transform: 'translateY(-20px) translateX(10px)' },
                    '50%': { transform: 'translateY(-10px) translateX(-10px)' },
                    '75%': { transform: 'translateY(-15px) translateX(5px)' },
                }
            }
        },
    },
    plugins: [],
}
