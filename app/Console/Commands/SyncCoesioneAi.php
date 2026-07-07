<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;
use DOMDocument;
use DOMXPath;

/**
 * Test iniziale scraping + AI: politichecoesione.governo.it non ha CKAN/API/RSS strutturato
 * come le altre fonti, solo pagine HTML server-rendered. Qui il parsing HTML estrae solo
 * titolo + link di ogni bando dalla pagina elenco; tutti i campi strutturati (scadenza,
 * budget, target, categoria) vengono estratti da un modello Gemini a partire dal testo
 * grezzo della pagina di dettaglio, perché il formato prosa non è regex-friendly come
 * euroinfosicilia.it.
 */
class SyncCoesioneAi extends Command
{
    protected $signature = 'bandi:sync-coesione-ai
                            {--limit=10 : Numero massimo di bandi da processare}
                            {--force : Reimporta anche i bandi già presenti}
                            {--dry-run : Esegue scraping + AI ma non scrive nel database, stampa solo i risultati}
                            {--model=gemini-2.5-flash : Modello Gemini da usare (gemini-2.0-* ha quota free-tier 0 su molti account)}';

    protected $description = 'Test scraping + AI: importa bandi da politichecoesione.governo.it usando Gemini per estrarre i campi strutturati dal testo';

    private const LIST_URL = 'https://politichecoesione.governo.it/it/finanziamenti-avvisi-e-bandi/';
    private const FONTE    = 'politiche_coesione_ai';

    public function handle(): int
    {
        $apiKey = env('GEMINI_API_KEY');
        $dryRun = $this->option('dry-run');

        if (!$apiKey && !$dryRun) {
            $this->error('❌ GEMINI_API_KEY non configurata in .env. Ottienine una gratuita su https://aistudio.google.com/apikey');
            return self::FAILURE;
        }

        $this->info('🔄 Scraping elenco bandi da politichecoesione.governo.it...');

        $bandi = $this->scaricaElenco();
        if (empty($bandi)) {
            $this->error('❌ Nessun bando trovato nella pagina elenco: la struttura HTML potrebbe essere cambiata.');
            return self::FAILURE;
        }

        $this->info('📊 Trovati ' . count($bandi) . ' bandi in elenco.');

        $limit    = (int) $this->option('limit');
        $force    = $this->option('force');
        $model    = $this->option('model');
        $imported = 0;
        $skipped  = 0;
        $primaChiamata = true;

        foreach (array_slice($bandi, 0, $limit) as $item) {
            $slug           = $this->slugFromUrl($item['url']);
            $codiceEsterno  = 'pc_' . $slug;

            if (!$force && !$dryRun) {
                $esiste = BandoImportato::where('codice_esterno', $codiceEsterno)
                                        ->where('fonte', self::FONTE)
                                        ->exists();
                if ($esiste) { $skipped++; continue; }
            }

            $this->info("📥 [{$item['titolo']}]");

            $testo = $this->scaricaTestoDettaglio($item['url']);
            if (!$testo) {
                $this->warn('   ⚠️ Impossibile leggere la pagina di dettaglio, salto.');
                $skipped++;
                continue;
            }

            // Free tier Gemini: max 5 richieste/minuto, quindi spaziamo le chiamate
            if (!$primaChiamata) {
                sleep(13);
            }
            $primaChiamata = false;

            $campi = $this->estraiCampiConGemini($apiKey, $model, $item['titolo'], $testo);
            if (!$campi) {
                $this->warn('   ⚠️ Estrazione AI fallita, salto.');
                $skipped++;
                continue;
            }

            if (($campi['tipo_contenuto'] ?? null) !== 'bando_finanziamento') {
                $this->warn("   ⚠️ Non è un bando di finanziamento (tipo: {$campi['tipo_contenuto']}), salto.");
                $skipped++;
                continue;
            }

            $scadenza = $this->parseData($campi['scadenza'] ?? null);
            $bando = [
                'codice_esterno'     => $codiceEsterno,
                'fonte'              => self::FONTE,
                'titolo'             => mb_substr($item['titolo'], 0, 255),
                'descrizione'        => mb_substr($campi['descrizione'] ?? '', 0, 2000) ?: null,
                'url'                => $item['url'],
                'categoria'          => $campi['categoria'] ?? null,
                'livello'            => 'statale',
                'regione'            => $campi['regione'] ?? null,
                'provincia'          => $campi['provincia'] ?? null,
                'comune'             => $campi['comune'] ?? null,
                'target'             => $campi['target'] ?? null,
                'budget_totale'      => $this->parseNumero($campi['budget_totale'] ?? null),
                'budget_min'         => null,
                'budget_max'         => null,
                'scadenza'           => $scadenza,
                'data_pubblicazione' => null,
                'data_inizio'        => null,
                'stato'              => $this->determinaStato($scadenza),
                'extra_data'         => json_encode(['gemini_model' => $model], JSON_UNESCAPED_UNICODE),
            ];

            if ($dryRun) {
                $this->line('   ' . json_encode($bando, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                $imported++;
                continue;
            }

            BandoImportato::updateOrCreate(
                ['codice_esterno' => $codiceEsterno, 'fonte' => self::FONTE],
                $bando
            );
            $imported++;
        }

        $this->newLine();
        $this->info("✅ Processati: {$imported}" . ($skipped ? ", {$skipped} saltati" : '') . ($dryRun ? ' (dry-run, nessuna scrittura su DB)' : ''));
        return self::SUCCESS;
    }

    /**
     * Estrae titolo + url dei bandi di primo livello dalla pagina elenco.
     * Ogni bando è un <h2 class="card-header-custom..."><a class="text-decoration-none" href="...">Titolo</a></h2>
     */
    private function scaricaElenco(): array
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'DeepDrive/1.0'])
            ->get(self::LIST_URL);

