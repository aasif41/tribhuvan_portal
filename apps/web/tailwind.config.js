var config = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: '#0d1f3c',
                    light: '#1a3460',
                    dark: '#091529',
                },
                gold: {
                    DEFAULT: '#c8922a',
                    light: '#f0b93a',
                    dark: '#a67820',
                },
                brand: {
                    bg: '#f4f6fb',
                    text: '#1a2744',
                    muted: '#64748b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
