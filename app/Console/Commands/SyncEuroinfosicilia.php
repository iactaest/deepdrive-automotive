<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

/**
 * Importa bandi aperti dal portale euroinfosicilia.it (Regione Siciliana FESR/FSC/POC/PSC).
 * Usa l'API REST WordPress nativa del sito — nessun scraping HTML necessario.
 */
class SyncEuroinfosicilia extends Command
{
    protected $signature = 'bandi:sync-euroinfosicilia
                            {--limit=0 : Limite post da importare (0 = tutti)}
                            {--pages=20 : Numero massimo di pagine da scorrere}
                            {--force : Reimporta anche i bandi già presenti}';

    protected $description = 'Sincronizza bandi aperti da euroinfosicilia.it (PR FESR, FSC, POC, PSC Sicilia) via WP REST API';

    private const BASE_URL  = 'https://euroinfosicilia.it/wp-json/wp/v2/posts';
    private const FONTE     = 'euroinfosicilia';
    private const PER_PAGE  = 100;

    // Categorie WP da includere (bandi aperti per programma)
    private const CAT_INCLUDI = [
        321,  // Bandi e Avvisi
        330,  // Bandi PR FESR 21-27
        332,  // Bandi FSC Sicilia 21-27
        327,  // Bandi POC Sicilia 14-20
        1513, // Bandi PSC Sicilia 14-20
        322,  // Bandi Altri Programmi
        340,  // Bandi e Avvisi Aperti
    ];

    // Categorie WP da escludere
    private const CAT_ESCLUDI = [
        341,  // Bandi e Avvisi Chiusi
        338,  // Esiti e Graduatorie
        335,  // Decreti (non sono bandi)
    ];

    // Mappa categoria WP → label interna
    private const CAT_MAP = [
        330  => 'PR FESR 2021-2027',
        332  => 'FSC Sicilia 2021-2027',
        327  => 'POC Sicilia 2014-2020',
        1513 => 'PSC Sicilia 2014-2020',
        322  => 'Programmi regionali vari',
        321  => 'Bandi e Avvisi',
        340  => 'Bandi e Avvisi',
    ];

    public function handle(): int
    {
        $this->info('🔄 Sincronizzazione bandi euroinfosicilia.it (WP REST API)...');

        $limit    = (int) $this->option('limit');
        $maxPages = (int) $this->option('pages');
        $force    = $this->option('force');

        $imported = 0;
        $skipped  = 0;
        $page     = 1;

        do {
            $params = [
                'per_page'          => self::PER_PAGE,
                'page'              => $page,
                'categories'        => implode(',', self::CAT_INCLUDI),
                'categories_exclude' => implode(',', self::CAT_ESCLUDI),
                '_fields'           => 'id,title,date,excerpt,content,link,categories',
                'orderby'           => 'date',
                'order'             => 'desc',
            ];

            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'DeepDrive/1.0'])
                ->get(self::BASE_URL, $params);

            if ($response->status() === 400) {
                break; // pagina oltre il totale disponibile
            }

            if (!$response->successful()) {
                $this->warn("⚠️ HTTP {$response->status()} alla pagina $page");
                break;
            }

            $posts = $response->json();
            if (empty($posts)) break;

            $totalPages = (int) $response->header('X-WP-TotalPages', 1);
            $totalPosts = (int) $response->header('X-WP-Total', 0);

            if ($page === 1) {
                $this->info("📊 Post trovati: {$totalPosts} in {$totalPages} pagine");
            }

            foreach ($posts as $post) {
                if ($limit > 0 && $imported >= $limit) break 2;

                $bando = $this->mapToBando($post);
                if (!$bando) { $skipped++; continue; }

                // Salta bandi già importati se non --force
                if (!$force) {
                    $esiste = BandoImportato::where('codice_esterno', $bando['codice_esterno'])
                                            ->where('fonte', self::FONTE)
                                            ->exists();
                    if ($esiste) { $skipped++; continue; }
                }

                // Aggiorna lo stato se il bando era già nel DB (scadenza potrebbe essere cambiata)
                BandoImportato::updateOrCreate(
                    ['codice_esterno' => $bando['codice_esterno'], 'fonte' => self::FONTE],
                    $bando
                );
                $imported++;
                $this->output->write('.');
            }

