<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bando extends Model
{
    use HasFactory;

    protected $table = 'bandi';

    protected $fillable = [
        'ente_id',
        'titolo',
        'descrizione',
        'ente_erogatore',
        'scadenza',
        'budget_totale',
        'livello',
        'categoria',
        'regione',
        'provincia',
        'fonte',
        'link',
        'target',
        'requisiti',
        'stato',
        'cofinanziamento_richiesto',
        'percentuale_cofinanziamento',
        'testo_integrale',
        'tipologia',
        'budget',
    ];

    protected $casts = [
        'scadenza' => 'date',
        'requisiti' => 'array',
        'budget_totale' => 'decimal:2',
        'percentuale_cofinanziamento' => 'decimal:2',
        'cofinanziamento_richiesto' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // =============================================
    // RELAZIONI
    // =============================================

    /**
     * Relazione con l'ente erogatore
     */
    public function ente()
    {
        return $this->belongsTo(Ente::class, 'ente_id');
    }

    /**
     * Relazione con i match (BandiMatch)
     */
    public function bandiMatch()
    {
        return $this->hasMany(BandiMatch::class, 'bando_id');
    }

    /**
     * Relazione con gli enti attraverso i match
     */
    public function entiMatchati()
    {
        return $this->belongsToMany(Ente::class, 'bandi_match', 'bando_id', 'user_id')
                    ->withPivot('punteggio_compatibilita', 'punti_forza', 'punti_debolezza', 'requisiti_mancanti', 'match_obbligatori')
                    ->withTimestamps()
                    ->orderBy('pivot_punteggio_compatibilita', 'desc');
    }

    /**
     * Relazione con i preferiti degli utenti
     */
    public function preferiti()
    {
        return $this->hasMany(BandoPreferito::class);
    }

    /**
     * Relazione con gli utenti che hanno salvato questo bando
     */
    public function utentiPreferiti()
    {
        return $this->belongsToMany(User::class, 'preferiti_bandi', 'bando_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Relazione con le analisi del bando
     */
    public function analisi()
    {
        return $this->hasOne(BandiAnalisi::class, 'bando_id');
    }

    // =============================================
    // SCOPES (Filtri)
    // =============================================

    /**
     * Filtra per bandi aperti
     */
    public function scopeAperti($query)
    {
        return $query->where('stato', 'aperto');
    }

    /**
     * Filtra per bandi chiusi
     */
    public function scopeChiusi($query)
    {
        return $query->where('stato', 'chiuso');
    }

    /**
     * Filtra per bandi in scadenza
     */
    public function scopeInScadenza($query, $giorni = 30)
    {
        return $query->where('scadenza', '<=', now()->addDays($giorni))
                    ->where('stato', 'aperto');
    }

    /**
     * Filtra per fonte (OpenCoesione, Regione, Ministero, etc.)
     */
    public function scopeFonte($query, $fonte)
    {
        return $query->where('fonte', $fonte);
    }

    /**
     * Filtra per categoria
     */
    public function scopeCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    /**
     * Filtra per regione
     */
    public function scopeRegione($query, $regione)
    {
        return $query->where('regione', $regione);
    }

    /**
     * Filtra per target (Comune, Provincia, Regione, etc.)
     */
    public function scopeTarget($query, $target)
    {
        return $query->where('target', $target);
    }

    /**
     * Filtra per budget minimo
     */
    public function scopeBudgetMinimo($query, $minimo)
    {
        return $query->where('budget_totale', '>=', $minimo);
    }

    /**
     * Filtra per budget massimo
     */
    public function scopeBudgetMassimo($query, $massimo)
    {
        return $query->where('budget_totale', '<=', $massimo);
    }

    // =============================================
    // METODI UTILI
    // =============================================

    /**
     * Verifica se il bando è in scadenza
     */
    public function isInScadenza($giorni = 30): bool
    {
        return $this->scadenza && $this->scadenza <= now()->addDays($giorni) && $this->stato === 'aperto';
    }

    /**
     * Verifica se il bando è aperto
     */
    public function isAperto(): bool
    {
        return $this->stato === 'aperto';
    }

    /**
     * Verifica se il bando è chiuso
     */
    public function isChiuso(): bool
    {
        return $this->stato === 'chiuso';
    }

    /**
     * Ottiene il match più alto per questo bando
     */
    public function getMatchMassimo()
    {
        return $this->bandiMatch()->max('punteggio_compatibilita');
    }

    /**
     * Ottiene gli enti con match alto per questo bando
     */
    public function getEntiMatchAlto($soglia = 70)
    {
        return $this->bandiMatch()
                    ->where('punteggio_compatibilita', '>=', $soglia)
                    ->with('ente')
                    ->orderBy('punteggio_compatibilita', 'desc')
                    ->get();
    }

    /**
     * Ottiene il numero di preferiti per questo bando
     */
    public function getNumeroPreferiti()
    {
        return $this->preferiti()->count();
    }

    /**
     * Determina lo stato in base alla scadenza
     */
    public function aggiornaStato()
    {
        if (!$this->scadenza) {
            return;
        }

        if ($this->scadenza < now()) {
            $this->stato = 'chiuso';
        } elseif ($this->scadenza <= now()->addDays(30) && $this->stato === 'aperto') {
            $this->stato = 'in_scadenza';
        }
        
        $this->save();
    }

    /**
     * Ottiene la fonte formattata
     */
    public function getFonteFormattataAttribute()
    {
        $fonti = [
            'OpenCoesione' => 'OpenCoesione',
            'Regione' => 'Regionale',
            'Ministero' => 'Nazionale',
            'UE' => 'Europeo',
            'PNRR' => 'PNRR',
        ];

        return $fonti[$this->fonte] ?? $this->fonte ?? 'Sconosciuta';
    }

    /**
     * Ottiene lo stato formattato
     */
    public function getStatoFormattatoAttribute()
    {
        $stati = [
            'aperto' => '🟢 Aperto',
            'chiuso' => '🔴 Chiuso',
            'in_scadenza' => '🟡 In scadenza',
        ];

        return $stati[$this->stato] ?? $this->stato;
    }

    /**
     * Ottiene i giorni mancanti alla scadenza
     */
    public function getGiorniMancantiAttribute()
    {
        if (!$this->scadenza) {
            return null;
        }

        $diff = now()->diffInDays($this->scadenza, false);
        return $diff < 0 ? 0 : $diff;
    }
}