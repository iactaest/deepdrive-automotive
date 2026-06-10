import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Building2, MapPin, Briefcase, Heart, ArrowRight, Check, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ProfiloWizard({ profilo }: any) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    
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

    const tipiEnte = [
        { value: 'comune', label: '🏛️ Comune', desc: 'Ente locale territoriale' },
        { value: 'provincia', label: '🗺️ Provincia', desc: 'Ente provinciale' },
        { value: 'regione', label: '🏢 Regione', desc: 'Ente regionale' },
        { value: 'asl', label: '🏥 ASL', desc: 'Azienda Sanitaria Locale' },
        { value: 'universita', label: '🎓 Università', desc: 'Ateneo/Università' },
        { value: 'scuola', label: '📚 Scuola', desc: 'Istituto scolastico' },
        { value: 'altro', label: '⚙️ Altro', desc: 'Altro tipo di ente' },
    ];

    const categorieBandi = [
        { value: 'digitalizzazione', label: '💻 Digitalizzazione', color: 'blue' },
        { value: 'ambiente', label: '🌱 Ambiente', color: 'green' },
        { value: 'formazione', label: '📚 Formazione', color: 'yellow' },
        { value: 'sociale', label: '❤️ Sociale', color: 'red' },
        { value: 'cultura', label: '🎭 Cultura', color: 'purple' },
        { value: 'infrastrutture', label: '🏗️ Infrastrutture', color: 'orange' },
        { value: 'sanita', label: '🏥 Sanità', color: 'teal' },
        { value: 'innovazione', label: '🚀 Innovazione', color: 'cyan' },
    ];

    const livelliBandi = [
        { value: 'comunale', label: '🏛️ Comunale', desc: 'Bandi del comune' },
        { value: 'regionale', label: '🏢 Regionale', desc: 'Bandi della regione' },
        { value: 'nazionale', label: '🇮🇹 Nazionale', desc: 'Bandi nazionali (PNRR, Ministeri)' },
        { value: 'europeo', label: '🇪🇺 Europeo', desc: 'Bandi europei (Horizon, LIFE)' },
    ];

    const importiBandi = [
        { value: '<40k', label: '💰 < €40.000', desc: 'Piccoli progetti' },
        { value: '40k-150k', label: '💰 €40.000 - €150.000', desc: 'Progetti medi' },
        { value: '150k-1M', label: '💰 €150.000 - €1.000.000', desc: 'Grandi progetti' },
        { value: '>1M', label: '💰 > €1.000.000', desc: 'Megaprogetti' },
    ];

    const regioni = [
        'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
        'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
        'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
        'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
    ];

    const toggleArray = (array: string[], value: string) => {
        return array.includes(value)
            ? array.filter(v => v !== value)
            : [...array, value];
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const response = await fetch('/ente/profilo/completa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(form)
            });
            
            if (response.ok) {
                router.visit('/dashboard/ente');
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Profilazione Ente</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Completa il profilo del tuo Ente</h1>
                    <p className="text-slate-400">Step {step} di 3: raccontaci la tua organizzazione</p>
                </div>

                {/* Progress bar */}
                <div className="flex justify-between mb-8 px-4">
                    <div className={`flex-1 h-2 rounded-l-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 rounded-r-full transition-all ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                </div>

                <form onSubmit={handleSubmit}>
                    {/* STEP 1: Dati Anagrafici */}
                    {step === 1 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm animate-fade-in">
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
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                                        placeholder="es. Comune di Roma"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipo Ente *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {tipiEnte.map((tipo) => (
                                            <button
                                                key={tipo.value}
                                                type="button"
                                                onClick={() => setForm({...form, tipo_ente: tipo.value})}
                                                className={`p-3 rounded-lg border transition-all text-left ${
                                                    form.tipo_ente === tipo.value
                                                        ? 'bg-blue-500/20 border-blue-500 text-white'
                                                        : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <div className="font-medium">{tipo.label}</div>
                                                <div className="text-xs text-slate-400">{tipo.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Codice Fiscale</label>
                                        <input
                                            type="text"
                                            value={form.codice_fiscale}
                                            onChange={(e) => setForm({...form, codice_fiscale: e.target.value})}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                                            placeholder="00000000000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Partita IVA</label>
                                        <input
                                            type="text"
                                            value={form.partita_iva}
                                            onChange={(e) => setForm({...form, partita_iva: e.target.value})}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                                            placeholder="00000000000"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition"
                                >
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Localizzazione */}
                    {step === 2 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm animate-fade-in">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-400" />
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
                                        placeholder="es. Roma"
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
                                        placeholder="es. Roma"
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
                            <div className="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2 bg-slate-700 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-slate-600 transition"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition"
                                >
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Preferenze Bandi */}
                    {step === 3 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm animate-fade-in">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-blue-400" />
                                Preferenze Bandi
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Categorie */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Categorie di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categorieBandi.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    categorie_interesse: toggleArray(form.categorie_interesse, cat.value)
                                                })}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    form.categorie_interesse.includes(cat.value)
                                                        ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/50`
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Livelli */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Livelli di interesse</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {livelliBandi.map((livello) => (
                                            <button
                                                key={livello.value}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    livelli_interesse: toggleArray(form.livelli_interesse, livello.value)
                                                })}
                                                className={`p-3 rounded-lg border transition-all text-left ${
                                                    form.livelli_interesse.includes(livello.value)
                                                        ? 'bg-blue-500/20 border-blue-500'
                                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                                }`}
                                            >
                                                <div className="font-medium text-white">{livello.label}</div>
                                                <div className="text-xs text-slate-400">{livello.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Importi */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Fasce di importo</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {importiBandi.map((importo) => (
                                            <button
                                                key={importo.value}
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    importi_interesse: toggleArray(form.importi_interesse, importo.value)
                                                })}
                                                className={`p-3 rounded-lg border transition-all text-left ${
                                                    form.importi_interesse.includes(importo.value)
                                                        ? 'bg-green-500/20 border-green-500'
                                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                                }`}
                                            >
                                                <div className="font-medium text-white">{importo.label}</div>
                                                <div className="text-xs text-slate-400">{importo.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2 bg-slate-700 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-slate-600 transition"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                                >
                                    {saving ? 'Salvataggio...' : <><Check className="h-4 w-4" /> Completa Profilo</>}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}