            $page++;
        } while ($page <= min($maxPages, $totalPages ?? 1));

        $this->newLine();
        $this->info("✅ Importati: {$imported} bandi" . ($skipped ? ", {$skipped} saltati" : ''));
        return self::SUCCESS;
    }

    private function mapToBando(array $post): ?array
    {
        $id     = $post['id'] ?? null;
        $titolo = html_entity_decode(strip_tags($post['title']['rendered'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $link   = $post['link'] ?? null;

        if (empty($titolo) || empty($id)) return null;

        $contentHtml = $post['content']['rendered'] ?? '';
        $excerptHtml = $post['excerpt']['rendered'] ?? '';

        // Descrizione: usa excerpt senza HTML
        $descrizione = trim(strip_tags(html_entity_decode($excerptHtml, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
        if (empty($descrizione)) {
            $descrizione = mb_substr(trim(strip_tags(html_entity_decode($contentHtml, ENT_QUOTES | ENT_HTML5, 'UTF-8'))), 0, 500);
        }

        $scadenza  = $this->estraiScadenza($contentHtml . ' ' . $titolo);
        $categoria = $this->mapCategoria($post['categories'] ?? []);
        $target    = $this->estraiTarget($contentHtml);
        $stato     = $this->determinaStato($scadenza, $post['categories'] ?? []);

        // Escludi bandi chiusi senza data (già archiviati)
        if ($stato === 'chiuso' && !$scadenza) return null;

        return [
            'codice_esterno'     => 'eis_' . $id,
            'fonte'              => self::FONTE,
            'titolo'             => mb_substr($titolo, 0, 255),
            'descrizione'        => mb_substr($descrizione, 0, 2000) ?: null,
            'url'                => $link,
            'categoria'          => $categoria,
            'livello'            => 'regionale',
            'regione'            => 'Sicilia',
            'target'             => $target,
            'budget_totale'      => null,
            'budget_min'         => null,
            'budget_max'         => null,
            'scadenza'           => $scadenza,
            'data_pubblicazione' => substr($post['date'] ?? '', 0, 10) ?: null,
            'data_inizio'        => null,
            'stato'              => $stato,
            'extra_data'         => json_encode(['wp_id' => $id, 'categories' => $post['categories']], JSON_UNESCAPED_UNICODE),
        ];
    }

    /**
     * Estrae la data di scadenza dal testo HTML del post.
     * Cerca pattern comuni: "entro il DD/MM/YYYY", "scadenza DD/MM/YYYY", "del DD/MM/YYYY ore"
     */
    private function estraiScadenza(string $html): ?string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $patterns = [
            // "entro le ore 12:00 del 31/12/2026" o "entro il 31/12/2026"
            '/entro\s+(?:le\s+ore\s+[\d:]+\s+del\s+|il\s+|il\s+giorno\s+)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i',
            // "scadenza:? 31/12/2026" o "scadenza del 31/12/2026"
            '/scadenza\s*(?:del\s+|:\s*)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i',
            // "fino al 31/12/2026" o "fino alle ore 12 del 31/12/2026"
            '/fino\s+(?:al\s+|alle?\s+ore\s+[\d:]+\s+del\s+)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i',
            // "termina il 31/12/2026" o "termine: 31/12/2026"
            '/termin[aei]\s*(?:il\s+|:\s*)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i',
            // "presentazione delle domande" seguito da data
            '/presentazione\s+delle\s+domande[^.]{0,80}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i',
            // data standalone in formato ISO vicino a "scadenza" o simili
            '/(?:scadenza|deadline|termine|chiusura)[^.]{0,60}(\d{4}-\d{2}-\d{2})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $m)) {
                $d = $this->parseDate($m[1]);
                if ($d && $d >= '2024-01-01') { // ignora date troppo vecchie
                    return $d;
                }
            }
        }

        return null;
    }

    /**
     * Inferisce i destinatari del bando dal testo (Comuni, imprese, ecc.)
     */
    private function estraiTarget(string $html): ?string
    {
        $text = strtolower(html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        $isEnte   = preg_match('/comuni\b|enti local[ei]|pubblica amministrazione|municipalit|ente pubblic/i', $text);
        $isImpresa = preg_match('/impres[ae]\b|operator[ei] economic[io]|professionist/i', $text);

        if ($isEnte && !$isImpresa)  return 'Enti locali, Comuni';
        if ($isEnte && $isImpresa)   return 'Enti locali, Imprese';
        if ($isImpresa && !$isEnte)  return 'Impresa';

        return null; // target non specificato
    }

    /**
     * Mappa gli ID categoria WP al label interno del programma.
     */
    private function mapCategoria(array $catIds): ?string
    {
        foreach (self::CAT_MAP as $id => $label) {
            if (in_array($id, $catIds)) return $label;
        }
        return 'Fondi strutturali Sicilia';
    }

    private function determinaStato(?string $scadenza, array $catIds): string
    {
        // Se la categoria "Chiusi" è presente → chiuso
        if (array_intersect([341], $catIds)) return 'chiuso';

        if (!$scadenza) return 'aperto';

        $diff = now()->diffInDays($scadenza, false);
        if ($diff < 0)   return 'chiuso';
        if ($diff <= 30) return 'in_scadenza';
        return 'aperto';
    }

    private function parseDate(?string $value): ?string
    {
        if (empty($value)) return null;
        $value = trim(str_replace(['.', '-'], '/', $value));

        foreach (['d/m/Y', 'Y/m/d', 'm/d/Y'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, $value);
            if ($d && $d->format($fmt) === $value) {
                return $d->format('Y-m-d');
            }
        }
        // ISO già parsabile
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $value, $m)) {
            return "{$m[1]}-{$m[2]}-{$m[3]}";
        }
        return null;
    }
}
