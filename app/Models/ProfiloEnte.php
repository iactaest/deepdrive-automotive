<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfiloEnte extends Model
{
    use HasFactory;

    protected $table = 'profili_ente';

    protected $fillable = [
        'user_id', 'nome_ente', 'tipo_ente', 'regione', 'provincia', 'comune',
        'partita_iva', 'codice_fiscale', 'categorie_preferite', 'settori_interesse',
        'livello_preferito', 'importo_preferito'
    ];

    protected $casts = [
        'categorie_preferite' => 'array',
        'settori_interesse' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}