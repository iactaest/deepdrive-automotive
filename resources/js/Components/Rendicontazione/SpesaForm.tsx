import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Loader2 } from 'lucide-react';

export const CATEGORIE_SPESA: { value: string; label: string }[] = [
    { value: 'personale_interno', label: 'Personale interno' },
    { value: 'consulenze_esterne', label: 'Consulenze esterne' },
    { value: 'attrezzature', label: 'Attrezzature' },
    { value: 'materiali_forniture', label: 'Materiali e forniture' },
    { value: 'servizi_informatici', label: 'Servizi informatici' },
    { value: 'comunicazione', label: 'Comunicazione' },
    { value: 'spese_generali', label: 'Spese generali' },
    { value: 'missioni_trasferte', label: 'Missioni e trasferte' },
    { value: 'formazione', label: 'Formazione' },
];

interface Props {
    rendicontazioneId: number;
}

const FORM_VUOTO = {
    categoria: CATEGORIE_SPESA[0].value,
    descrizione: '',
    importo: '',
    data_spesa: '',
    fornitore: '',
    numero_fattura: '',
};

export default function SpesaForm({ rendicontazioneId }: Props) {
    const [aperto, setAperto] = useState(false);
    const [form, setForm] = useState(FORM_VUOTO);
    const [errori, setErrori] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    const submit = () => {
        setSalvando(true);
        setErrori({});
        router.post(`/ente/rendicontazione/${rendicontazioneId}/spese`, form, {
            preserveScroll: true,
            onSuccess: () => { setForm(FORM_VUOTO); setAperto(false); },
            onError: (e) => setErrori(e as Record<string, string>),
            onFinish: () => setSalvando(false),
        });
    };

    if (!aperto) {
        return (
            <button
                onClick={() => setAperto(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium transition"
            >
                <Plus className="h-4 w-4" /> Aggiungi spesa
            </button>
        );
    }

    return (
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Categoria</label>
                    <select
                        value={form.categoria}
                        onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                        className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        {CATEGORIE_SPESA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Importo (€)</label>
                    <input
                        type="number" min="0" step="0.01"
                        value={form.importo}
                        onChange={(e) => setForm(f => ({ ...f, importo: e.target.value }))}
                        className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    {errori.importo && <p className="text-xs text-red-400 mt-1">{errori.importo}</p>}
                </div>
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">Descrizione</label>
                <input
                    type="text"
                    value={form.descrizione}
                    onChange={(e) => setForm(f => ({ ...f, descrizione: e.target.value }))}
                    className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                />
                {errori.descrizione && <p className="text-xs text-red-400 mt-1">{errori.descrizione}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Data spesa</label>
                    <input
                        type="date"
                        value={form.data_spesa}
                        onChange={(e) => setForm(f => ({ ...f, data_spesa: e.target.value }))}
                        className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    {errori.data_spesa && <p className="text-xs text-red-400 mt-1">{errori.data_spesa}</p>}
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Fornitore</label>
                    <input
                        type="text"
                        value={form.fornitore}
                        onChange={(e) => setForm(f => ({ ...f, fornitore: e.target.value }))}
                        className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">N. fattura</label>
                    <input
                        type="text"
                        value={form.numero_fattura}
                        onChange={(e) => setForm(f => ({ ...f, numero_fattura: e.target.value }))}
                        className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    onClick={() => { setAperto(false); setForm(FORM_VUOTO); setErrori({}); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/60 transition"
                >
                    Annulla
                </button>
                <button
                    onClick={submit}
                    disabled={salvando}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-lg text-white text-sm font-medium transition"
                >
                    {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salva spesa
                </button>
            </div>
        </div>
    );
}
