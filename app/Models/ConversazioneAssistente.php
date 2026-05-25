<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversazioneAssistente extends Model
{
    use HasFactory;

    protected $table = 'conversazioni_assistente';

    protected $fillable = [
        'domanda',
        'risposta',
        'user_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}