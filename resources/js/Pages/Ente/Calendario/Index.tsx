import { useEffect, useState } from 'react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { CalendarDays, Plus, X, Loader2, AlarmClock } from 'lucide-react';
import CalendarioView, { EventoCalendario, EventoGiorno } from '@/Components/Calendario/CalendarioView';
import PannelloDettaglioEvento from '@/Components/Calendario/PannelloDettaglioEvento';
import PannelloGiorno from '@/Components/Calendario/PannelloGiorno';

const GIORNI_FINESTRA_PROSSIME_SCADENZE = 180; // 6 mesi

function calcolaProssimeScadenze(eventi: EventoCalendario[]) {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const limite = new Date(oggi);
    limite.setDate(limite.getDate() + GIORNI_FINESTRA_PROSSIME_SCADENZE);

    return eventi
        .filter((e) => e.extendedProps.kind === 'evento' && e.start)
        .filter((e) => {
            const data = new Date(e.start + 'T00:00:00');
            return data >= oggi && data <= limite;
        })
        .sort((a, b) => a.start.localeCompare(b.start));
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

function NuovoEventoModal({ dataIniziale, onClose, onCreato }: { dataIniziale?: string; onClose: () => void; onCreato: () => void }) {
    const [titolo, setTitolo] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [dataScadenza, setDataScadenza] = useState(dataIniziale ?? '');
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
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
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
    const [eventi, setEventi] = useState<EventoCalendario[]>([]);
    const [eventoSelezionatoId, setEventoSelezionatoId] = useState<number | null>(null);
    const [giornoSelezionato, setGiornoSelezionato] = useState<{ data: string; eventi: EventoGiorno[] } | null>(null);
    const [nuovoEventoData, setNuovoEventoData] = useState<string | null>(null);
    const [modaleAperto, setModaleAperto] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetch('/ente/calendario/eventi')
            .then((r) => r.json())
            .then(setEventi);
    }, [refreshKey]);

    const aggiorna = () => setRefreshKey((k) => k + 1);
    const prossimeScadenze = calcolaProssimeScadenze(eventi);

    const handleGiornoClick = (data: string, eventi: EventoGiorno[]) => {
        if (eventi.length === 0) {
            setNuovoEventoData(data);
            setModaleAperto(true);
        } else if (eventi.length === 1) {
            setEventoSelezionatoId(eventi[0].eventoId);
        } else {
            setGiornoSelezionato({ data, eventi });
        }
    };

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
                            Scadenze dei bandi salvati e in match, con task interni collegati. Clicca su un giorno per il dettaglio.
                        </p>
                    </div>
                    <button
                        onClick={() => { setNuovoEventoData(null); setModaleAperto(true); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-sm font-medium shadow-lg shadow-green-500/20 transition"
                    >
                        <Plus className="h-4 w-4" /> Nuovo evento
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" /> Scadenza bando</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.7)]" /> Evento manuale</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.7)]" /> Task in scadenza</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]" /> Task completato</span>
                </div>

                {prossimeScadenze.length > 0 && (
                    <div>
                        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                            <AlarmClock className="h-3.5 w-3.5" /> Prossime scadenze (entro 6 mesi)
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {prossimeScadenze.map((e) => (
                                <button
                                    key={e.id}
                                    onClick={() => setEventoSelezionatoId(e.extendedProps.evento_id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs transition"
                                >
                                    <span className="text-amber-300 font-medium truncate max-w-[220px]">{e.title}</span>
                                    <span className="text-amber-500/80 shrink-0">
                                        {new Date(e.start + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <CalendarioView eventi={eventi} onEventoClick={setEventoSelezionatoId} onGiornoClick={handleGiornoClick} />

                {eventoSelezionatoId && (
                    <PannelloDettaglioEvento
                        eventoId={eventoSelezionatoId}
                        onClose={() => setEventoSelezionatoId(null)}
                        onCambiato={aggiorna}
                    />
                )}

                {giornoSelezionato && (
                    <PannelloGiorno
                        data={giornoSelezionato.data}
                        eventi={giornoSelezionato.eventi}
                        onSeleziona={(eventoId) => { setGiornoSelezionato(null); setEventoSelezionatoId(eventoId); }}
                        onClose={() => setGiornoSelezionato(null)}
                    />
                )}

                {modaleAperto && (
                    <NuovoEventoModal
                        dataIniziale={nuovoEventoData ?? undefined}
                        onClose={() => setModaleAperto(false)}
                        onCreato={aggiorna}
                    />
                )}
            </div>
        </LayoutEnte>
    );
}
