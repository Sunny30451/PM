import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { normalizeBasePath } from './server/config.js';

const appBasePath = normalizeBasePath(process.env.APP_BASE_PATH);
const viteBasePath = appBasePath === '/' ? '/' : `${appBasePath}/`;
const apiPath = `${appBasePath === '/' ? '' : appBasePath}/api`;

export default defineConfig({
    base: viteBasePath,
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            [apiPath]: {
                target: `http://127.0.0.1:${process.env.API_PORT || 3001}`,
                changeOrigin: true,
            },
        },
    },
});
