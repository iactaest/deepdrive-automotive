<?php

namespace App\Http\Controllers;

use App\Models\ConversazioneAssistente;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. STATISTICHE BASE
        $stats = [
            'totale_veicoli' => 0,
            'totale_clienti' => 0,
            'totale_conversazioni' => ConversazioneAssistente::count(),
            'conversazioni_odierne' => ConversazioneAssistente::whereDate('created_at', today())->count(),
        ];

        // 2. TREND CONVERSAZIONI (ultimi 7 giorni)
        $trendConversazioni = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = ConversazioneAssistente::whereDate('created_at', $date)->count();
            $trendConversazioni[] = [
                'data' => $date->format('D'),
                'count' => $count,
            ];
        }

        // 3. DISTRIBUZIONE VEICOLI PER MARCA
        $distribuzioneMarche = [
            ['nome' => 'BMW', 'valore' => 35],
            ['nome' => 'Audi', 'valore' => 28],
            ['nome' => 'Mercedes', 'valore' => 22],
            ['nome' => 'Tesla', 'valore' => 15],
            ['nome' => 'Fiat', 'valore' => 12],
            ['nome' => 'Ford', 'valore' => 8],
        ];

        // 4. PERFORMANCE VENDITE
        $performanceVendite = [
            'labels' => ['BMW', 'Audi', 'Mercedes', 'Tesla', 'Fiat', 'Ford'],
            'vendite_2024' => [145, 128, 112, 98, 156, 87],
            'vendite_2023' => [128, 115, 98, 72, 142, 76],
        ];

        // 5. MANUTENZIONI PER MESE
        $mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        $manutenzioni = [];
        foreach ($mesi as $index => $mese) {
            $manutenzioni[] = [
                'mese' => $mese,
                'ordinarie' => rand(40, 80),
                'straordinarie' => rand(10, 35),
            ];
        }

        // 6. ATTIVITÀ RECENTI
        $attivitaRecenti = ConversazioneAssistente::latest()
            ->take(10)
            ->get()
            ->map(fn($conv) => [
                'id' => $conv->id,
                'tipo' => 'conversazione',
                'descrizione' => "Nuova conversazione: " . substr($conv->domanda, 0, 50) . "...",
                'created_at' => $conv->created_at->toISOString(),
            ])
            ->toArray();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'trendConversazioni' => $trendConversazioni,
            'distribuzioneMarche' => $distribuzioneMarche,
            'performanceVendite' => $performanceVendite,
            'manutenzioni' => $manutenzioni,
            'attivitaRecenti' => $attivitaRecenti,
        ]);
    }
}