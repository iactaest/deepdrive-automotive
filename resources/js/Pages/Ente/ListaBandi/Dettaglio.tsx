import React from 'react';
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
}

interface Match {
    punteggio: number;
    punti_forza: string[];
    punti_debolezza: string[];
}

interface Props {
    bando: Bando;
    match: Match | null;
    ente: any;
}

export default function ListaBandiDettaglio({ bando, match, ente }: Props) {
    const getMatchColor = (punteggio: number) => {
        if (punteggio >= 70) return 'text-green-400';
        if (punteggio >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={() => router.get('/ente/lista-bandi')}
                            className="text-blue-400 hover:text-blue-300 transition"
                        >
                            ← Torna alla lista
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h1 className="text-2xl font-bold text-white mb-4">{bando.titolo}</h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-2">📋 Informazioni Generali</h3>
                                <div className="space-y-2">
                                    <p><span className="text-slate-400">Fonte:</span> <span className="text-white">{bando.fonte || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Stato:</span> 
                                        <span className={`px-2 py-1 ml-2 ${bando.stato === 'aperto' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} rounded-full text-xs`}>
                                            {bando.stato}
                                        </span>
                                    </p>
                                    <p><span className="text-slate-400">Categoria:</span> <span className="text-white">{bando.categoria || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Regione:</span> <span className="text-white">{bando.regione || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Budget:</span> <span className="text-white">{bando.budget_totale ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(bando.budget_totale) : 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Scadenza:</span> <span className="text-white">{bando.scadenza ? new Date(bando.scadenza).toLocaleDateString('it-IT') : 'N/A'}</span></p>
                                </div>
                            </div>
                            
                            {match ? (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Match con il tuo profilo</h3>
                                    <div className={`text-4xl font-bold ${getMatchColor(match.punteggio)}`}>
                                        {match.punteggio}%
                                    </div>
                                    
                                    {match.punti_forza && match.punti_forza.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-green-400">✅ Punti di forza</h4>
                                            <ul className="list-disc list-inside text-sm text-white space-y-1">
                                                {match.punti_forza.map((punto, idx) => (
                                                    <li key={idx}>{punto}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {match.punti_debolezza && match.punti_debolezza.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-red-400">⚠️ Punti debolezza</h4>
                                            <ul className="list-disc list-inside text-sm text-white space-y-1">
                                                {match.punti_debolezza.map((punto, idx) => (
                                                    <li key={idx}>{punto}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Match con il tuo profilo</h3>
                                    <p className="text-slate-400">⏳ Nessun match calcolato per questo bando.</p>
                                </div>
                            )}
                        </div>
                        
                        {bando.descrizione && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-400 mb-2">📝 Descrizione</h3>
                                <p className="text-white">{bando.descrizione}</p>
                            </div>
                        )}
                        
                        {bando.url && (
                            <div className="mt-6">
                                <a href={bando.url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition">
                                    🔗 Vai al bando originale
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}