<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Sincronizzazione bandi dalla Regione Siciliana (ogni 24 ore)
        $schedule->command('bandi:sync-regione-sicilia --limit=20')
                 ->daily()
                 ->at('02:00')
                 ->withoutOverlapping();

        // Sincronizzazione bandi EU Funding & Tenders (ogni 24 ore)
        $schedule->command('bandi:sync-eu-funding --limit=50')
                 ->daily()
                 ->at('04:00')
                 ->withoutOverlapping();

        // Calcolo match (dopo le sincronizzazioni)
        $schedule->command('bandi:calculate-matches')
                 ->daily()
                 ->at('05:00')
                 ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}