        if (!$response->successful()) return [];

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($response->body());
        libxml_use_internal_errors(false);

        $xpath = new DOMXPath($dom);
        $nodes = $xpath->query("//h2[contains(@class, 'card-header-custom')]/a[contains(@class, 'text-decoration-none')]");

        $bandi = [];
        foreach ($nodes as $node) {
            $href   = $node->getAttribute('href');
            $titolo = trim($node->textContent);
            if (!$href || !$titolo) continue;

            $url = str_starts_with($href, 'http') ? $href : 'https://politichecoesione.governo.it' . $href;

            // Solo pagine di primo livello (un solo segmento dopo /finanziamenti-avvisi-e-bandi/)
            if (!preg_match('#^https://politichecoesione\.governo\.it/it/finanziamenti-avvisi-e-bandi/[^/]+/$#', $url)) {
                continue;
            }

            $bandi[$url] = ['titolo' => $titolo, 'url' => $url];
        }

        return array_values($bandi);
    }

    /**
     * Scarica la pagina di dettaglio e ne estrae il testo visibile, ripulito da
     * script/style/header/footer/nav e tag HTML. Non isola un contenitore preciso
     * (il sito non ha un <main> stabile): il rumore residuo (menu, breadcrumb) è
     * lasciato al modello AI, a cui viene chiesto esplicitamente di ignorarlo.
     */
    private function scaricaTestoDettaglio(string $url): ?string
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'DeepDrive/1.0'])
            ->get($url);

        if (!$response->successful()) return null;

        $html = $response->body();
        $html = preg_replace('#<script.*?</script>#is', ' ', $html);
        $html = preg_replace('#<style.*?</style>#is', ' ', $html);
        $html = preg_replace('#<header.*?</header>#is', ' ', $html);
        $html = preg_replace('#<footer.*?</footer>#is', ' ', $html);
        $html = preg_replace('#<nav.*?</nav>#is', ' ', $html);
        $html = preg_replace('#<!--.*?-->#is', ' ', $html);

        $testo = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $testo = preg_replace('/[ \t]+/', ' ', $testo);
        $testo = preg_replace('/\n\s*\n+/', "\n", $testo);
        $testo = trim($testo);

        return mb_substr($testo, 0, 6000) ?: null;
    }

    /**
     * Chiama Gemini per estrarre i campi strutturati del bando dal testo grezzo scrappato.
     */
    private function estraiCampiConGemini(string $apiKey, string $model, string $titolo, string $testo): ?array
    {
        $prompt = <<<PROMPT
Sei un estrattore di dati per un motore di ricerca bandi/finanziamenti pubblici italiani.
Ti fornisco il testo grezzo (con rumore residuo di menu/breadcrumb da ignorare) della pagina di un bando: "{$titolo}".

Estrai SOLO le informazioni esplicitamente presenti nel testo. Se un'informazione non è indicata, usa null — non inventare.
Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun markdown, nessun testo extra), con queste chiavi:
- tipo_contenuto: classifica la pagina in una di queste categorie esatte:
  - "bando_finanziamento": un vero bando/avviso/fondo che eroga risorse economiche a un beneficiario
  - "concorso_personale": un concorso pubblico per assumere personale (non è un finanziamento)
  - "documentazione_attuazione": pagina di soli documenti/moduli/linee guida attuative, senza un bando attivo con importi o scadenze proprie
  - "altro": nessuna delle precedenti
