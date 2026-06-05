import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Euro, Building2, Bookmark } from 'lucide-react';

export default function Show({ bando }: any) {
    if (!bando) {
        return (
            <AuthenticatedLayout>
                <div className="py-12 text-center">
                    <p className="text-slate-400">Bando non trovato</p>
                    <button 
                        onClick={() => router.visit('/bandi')}
                        className="mt-4 text-blue-400 hover:text-blue-300"
                    >
                        ← Torna indietro
                    </button>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button 
                        onClick={() => router.visit('/bandi')}
                        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Torna indietro
                    </button>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                            <h1 className="text-2xl font-bold text-white">{bando.titolo}</h1>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {bando.ente}</span>
                                <span className="flex items-center gap-1"><Euro className="h-4 w-4" /> {bando.budget}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Scade: {bando.scadenza}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-300">{bando.descrizione}</p>
                            <button className="mt-6 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm flex items-center gap-2">
                                <Bookmark className="h-4 w-4" /> Salva tra i preferiti
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}