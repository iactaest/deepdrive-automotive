<?php

namespace App\Providers;

use Illuminate\Http\Request;
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

        // Usato per smistare tra Ente/Dashboard (sidebar, desktop) e
        // Ente/DashboardMobile (ruota di bolle) in base al dispositivo.
        Request::macro('isMobile', function () {
            /** @var Request $this */
            return (bool) preg_match(
                '/android|iphone|ipad|ipod|windows phone|mobile|blackberry|opera mini|iemobile/i',
                (string) $this->userAgent()
            );
        });
    }
}
