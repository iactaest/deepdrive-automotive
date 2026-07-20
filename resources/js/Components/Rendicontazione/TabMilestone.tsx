import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Loader2 } from 'lucide-react';
import MilestoneCard, { Milestone } from './MilestoneCard';

interface Props {
    rendicontazioneId: number;
    milestone: Milestone[];
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const FORM_VUOTO = { titolo: '', descrizione: '', data_prevista: '' };

export default function TabMilestone({ rendicontazioneId, milestone }: Props) {
    const [lista, setLista] = useState<Milestone[]>(milestone);
    const [aperto, setAperto] = useState(false);
    const [form, setForm] = useState(FORM_VUOTO);
    const [errori, setErrori] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    useEffect(() => { setLista(milestone); }, [milestone]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = lista.findIndex((m) => m.id === active.id);
        const newIndex = lista.findIndex((m) => m.id === over.id);
        const riordinati = arrayMove(lista, oldIndex, newIndex).map((m, i) => ({ ...m, ordine: i }));
        setLista(riordinati);

        await fetch(`/ente/rendicontazione/${rendicontazioneId}/milestone/${active.id}/ordine`, {
            method: 'PATCH',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ordine: newIndex }),
        });
    };

    const cambiaStato = (id: number, stato: Milestone['stato']) => {
        setLista((prev) => prev.map((m) => (m.id === id ? { ...m, stato } : m)));
        router.put(`/ente/rendicontazione/${rendicontazioneId}/milestone/${id}`, {
            stato,
            ...(stato === 'completata' ? { percentuale_avanzamento: 100, data_completamento: new Date().toISOString().slice(0, 10) } : {}),
        }, { preserveScroll: true, preserveState: true });
    };

    const cambiaAvanzamento = (id: number, valore: number) => {
        setLista((prev) => prev.map((m) => (m.id === id ? { ...m, percentuale_avanzamento: valore } : m)));
        router.put(`/ente/rendicontazione/${rendicontazioneId}/milestone/${id}`, { percentuale_avanzamento: valore }, { preserveScroll: true, preserveState: true });
    };

    const eliminaMilestone = (id: number) => {
        if (!confirm('Eliminare questa milestone?')) return;
        setLista((prev) => prev.filter((m) => m.id !== id));
        router.delete(`/ente/rendicontazione/${rendicontazioneId}/milestone/${id}`, { preserveScroll: true });
    };

    const submit = () => {
        setSalvando(true);
        setErrori({});
        router.post(`/ente/rendicontazione/${rendicontazioneId}/milestone`, form, {
            preserveScroll: true,
            onSuccess: () => { setForm(FORM_VUOTO); setAperto(false); },
            onError: (e) => setErrori(e as Record<string, string>),
            onFinish: () => setSalvando(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{lista.length} milestone</p>
                {!aperto && (
                    <button
                        onClick={() => setAperto(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium transition"
                    >
                        <Plus className="h-4 w-4" /> Aggiungi milestone
                    </button>
                )}
            </div>

            {aperto && (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5 space-y-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Titolo</label>
                        <input
                            type="text"
                            value={form.titolo}
                            onChange={(e) => setForm(f => ({ ...f, titolo: e.target.value }))}
                            className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        {errori.titolo && <p className="text-xs text-red-400 mt-1">{errori.titolo}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Descrizione</label>
                        <textarea
                            value={form.descrizione}
                            onChange={(e) => setForm(f => ({ ...f, descrizione: e.target.value }))}
                            className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Data prevista</label>
                        <input
                            type="date"
                            value={form.data_prevista}
                            onChange={(e) => setForm(f => ({ ...f, data_prevista: e.target.value }))}
                            className="w-full max-w-xs bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                        />
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
                            Salva milestone
                        </button>
                    </div>
                </div>
            )}

            {lista.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 p-8 border border-slate-700/50 text-center text-slate-400">
                    Nessuna milestone definita.
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={lista.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {lista.map((m) => (
                                <MilestoneCard
                                    key={m.id}
                                    milestone={m}
                                    onCambiaStato={cambiaStato}
                                    onCambiaAvanzamento={cambiaAvanzamento}
                                    onElimina={eliminaMilestone}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
