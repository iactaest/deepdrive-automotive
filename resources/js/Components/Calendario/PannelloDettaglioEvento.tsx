import { useEffect, useState } from 'react';
import { X, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import TaskCard, { CalendarioTask } from './TaskCard';
import FormTask, { NuovoTaskInput } from './FormTask';

interface BandoInfo {
    id: number;
    titolo: string;
    scadenza: string | null;
    categoria: string | null;
    fonte: string | null;
    descrizione: string | null;
}

interface EventoDettaglio {
    id: number;
    tipo: 'bando' | 'manuale';
    bando_id: number | null;
    titolo: string | null;
    descrizione: string | null;
    note: string | null;
    bando: BandoInfo | null;
    tasks: CalendarioTask[];
    scadenza_effettiva: string | null;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function PannelloDettaglioEvento({
    eventoId, onClose, onCambiato,
}: {
    eventoId: number;
    onClose: () => void;
    onCambiato: () => void;
}) {
    const [evento, setEvento] = useState<EventoDettaglio | null>(null);
    const [caricamento, setCaricamento] = useState(true);
    const [nota, setNota] = useState('');
    const [salvandoNota, setSalvandoNota] = useState(false);
    const [salvandoTask, setSalvandoTask] = useState(false);
    const [taskInAggiornamento, setTaskInAggiornamento] = useState<number | null>(null);
    const [eliminando, setEliminando] = useState(false);

    const carica = () => {
        setCaricamento(true);
        fetch(`/ente/calendario/eventi/${eventoId}`)
            .then((r) => r.json())
            .then((data) => {
                setEvento(data.evento);
                setNota(data.evento.note ?? '');
                setCaricamento(false);
            });
    };

    useEffect(() => { carica(); }, [eventoId]);

    const salvaNota = async () => {
        setSalvandoNota(true);
        await fetch(`/ente/calendario/eventi/${eventoId}/nota`, {
            method: 'PUT',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: nota }),
        });
        setSalvandoNota(false);
        onCambiato();
    };

    const aggiungiTask = async (input: NuovoTaskInput) => {
        setSalvandoTask(true);
        await fetch(`/ente/calendario/eventi/${eventoId}/task`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });
        setSalvandoTask(false);
        carica();
        onCambiato();
    };

    const cambiaStatoTask = async (taskId: number, stato: CalendarioTask['stato']) => {
        setTaskInAggiornamento(taskId);
        await fetch(`/ente/calendario/task/${taskId}/stato`, {
            method: 'PATCH',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ stato }),
        });
        setTaskInAggiornamento(null);
        carica();
        onCambiato();
    };

    const eliminaTask = async (taskId: number) => {
        setTaskInAggiornamento(taskId);
        await fetch(`/ente/calendario/task/${taskId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setTaskInAggiornamento(null);
        carica();
        onCambiato();
    };

    const eliminaEvento = async () => {
        if (!confirm('Eliminare questo evento? Verranno eliminati anche i task collegati.')) return;
        setEliminando(true);
        await fetch(`/ente/calendario/eventi/${eventoId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setEliminando(false);
        onCambiato();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-700/50 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                    <h2 className="text-white font-semibold">Dettaglio evento</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {caricamento || !evento ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                ) : (
                    <div className="p-4 space-y-5">
                        <div>
                            {evento.tipo === 'bando' && evento.bando ? (
                                <>
                                    <a
                                        href={`/ente/lista-bandi/${evento.bando.id}`}
                                        className="text-white font-semibold hover:text-green-400 transition inline-flex items-start gap-1"
                                    >
                                        {evento.bando.titolo}
                                        <ExternalLink className="h-3.5 w-3.5 mt-1 shrink-0" />
                                    </a>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {evento.bando.categoria} {evento.bando.fonte ? `· ${evento.bando.fonte}` : ''}
                                    </p>
                                </>
                            ) : (
                                <p className="text-white font-semibold">{evento.titolo}</p>
                            )}
                            <p className="text-sm text-slate-300 mt-2">
                                Scadenza: <span className="font-medium">
                                    {evento.scadenza_effettiva ? new Date(evento.scadenza_effettiva).toLocaleDateString('it-IT') : '—'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Nota</label>
                            <textarea
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                rows={3}
                                placeholder="Aggiungi una nota..."
                                className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                onClick={salvaNota}
                                disabled={salvandoNota}
                                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-xs font-medium transition"
                            >
                                {salvandoNota ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salva nota'}
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                                Task ({evento.tasks.length})
                            </label>
                            <div className="space-y-2">
                                {evento.tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        aggiornando={taskInAggiornamento === task.id}
                                        onCambiaStato={(stato) => cambiaStatoTask(task.id, stato)}
                                        onElimina={() => eliminaTask(task.id)}
                                    />
                                ))}
                            </div>
                            <div className="mt-2">
                                <FormTask salvando={salvandoTask} onSubmit={aggiungiTask} />
                            </div>
                        </div>

                        <button
                            onClick={eliminaEvento}
                            disabled={eliminando}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 text-red-400 text-xs font-medium transition"
                        >
                            {eliminando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            Elimina evento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
