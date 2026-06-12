import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Building2, MapPin, Heart, Edit, ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';

export default function ProfiloShow({ profilo }: any) {
    const getTipoLabel = (tipo: string) => {
        const tipi: Record<string, string> = {
            comune: '🏛️ Comune',
            provincia: '🗺️ Provincia',
            regione: '🏢 Regione',
            asl: '🏥 ASL',
            universita: '🎓 Università',
            scuola: '📚 Scuola',
            altro: '⚙️ Altro'
        };
        return tipi[tipo] || tipo;
    };

    const handleDelete = () => {
        if (confirm('⚠️ Sei sicuro di voler cancellare il profilo? Dovrai ricrearlo da capo.')) {
            router.delete('/ente/profilo');
        }
    };

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => router.visit('/dashboard/ente')}
                            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Torna alla Dashboard
                        </button>
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Building2 className="h-8 w-8 text-blue-400" />
                                    {profilo.nome_ente}
                                </h1>
                                <p className="text-slate-400 mt-2">{getTipoLabel(profilo.tipo_ente)}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.visit('/ente/profilo/modifica')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 transition"
                                >
                                    <Edit className="h-4 w-4" /> Modifica Profilo
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2 transition"
                                >
                                    <Trash2 className="h-4 w-4" /> Cancella Profilo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenuto */}
                    <div className="space-y-6">
                        {/* Dati Anagrafici */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                    Dati Anagrafici
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Nome Ente</label>
                                    <p className="text-white font-medium">{profilo.nome_ente}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Tipo Ente</label>
                                    <p className="text-white font-medium">{getTipoLabel(profilo.tipo_ente)}</p>
                                </div>
                                {profilo.codice_fiscale && (
                                    <div>
                                        <label className="text-sm text-slate-400">Codice Fiscale</label>
                                        <p className="text-white font-medium">{profilo.codice_fiscale}</p>
                                    </div>
                                )}
                                {profilo.partita_iva && (
                                    <div>
                                        <label className="text-sm text-slate-400">Partita IVA</label>
                                        <p className="text-white font-medium">{profilo.partita_iva}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Localizzazione */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-400" />
                                    Localizzazione
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Regione</label>
                                    <p className="text-white font-medium">{profilo.regione}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Provincia</label>
                                    <p className="text-white font-medium">{profilo.provincia}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Comune</label>
                                    <p className="text-white font-medium">{profilo.comune}</p>
                                </div>
                                {profilo.indirizzo && (
                                    <div>
                                        <label className="text-sm text-slate-400">Indirizzo</label>
                                        <p className="text-white font-medium">{profilo.indirizzo}</p>
                                    </div>
                                )}
                                {profilo.cap && (
                                    <div>
                                        <label className="text-sm text-slate-400">CAP</label>
                                        <p className="text-white font-medium">{profilo.cap}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preferenze Bandi */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-pink-400" />
                                    Preferenze Bandi
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Categorie di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profilo.categorie_interesse?.map((cat: string) => (
                                            <span key={cat} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                                                {cat}
                                            </span>
                                        ))}
                                        {(!profilo.categorie_interesse || profilo.categorie_interesse.length === 0) && (
                                            <p className="text-slate-500 text-sm">Nessuna categoria selezionata</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Livelli di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profilo.livelli_interesse?.map((livello: string) => (
                                            <span key={livello} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                                                {livello}
                                            </span>
                                        ))}
                                        {(!profilo.livelli_interesse || profilo.livelli_interesse.length === 0) && (
                                            <p className="text-slate-500 text-sm">Nessun livello selezionato</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Fasce di importo</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profilo.importi_interesse?.map((importo: string) => (
                                            <span key={importo} className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                                                {importo}
                                            </span>
                                        ))}
                                        {(!profilo.importi_interesse || profilo.importi_interesse.length === 0) && (
                                            <p className="text-slate-500 text-sm">Nessuna fascia selezionata</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stato profilo */}
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <p className="text-green-400">Profilo completo! Puoi modificarlo in qualsiasi momento.</p>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}