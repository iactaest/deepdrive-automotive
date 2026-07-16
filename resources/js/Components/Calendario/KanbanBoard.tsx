import { useEffect, useState } from 'react';
import {
    DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners,
    PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { GripVertical, User, CalendarClock } from 'lucide-react';

interface KanbanTask {
    id: number;
    titolo: string;
    descrizione: string | null;
    priorita: 'bassa' | 'media' | 'alta';
    stato: 'da_fare' | 'in_corso' | 'completato';
    scadenza: string | null;
    ordine: number;
    assegnato_utente: { id: number; name: string } | null;
    evento_titolo: string | null;
}

const COLONNE: { stato: KanbanTask['stato']; label: string }[] = [
    { stato: 'da_fare', label: 'Da fare' },
    { stato: 'in_corso', label: 'In corso' },
    { stato: 'completato', label: 'Completato' },
];

const PRIORITA_STILE: Record<KanbanTask['priorita'], string> = {
    alta: 'bg-red-500/20 text-red-400',
    media: 'bg-amber-500/20 text-amber-400',
    bassa: 'bg-slate-600/40 text-slate-300',
};

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

function KanbanCard({ task }: { task: KanbanTask }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
        >
            <div className="flex items-start gap-2">
                <button {...attributes} {...listeners} className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium">{task.titolo}</p>
                    {task.evento_titolo && <p className="text-[10px] text-slate-500 truncate mt-0.5">{task.evento_titolo}</p>}
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITA_STILE[task.priorita]}`}>
                            {task.priorita}
                        </span>
                        {task.assegnato_utente && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                <User className="h-3 w-3" /> {task.assegnato_utente.name}
                            </span>
                        )}
                        {task.scadenza && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                <CalendarClock className="h-3 w-3" /> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Colonna({ stato, label, task }: { stato: KanbanTask['stato']; label: string; task: KanbanTask[] }) {
    const { setNodeRef } = useDroppable({ id: stato });

    return (
        <div className="flex-1 min-w-[260px]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">{label} ({task.length})</h3>
            <div ref={setNodeRef} className="space-y-2 min-h-[80px] rounded-xl bg-slate-800/30 border border-slate-700/40 p-2">
                <SortableContext items={task.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {task.map((t) => <KanbanCard key={t.id} task={t} />)}
                </SortableContext>
            </div>
        </div>
    );
}

export default function KanbanBoard() {
    const [task, setTask] = useState<KanbanTask[]>([]);
    const [caricamento, setCaricamento] = useState(true);
    const [attivo, setAttivo] = useState<KanbanTask | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const carica = () => {
        fetch('/ente/calendario/task')
            .then((r) => r.json())
            .then((data) => { setTask(data); setCaricamento(false); });
    };

    useEffect(() => { carica(); }, []);

    const colonneTask = (stato: KanbanTask['stato']) =>
        task.filter((t) => t.stato === stato).sort((a, b) => a.ordine - b.ordine);

    const trovaColonna = (id: number | string): KanbanTask['stato'] | null => {
        if (COLONNE.some((c) => c.stato === id)) return id as KanbanTask['stato'];
        return task.find((t) => t.id === id)?.stato ?? null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setAttivo(task.find((t) => t.id === event.active.id) ?? null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setAttivo(null);
        const { active, over } = event;
        if (!over) return;

        const colonnaOrigine = trovaColonna(active.id);
        const colonnaDestinazione = trovaColonna(over.id);
        if (!colonnaOrigine || !colonnaDestinazione) return;

        const taskId = Number(active.id);

        if (colonnaOrigine !== colonnaDestinazione) {
            // spostato in un'altra colonna: cambia stato (riusa endpoint esistente)
            setTask((prev) => prev.map((t) => (t.id === taskId ? { ...t, stato: colonnaDestinazione } : t)));

            await fetch(`/ente/calendario/task/${taskId}/stato`, {
                method: 'PATCH',
                headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ stato: colonnaDestinazione }),
            });
            carica();
        } else if (active.id !== over.id) {
            // riordino dentro la stessa colonna
            const colonnaTaskList = colonneTask(colonnaOrigine);
            const oldIndex = colonnaTaskList.findIndex((t) => t.id === active.id);
            const newIndex = colonnaTaskList.findIndex((t) => t.id === over.id);
            const riordinati = arrayMove(colonnaTaskList, oldIndex, newIndex);

            setTask((prev) => {
                const altri = prev.filter((t) => t.stato !== colonnaOrigine);
                return [...altri, ...riordinati.map((t, i) => ({ ...t, ordine: i }))];
            });

            await fetch(`/ente/calendario/task/${taskId}/ordine`, {
                method: 'PATCH',
                headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ordine: newIndex }),
            });
        }
    };

    if (caricamento) return <p className="text-sm text-slate-400">Caricamento...</p>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {COLONNE.map((c) => (
                    <Colonna key={c.stato} stato={c.stato} label={c.label} task={colonneTask(c.stato)} />
                ))}
            </div>
            <DragOverlay>
                {attivo ? <KanbanCard task={attivo} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
