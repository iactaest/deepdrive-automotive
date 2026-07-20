import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FileBarChart, Download, Loader2 } from 'lucide-react';

export interface Report {
    id: number;
    tipo: 'intermedio' | 'finale';
    periodo_da: string;
    periodo_a: string;
    totale_spese: string;
    spese_ammissibili: string;
    spese_non_ammissibili: string;
    percentuale_avanzamento: number;
    generato_at: string;
}

interface Props {
    rendicontazioneId: number;
    report: Report[];
    dataInizio: string;
    dataFine: string;
}

const formatEuro = (v: string | number) => `€${Number(v).toLocaleString('it-IT', { maximumFractionDigits: 0 })}`;

export default function TabReport({ rendicontazioneId, report, dataInizio, dataFine }: Props) {
    const [form, setForm] = useState({
        tipo: 'intermedio' as 'intermedio' | 'finale',
        periodo_da: dataInizio.slice(0, 10),
        periodo_a: dataFine.slice(0, 10),
    });
    const [errori, setErrori] = useState<Record<string, string>>({});
    const [generando, setGenerando] = useState(false);

    const genera = () => {
        setGenerando(true);
        setErrori({});
        router.post(`/ente/rendicontazione/${rendicontazioneId}/report`, form, {
            preserveScroll: true,
            onError: (e) => setErrori(e as Record<string, string>),
            onFinish: () => setGenerando(false),
        });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Genera nuovo report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                        <select
                            value={form.tipo}
                            onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as 'intermedio' | 'finale' }))}
                            className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="intermedio">Intermedio</option>
                            <option value="finale">Finale</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Periodo da</label>
                        <input
                            type="date"
                            value={form.periodo_da}
                            onChange={(e) => setForm(f => ({ ...f, periodo_da: e.target.value }))}
                            className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        {errori.periodo_da && <p className="text-xs text-red-400 mt-1">{errori.periodo_da}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Periodo a</label>
                        <input
                            type="date"
                            value={form.periodo_a}
                            onChange={(e) => setForm(f => ({ ...f, periodo_a: e.target.value }))}
                            className="w-full bg-slate-900/60 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        {errori.periodo_a && <p className="text-xs text-red-400 mt-1">{errori.periodo_a}</p>}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={genera}
                        disabled={generando}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-lg text-white text-sm font-medium transition"
                    >
                        {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBarChart className="h-4 w-4" />}
                        Genera report PDF
                    </button>
                </div>
            </div>

            {report.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 p-8 border border-slate-700/50 text-center text-slate-400">
                    Nessun report generato finora.
                </div>
            ) : (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 divide-y divide-slate-700/50">
                    {report.map((r) => (
                        <div key={r.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-white font-medium">
                                    Report {r.tipo === 'finale' ? 'Finale' : 'Intermedio'}
                                    <span className="text-xs text-slate-500 ml-2">
                                        {new Date(r.periodo_da).toLocaleDateString('it-IT')} — {new Date(r.periodo_a).toLocaleDateString('it-IT')}
                                    </span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Totale {formatEuro(r.totale_spese)} · Ammissibili {formatEuro(r.spese_ammissibili)} · Avanzamento {r.percentuale_avanzamento}%
                                    · generato il {new Date(r.generato_at).toLocaleDateString('it-IT')}
                                </p>
                            </div>
                            <a
                                href={`/ente/rendicontazione/${rendicontazioneId}/report/${r.id}/download`}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-xs font-medium transition"
                            >
                                <Download className="h-3.5 w-3.5" /> Scarica PDF
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
