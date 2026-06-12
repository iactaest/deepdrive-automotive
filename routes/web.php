<?php

use App\Http\Controllers\AssistenteController;
use App\Http\Controllers\BandiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfiloImpresaController;
use App\Http\Controllers\ProfiloEnteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Dashboard per tipo utente (fuori dal gruppo auth per evitare duplicazione)
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/impresa', function () {
        return Inertia::render('Impresa/Dashboard');
    })->name('impresa.dashboard');
    
    Route::get('/dashboard/ente', function () {
        return Inertia::render('Ente/Dashboard');
    })->name('ente.dashboard');
    
    Route::get('/dashboard/associazione', function () {
        return Inertia::render('Associazione/Dashboard');
    })->name('associazione.dashboard');
    
    Route::get('/dashboard/professionista', function () {
        return Inertia::render('Professionista/Dashboard');
    })->name('professionista.dashboard');
});

Route::middleware('auth')->group(function () {
    // Profilo
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Assistente
    Route::get('/assistente', [AssistenteController::class, 'index'])->name('assistente');
    Route::post('/assistente/invia', [AssistenteController::class, 'inviaDomanda'])->name('assistente.invia');
    
    // Bandi Finder - Landing e Ricerca Generale
    // Route::get('/bandi', [BandiController::class, 'landing'])->name('bandi.landing');
    // Route::post('/bandi/cerca', [BandiController::class, 'cerca'])->name('bandi.cerca');
    // Route::get('/bandi/{id}', [BandiController::class, 'show'])->name('bandi.show');
    // Route::post('/bandi/{id}/preferisci', [BandiController::class, 'preferisci'])->name('bandi.preferisci');
    // Route::delete('/bandi/{id}/preferiti', [BandiController::class, 'rimuoviPreferito'])->name('bandi.rimuoviPreferito');
    
    // Profilo Impresa Privata
    Route::get('/profilo-impresa', [ProfiloImpresaController::class, 'index'])->name('profilo.impresa');
    Route::post('/profilo-impresa', [ProfiloImpresaController::class, 'store'])->name('profilo.impresa.store');
    
    // Ente Pubblico
    Route::get('/ente/dashboard', [EnteController::class, 'index'])->name('ente.dashboard');
    Route::get('/ente/profilo', [EnteController::class, 'profilo'])->name('ente.profilo');
    Route::post('/ente/profilo', [EnteController::class, 'storeProfilo'])->name('ente.profilo.store');
    
    // Profilo Ente Wizard
    Route::get('/ente/profilo/completa', [ProfiloEnteController::class, 'create'])->name('ente.profilo.create');
    Route::post('/ente/profilo/completa', [ProfiloEnteController::class, 'store'])->name('ente.profilo.store');

    // Profilo Ente - Visualizzazione e Modifica
    Route::get('/ente/profilo', [ProfiloEnteController::class, 'show'])->name('ente.profilo.show');
    Route::get('/ente/profilo/modifica', [ProfiloEnteController::class, 'edit'])->name('ente.profilo.edit');
    Route::post('/ente/profilo', [ProfiloEnteController::class, 'update'])->name('ente.profilo.update');
    Route::delete('/ente/profilo', [ProfiloEnteController::class, 'destroy'])->name('ente.profilo.destroy');

    // Bandi Finder - Ricerca Ente
    Route::get('/ente/ricerca', [BandiController::class, 'ricercaEnte'])->name('ente.ricerca');
    Route::post('/bandi/cerca', [BandiController::class, 'cerca'])->name('bandi.cerca');
});

Route::get('/test-ricerca', [BandiController::class, 'ricercaEnte'])->name('test.ricerca');

require __DIR__.'/auth.php';