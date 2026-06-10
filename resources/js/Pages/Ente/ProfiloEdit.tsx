import { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Building2, MapPin, Heart, Save, ArrowLeft } from 'lucide-react';

export default function ProfiloEdit({ profilo }: any) {
    const [form, setForm] = useState({
        nome_ente: profilo?.nome_ente || '',
        tipo_ente: profilo?.tipo_ente || 'comune',
        codice_fiscale: profilo?.codice_fiscale || '',
        partita_iva: profilo?.partita_iva || '',
        regione: profilo?.regione || '',
        provincia: profilo?.provincia || '',
        comune: profilo?.comune || '',
        indirizzo: profilo?.indirizzo || '',
        cap: profilo?.cap || '',
        categorie_interesse: profilo?.categorie_interesse || [],
        livelli_interesse: profilo?.livelli_interesse || [],
        importi_interesse: profilo?.importi_interesse || [],
    });

    const [saving, setSaving] = useState(false);

    const tipiEnte = [
        { value: 'comune', label: '🏛️ Comune' },
        { value: 'provincia', label: '🗺️ Provincia' },
        { value: 'regione', label: '🏢 Regione' },
        { value: 'asl', label: '🏥 ASL' },
        { value: 'universita', label: '🎓 Università' },
        { value: 'scuola', label: '📚 Scuola' },
        { value: 'altro', label: '⚙️ Altro' },
    ];

    const categorieBandi = [
        'digitalizzazione', 'ambiente', 'formazione', 'sociale',
        'cultura', 'infrastrutture', 'sanita', 'innovazione'
    ];

    const livelliBandi = ['comunale', 'regionale', 'nazionale', 'europeo'];
    const importiBandi = ['<40k', '40k-150k', '150k-1M', '>1M'];

    const regioni = [
        'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
        'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
        'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
        'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
    ];

    const toggleArray = (array: string[], value: string) => {
        return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const response = await fetch('/ente/profilo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(form)
            });
            
            if (response.ok) {
                router.visit('/ente/profilo');
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-8">
                        <button 
                            onClick={() => router.visit('/ente/profilo')}
                            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Torna al Profilo
                        </button>
                        <h1 className="text-3xl font-bold text-white">✏️ Modifica Profilo Ente</h1>
                        <p className="text-slate-400 mt-2">Aggiorna i dati del tuo ente</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dati Anagrafici */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-400" />
                                Dati Anagrafici
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome Ente *</label>
                                    <input
                                        type="text"
                                        value={form.nome_ente}
                                        onChange={(e) => setForm({...form, nome_ente: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipo Ente *</label>
                                    <select
                                        value={form.tipo_ente}
                                        onChange={(e) => setForm({...form, tipo_ente: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    >
                                        {tipiEnte.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Codice Fiscale</label>
                                        <input
                                            type="text"
                                            value={form.codice_fiscale}
                                            onChange={(e) => setForm({...form, codice_fiscale: e.target.value})}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Partita IVA</label>
                                        <input
                                            type="text"
                                            value={form.partita_iva}
                                            onChange={(e) => setForm({...form, partita_iva: e.target.value})}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Localizzazione */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-400" />
                                Localizzazione
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Regione *</label>
                                    <select
                                        value={form.regione}
                                        onChange={(e) => setForm({...form, regione: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    >
                                        <option value="">Seleziona regione...</option>
                                        {regioni.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Provincia *</label>
                                    <input
                                        type="text"
                                        value={form.provincia}
                                        onChange={(e) => setForm({...form, provincia: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Comune *</label>
                                    <input
                                        type="text"
                                        value={form.comune}
                                        onChange={(e) => setForm({...form, comune: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">CAP</label>
                                    <input
                                        type="text"
                                        value={form.cap}
                                        onChange={(e) => setForm({...form, cap: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        placeholder="00100"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Indirizzo</label>
                                    <input
                                        type="text"
                                        value={form.indirizzo}
                                        onChange={(e) => setForm({...form, indirizzo: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        placeholder="Via Roma 1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preferenze */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-pink-400" />
                                Preferenze Bandi
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Categorie di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categorieBandi.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    categorie_interesse: toggleArray(form.categorie_interesse, cat)
                                                })}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    form.categorie_interesse.includes(cat)
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Livelli di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {livelliBandi.map((livello) => (
                                            <button
                                                key={livello}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    livelli_interesse: toggleArray(form.livelli_interesse, livello)
                                                })}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    form.livelli_interesse.includes(livello)
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {livello}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Fasce di importo</label>
                                    <div className="flex flex-wrap gap-2">
                                        {importiBandi.map((importo) => (
                                            <button
                                                key={importo}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    importi_interesse: toggleArray(form.importi_interesse, importo)
                                                })}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    form.importi_interesse.includes(importo)
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {importo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                            >
                                {saving ? 'Salvataggio...' : <><Save className="h-4 w-4" /> Salva Modifiche</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </LayoutEnte>
    );
}