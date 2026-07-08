<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BandoPreferito extends Model
{
    use HasFactory;

    protected $table = 'bandi_preferiti';

    protected $fillable = [
        'user_id', 'bando_id', 'note'
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