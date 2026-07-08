<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

class SyncEuFundingTenders extends Command
{
    protected $signature = 'bandi:sync-eu-funding
                            {--programme=43108390 : Programma UE (43108390=Horizon Europe)}
                            {--limit=50 : Numero massimo di bandi da importare}
                            {--text=* : Testo da cercare (usa * per tutto)}';
    
    protected $description = 'Sincronizza bandi dal portale EU Funding & Tenders (API SEDIA)';

    public function handle()
    {
        $this->info('🔄 Sincronizzazione EU Funding & Tenders...');
        
        $programme = $this->option('programme');
        $limit = (int)$this->option('limit');
        
        // Gestisci l'opzione text (può essere array)
        $text = $this->option('text');
        if (is_array($text)) {
            $text = $text[0] ?? '*';
        }
        if (empty($text)) {
            $text = '*';
        }
        
        // API Key pubblica SEDIA
        $apiKey = 'SEDIA';
        $url = "https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey={$apiKey}&text=" . urlencode($text);
        
        // Body della richiesta
        $body = [
            'sort' => ['order' => 'DESC', 'field' => 'startDate'],
            'query' => [
                'bool' => [
                    'must' => [
                        ['terms' => ['type' => ['1', '2', '8']]],
                        ['terms' => ['status' => ['31094501', '31094502']]],
                        ['terms' => ['frameworkProgramme' => [$programme]]]
                    ]
                ]
            ],
            'languages' => ['en'],
            'pageSize' => $limit,
            'pageNumber' => 1,
            'displayFields' => [
                'type', 'identifier', 'title', 'status', 'startDate',
                'deadlineDate', 'frameworkProgramme', 'typesOfAction',
                'descriptionByte', 'url', 'callIdentifier', 'callTitle',
                'reference', 'summary', 'metadata'
            ]
        ];
        
        $this->info("📥 Chiamata API: $url");
        $this->info("📊 Programma: $programme, Limit: $limit, Text: $text");
        
        try {
            $response = Http::timeout(60)->post($url, $body);
            
            if (!$response->successful()) {
                $this->error("❌ Errore API: " . $response->status());
                $this->error("❌ Risposta: " . substr($response->body(), 0, 500));
                return;
            }
            
            $data = $response->json();
            
            // Estrai i risultati
            $results = $data['results'] ?? [];
            
            if (empty($results)) {
                $this->warn("⚠️ Nessun bando trovato per il programma: $programme");
                return;
            }
            
            $this->info("📊 Trovati " . count($results) . " bandi");
            
            $imported = 0;
            foreach ($results as $item) {
                if ($this->importBando($item)) {
                    $imported++;
                }
            }
            
            $this->info("✅ Sincronizzazione completata! Importati $imported bandi.");
            
        } catch (\Exception $e) {
            $this->error("❌ Errore: " . $e->getMessage());
        }
    }

    private function importBando($data)
    {
        // Estrai i campi dalla struttura annidata
        $metadata = $data['metadata'] ?? [];
        
        // ID e titolo
        $id = $data['reference'] ?? $data['identifier'] ?? null;
        
        // Cerca il titolo in vari livelli
        $titolo = $data['title'] ?? null;
        if (!$titolo || $titolo === 'N/A') {
            $titolo = $metadata['title'][0] ?? null;
        }
        if (!$titolo || $titolo === 'N/A') {
            $titolo = $data['summary'] ?? null;
        }
        if (!$titolo || $titolo === 'N/A') {
            $titolo = 'N/A';
        }
        
        // Scadenza
        $scadenza = $data['deadlineDate'] ?? null;
        if (!$scadenza) {
            $scadenza = $metadata['deadlineDate'][0] ?? null;
        }
        
        // Programma
        $programma = $data['frameworkProgramme'] ?? null;
        if (!$programma) {
            $programma = $metadata['frameworkProgramme'][0] ?? 'EU';
        }
        $programmaNome = $data['callTitle'] ?? null;
        if (!$programmaNome) {
            $programmaNome = $metadata['callTitle'][0] ?? 'EU Funding';
        }
        
        // Descrizione
        $descrizione = $data['descriptionByte'] ?? null;
        if (!$descrizione) {
            $descrizione = $metadata['descriptionByte'][0] ?? null;
        }
        if ($descrizione) {
            $descrizione = strip_tags($descrizione);
            $descrizione = html_entity_decode($descrizione);
        }
        
        // URL
        $url = $data['url'] ?? null;
        if (!$url) {
            $url = $metadata['url'][0] ?? null;
        }
        
        // Tipo di azione
        $typeOfAction = $data['typesOfAction'] ?? null;
        if (!$typeOfAction) {
            $typeOfAction = $metadata['typesOfAction'][0] ?? null;
        }
        if (is_array($typeOfAction)) {
            $typeOfAction = implode(', ', $typeOfAction);
        }
        
        // Determina la categoria
        $categoria = $this->determinaCategoria($titolo, $descrizione);
        
        // Stato
        $status = $data['status'] ?? null;
        if ($status) {
            $stato = $this->determinaStato($status);
        } else {
            $stato = 'aperto';
        }
        
        // Salva il bando
        try {
            $bando = BandoImportato::updateOrCreate(
                ['codice_esterno' => $id, 'fonte' => 'eu_funding_' . strtolower(str_replace(' ', '_', $programmaNome))],
                [
                    'titolo' => mb_substr($this->sanitizeString($titolo), 0, 255),
                    'descrizione' => $this->truncaConEllissi($descrizione ? $this->sanitizeString($descrizione) : null),
                    'url' => $url,
                    'categoria' => $categoria,
                    'livello' => 'europeo',
                    'regione' => 'Europa',
                    'target' => $typeOfAction ? mb_substr($typeOfAction, 0, 255) : 'Tutti',
                    'budget_totale' => null,
                    'scadenza' => $scadenza ? date('Y-m-d', strtotime($scadenza)) : null,
                    'stato' => $stato,
                    'extra_data' => json_encode($data, JSON_UNESCAPED_UNICODE),
                ]
            );

            $this->info("✅ Importato: " . mb_substr($titolo, 0, 50) . "...");
            return true;
            
        } catch (\Exception $e) {
            $this->warn("⚠️ Errore importazione: " . $e->getMessage());
            return false;
        }
    }
    
