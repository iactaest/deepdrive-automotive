<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'tipo_utente', 'ente_titolare_id', 'email_verified_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Verifica se l'utente è di un certo tipo
     */
    public function isImpresa(): bool
    {
        return $this->tipo_utente === 'impresa';
    }

    public function isEnte(): bool
    {
        return $this->tipo_utente === 'ente';
    }

    public function isAssociazione(): bool
    {
        return $this->tipo_utente === 'associazione';
    }

    public function isProfessionista(): bool
    {
        return $this->tipo_utente === 'professionista';
    }

    /**
     * Ottiene la route della dashboard in base al tipo utente
     */
    public function getDashboardRoute(): string
    {
        return match ($this->tipo_utente) {
            'impresa' => 'impresa.dashboard',
            'ente' => 'ente.dashboard',
            'associazione' => 'associazione.dashboard',
            'professionista' => 'professionista.dashboard',
            default => 'dashboard',
        };
    }

    /**
     * Ottiene il label del tipo utente
     */
    public function getTipoUtenteLabel(): string
    {
        return match ($this->tipo_utente) {
            'impresa' => '🏢 Impresa Privata',
            'ente' => '🏛️ Ente Pubblico',
            'associazione' => '🤝 Associazione / No-Profit',
            'professionista' => '👤 Libero Professionista',
            default => 'Utente',
        };
    }

    /**
     * Un titolare è chi non è stato invitato da nessun altro (ha completato il wizard ProfiloEnte).
     */
    public function isTitolare(): bool
    {
        return is_null($this->ente_titolare_id);
    }

    public function titolare(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ente_titolare_id');
    }

    public function dipendenti(): HasMany
    {
        return $this->hasMany(User::class, 'ente_titolare_id');
    }

    /**
     * ID di titolare + tutti i dipendenti (incluso l'utente stesso). Unica fonte di verità
     * per lo scoping condiviso del Calendario — usare sempre al posto di Auth::id() nudo.
     */
    public function gruppoEnteIds(): array
    {
        $titolareId = $this->ente_titolare_id ?? $this->id;

        return User::where('id', $titolareId)->orWhere('ente_titolare_id', $titolareId)->pluck('id')->all();
    }

    /**
     * L'user_id a cui è intestato il ProfiloEnte "vero" dell'ente (il titolare, chi ha fatto
     * il wizard). Per un dipendente è ente_titolare_id, per un titolare è se stesso. Usare
     * per ogni lettura di contesto ente (profilo, ricerca, lista bandi, match, assistente):
     * i dipendenti vedono lo stesso ente ma non hanno un ProfiloEnte proprio da compilare.
     * Le risorse personali (bandi salvati, cassetto documenti) restano invece scoped su
     * Auth::id() puro, non su questo metodo.
     */
    public function enteEffettivoUserId(): int
    {
        return $this->ente_titolare_id ?? $this->id;
    }
}