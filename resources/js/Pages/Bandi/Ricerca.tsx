import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, Filter, Calendar, Euro, Building2 } from 'lucide-react';

export default function Ricerca() {
    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-800/50 rounded-xl p-6">
                        <h1 className="text-2xl font-bold text-white mb-4">🔍 Ricerca Bandi per Enti Pubblici</h1>
                        <p className="text-slate-400">In sviluppo: filtri per livello, procedura, oggetto, importo e scadenza...</p>
                        
                        {/* Placeholder filtri */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-400 text-sm">Livello: Tutti</span>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-400 text-sm">Procedura: Tutte</span>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                                <Euro className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-400 text-sm">Importo: Tutti</span>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-400 text-sm">Scadenza: Tutte</span>
                            </div>
                        </div>
                        
                        <div className="text-center py-12 text-slate-500">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Funzionalità di ricerca avanzata in arrivo...</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}