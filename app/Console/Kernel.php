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
        // Regione Siciliana CKAN — dataset bandi/finanziamenti
        $schedule->command('bandi:sync-regione-sicilia --limit=30')
                 ->daily()
                 ->at('02:00')
                 ->withoutOverlapping();

        // EU Funding & Tenders (Horizon Europe e altri programmi EU)
        $schedule->command('bandi:sync-eu-funding --limit=50')
                 ->daily()
                 ->at('03:00')
                 ->withoutOverlapping();

        // incentivi.gov.it — agevolazioni MIMIT + Invitalia
        $schedule->command('bandi:sync-incentivi --solo-attivi')
                 ->weekly()
                 ->mondays()
                 ->at('03:30')
                 ->withoutOverlapping();

        // TED — gare d'appalto PA italiane (enti locali e organismi pubblici)
        $schedule->command('bandi:sync-ted --paese=ITA --pagine=3 --giorni=30')
                 ->daily()
                 ->at('04:00')
                 ->withoutOverlapping();

        // Calcolo match (dopo tutte le sincronizzazioni)
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