<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'tipo_utente'])]
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
}