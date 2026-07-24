<?php

namespace App\Http\Controllers;

use App\Models\ProfiloEnte;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProfiloEnteController extends Controller
{
    public function create()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();
        return Inertia::render('Ente/ProfiloWizard', ['profilo' => $profilo]);
    }

    public function store(Request $request)
    {
        abort_unless(auth()->user()->isTitolare(), 403, 'Solo il titolare dell\'ente può modificare il profilo.');

        try {
            Log::info('=== STORE CHIAMATO ===');
            Log::info('Dati ricevuti:', $request->all());
            
            if (!auth()->check()) {
                return response()->json(['success' => false, 'message' => 'Utente non autenticato'], 401);
            }
            
            $rules = [
                'nome_ente' => 'required|string|max:255',
                'tipo_ente' => 'required|string',
                'regione' => 'required|string',
                'provincia' => 'required|string',
                'comune' => 'required|string',
            ];
            
            $validator = Validator::make($request->all(), $rules);
            
            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            
            $data = [
                'user_id' => auth()->id(),
                'nome_ente' => $request->nome_ente,
                'tipo_ente' => $request->tipo_ente,
                'codice_fiscale' => $request->codice_fiscale,
                'partita_iva' => $request->partita_iva,
                'telefono' => $request->telefono,
                'email_pec' => $request->email_pec,
                'sito_web' => $request->sito_web,
                'fax' => $request->fax,
                'regione' => $request->regione,
                'provincia' => $request->provincia,
                'comune' => $request->comune,
                'indirizzo' => $request->indirizzo,
                'cap' => $request->cap,
                'popolazione_comune' => $request->popolazione_comune,
                'settore_prevalente' => is_array($request->settore_prevalente) 
    ? json_encode($request->settore_prevalente) 
    : null,
                'esperienza_fondi_europei' => $request->esperienza_fondi_europei ? 1 : 0,
                'ruolo_bandi' => $request->ruolo_bandi ?? 'nessuno',
                'cofinanziamento_disponibile' => $request->cofinanziamento_disponibile ? 1 : 0,
                'percentuale_cofinanziamento' => $request->percentuale_cofinanziamento,
                'referente_bandi' => $request->referente_bandi ? 1 : 0,
                'gia_beneficiario_pnrr' => $request->gia_beneficiario_pnrr ? 1 : 0,
                'categorie_interesse' => is_array($request->categorie_interesse) ? json_encode($request->categorie_interesse) : null,
                'livelli_interesse' => is_array($request->livelli_interesse) ? json_encode($request->livelli_interesse) : null,
                'importi_interesse' => is_array($request->importi_interesse) ? json_encode($request->importi_interesse) : null,
                'profilo_completo' => true,
                
                // STEP 6 - NUOVI CRITERI
                'num_progetti_europei' => $request->num_progetti_europei ?? null,
                'staff_dedicato_bandi' => $request->staff_dedicato_bandi ? 1 : 0,
                'consulente_esterno_bandi' => $request->consulente_esterno_bandi ? 1 : 0,
                'anticipo_spese_disponibile' => $request->anticipo_spese_disponibile ? 1 : 0,
                'conto_dedicato_fondi' => $request->conto_dedicato_fondi ? 1 : 0,
                'tipologia_investimento' => is_array($request->tipologia_investimento) ? json_encode($request->tipologia_investimento) : null,
                'dimensione_impresa' => is_array($request->dimensione_impresa) ? json_encode($request->dimensione_impresa) : null,
                'intensita_aiuto' => $request->intensita_aiuto ?? null,
                'cup_attivo' => $request->cup_attivo ? 1 : 0,
                'target_group' => is_array($request->target_group) ? json_encode($request->target_group) : null,
                'attivita_erogabili' => is_array($request->attivita_erogabili) ? json_encode($request->attivita_erogabili) : null,
                'accreditamento_formativo' => $request->accreditamento_formativo ? 1 : 0,
                'regione_accreditamento' => $request->regione_accreditamento ?? null,
                'sistemi_informativi' => is_array($request->sistemi_informativi) ? json_encode($request->sistemi_informativi) : null,
                'obiettivi_policy' => is_array($request->obiettivi_policy) ? json_encode($request->obiettivi_policy) : null,
                'modello_budget' => $request->modello_budget ?? null,
                'assicurazione_catastrofale' => $request->assicurazione_catastrofale ? 1 : 0,
            ];
            
            Log::info('Dati da salvare:', $data);
            
            $profilo = ProfiloEnte::updateOrCreate(
                ['user_id' => auth()->id()],
                $data
            );
            
            Log::info('Profilo salvato con ID: ' . ($profilo->id ?? 'null'));
            
            return response()->json([
                'success' => true,
                'message' => 'Profilo completato con successo!',
                'redirect' => route('ente.profilo.show')
            ]);
            
        } catch (\Exception $e) {
            Log::error('ERRORE: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Errore: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request)
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();

        if (!$profilo) {
            return redirect()->route('ente.profilo.create');
        }

        // Decodifica JSON
        $profilo->categorie_interesse = json_decode($profilo->categorie_interesse, true) ?? [];
        $profilo->livelli_interesse = json_decode($profilo->livelli_interesse, true) ?? [];
        $profilo->importi_interesse = json_decode($profilo->importi_interesse, true) ?? [];
        $profilo->tipologia_investimento = json_decode($profilo->tipologia_investimento, true) ?? [];
        $profilo->dimensione_impresa = json_decode($profilo->dimensione_impresa, true) ?? [];
        $profilo->target_group = json_decode($profilo->target_group, true) ?? [];
        $profilo->attivita_erogabili = json_decode($profilo->attivita_erogabili, true) ?? [];
        $profilo->sistemi_informativi = json_decode($profilo->sistemi_informativi, true) ?? [];
        $profilo->obiettivi_policy = json_decode($profilo->obiettivi_policy, true) ?? [];

        // Vista incorporata nel menu mobile: stessi dati della pagina, in JSON.
        if ($request->boolean('embed')) {
            return response()->json(['profilo' => $profilo]);
        }

        return Inertia::render('Ente/ProfiloShow', ['profilo' => $profilo]);
    }

    public function edit()
    {
        abort_unless(auth()->user()->isTitolare(), 403, 'Solo il titolare dell\'ente può modificare il profilo.');

        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        if (!$profilo) return redirect()->route('ente.profilo.create');
        
        $profilo->categorie_interesse = json_decode($profilo->categorie_interesse, true) ?? [];
        $profilo->livelli_interesse = json_decode($profilo->livelli_interesse, true) ?? [];
        $profilo->importi_interesse = json_decode($profilo->importi_interesse, true) ?? [];
        $profilo->tipologia_investimento = json_decode($profilo->tipologia_investimento, true) ?? [];
        $profilo->dimensione_impresa = json_decode($profilo->dimensione_impresa, true) ?? [];
        $profilo->target_group = json_decode($profilo->target_group, true) ?? [];
        $profilo->attivita_erogabili = json_decode($profilo->attivita_erogabili, true) ?? [];
        $profilo->sistemi_informativi = json_decode($profilo->sistemi_informativi, true) ?? [];
        $profilo->obiettivi_policy = json_decode($profilo->obiettivi_policy, true) ?? [];
        
        return Inertia::render('Ente/ProfiloEdit', ['profilo' => $profilo]);
    }

    public function update(Request $request)
    {
        abort_unless(auth()->user()->isTitolare(), 403, 'Solo il titolare dell\'ente può modificare il profilo.');

        $data = [
            'nome_ente' => $request->nome_ente,
            'tipo_ente' => $request->tipo_ente,
            'codice_fiscale' => $request->codice_fiscale,
            'partita_iva' => $request->partita_iva,
            'telefono' => $request->telefono,
            'email_pec' => $request->email_pec,
            'sito_web' => $request->sito_web,
            'fax' => $request->fax,
            'regione' => $request->regione,
            'provincia' => $request->provincia,
            'comune' => $request->comune,
            'indirizzo' => $request->indirizzo,
            'cap' => $request->cap,
            'popolazione_comune' => $request->popolazione_comune,
            'settore_prevalente' => $request->settore_prevalente,
            'esperienza_fondi_europei' => $request->esperienza_fondi_europei ? 1 : 0,
            'ruolo_bandi' => $request->ruolo_bandi ?? 'nessuno',
            'cofinanziamento_disponibile' => $request->cofinanziamento_disponibile ? 1 : 0,
            'percentuale_cofinanziamento' => $request->percentuale_cofinanziamento,
            'referente_bandi' => $request->referente_bandi ? 1 : 0,
            'gia_beneficiario_pnrr' => $request->gia_beneficiario_pnrr ? 1 : 0,
            'categorie_interesse' => is_array($request->categorie_interesse) ? json_encode($request->categorie_interesse) : null,
            'livelli_interesse' => is_array($request->livelli_interesse) ? json_encode($request->livelli_interesse) : null,
            'importi_interesse' => is_array($request->importi_interesse) ? json_encode($request->importi_interesse) : null,
            
            // STEP 6 - NUOVI CRITERI
            'num_progetti_europei' => $request->num_progetti_europei ?? null,
            'staff_dedicato_bandi' => $request->staff_dedicato_bandi ? 1 : 0,
            'consulente_esterno_bandi' => $request->consulente_esterno_bandi ? 1 : 0,
            'anticipo_spese_disponibile' => $request->anticipo_spese_disponibile ? 1 : 0,
            'conto_dedicato_fondi' => $request->conto_dedicato_fondi ? 1 : 0,
            'tipologia_investimento' => is_array($request->tipologia_investimento) ? json_encode($request->tipologia_investimento) : null,
            'dimensione_impresa' => is_array($request->dimensione_impresa) ? json_encode($request->dimensione_impresa) : null,
            'intensita_aiuto' => $request->intensita_aiuto ?? null,
            'cup_attivo' => $request->cup_attivo ? 1 : 0,
            'target_group' => is_array($request->target_group) ? json_encode($request->target_group) : null,
            'attivita_erogabili' => is_array($request->attivita_erogabili) ? json_encode($request->attivita_erogabili) : null,
            'accreditamento_formativo' => $request->accreditamento_formativo ? 1 : 0,
            'regione_accreditamento' => $request->regione_accreditamento ?? null,
            'sistemi_informativi' => is_array($request->sistemi_informativi) ? json_encode($request->sistemi_informativi) : null,
            'obiettivi_policy' => is_array($request->obiettivi_policy) ? json_encode($request->obiettivi_policy) : null,
            'modello_budget' => $request->modello_budget ?? null,
            'assicurazione_catastrofale' => $request->assicurazione_catastrofale ? 1 : 0,
        ];
        
        ProfiloEnte::updateOrCreate(['user_id' => auth()->id()], $data);
        
        return redirect()->route('ente.profilo.show')->with('success', 'Profilo aggiornato!');
    }

    public function destroy()
    {
        abort_unless(auth()->user()->isTitolare(), 403, 'Solo il titolare dell\'ente può eliminare il profilo.');

        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        if ($profilo) $profilo->delete();
        return redirect()->route('ente.profilo.create')->with('success', 'Profilo cancellato.');
    }
}