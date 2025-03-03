import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
    css: {
        postcss: './postcss.config.js',
    },
    base: './',
    resolve: {
        alias: {
            '@/frontend': path.resolve(__dirname, 'src/frontend'),
        },
    },
});
