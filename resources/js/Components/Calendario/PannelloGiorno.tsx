import { X } from 'lucide-react';
import { EventoGiorno } from './CalendarioView';

export default function PannelloGiorno({
    data, eventi, onSeleziona, onClose,
}: {
    data: string;
    eventi: EventoGiorno[];
    onSeleziona: (eventoId: number) => void;
    onClose: () => void;
}) {
    const dataFormattata = new Date(data + 'T00:00:00').toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold capitalize">{dataFormattata}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2">
                    {eventi.map((e) => (
                        <button
                            key={`${e.kind}-${e.eventoId}-${e.title}`}
                            onClick={() => onSeleziona(e.eventoId)}
                            className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 transition"
                        >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                            <span className="text-sm text-slate-200 truncate">{e.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
