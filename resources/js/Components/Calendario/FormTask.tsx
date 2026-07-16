import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

export interface MembroGruppo {
    id: number;
    name: string;
}

export interface NuovoTaskInput {
    titolo: string;
    descrizione: string;
    assegnato_user_id: number | null;
    priorita: 'bassa' | 'media' | 'alta';
    scadenza: string;
}

const TASK_SUGGERITI = [
    'Preparare DURC',
    'Delibera di Giunta',
    'Raccolta documenti',
    'Firma digitale RUP',
];

export default function FormTask({
    salvando, membriGruppo, onSubmit,
}: {
    salvando: boolean;
    membriGruppo: MembroGruppo[];
    onSubmit: (input: NuovoTaskInput) => void;
}) {
    const [aperto, setAperto] = useState(false);
    const [titolo, setTitolo] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [assegnatoUserId, setAssegnatoUserId] = useState<string>('');
    const [priorita, setPriorita] = useState<NuovoTaskInput['priorita']>('media');
    const [scadenza, setScadenza] = useState('');

    const reset = () => {
        setTitolo(''); setDescrizione(''); setAssegnatoUserId(''); setPriorita('media'); setScadenza('');
    };

    const submit = () => {
        if (!titolo.trim()) return;
        onSubmit({
            titolo: titolo.trim(),
            descrizione: descrizione.trim(),
            assegnato_user_id: assegnatoUserId ? Number(assegnatoUserId) : null,
            priorita,
            scadenza,
        });
        reset();
        setAperto(false);
    };

    if (!aperto) {
        return (
            <button
                onClick={() => setAperto(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
            >
                <Plus className="h-3.5 w-3.5" /> Aggiungi Task
            </button>
        );
    }

    return (
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 space-y-2">
            <input
                type="text"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                placeholder="Titolo task"
                list="task-suggeriti"
                className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <datalist id="task-suggeriti">
                {TASK_SUGGERITI.map((t) => <option key={t} value={t} />)}
            </datalist>

            <textarea
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={2}
                placeholder="Descrizione (opzionale)"
                className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <div className="grid grid-cols-2 gap-2">
                <select
                    value={assegnatoUserId}
                    onChange={(e) => setAssegnatoUserId(e.target.value)}
                    className="text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                    <option value="">Non assegnato</option>
                    {membriGruppo.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <select
                    value={priorita}
                    onChange={(e) => setPriorita(e.target.value as NuovoTaskInput['priorita'])}
                    className="text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                    <option value="bassa">Priorità bassa</option>
                    <option value="media">Priorità media</option>
                    <option value="alta">Priorità alta</option>
                </select>
            </div>

            <input
                type="date"
                value={scadenza}
                onChange={(e) => setScadenza(e.target.value)}
                className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={submit}
                    disabled={salvando || !titolo.trim()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition"
                >
                    {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salva task'}
                </button>
                <button
                    onClick={() => { reset(); setAperto(false); }}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition"
                >
                    Annulla
                </button>
            </div>
        </div>
    );
}
