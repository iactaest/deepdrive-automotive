import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';

interface Bando {
    id: number;
    titolo: string;
    fonte: string;
    categoria: string;
    regione: string;
    budget_totale: number;
    scadenza: string;
    stato: string;
    url: string;
    descrizione: string;
    match_punteggio: number;
    punti_forza: string[];
    punti_debolezza: string[];
}

interface Props {
    bandi: Bando[];
    stats: {
        totale: number;
        aperti: number;
        in_scadenza: number;
        chiusi: number;
        match_alti: number;
        match_medi: number;
    };
    categorie: string[];
    regioni: string[];
    filtri: any;
    compatto?: boolean;
    // Quando fornita (vista incorporata nel menu mobile) viene chiamata al posto
    // di router.get, dato che li' non siamo sulla vera pagina /ente/lista-bandi.
    onFiltra?: (params: Record<string, any>) => void;
}

const PER_PAGINA = 10;

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile.
export default function ListaBandiContenuto({ bandi, stats, categorie, regioni, filtri, compatto = false, onFiltra }: Props) {
    const [search, setSearch]       = useState(filtri.search || '');
    const [categoria, setCategoria] = useState(filtri.categoria || '');
    const [regione, setRegione]     = useState(filtri.regione || '');
    const [stato, setStato]         = useState(filtri.stato || '');
    const [minMatch, setMinMatch]   = useState<number>(filtri.min_match ?? 0);
    const [pagina, setPagina]       = useState(1);

    const statoAttivo    = filtri.stato    || '';
    const minMatchAttivo = filtri.min_match != null ? Number(filtri.min_match) : 0;
    const maxMatchAttivo = filtri.max_match != null ? Number(filtri.max_match) : null;

    const naviga = (params: Record<string, any>) => {
        if (onFiltra) onFiltra(params);
        else router.get('/ente/lista-bandi', params);
    };

    const handleFilter = () => {
        setPagina(1);
        naviga({ search, categoria, regione, stato, min_match: minMatch });
    };

    const handleReset = () => {
        setSearch(''); setCategoria(''); setRegione(''); setStato(''); setMinMatch(0); setPagina(1);
        naviga({});
    };

    // Casella filtro in stile "bolla" (pattern, gradiente 3D, bordo colorato).
    const casellaFiltro = (label: string, count: number, bordo: string, attivo: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={`card-bolla w-full text-left p-4 transition-all hover:brightness-125 ${attivo ? 'brightness-125' : ''}`}
            style={{ borderWidth: attivo ? 3 : 2, borderStyle: 'solid', borderColor: bordo }}
        >
            <span className="card-bolla-bg" />
            <div className="relative">
                <div className="text-2xl font-bold" style={{ color: bordo }}>{count}</div>
                <div className="text-sm text-slate-400 mt-0.5">{label}</div>
                {attivo && <div className="text-xs text-slate-500 mt-1">▼ filtro attivo</div>}
            </div>
        </button>
    );

    // Bottoni stato: filtrano solo per stato, preservano i filtri testo correnti
    const btnStato = (label: string, valore: string, count: number, bordo: string) => {
        const attivo = statoAttivo === valore;
        return casellaFiltro(label, count, bordo, attivo, () => {
            setPagina(1);
            naviga({ search, categoria, regione, stato: attivo ? '' : valore, min_match: 0 });
        });
    };

    // Bottoni match: filtrano solo per punteggio, azzerano il filtro stato
    const btnMatch = (label: string, min: number, max: number | null, count: number, bordo: string) => {
        const attivo = minMatchAttivo === min && maxMatchAttivo === max && !statoAttivo;
        return casellaFiltro(label, count, bordo, attivo, () => {
            setPagina(1);
            const p: Record<string, any> = { search, categoria, regione, min_match: min };
            if (max !== null) p.max_match = max;
            naviga(p);
        });
    };

    // Paginazione
    const totalePagine = Math.ceil(bandi.length / PER_PAGINA);
    const bandiPagina  = bandi.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA);

    return (
        <>
            {/* Header */}
            <div className="mb-6 text-center" style={{ marginTop: 25 }}>
                <h1 className="text-3xl font-bold text-white">📋 Lista Bandi</h1>
                <p className="text-slate-300 mt-1">
                    {stats.totale} bandi trovati — clicca le card per filtrare
                </p>
            </div>

            {/* Due righe da 3 — stato e match */}
            <div className="space-y-3 mb-8">
                <div className="grid grid-cols-3 gap-3">
                    {btnStato('Aperti',            'aperto',      stats.aperti,      '#7CB08A')}
                    {btnStato('Chiusi recenti',    'chiuso',      stats.chiusi,      '#C08FA8')}
                    {btnStato('In scadenza ≤30gg', 'in_scadenza', stats.in_scadenza, '#AFA36C')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {btnMatch('Tutti i bandi',       0,  null, stats.totale,     '#8FA3C7')}
                    {btnMatch('Match Alto ≥ 70%',  70, null, stats.match_alti, '#66AB93')}
                    {btnMatch('Match Medio 50–69%',50, 69,  stats.match_medi, '#C0975F')}
                </div>
            </div>

            {/* Filtri */}
            <div className="bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700/50 mb-6">
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Cerca per titolo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="">Tutte le categorie</option>
                            {categorie.map((cat) => (
                                <option key={cat} value={cat}>{cat.length > 40 ? cat.substring(0, 40) + '…' : cat}</option>
                            ))}
                        </select>
                        <select value={regione} onChange={(e) => setRegione(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="">Tutte le regioni</option>
                            {regioni.map((r) => (
                                <option key={r} value={r}>{r.length > 28 ? r.substring(0, 28) + '…' : r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select value={stato} onChange={(e) => setStato(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="">Tutti gli stati</option>
                            <option value="aperto">Aperto</option>
                            <option value="in_scadenza">In scadenza</option>
                            <option value="chiuso">Chiuso</option>
                        </select>
                        <select value={minMatch} onChange={(e) => setMinMatch(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-blue-500/50 rounded-lg text-blue-300 focus:outline-none focus:border-blue-400">
                            <option value={0}>Tutti i bandi</option>
                            <option value={30}>≥ 30% match</option>
                            <option value={50}>≥ 50% match</option>
                            <option value={70}>≥ 70% match</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleFilter}
                            className="px-3.5 py-1.5 text-sm bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition whitespace-nowrap">
                            🔍 Filtra
                        </button>
                        <button onClick={handleReset}
                            className="px-3.5 py-1.5 text-sm bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition whitespace-nowrap">
                            ↻ Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista Bandi */}
            <div className="space-y-3">
                {bandi.length === 0 ? (
                    <CardBolla bordo="#8FA3C7" className="p-8 text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-white mb-2">Nessun bando trovato</h2>
                        <p className="text-slate-400">Prova a modificare i filtri o clicca Reset.</p>
                    </CardBolla>
                ) : (
                    bandiPagina.map((bando, idx) => {
                        const colore = PALETTE_BOLLA[idx % PALETTE_BOLLA.length];
                        return (
                            <CardBolla key={bando.id} bordo={colore} indice={idx} className="p-4 hover:brightness-110 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="text-base font-semibold text-white flex-1 min-w-0">
                                        <a href={`/ente/lista-bandi/${bando.id}`} className="hover:text-white/80 transition">
                                            {bando.titolo}
                                        </a>
                                    </h2>
                                    <a href={`/ente/lista-bandi/${bando.id}`}
                                        className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:brightness-125"
                                        style={{
                                            background: `linear-gradient(145deg, ${colore}33, ${colore}1A)`,
                                            borderColor: colore,
                                            color: colore,
                                        }}>
                                        Dettaglio <ChevronRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </CardBolla>
                        );
                    })
                )}
            </div>

            {/* Paginazione */}
            {totalePagine > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-400">
                        {(pagina - 1) * PER_PAGINA + 1}–{Math.min(pagina * PER_PAGINA, bandi.length)} di {bandi.length} bandi
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                            className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white disabled:opacity-30 hover:bg-slate-600 transition"
                        >
                            ‹ Prec
                        </button>
                        {Array.from({ length: totalePagine }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalePagine || Math.abs(n - pagina) <= 2)
                            .reduce<(number | '…')[]>((acc, n, idx, arr) => {
                                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('…');
                                acc.push(n);
                                return acc;
                            }, [])
                            .map((n, i) =>
                                n === '…' ? (
                                    <span key={`e${i}`} className="px-2 py-1.5 text-sm text-slate-500">…</span>
                                ) : (
                                    <button
                                        key={n}
                                        onClick={() => setPagina(n as number)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                            pagina === n
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                )
                            )}
                        <button
                            onClick={() => setPagina(p => Math.min(totalePagine, p + 1))}
                            disabled={pagina === totalePagine}
                            className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white disabled:opacity-30 hover:bg-slate-600 transition"
                        >
                            Succ ›
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
