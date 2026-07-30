<?php

use App\Http\Controllers\AssistenteController;
use App\Http\Controllers\BandiController;
use App\Http\Controllers\EnteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfiloImpresaController;
use App\Http\Controllers\ProfiloEnteController;
use App\Http\Controllers\BandiListaController;
use App\Http\Controllers\BandiSalvatiController;
use App\Http\Controllers\BandoDocumentiController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\GestioneTeamController;
use App\Http\Controllers\NotificheController;
use App\Http\Controllers\RendicontazioneController;
use App\Http\Controllers\RendicontazioneSpesaController;
use App\Http\Controllers\RendicontazioneMilestoneController;
use App\Http\Controllers\RendicontazioneReportController;
use App\Http\Controllers\StoricoBandiController;
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
    Route::get('/ente/profilo/completa', [ProfiloEnteController::class, 'create'])->name('ente.profilo.create');
    Route::post('/ente/profilo/completa', [ProfiloEnteController::class, 'store'])->name('ente.profilo.completa');
    Route::get('/ente/profilo/modifica', [ProfiloEnteController::class, 'edit'])->name('ente.profilo.edit');
    Route::put('/ente/profilo', [ProfiloEnteController::class, 'update'])->name('ente.profilo.update');
    Route::delete('/ente/profilo', [ProfiloEnteController::class, 'destroy'])->name('ente.profilo.destroy');
    
    Route::get('/ente/menu', [EnteController::class, 'menu'])->name('ente.menu');
    Route::get('/ente/menu/dati-dashboard', [EnteController::class, 'datiDashboard'])->name('ente.menu.dati-dashboard');
    Route::get('/ente/dashboard', [EnteController::class, 'index'])->name('ente.dashboard');
    Route::get('/ente/ricerca', [BandiController::class, 'ricercaEnte'])->name('ente.ricerca');
    Route::post('/bandi/cerca', [BandiController::class, 'cerca'])->name('bandi.cerca');

    // ============================================================
    // ✅ LISTA BANDI
    // ============================================================
   Route::get('/ente/lista-bandi', [BandiListaController::class, 'index'])->name('lista.bandi');