    private function determinaCategoria($titolo, $descrizione)
    {
        $testo = strtolower($titolo . ' ' . ($descrizione ?? ''));
        
        $categorie = [
            'digitalizzazione' => ['digital', 'digitale', 'ict', 'technology', 'ai', 'intelligenza artificiale', 'data', 'software'],
            'ambiente' => ['climate', 'green', 'ambiente', 'sostenibile', 'environment', 'ecologia'],
            'energia' => ['energy', 'energia', 'renewable', 'rinnovabile'],
            'mobilità' => ['mobility', 'transport', 'mobilita', 'trasporti'],
            'sociale' => ['social', 'inclusion', 'sociale', 'inclusione', 'welfare'],
            'ricerca' => ['research', 'ricerca', 'innovation', 'innovazione', 'scienza'],
            'cultura' => ['culture', 'cultural', 'cultura', 'patrimonio'],
            'sanità' => ['health', 'sanita', 'medicina', 'biotech', 'clinical'],
            'industria' => ['industry', 'industrial', 'industria', 'manufacturing', 'produzione'],
            'materiali' => ['materials', 'materiali', 'raw materials', 'materie prime'],
            'standardizzazione' => ['standardisation', 'standardization', 'standard', 'norme'],
            'formazione' => ['education', 'training', 'formazione', 'istruzione', 'learning'],
            'agricoltura' => ['agriculture', 'agricoltura', 'farming', 'food', 'alimentare'],
            'spazio' => ['space', 'spazio', 'satellite', 'satellitare'],
            'difesa' => ['defence', 'security', 'sicurezza', 'difesa'],
        ];
        
        foreach ($categorie as $categoria => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($testo, $keyword)) {
                    return $categoria;
                }
            }
        }
        
        return null;
    }
    
    private function determinaStato($status)
    {
        // Mappa gli stati dell'API
        $stati = [
            '31094501' => 'aperto',
            '31094502' => 'in_scadenza',
            '31094503' => 'chiuso',
        ];
        
        if (is_string($status) && isset($stati[$status])) {
            return $stati[$status];
        }
        
        if (is_array($status)) {
            $statusId = $status['id'] ?? null;
            if ($statusId && isset($stati[$statusId])) {
                return $stati[$statusId];
            }
        }
        
        return 'aperto';
    }

    private function sanitizeString(string $value): string
    {
        // Converte in UTF-8 valido e rimuove sequenze non supportate da MySQL utf8mb4
        $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        // Rimuove caratteri di controllo eccetto tab/newline/carriage return
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
        return $value ?? '';
    }

    /**
     * Tronca a $max caratteri sull'ultimo confine di parola invece di tagliare a metà
     * e aggiunge "…".
     */
    private function truncaConEllissi(?string $testo, int $max = 2000): ?string
    {
        if (empty($testo)) return null;
        if (mb_strlen($testo) <= $max) return $testo;

        $tagliato = mb_substr($testo, 0, $max);
        $ultimoSpazio = mb_strrpos($tagliato, ' ');
        if ($ultimoSpazio !== false) {
            $tagliato = mb_substr($tagliato, 0, $ultimoSpazio);
        }
        return rtrim($tagliato, ".,;: \t\n") . '…';
    }
}