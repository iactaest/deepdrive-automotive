import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Settings, Search, Bookmark, TrendingUp, Calendar, Building2, Euro, Clock } from 'lucide-react';

export default function Dashboard({ profilo, bandi, stats }: any) {
    const hasProfilo = profilo && profilo.nome_ente;

    if (!hasProfilo) {
        return (
            <AuthenticatedLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
                    <div className="max-w-2xl mx-auto text-center px-4">
                        <div className="bg-slate-800/50 rounded-2xl p-8">
                            <Building2 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-4">🏛️ Benvenuto!</h1>
                            <p className="text-slate-400 mb-6">
                                Per iniziare a cercare bandi e gare d'appalto, completa il profilo del tuo ente.
                            </p>
                            <button
                                onClick={() => router.visit('/ente/profilo')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition"
                            >
                                Crea Profilo Ente
                            </button>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">🏛️ {profilo.nome_ente}</h1>
                        <p className="text-slate-400 mt-2">Dashboard bandi e gare d'appalto</p>
                    </div>

                    {/* Statistiche */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <Search className="h-8 w-8 text-blue-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{stats?.totali || 0}</p>
                            <p className="text-slate-400 text-sm">Bandi attivi</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <Calendar className="h-8 w-8 text-orange-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{stats?.in_scadenza || 0}</p>
                            <p className="text-slate-400 text-sm">In scadenza (30gg)</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
                            <p className="text-2xl font-bold text-white">€{stats?.budget_totale || '0'}M</p>
                            <p className="text-slate-400 text-sm">Budget totale</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <Bookmark className="h-8 w-8 text-purple-400 mb-2" />
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-slate-400 text-sm">Preferiti</p>
                        </div>
                    </div>

                    {/* Azioni Rapide */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <button
                            onClick={() => router.visit('/ente/ricerca')}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-left hover:scale-105 transition"
                        >
                            <Search className="h-8 w-8 text-white mb-2" />
                            <h3 className="text-xl font-semibold text-white">Ricerca Bandi</h3>
                            <p className="text-blue-200 text-sm mt-1">Cerca bandi e gare d'appalto con filtri avanzati</p>
                        </button>
                        <button
                            onClick={() => router.visit('/ente/profilo')}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-left hover:scale-105 transition"
                        >
                            <Settings className="h-8 w-8 text-white mb-2" />
                            <h3 className="text-xl font-semibold text-white">Modifica Profilo</h3>
                            <p className="text-purple-200 text-sm mt-1">Aggiorna i dati e le preferenze del tuo ente</p>
                        </button>
                    </div>

                    {/* Lista Bandi */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="p-6 border-b border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white">📋 Bandi Aperti</h3>
                        </div>
                        <div className="divide-y divide-slate-700/50">
                            {bandi && bandi.length > 0 ? (
                                bandi.map((bando: any) => (
                                    <div 
                                        key={bando.id} 
                                        onClick={() => router.visit(`/bandi/${bando.id}`)}
                                        className="p-6 hover:bg-slate-700/30 transition cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-white font-semibold">{bando.titolo}</h4>
                                                    <span className="px-2 py-0.5 bg-purple-500/20 rounded-full text-xs text-purple-400">
                                                        {bando.categoria}
                                                    </span>
                                                    {bando.regione !== 'Nazionale' && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 rounded-full text-xs text-green-400">
                                                            {bando.regione}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{bando.descrizione}</p>
                                                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {bando.ente}</span>
                                                    <span className="flex items-center gap-1"><Euro className="h-3 w-3" /> {bando.budget}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Scade: {bando.scadenza}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {bando.target}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-2 py-1 rounded-full text-xs ${
                                                    bando.scadenza <= new Date().toISOString().split('T')[0] 
                                                        ? 'bg-red-500/20 text-red-400' 
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {bando.stato === 'aperto' ? '🟢 Aperto' : '🔴 Chiuso'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    Nessun bando disponibile al momento.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}