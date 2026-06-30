import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';

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
    ente: any;
}

const getMatchColor = (scadenza: string | null, stato: string): string => {
    if (stato === 'chiuso') return 'text-red-400';
    if (!scadenza) return 'text-green-400';
    const oggi = new Date(); oggi.setHours(0,0,0,0);
    const sc = new Date(scadenza); sc.setHours(0,0,0,0);
    const gg = Math.floor((sc.getTime() - oggi.getTime()) / 86400000);
    if (gg < 0)    return 'text-red-400';
    if (gg <= 30)  return 'text-yellow-400';
    if (gg <= 180) return 'text-orange-400';
    return 'text-green-400';
};

const getScadenzaBadgeClass = (scadenza: string | null, stato: string): string => {
    if (stato === 'chiuso') return 'bg-red-500/20 text-red-400';
    if (!scadenza) return 'bg-green-500/20 text-green-400';
    const oggi = new Date(); oggi.setHours(0,0,0,0);
    const sc = new Date(scadenza); sc.setHours(0,0,0,0);
    const gg = Math.floor((sc.getTime() - oggi.getTime()) / 86400000);
    if (gg < 0)    return 'bg-red-500/20 text-red-400';
    if (gg <= 30)  return 'bg-yellow-500/20 text-yellow-400';
    if (gg <= 180) return 'bg-orange-500/20 text-orange-400';
    return 'bg-green-500/20 text-green-400';
};

const getStatoBadgeClass = (stato: string): string => {
    if (stato === 'aperto')      return 'bg-green-500/20 text-green-400';
    if (stato === 'in_scadenza') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
};

const PER_PAGINA = 10;

