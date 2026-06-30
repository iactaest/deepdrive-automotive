import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';

interface Bando {
    id: number;
    titolo: string;
    fonte: string;
    categoria: string;
    regione: string;
    livello: string;
    budget_totale: number;
    scadenza: string;
    stato: string;
    url: string;
    descrizione: string;
}

interface Match {
    punteggio: number;
    punti_forza: string[];
    punti_debolezza: string[];
}

interface Props {
    bando: Bando;
    match: Match;
    ente: any;
}

const getMatchColor = (scadenza: string | null, stato: string): string => {
    if (stato === 'chiuso') return 'text-red-400';
    if (!scadenza) return 'text-green-400';
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    const sc = new Date(scadenza); sc.setHours(0, 0, 0, 0);
    const gg = Math.floor((sc.getTime() - oggi.getTime()) / 86400000);
    if (gg < 0)    return 'text-red-400';
    if (gg <= 30)  return 'text-yellow-400';
    if (gg <= 180) return 'text-orange-400';
    return 'text-green-400';
};

const getStatoBadge = (stato: string) => {
    if (stato === 'aperto')      return 'bg-green-500/20 text-green-400';
    if (stato === 'in_scadenza') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
};

const statoLabel = (stato: string) =>
    stato === 'aperto' ? 'Aperto' : stato === 'in_scadenza' ? 'In scadenza' : 'Chiuso';

const MAX_RIGHE = 20;

export default function ListaBandiDettaglio({ bando, match }: Props) {
    const [descAperta, setDescAperta] = useState(false);

    const righe = (bando.descrizione ?? '').split('\n');
    const descrizioneBreve = righe.slice(0, MAX_RIGHE).join('\n');
    const haAltro = righe.length > MAX_RIGHE;

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <button
                            onClick={() => router.get('/ente/lista-bandi')}
                            className="text-blue-400 hover:text-blue-300 transition text-sm"
                        >
                            ← Torna alla lista
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h1 className="text-2xl font-bold text-white mb-6">{bando.titolo}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Colonna sinistra — info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-3">📋 Informazioni</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Fonte</span>
                                        <span className="text-white">{bando.fonte || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Stato</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatoBadge(bando.stato)}`}>
                                            {statoLabel(bando.stato)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Categoria</span>
                                        <span className="text-white">{bando.categoria || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Livello</span>
                                        <span className="text-white">{bando.livello || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Regione</span>
                                        <span className="text-white">{bando.regione || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Budget</span>
                                        <span className="text-white">
                                            {bando.budget_totale
                                                ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(bando.budget_totale)
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Scadenza</span>
                                        <span className={`font-medium ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                            {bando.scadenza
                                                ? new Date(bando.scadenza).toLocaleDateString('it-IT')
                                                : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Descrizione sotto scadenza */}
                                {bando.descrizione && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-slate-400 mb-2">📝 Descrizione</h3>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {descAperta ? bando.descrizione : descrizioneBreve}
                                        </p>
                                        {haAltro && (
                                            <button
                                                onClick={() => setDescAperta(v => !v)}
                                                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
                                            >
                                                {descAperta ? '▲ Mostra meno' : '▼ Mostra tutto'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Colonna destra — match */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-3">🎯 Match con il tuo profilo</h3>
                                <div className={`text-5xl font-bold ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                    {match.punteggio}%
                                </div>
                                <p className="text-xs text-slate-500 mt-1">compatibilità stimata</p>

                                {match.punti_forza?.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-green-400 mb-1">✅ Punti di forza</h4>
                                        <ul className="space-y-1">
                                            {match.punti_forza.map((p, i) => (
                                                <li key={i} className="text-sm text-white">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {match.punti_debolezza?.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-red-400 mb-1">⚠️ Punti di debolezza</h4>
                                        <ul className="space-y-1">
                                            {match.punti_debolezza.map((p, i) => (
                                                <li key={i} className="text-sm text-white">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fonte e link originale */}
                        <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-3">
                            <div>
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Fonte dati</span>
                                <p className="text-sm text-slate-300 mt-0.5">{bando.fonte || '—'}</p>
                            </div>

                            {bando.url ? (
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Link bando originale</span>
                                    <p className="text-xs text-slate-500 break-all mt-0.5 mb-2">{bando.url}</p>
                                    <a
                                        href={bando.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-5 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition"
                                    >
                                        🔗 Vai al bando originale
                                    </a>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Link bando originale</span>
                                    <p className="text-sm text-slate-500 mt-1">URL non disponibile per questo bando</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}
