import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, CalendarClock } from 'lucide-react';

export interface Milestone {
    id: number;
    titolo: string;
    descrizione: string | null;
    data_prevista: string | null;
    data_completamento: string | null;
    stato: 'da_fare' | 'in_corso' | 'completata';
    percentuale_avanzamento: number;
    ordine: number;
}

const STATO_STILE: Record<Milestone['stato'], string> = {
    da_fare: 'bg-slate-600/40 text-slate-300',
    in_corso: 'bg-blue-500/20 text-blue-400',
    completata: 'bg-emerald-500/20 text-emerald-400',
};

const STATO_LABEL: Record<Milestone['stato'], string> = {
    da_fare: 'Da fare',
    in_corso: 'In corso',
    completata: 'Completata',
};

interface Props {
    milestone: Milestone;
    onCambiaStato: (id: number, stato: Milestone['stato']) => void;
    onCambiaAvanzamento: (id: number, valore: number) => void;
    onElimina: (id: number) => void;
}

export default function MilestoneCard({ milestone: m, onCambiaStato, onCambiaAvanzamento, onElimina }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
            <div className="flex items-start gap-3">
                <button {...attributes} {...listeners} className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
                    <GripVertical className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white font-medium">{m.titolo}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATO_STILE[m.stato]}`}>
                            {STATO_LABEL[m.stato]}
                        </span>
                    </div>
                    {m.descrizione && <p className="text-sm text-slate-400 mt-1">{m.descrizione}</p>}
                    {m.data_prevista && (
                        <p className="inline-flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <CalendarClock className="h-3 w-3" /> Prevista: {new Date(m.data_prevista).toLocaleDateString('it-IT')}
                            {m.data_completamento && ` · Completata: ${new Date(m.data_completamento).toLocaleDateString('it-IT')}`}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${m.percentuale_avanzamento}%` }} />
                        </div>
                        <input
                            type="number" min={0} max={100}
                            value={m.percentuale_avanzamento}
                            onChange={(e) => onCambiaAvanzamento(m.id, Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 bg-slate-900/60 border border-slate-600/60 rounded-lg px-2 py-1 text-xs text-white text-right"
                        />
                        <span className="text-xs text-slate-400">%</span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <select
                            value={m.stato}
                            onChange={(e) => onCambiaStato(m.id, e.target.value as Milestone['stato'])}
                            className="bg-slate-900/60 border border-slate-600/60 rounded-lg px-2 py-1 text-xs text-slate-300"
                        >
                            <option value="da_fare">Da fare</option>
                            <option value="in_corso">In corso</option>
                            <option value="completata">Completata</option>
                        </select>
                        <button
                            onClick={() => onElimina(m.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition ml-auto"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Elimina
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
