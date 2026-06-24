<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ente;

class EntiSeeder extends Seeder
{
    public function run()
    {
        $enti = [
            [
                'nome' => 'Comune di Milano',
                'tipo' => 'Comune',
                'regione' => 'Lombardia',
                'provincia' => 'Milano',
                'comune' => 'Milano',
                'codice_identificativo' => 'COM-MI-001',
                'partita_iva' => '12345678901',
                'cap' => '20121',
                'popolazione' => 1400000,
                'attivo' => true,
            ],
            [
                'nome' => 'Comune di Roma',
                'tipo' => 'Comune',
                'regione' => 'Lazio',
                'provincia' => 'Roma',
                'comune' => 'Roma',
                'codice_identificativo' => 'COM-RM-001',
                'partita_iva' => '12345678902',
                'cap' => '00118',
                'popolazione' => 2800000,
                'attivo' => true,
            ],
            [
                'nome' => 'Comune di Napoli',
                'tipo' => 'Comune',
                'regione' => 'Campania',
                'provincia' => 'Napoli',
                'comune' => 'Napoli',
                'codice_identificativo' => 'COM-NA-001',
                'partita_iva' => '12345678903',
                'cap' => '80121',
                'popolazione' => 900000,
                'attivo' => true,
            ],
            [
                'nome' => 'Provincia di Bergamo',
                'tipo' => 'Provincia',
                'regione' => 'Lombardia',
                'provincia' => 'Bergamo',
                'comune' => 'Bergamo',
                'codice_identificativo' => 'PRO-BG-001',
                'partita_iva' => '12345678904',
                'cap' => '24121',
                'popolazione' => 500000,
                'attivo' => true,
            ],
            [
                'nome' => 'Regione Lombardia',
                'tipo' => 'Regione',
                'regione' => 'Lombardia',
                'provincia' => null,
                'comune' => null,
                'codice_identificativo' => 'REG-LOM-001',
                'partita_iva' => '12345678905',
                'cap' => '20124',
                'popolazione' => 10000000,
                'attivo' => true,
            ],
            [
                'nome' => 'Regione Lazio',
                'tipo' => 'Regione',
                'regione' => 'Lazio',
                'provincia' => null,
                'comune' => null,
                'codice_identificativo' => 'REG-LAZ-001',
                'partita_iva' => '12345678906',
                'cap' => '00147',
                'popolazione' => 5800000,
                'attivo' => true,
            ],
            [
                'nome' => 'Unione dei Comuni della Valle',
                'tipo' => 'Unione di Comuni',
                'regione' => 'Lombardia',
                'provincia' => 'Bergamo',
                'comune' => null,
                'codice_identificativo' => 'UNI-BG-001',
                'partita_iva' => null,
                'cap' => '24010',
                'popolazione' => 30000,
                'attivo' => true,
            ],
            [
                'nome' => 'Comunità Montana Valle Brembana',
                'tipo' => 'Comunità Montana',
                'regione' => 'Lombardia',
                'provincia' => 'Bergamo',
                'comune' => null,
                'codice_identificativo' => 'CM-BG-001',
                'partita_iva' => null,
                'cap' => '24010',
                'popolazione' => 15000,
                'attivo' => true,
            ],
            [
                'nome' => 'Comune di Bergamo',
                'tipo' => 'Comune',
                'regione' => 'Lombardia',
                'provincia' => 'Bergamo',
                'comune' => 'Bergamo',
                'codice_identificativo' => 'COM-BG-001',
                'partita_iva' => '12345678907',
                'cap' => '24121',
                'popolazione' => 120000,
                'attivo' => true,
            ],
            [
                'nome' => 'Comune di Brescia',
                'tipo' => 'Comune',
                'regione' => 'Lombardia',
                'provincia' => 'Brescia',
                'comune' => 'Brescia',
                'codice_identificativo' => 'COM-BS-001',
                'partita_iva' => '12345678908',
                'cap' => '25121',
                'popolazione' => 200000,
                'attivo' => true,
            ],
        ];
        
        foreach ($enti as $dati) {
            $esistente = Ente::where('nome', $dati['nome'])->first();
            if (!$esistente) {
                Ente::create($dati);
                $this->command->info("✅ Creato: {$dati['nome']}");
            } else {
                $this->command->info("⏭️ Già esistente: {$dati['nome']}");
            }
        }
        
        $this->command->info('✅ Popolamento enti completato!');
    }
}