Route::get('/ente/lista-bandi/{id}', [BandiListaController::class, 'show'])->name('lista.bandi.dettaglio');
Route::post('/ente/lista-bandi/{id}/perso', [BandiListaController::class, 'segnaPerso'])->name('lista.bandi.perso');
Route::delete('/ente/lista-bandi/{id}/perso', [BandiListaController::class, 'annullaPerso'])->name('lista.bandi.perso.annulla');

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
    Route::put('/bandi/{id}/documenti/{docId}/nota', [BandoDocumentiController::class, 'salvaNota'])->name('bando.documenti.nota');
    Route::get('/bandi/{id}/documenti/{docId}/download', [BandoDocumentiController::class, 'download'])->name('bando.documenti.download');
    Route::get('/ente/lista-bandi/{id}/cassetto', [BandoDocumentiController::class, 'pagina'])->name('bando.documenti.pagina');
    Route::get('/cassetto-documenti', [BandoDocumentiController::class, 'cassettoGlobale'])->name('cassetto.documenti');

    // ============================================================
    // ✅ CALENDARIO SCADENZE COLLABORATIVO
    // ============================================================
    Route::get('/ente/calendario', [CalendarioController::class, 'index'])->name('calendario.index');
    Route::get('/ente/calendario/eventi', [CalendarioController::class, 'eventi'])->name('calendario.eventi');
    Route::get('/ente/calendario/eventi/{id}', [CalendarioController::class, 'show'])->name('calendario.eventi.show');
    Route::get('/ente/calendario/membri', [CalendarioController::class, 'membri'])->name('calendario.membri');
    Route::get('/ente/calendario/task', [CalendarioController::class, 'task'])->name('calendario.task.lista');
    Route::patch('/ente/calendario/task/{taskId}/ordine', [CalendarioController::class, 'taskRiordina'])->name('calendario.task.ordine');
    Route::post('/ente/calendario/eventi', [CalendarioController::class, 'store'])->name('calendario.eventi.store');
    Route::put('/ente/calendario/eventi/{id}', [CalendarioController::class, 'update'])->name('calendario.eventi.update');
    Route::put('/ente/calendario/eventi/{id}/nota', [CalendarioController::class, 'salvaNota'])->name('calendario.eventi.nota');
    Route::delete('/ente/calendario/eventi/{id}', [CalendarioController::class, 'destroy'])->name('calendario.eventi.destroy');
    Route::post('/ente/calendario/eventi/{eventoId}/task', [CalendarioController::class, 'taskStore'])->name('calendario.task.store');
    Route::put('/ente/calendario/task/{taskId}', [CalendarioController::class, 'taskUpdate'])->name('calendario.task.update');
    Route::patch('/ente/calendario/task/{taskId}/stato', [CalendarioController::class, 'taskCambiaStato'])->name('calendario.task.stato');
    Route::delete('/ente/calendario/task/{taskId}', [CalendarioController::class, 'taskDestroy'])->name('calendario.task.destroy');

    // ============================================================
    // ✅ GESTIONE TEAM (inviti dipendenti stesso ente)
    // ============================================================
    Route::get('/ente/team', [GestioneTeamController::class, 'index'])->name('team.index');
    Route::post('/ente/team/invita', [GestioneTeamController::class, 'invita'])->name('team.invita');
    Route::delete('/ente/team/inviti/{invito}', [GestioneTeamController::class, 'revoca'])->name('team.invito.revoca');
    Route::delete('/ente/team/membri/{userId}', [GestioneTeamController::class, 'rimuoviMembro'])->name('team.membro.rimuovi');

    // ============================================================
    // ✅ NOTIFICHE IN-APP
    // ============================================================
    Route::get('/notifiche', [NotificheController::class, 'index'])->name('notifiche.index');
    Route::get('/notifiche/non-lette-count', [NotificheController::class, 'nonLetteCount'])->name('notifiche.non-lette-count');
    Route::post('/notifiche/{id}/letta', [NotificheController::class, 'segnaLetta'])->name('notifiche.letta');
    Route::post('/notifiche/segna-tutte-lette', [NotificheController::class, 'segnaTutteLette'])->name('notifiche.segna-tutte-lette');

    // ============================================================
    // ✅ RENDICONTAZIONE POST-AGGIUDICAZIONE
    // ============================================================
    Route::get('/ente/rendicontazione', [RendicontazioneController::class, 'index'])->name('rendicontazione.index');
    Route::post('/ente/rendicontazione', [RendicontazioneController::class, 'store'])->name('rendicontazione.store');
    Route::get('/ente/rendicontazione/{id}', [RendicontazioneController::class, 'show'])->name('rendicontazione.show');
    Route::put('/ente/rendicontazione/{id}', [RendicontazioneController::class, 'update'])->name('rendicontazione.update');
    Route::delete('/ente/rendicontazione/{id}', [RendicontazioneController::class, 'destroy'])->name('rendicontazione.destroy');

    Route::post('/ente/rendicontazione/{id}/spese', [RendicontazioneSpesaController::class, 'store'])->name('rendicontazione.spese.store');
    Route::put('/ente/rendicontazione/{id}/spese/{spesaId}', [RendicontazioneSpesaController::class, 'update'])->name('rendicontazione.spese.update');
    Route::delete('/ente/rendicontazione/{id}/spese/{spesaId}', [RendicontazioneSpesaController::class, 'destroy'])->name('rendicontazione.spese.destroy');
    Route::post('/ente/rendicontazione/{id}/spese/{spesaId}/upload', [RendicontazioneSpesaController::class, 'upload'])->name('rendicontazione.spese.upload');
    Route::get('/ente/rendicontazione/{id}/spese/{spesaId}/download', [RendicontazioneSpesaController::class, 'download'])->name('rendicontazione.spese.download');

    Route::post('/ente/rendicontazione/{id}/milestone', [RendicontazioneMilestoneController::class, 'store'])->name('rendicontazione.milestone.store');
    Route::put('/ente/rendicontazione/{id}/milestone/{milestoneId}', [RendicontazioneMilestoneController::class, 'update'])->name('rendicontazione.milestone.update');
    Route::patch('/ente/rendicontazione/{id}/milestone/{milestoneId}/ordine', [RendicontazioneMilestoneController::class, 'riordina'])->name('rendicontazione.milestone.ordine');
    Route::delete('/ente/rendicontazione/{id}/milestone/{milestoneId}', [RendicontazioneMilestoneController::class, 'destroy'])->name('rendicontazione.milestone.destroy');

    Route::post('/ente/rendicontazione/{id}/report', [RendicontazioneReportController::class, 'genera'])->name('rendicontazione.report.genera');
    Route::get('/ente/rendicontazione/{id}/report/{reportId}/download', [RendicontazioneReportController::class, 'download'])->name('rendicontazione.report.download');

    // ============================================================
    // ✅ STORICO BANDI (totali / in corso / vinti / persi)
    // ============================================================
    Route::get('/ente/storico-bandi', [StoricoBandiController::class, 'index'])->name('storico.bandi');
});

Route::get('/test-ricerca', [BandiController::class, 'ricercaEnte'])->name('test.ricerca');

require __DIR__.'/auth.php';