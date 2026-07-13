import { Loader2, Trash2, User, CalendarClock } from 'lucide-react';

export interface CalendarioTask {
    id: number;
    calendario_evento_id: number;
    titolo: string;
    descrizione: string | null;
    assegnato_a: string | null;
    priorita: 'bassa' | 'media' | 'alta';
    stato: 'da_fare' | 'in_corso' | 'completato';
    scadenza: string | null;
    completato_il: string | null;
}

const PRIORITA_STILE: Record<CalendarioTask['priorita'], string> = {
    alta: 'bg-red-500/20 text-red-400',
    media: 'bg-amber-500/20 text-amber-400',
    bassa: 'bg-slate-600/40 text-slate-300',
};

const STATO_LABEL: Record<CalendarioTask['stato'], string> = {
    da_fare: 'Da fare',
    in_corso: 'In corso',
    completato: 'Completato',
};

export default function TaskCard({
    task, aggiornando, onCambiaStato, onElimina,
}: {
    task: CalendarioTask;
    aggiornando: boolean;
    onCambiaStato: (stato: CalendarioTask['stato']) => void;
    onElimina: () => void;
}) {
    return (
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className={`text-sm font-medium ${task.stato === 'completato' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.titolo}
                    </p>
                    {task.descrizione && <p className="text-xs text-slate-400 mt-0.5">{task.descrizione}</p>}
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITA_STILE[task.priorita]}`}>
                            {task.priorita}
                        </span>
                        {task.assegnato_a && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                <User className="h-3 w-3" /> {task.assegnato_a}
                            </span>
                        )}
                        {task.scadenza && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                <CalendarClock className="h-3 w-3" /> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                            </span>
                        )}
                    </div>
                </div>

                <button onClick={onElimina} title="Elimina task" className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
                {aggiornando ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                    <select
                        value={task.stato}
                        onChange={(e) => onCambiaStato(e.target.value as CalendarioTask['stato'])}
                        className="text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                        {(Object.keys(STATO_LABEL) as CalendarioTask['stato'][]).map((s) => (
                            <option key={s} value={s}>{STATO_LABEL[s]}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}
