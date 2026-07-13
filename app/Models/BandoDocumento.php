<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BandoDocumento extends Model
{
    use HasFactory;

    protected $table = 'bando_documenti';

    protected $fillable = [
        'user_id', 'bando_id', 'nome_documento', 'descrizione',
        'link_ufficiale', 'obbligatorio', 'categoria', 'path_file', 'stato',
        'nota', 'nota_autore', 'nota_data',
    ];

    protected $casts = [
        'obbligatorio' => 'boolean',
        'nota_data' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bando()
    {
        return $this->belongsTo(BandoImportato::class, 'bando_id');
    }
}
