<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ente;  // <-- USA IL MODEL ENTEE
use App\Models\CriteriMatch;

class CriteriMatchSeeder extends Seeder
{
    public function run()
    {
        // Prendi tutti gli enti esistenti
        $enti = Ente::all();  // <-- USA ENTEE
        
        if ($enti->isEmpty()) {
            $this->command->info('⚠️ Nessun ente trovato. Crea prima alcuni enti.');
            return;
        }
        
        foreach ($enti as $ente) {
            // Controlla se l'ente ha già dei criteri
            $esistenti = CriteriMatch::where('ente_id', $ente->id)->first();
            
            if (!$esistenti) {
                // Determina il tipo di ente basato sul nome
                $tipo = $this->determinaTipoEnte($ente->nome);
                
                // Crea criteri di default
                CriteriMatch::create([
                    'ente_id' => $ente->id,
                    'tipo_ente' => $tipo,
                    'regione' => $ente->regione ?? 'Lombardia',
                    'provincia' => $ente->provincia ?? 'Milano',
                    'comune' => $ente->comune ?? null,
                    'settori_interesse' => ['Ambiente', 'Cultura', 'Digitale', 'Sociale', 'Infrastrutture'],
                    'budget_disponibile' => 100000.00,
                    'esperienza_europea' => false,
                    'popolazione' => $this->getPopolazioneDefault($tipo),
                ]);
                
                $this->command->info("✅ Criteri creati per: {$ente->nome} (Tipo: {$tipo})");
            } else {
                $this->command->info("⏭️ Criteri già esistenti per: {$ente->nome}");
            }
        }
        
        $this->command->info('✅ Popolamento criteri completato!');
    }
    
    private function determinaTipoEnte($nome)
    {
        $nome = strtolower($nome);
        
        if (str_contains($nome, 'comune')) return 'Comune';
        if (str_contains($nome, 'provincia')) return 'Provincia';
        if (str_contains($nome, 'regione')) return 'Regione';
        if (str_contains($nome, 'unione')) return 'Unione di Comuni';
        if (str_contains($nome, 'montana')) return 'Comunità Montana';
        if (str_contains($nome, 'consorzio')) return 'Consorzio';
        if (str_contains($nome, 'città metropolitana')) return 'Città Metropolitana';
        
        return 'Comune';
    }
    
    private function getPopolazioneDefault($tipo)
    {
        return match($tipo) {
            'Comune' => 15000,
            'Provincia' => 500000,
            'Regione' => 5000000,
            'Unione di Comuni' => 30000,
            'Comunità Montana' => 10000,
            'Consorzio' => 20000,
            'Città Metropolitana' => 1000000,
            default => 15000,
        };
    }
}