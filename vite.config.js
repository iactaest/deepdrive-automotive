import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // Configurabile per deploy sotto un sottopercorso (es. /bandi) su hosting
    // condiviso dove l'app non vive alla radice del dominio: di default resta
    // '/' (comportamento identico a prima) finche' VITE_BASE_PATH non e'
    // impostata nel .env usato in fase di build.
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
});
