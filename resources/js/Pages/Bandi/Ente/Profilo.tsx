import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, Building2, MapPin, Briefcase, TrendingUp } from 'lucide-react';

export default function Profilo({ profilo }: any) {
    const [form, setForm] = useState({
        nome_ente: profilo?.nome_ente || '',
        tipo_ente: profilo?.tipo_ente || '',
        regione: profilo?.regione || '',
        provincia: profilo?.provincia || '',
        comune: profilo?.comune || '',
        partita_iva: profilo?.partita_iva || '',
        codice_fiscale: profilo?.codice_fiscale || '',
        categorie_preferite: profilo?.categorie_preferite || [],
        livello_preferito: profilo?.livello_preferito || 'comunale',
        importo_preferito: profilo?.importo_preferito || '',
    });

    const [saving, setSaving] = useState(false);

    const tipiEnte = ['Comune', 'Regione', 'ASL', 'Università', 'Scuola', 'Altro'];
    const categorie = [
        { value: 'lavori', label: '🏗️ Lavori' },
        { value: 'forniture', label: '📦 Forniture' },
        { value: 'servizi', label: '💼 Servizi' },
        { value: 'r_s', label: '🔬 Ricerca e Sviluppo' },
    ];
    const livelli = [
        { value: 'comunale', label: 'Comunale' },
        { value: 'regionale', label: 'Regionale' },
        { value: 'nazionale', label: 'Nazionale' },
        { value: 'europeo', label: 'Europeo' },
    ];
    const importi = [
        { value: '<40k', label: 'Meno di €40.000' },
        { value: '40k-150k', label: '€40.000 - €150.000' },
        { value: '150k-1M', label: '€150.000 - €1.000.000' },
        { value: '1M-5M', label: '€1.000.000 - €5.000.000' },
        { value: '>5M', label: 'Oltre €5.000.000' },
    ];

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
                router.visit('/ente/dashboard');
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleCategoria = (categoria: string) => {
        setForm(prev => ({
            ...prev,
            categorie_preferite: prev.categorie_preferite.includes(categoria)
                ? prev.categorie_preferite.filter(c => c !== categoria)
                : [...prev.categorie_preferite, categoria]
        }));
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => router.visit('/bandi')}
                            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
                        >
                            ← Torna indietro
                        </button>
                        <h1 className="text-3xl font-bold text-white">🏛️ Profilo Ente Pubblico</h1>
                        <p className="text-slate-400 mt-2">Configura il profilo del tuo ente per trovare bandi e gare d'appalto</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sezione 1: Dati Ente */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                    <h2 className="text-xl font-semibold text-white">Dati Ente</h2>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome Ente *</label>
                                    <input
                                        type="text"
                                        value={form.nome_ente}
                                        onChange={(e) => setForm({...form, nome_ente: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipo Ente *</label>
                                    <select
                                        value={form.tipo_ente}
                                        onChange={(e) => setForm({...form, tipo_ente: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    >
                                        <option value="">Seleziona...</option>
                                        {tipiEnte.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Partita IVA</label>
                                    <input
                                        type="text"
                                        value={form.partita_iva}
                                        onChange={(e) => setForm({...form, partita_iva: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sezione 2: Localizzazione */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-green-400" />
                                    <h2 className="text-xl font-semibold text-white">Localizzazione</h2>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Regione *</label>
                                    <input
                                        type="text"
                                        value={form.regione}
                                        onChange={(e) => setForm({...form, regione: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Provincia *</label>
                                    <input
                                        type="text"
                                        value={form.provincia}
                                        onChange={(e) => setForm({...form, provincia: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Comune *</label>
                                    <input
                                        type="text"
                                        value={form.comune}
                                        onChange={(e) => setForm({...form, comune: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sezione 3: Preferenze di Ricerca */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-purple-400" />
                                    <h2 className="text-xl font-semibold text-white">Preferenze di Ricerca</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Categorie di interesse</label>
                                    <div className="flex flex-wrap gap-3">
                                        {categorie.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => toggleCategoria(cat.value)}
                                                className={`px-4 py-2 rounded-lg transition ${
                                                    form.categorie_preferite.includes(cat.value)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Livello preferito</label>
                                    <select
                                        value={form.livello_preferito}
                                        onChange={(e) => setForm({...form, livello_preferito: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    >
                                        {livelli.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Importo preferito</label>
                                    <select
                                        value={form.importo_preferito}
                                        onChange={(e) => setForm({...form, importo_preferito: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="">Tutti</option>
                                        {importi.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pulsante Salva */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? 'Salvataggio...' : <><Save className="h-5 w-5" /> Salva Profilo</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}