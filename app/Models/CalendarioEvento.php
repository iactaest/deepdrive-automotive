<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarioEvento extends Model
{
    protected $table = 'calendario_eventi';

    protected $fillable = [
        'user_id', 'tipo', 'bando_id', 'origine_preferito', 'origine_match',
        'titolo', 'descrizione', 'data_scadenza', 'note',
    ];

    protected $casts = [
        'origine_preferito' => 'boolean',
        'origine_match'     => 'boolean',
        'data_scadenza'     => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bando()
    {
        return $this->belongsTo(BandoImportato::class, 'bando_id');
    }

    public function tasks()
    {
        return $this->hasMany(CalendarioTask::class, 'calendario_evento_id');
    }

    public function reminders()
    {
        return $this->hasMany(CalendarioReminder::class, 'calendario_evento_id');
    }

    /**
     * Crea (o recupera) l'evento calendario collegato a un bando per un utente,
     * registrando la provenienza dell'auto-sync. Idempotente: sicura da richiamare
     * ripetutamente sia dal salvataggio nei preferiti sia dal calcolo dei match.
     */
    public static function sincronizzaDaBando(int $userId, int $bandoId, string $origine): self
    {
        $evento = self::firstOrCreate([
            'user_id'  => $userId,
            'bando_id' => $bandoId,
            'tipo'     => 'bando',
        ]);

        $evento->update(["origine_{$origine}" => true]);

        return $evento;
    }

    /**
     * Per tipo=bando la scadenza si legge sempre live dal bando collegato (mai cachata,
     * per non introdurre un secondo punto di verità che può disallinearsi).
     */
    public function scadenzaEffettiva(): ?\Carbon\Carbon
    {
        return $this->tipo === 'bando'
            ? $this->bando?->scadenza
            : $this->data_scadenza;
    }
}
