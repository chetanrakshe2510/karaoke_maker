/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                neon: {
                    cyan: '#22d3ee',
                    yellow: '#facc15',
                    pink: '#f472b6',
                },
                surface: {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a2e',
                    600: '#252540',
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'eq-bar': 'eqBar 0.8s ease-in-out infinite alternate',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
                eqBar: {
                    '0%': { height: '20%' },
                    '100%': { height: '100%' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            dropShadow: {
                'neon-cyan': '0 0 12px rgba(34, 211, 238, 0.5)',
                'neon-yellow': '0 0 12px rgba(250, 204, 21, 0.5)',
            },
        },
    },
    plugins: [],
}
