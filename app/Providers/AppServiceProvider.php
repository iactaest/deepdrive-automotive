<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Se APP_URL include un sottopercorso (es. https://host/bandi, deploy
        // su hosting condiviso dove l'app non vive alla radice del dominio),
        // forza route()/url()/asset() (e quindi anche i tag generati da @vite
        // e le route di Ziggy per Inertia) a usare quella radice invece di
        // derivarla dalla request in arrivo — altrimenti perderebbero il
        // prefisso. In locale (APP_URL senza path) questo blocco è un no-op.
        $path = parse_url(config('app.url'), PHP_URL_PATH);
        if ($path && trim($path, '/') !== '') {
            URL::forceRootUrl(config('app.url'));
            URL::forceScheme(parse_url(config('app.url'), PHP_URL_SCHEME) ?: 'https');
        }
    }
}
