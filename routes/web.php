<?php

use App\Http\Controllers\AssistenteController;
use App\Http\Controllers\BandiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfiloImpresaController;
use App\Http\Controllers\ProfiloEnteController;
use App\Http\Controllers\BandiListaController;
use App\Http\Controllers\BandiSalvatiController;
use App\Http\Controllers\BandoDocumentiController;
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

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/impresa', function () {
        return Inertia::render('Impresa/Dashboard');
    })->name('impresa.dashboard');
    
    Route::get('/dashboard/associazione', function () {
        return Inertia::render('Associazione/Dashboard');
    })->name('associazione.dashboard');
    
    Route::get('/dashboard/professionista', function () {
        return Inertia::render('Professionista/Dashboard');
    })->name('professionista.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/assistente', [AssistenteController::class, 'index'])->name('assistente');
    Route::post('/assistente/invia', [AssistenteController::class, 'inviaDomanda'])->name('assistente.invia');
    
    Route::get('/profilo-impresa', [ProfiloImpresaController::class, 'index'])->name('profilo.impresa');
    Route::post('/profilo-impresa', [ProfiloImpresaController::class, 'store'])->name('profilo.impresa.store');
    
    // ============================================================
    // ✅ PROFILO ENTE - ROUTE CORRETTE
    // ============================================================
    
    Route::get('/ente/profilo', [ProfiloEnteController::class, 'show'])->name('ente.profilo.show');
    Route::get('/ente/profilo/show', [ProfiloEnteController::class, 'show'])->name('ente.profilo.show');
    Route::get('/ente/profilo/completa', [ProfiloEnteController::class, 'create'])->name('ente.profilo.create');
    Route::post('/ente/profilo/completa', [ProfiloEnteController::class, 'store'])->name('ente.profilo.completa');
    Route::get('/ente/profilo/modifica', [ProfiloEnteController::class, 'edit'])->name('ente.profilo.edit');
    Route::put('/ente/profilo', [ProfiloEnteController::class, 'update'])->name('ente.profilo.update');
    Route::delete('/ente/profilo', [ProfiloEnteController::class, 'destroy'])->name('ente.profilo.destroy');
    
    Route::get('/ente/dashboard', [EnteController::class, 'index'])->name('ente.dashboard');
    Route::get('/ente/ricerca', [BandiController::class, 'ricercaEnte'])->name('ente.ricerca');
    Route::post('/bandi/cerca', [BandiController::class, 'cerca'])->name('bandi.cerca');

    // ============================================================
    // ✅ LISTA BANDI
    // ============================================================
   Route::get('/ente/lista-bandi', [BandiListaController::class, 'index'])->name('lista.bandi');
Route::get('/ente/lista-bandi/{id}', [BandiListaController::class, 'show'])->name('lista.bandi.dettaglio');

    // ============================================================
    // ✅ BANDI SALVATI
    // ============================================================
    Route::get('/bandi-salvati', [BandiSalvatiController::class, 'index'])->name('bandi.salvati');
    Route::post('/bandi-salvati', [BandiSalvatiController::class, 'store'])->name('bandi.salvati.store');
    Route::delete('/bandi-salvati/{bandoId}', [BandiSalvatiController::class, 'destroy'])->name('bandi.salvati.destroy');

    // ============================================================
    // ✅ ASSISTENTE AI DOCUMENTI BANDO
    // ============================================================
    Route::post('/bandi/{id}/analizza-documenti', [BandoDocumentiController::class, 'analizza'])->name('bando.documenti.analizza');
    Route::get('/bandi/{id}/documenti', [BandoDocumentiController::class, 'index'])->name('bando.documenti.index');
    Route::post('/bandi/{id}/documenti', [BandoDocumentiController::class, 'store'])->name('bando.documenti.store');
    Route::delete('/bandi/{id}/documenti/{docId}', [BandoDocumentiController::class, 'destroy'])->name('bando.documenti.destroy');
    Route::get('/bandi/{id}/documenti/{docId}/download', [BandoDocumentiController::class, 'download'])->name('bando.documenti.download');
    Route::get('/ente/lista-bandi/{id}/cassetto', [BandoDocumentiController::class, 'pagina'])->name('bando.documenti.pagina');
    Route::get('/cassetto-documenti', [BandoDocumentiController::class, 'cassettoGlobale'])->name('cassetto.documenti');
});

Route::get('/test-ricerca', [BandiController::class, 'ricercaEnte'])->name('test.ricerca');

require __DIR__.'/auth.php';