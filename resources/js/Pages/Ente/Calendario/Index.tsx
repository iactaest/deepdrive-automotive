import { useState } from 'react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { CalendarDays, Plus, X, Loader2 } from 'lucide-react';
import CalendarioView from '@/Components/Calendario/CalendarioView';
import PannelloDettaglioEvento from '@/Components/Calendario/PannelloDettaglioEvento';

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

function NuovoEventoModal({ onClose, onCreato }: { onClose: () => void; onCreato: () => void }) {
    const [titolo, setTitolo] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [dataScadenza, setDataScadenza] = useState('');
    const [salvando, setSalvando] = useState(false);

    const salva = async () => {
        if (!titolo.trim() || !dataScadenza) return;
        setSalvando(true);
        await fetch('/ente/calendario/eventi', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ titolo: titolo.trim(), descrizione: descrizione.trim(), data_scadenza: dataScadenza }),
        });
        setSalvando(false);
        onCreato();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Nuovo evento</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={titolo}
                        onChange={(e) => setTitolo(e.target.value)}
                        placeholder="Titolo"
                        className="w-full text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <textarea
                        value={descrizione}
                        onChange={(e) => setDescrizione(e.target.value)}
                        rows={2}
                        placeholder="Descrizione (opzionale)"
                        className="w-full text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                        type="date"
                        value={dataScadenza}
                        onChange={(e) => setDataScadenza(e.target.value)}
                        className="w-full text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                        onClick={salva}
                        disabled={salvando || !titolo.trim() || !dataScadenza}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-medium transition"
                    >
                        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crea evento'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CalendarioIndex() {
    const [eventoSelezionatoId, setEventoSelezionatoId] = useState<number | null>(null);
    const [modaleAperto, setModaleAperto] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const aggiorna = () => setRefreshKey((k) => k + 1);

    return (
        <LayoutEnte>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-green-400" />
                            Calendario Scadenze
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Scadenze dei bandi salvati e in match, con task interni collegati.
                        </p>
                    </div>
                    <button
                        onClick={() => setModaleAperto(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition"
                    >
                        <Plus className="h-4 w-4" /> Nuovo evento
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Scadenza bando</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Evento manuale</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Task in scadenza</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Task completato</span>
                </div>

                <CalendarioView key={refreshKey} onEventoClick={setEventoSelezionatoId} />

                {eventoSelezionatoId && (
                    <PannelloDettaglioEvento
                        eventoId={eventoSelezionatoId}
                        onClose={() => setEventoSelezionatoId(null)}
                        onCambiato={aggiorna}
                    />
                )}

                {modaleAperto && (
                    <NuovoEventoModal onClose={() => setModaleAperto(false)} onCreato={aggiorna} />
                )}
            </div>
        </LayoutEnte>
    );
}