export default function ListaBandiIndex({ bandi, stats, categorie, regioni, filtri }: Props) {
    const [search, setSearch]       = useState(filtri.search || '');
    const [categoria, setCategoria] = useState(filtri.categoria || '');
    const [regione, setRegione]     = useState(filtri.regione || '');
    const [stato, setStato]         = useState(filtri.stato || '');
    const [minMatch, setMinMatch]   = useState<number>(filtri.min_match ?? 50);
    const [pagina, setPagina]       = useState(1);

    // Parametri persistenti dalla URL (search/categoria/regione)
    const baseParams = {
        search:    filtri.search    || '',
        categoria: filtri.categoria || '',
        regione:   filtri.regione   || '',
    };

    const statoAttivo   = filtri.stato    || '';
    const minMatchAttivo = filtri.min_match != null ? Number(filtri.min_match) : 50;
    const maxMatchAttivo = filtri.max_match != null ? Number(filtri.max_match) : null;

    const handleFilter = () => {
        setPagina(1);
        router.get('/ente/lista-bandi', { ...baseParams, stato, min_match: minMatch });
    };

    const handleReset = () => {
        setSearch(''); setCategoria(''); setRegione(''); setStato(''); setMinMatch(50); setPagina(1);
        router.get('/ente/lista-bandi');
    };

    // Bottoni stato: filtrano solo per stato, reset match a default (50, no max)
    const btnStato = (label: string, valore: string, count: number, colorNum: string, colorBorder: string) => {
        const attivo = statoAttivo === valore;
        return (
            <button
                onClick={() => {
                    setPagina(1);
                    router.get('/ente/lista-bandi', {
                        ...baseParams,
                        stato: attivo ? '' : valore,
                        min_match: 50,
                    });
                }}
                className={`flex-1 rounded-xl p-4 border text-left transition-all hover:brightness-110 ${
                    attivo ? `${colorBorder.replace('/40', '')} bg-slate-700/60` : `${colorBorder} bg-slate-800/50`
                }`}
            >
                <div className={`text-2xl font-bold ${colorNum}`}>{count}</div>
                <div className="text-sm text-slate-400 mt-0.5">{label}</div>
                {attivo && <div className="text-xs text-slate-500 mt-1">▼ filtro attivo</div>}
            </button>
        );
    };

    // Bottoni match: filtrano solo per punteggio, azzerano il filtro stato
    const btnMatch = (label: string, min: number, max: number | null, count: number, colorNum: string, colorBorder: string) => {
        const attivo = minMatchAttivo === min && maxMatchAttivo === max && !statoAttivo;
        return (
            <button
                onClick={() => {
                    setPagina(1);
                    const p: Record<string, any> = { ...baseParams, min_match: min };
                    if (max !== null) p.max_match = max;
                    router.get('/ente/lista-bandi', p);
                }}
                className={`flex-1 rounded-xl p-4 border text-left transition-all hover:brightness-110 ${
                    attivo ? `${colorBorder.replace('/40', '')} bg-slate-700/60` : `${colorBorder} bg-slate-800/50`
                }`}
            >
                <div className={`text-2xl font-bold ${colorNum}`}>{count}</div>
                <div className="text-sm text-slate-400 mt-0.5">{label}</div>
                {attivo && <div className="text-xs text-slate-500 mt-1">▼ filtro attivo</div>}
            </button>
        );
    };

    // Paginazione
    const totalePagine = Math.ceil(bandi.length / PER_PAGINA);
    const bandiPagina  = bandi.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA);

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white">📋 Lista Bandi</h1>
                        <p className="text-slate-400 mt-1">
                            {stats.totale} bandi trovati — clicca le card per filtrare
                        </p>
                    </div>

                    {/* Unica riga — tutti i filtri */}
                    <div className="flex gap-3 mb-8 flex-wrap">
                        {btnStato('Aperti',            'aperto',      stats.aperti,      'text-green-400',  'border-green-700/40')}
                        {btnStato('Chiusi recenti',    'chiuso',      stats.chiusi,      'text-red-400',    'border-red-700/40')}
                        {btnStato('In scadenza ≤30gg', 'in_scadenza', stats.in_scadenza, 'text-yellow-400', 'border-yellow-700/40')}
                        {btnMatch('Bandi ≥ 50% match', 50, null, stats.totale,     'text-white',      'border-slate-600/60')}
                        {btnMatch('Match Alto >70%',   70, null, stats.match_alti, 'text-blue-400',   'border-blue-700/40')}
                        {btnMatch('Match Medio 50–69%',50, 69,  stats.match_medi, 'text-orange-400', 'border-orange-700/40')}
                    </div>

                    {/* Legenda colori */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-400">
                        <span>% match colorato per scadenza:</span>
                        <span className="text-green-400 font-semibold">● Verde</span><span>&gt;6 mesi</span>
                        <span className="text-orange-400 font-semibold">● Arancio</span><span>1–6 mesi</span>
                        <span className="text-yellow-400 font-semibold">● Giallo</span><span>≤1 mese</span>
                        <span className="text-red-400 font-semibold">● Rosso</span><span>chiuso</span>
                    </div>

                    {/* Filtri */}
                    <div className="bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700/50 mb-6">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className="flex-1 min-w-[140px]">
                                <input
                                    type="text"
                                    placeholder="Cerca per titolo..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[120px] max-w-[160px]">
                                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option value="">Tutte le categorie</option>
                                    {categorie.map((cat) => (
                                        <option key={cat} value={cat}>{cat.length > 40 ? cat.substring(0, 40) + '…' : cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[120px] max-w-[150px]">
                                <select value={regione} onChange={(e) => setRegione(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option value="">Tutte le regioni</option>
                                    {regioni.map((r) => (
                                        <option key={r} value={r}>{r.length > 28 ? r.substring(0, 28) + '…' : r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[100px] max-w-[130px]">
                                <select value={stato} onChange={(e) => setStato(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option value="">Tutti gli stati</option>
                                    <option value="aperto">Aperto</option>
                                    <option value="in_scadenza">In scadenza</option>
                                    <option value="chiuso">Chiuso</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[110px] max-w-[140px]">
                                <select value={minMatch} onChange={(e) => setMinMatch(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-blue-500/50 rounded-lg text-blue-300 focus:outline-none focus:border-blue-400">
                                    <option value={0}>Tutti i bandi</option>
                                    <option value={50}>≥ 50% match</option>
                                    <option value={70}>≥ 70% match</option>
                                    <option value={90}>≥ 90% match</option>
                                </select>
                            </div>
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

                    {/* Lista Bandi */}
                    <div className="space-y-3">
                        {bandi.length === 0 ? (
                            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
                                <div className="text-4xl mb-4">📭</div>
                                <h2 className="text-xl font-semibold text-white mb-2">Nessun bando trovato</h2>
                                <p className="text-slate-400">Prova a modificare i filtri o clicca Reset.</p>
                            </div>
                        ) : (
                            bandiPagina.map((bando) => (
                                <div key={bando.id}
                                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all">
                                    <div className="flex flex-wrap items-start gap-4">

                                        <div className="flex-shrink-0 w-14 text-center">
                                            <div className={`text-2xl font-bold ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                                {bando.match_punteggio}%
                                            </div>
                                            <div className="text-xs text-slate-400">Match</div>
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <h2 className="text-base font-semibold text-white">
                                                <a href={`/ente/lista-bandi/${bando.id}`} className="hover:text-blue-400 transition">
                                                    {bando.titolo}
                                                </a>
                                            </h2>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {bando.categoria && (
                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{bando.categoria}</span>
                                                )}
                                                {bando.regione && (
                                                    <span className="px-2 py-0.5 bg-slate-600/40 text-slate-300 text-xs rounded-full">📍 {bando.regione}</span>
                                                )}
                                                {bando.scadenza && (
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getScadenzaBadgeClass(bando.scadenza, bando.stato)}`}>
                                                        📅 {new Date(bando.scadenza).toLocaleDateString('it-IT')}
                                                    </span>
                                                )}
                                                {bando.budget_totale && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                        💰 {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(bando.budget_totale)}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                                    {bando.fonte || 'Sconosciuta'}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatoBadgeClass(bando.stato)}`}>
                                                    {bando.stato === 'aperto' ? 'Aperto' : bando.stato === 'in_scadenza' ? 'In scadenza' : 'Chiuso'}
                                                </span>
                                            </div>
                                            {bando.match_punteggio > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {bando.punti_forza?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {bando.punti_forza.map((p, i) => (
                                                                <span key={i} className="text-xs text-green-400">✅ {p}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {bando.punti_debolezza?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {bando.punti_debolezza.map((p, i) => (
                                                                <span key={i} className="text-xs text-red-400">⚠️ {p}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            <a href={`/ente/lista-bandi/${bando.id}`}
                                                className="inline-block px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition">
                                                📖 Dettaglio
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
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

                </div>
            </div>
        </LayoutEnte>
    );
}
