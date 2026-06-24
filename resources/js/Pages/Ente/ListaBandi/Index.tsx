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
        match_alti: number;
        match_medi: number;
    };
    categorie: string[];
    regioni: string[];
    filtri: any;
    ente: any;
}

export default function ListaBandiIndex({ bandi, stats, categorie, regioni, filtri, ente }: Props) {
    const [search, setSearch] = useState(filtri.search || '');
    const [categoria, setCategoria] = useState(filtri.categoria || '');
    const [regione, setRegione] = useState(filtri.regione || '');
    const [stato, setStato] = useState(filtri.stato || '');

    const handleFilter = () => {
        router.get('/lista-bandi', {
            search,
            categoria,
            regione,
            stato
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategoria('');
        setRegione('');
        setStato('');
        router.get('/lista-bandi');
    };

    const getMatchColor = (punteggio: number) => {
        if (punteggio >= 70) return 'text-green-400';
        if (punteggio >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">📋 Lista Bandi</h1>
                        <p className="text-slate-400 mt-2">
                            Visualizza tutti i bandi disponibili e il loro match con il tuo profilo
                        </p>
                    </div>

                    {/* Statistiche */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-2xl font-bold text-white">{stats.totale}</div>
                            <div className="text-sm text-slate-400">Totale Bandi</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-2xl font-bold text-green-400">{stats.aperti}</div>
                            <div className="text-sm text-slate-400">Bandi Aperti</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-2xl font-bold text-blue-400">{stats.match_alti}</div>
                            <div className="text-sm text-slate-400">Match Alto (&gt;70%)</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-2xl font-bold text-yellow-400">{stats.match_medi}</div>
                            <div className="text-sm text-slate-400">Match Medio (50-69%)</div>
                        </div>
                    </div>

                    {/* Filtri - COMPATTI */}
{/* Filtri - DISTRIBUITI SU TUTTA LA LARGHEZZA */}
<div className="bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700/50 mb-8">
    <div className="flex flex-wrap items-center gap-1.5">
        {/* Input ricerca - occupa più spazio */}
        <div className="flex-1 min-w-[140px]">
            <input
                type="text"
                placeholder="Cerca per titolo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
        </div>

        {/* Select Categorie - con ellissi */}
        <div className="flex-1 min-w-[120px] max-w-[160px]">
            <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 truncate"
                title={categoria || 'Tutte le categorie'}
            >
                <option value="">Tutte le categorie</option>
                {categorie.map((cat) => (
                    <option key={cat} value={cat} title={cat}>
                        {cat.length > 50 ? cat.substring(0, 50) + '...' : cat}
                    </option>
                ))}
            </select>
        </div>

        {/* Select Regioni - con ellissi */}
        <div className="flex-1 min-w-[120px] max-w-[150px]">
            <select
                value={regione}
                onChange={(e) => setRegione(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 truncate"
                title={regione || 'Tutte le regioni'}
            >
                <option value="">Tutte le regioni</option>
                {regioni.map((r) => (
                    <option key={r} value={r} title={r}>
                        {r.length > 30 ? r.substring(0, 30) + '...' : r}
                    </option>
                ))}
            </select>
        </div>

        {/* Select Stati */}
        <div className="flex-1 min-w-[100px] max-w-[130px]">
            <select
                value={stato}
                onChange={(e) => setStato(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 truncate"
                title={stato || 'Tutti gli stati'}
            >
                <option value="">Tutti gli stati</option>
                <option value="aperto">Aperto</option>
                <option value="in_scadenza">In scadenza</option>
                <option value="chiuso">Chiuso</option>
            </select>
        </div>

        {/* Pulsanti */}
        <button
            onClick={handleFilter}
            className="px-3.5 py-1.5 text-sm bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition whitespace-nowrap"
        >
            🔍 Filtra
        </button>
        <button
            onClick={handleReset}
            className="px-3.5 py-1.5 text-sm bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition whitespace-nowrap"
        >
            ↻ Reset
        </button>
    </div>
</div>

                    {/* Lista Bandi */}
                    <div className="space-y-4">
                        {bandi.length === 0 ? (
                            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
                                <div className="text-4xl mb-4">📭</div>
                                <h2 className="text-xl font-semibold text-white mb-2">Nessun bando trovato</h2>
                                <p className="text-slate-400">Prova a modificare i filtri o a sincronizzare nuove fonti.</p>
                            </div>
                        ) : (
                            bandi.map((bando) => (
                                <div
                                    key={bando.id}
                                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex flex-wrap items-start gap-4">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            <div className={`text-2xl font-bold ${getMatchColor(bando.match_punteggio)}`}>
                                                {bando.match_punteggio}%
                                            </div>
                                            <div className="text-xs text-slate-400">Match</div>
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <h2 className="text-lg font-semibold text-white">
                                                <a
                                                    href={`/ente/lista-bandi/${bando.id}`}
                                                    className="hover:text-blue-400 transition"
                                                >
                                                    {bando.titolo}
                                                </a>
                                            </h2>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {bando.categoria && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                                        {bando.categoria}
                                                    </span>
                                                )}
                                                {bando.regione && (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                        📍 {bando.regione}
                                                    </span>
                                                )}
                                                {bando.scadenza && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                        📅 {new Date(bando.scadenza).toLocaleDateString('it-IT')}
                                                    </span>
                                                )}
                                                {bando.budget_totale && (
                                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                        💰 {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(bando.budget_totale)}
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                                    {bando.fonte || 'Sconosciuta'}
                                                </span>
                                                <span className={`px-2 py-1 ${bando.stato === 'aperto' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs rounded-full`}>
                                                    {bando.stato}
                                                </span>
                                            </div>

                                            {bando.match_punteggio > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    {bando.punti_forza && bando.punti_forza.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {bando.punti_forza.map((punto, idx) => (
                                                                <span key={idx} className="text-xs text-green-400">✅ {punto}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {bando.punti_debolezza && bando.punti_debolezza.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {bando.punti_debolezza.map((punto, idx) => (
                                                                <span key={idx} className="text-xs text-red-400">⚠️ {punto}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            <a
                                                href={`/ente/lista-bandi/${bando.id}`}
                                                className="inline-block px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition"
                                            >
                                                📖 Dettaglio
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}