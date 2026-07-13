<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Sync bandi ────────────────────────────────────────────────────────────

// Regione Siciliana CKAN (bandi/finanziamenti)
Schedule::command('bandi:sync-regione-sicilia --limit=30')
    ->daily()->at('02:00')->withoutOverlapping();

// euroinfosicilia.it — bandi aperti PR FESR / FSC / POC / PSC Sicilia
Schedule::command('bandi:sync-euroinfosicilia')
    ->daily()->at('02:30')->withoutOverlapping();

// EU Funding & Tenders (Horizon Europe e altri programmi EU)
Schedule::command('bandi:sync-eu-funding --limit=50')
    ->daily()->at('03:00')->withoutOverlapping();

// incentivi.gov.it — solo agevolazioni per enti pubblici
Schedule::command('bandi:sync-incentivi --solo-enti --solo-attivi')
    ->weekly()->mondays()->at('03:30')->withoutOverlapping();

// TED — gare d'appalto PA italiane
Schedule::command('bandi:sync-ted --paese=ITA --pagine=3 --giorni=30')
    ->daily()->at('04:00')->withoutOverlapping();

// politichecoesione.governo.it — scraping + AI (Gemini), niente CKAN/API su questa fonte.
// --limit=15 per restare sotto la quota free tier di Gemini (20 richieste/giorno); i bandi
// già importati vengono saltati prima di chiamare l'AI, quindi il limite copre comodamente
// anche i nuovi bandi pubblicati nel frattempo.
Schedule::command('bandi:sync-coesione-ai --limit=15')
    ->daily()->at('04:30')->withoutOverlapping();

// Calcolo match (dopo tutte le sincronizzazioni)
Schedule::command('bandi:calculate-matches')
    ->daily()->at('05:00')->withoutOverlapping();

// ─── Calendario Scadenze ───────────────────────────────────────────────────

// Reminder scadenze (dopo sync+match delle 02:00-05:00, così vede dati aggiornati)
Schedule::command('calendario:invia-reminder')
    ->daily()->at('08:00')->withoutOverlapping();