- categoria: stringa breve (es. "Industria", "Ricerca", "Ambiente", "Cultura", "Occupazione")
- target: chi può partecipare, riassunto libero (es. "Comuni", "Imprese manifatturiere", "Enti locali e Regioni")
- regione: nome regione se il bando è esplicitamente limitato a una regione specifica, altrimenti null
- provincia: nome provincia se esplicitamente indicata, altrimenti null
- comune: nome comune se esplicitamente indicato, altrimenti null
- budget_totale: importo totale del bando in euro, solo numero (es. 120000000), altrimenti null
- scadenza: data ultima per presentare domanda, formato YYYY-MM-DD, altrimenti null
- descrizione: sintesi in 2-3 frasi di cosa finanzia il bando

Testo:
{$testo}
PROMPT;

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        try {
            $response = Http::timeout(60)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0,
                    'responseMimeType' => 'application/json',
                ],
            ]);
        } catch (\Throwable $e) {
            $this->warn('   ⚠️ Errore chiamata Gemini: ' . $e->getMessage());
            return null;
        }

        if (!$response->successful()) {
            $this->warn("   ⚠️ Gemini HTTP {$response->status()}: " . $response->body());
            return null;
        }

        $testoRisposta = $response->json('candidates.0.content.parts.0.text');
        if (!$testoRisposta) return null;

        $testoRisposta = trim(preg_replace('/^```json|```$/m', '', $testoRisposta));

        $campi = json_decode($testoRisposta, true);
        return is_array($campi) ? $campi : null;
    }

    private function slugFromUrl(string $url): string
    {
        $path = trim(parse_url($url, PHP_URL_PATH), '/');
        $segmenti = explode('/', $path);
        return end($segmenti);
    }

    private function parseNumero(mixed $valore): ?float
    {
        if ($valore === null || $valore === '') return null;
        if (is_numeric($valore)) return (float) $valore;
        $pulito = preg_replace('/[^\d.]/', '', (string) $valore);
        return is_numeric($pulito) ? (float) $pulito : null;
    }

    private function parseData(?string $valore): ?string
    {
        if (!$valore || !preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $valore, $m)) return null;
        return "{$m[1]}-{$m[2]}-{$m[3]}";
    }

    private function determinaStato(?string $scadenza): string
    {
        if (!$scadenza) return 'aperto';
        $diff = now()->diffInDays($scadenza, false);
        if ($diff < 0)   return 'chiuso';
        if ($diff <= 30) return 'in_scadenza';
        return 'aperto';
    }
}
