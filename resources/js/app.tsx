import '../css/app.css';
// import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { publicUrl } from './lib/publicUrl';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Fonte unica per lo sfondo a pattern condiviso da .card-bolla-bg (app.css) e
// dalle varianti .dc-bg/.mb-bg (dashboard desktop/mobile): tiene conto del
// base path di Vite, cosi' l'URL resta corretto anche in un deploy sotto
// sottopercorso (es. /bandi) invece di restare ancorato alla radice del dominio.
document.documentElement.style.setProperty(
    '--pattern-giochi-bg',
    `url(${publicUrl('images/pattern-giochi.png')})`
);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
