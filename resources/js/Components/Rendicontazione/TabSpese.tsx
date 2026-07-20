import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2, Paperclip, Download, AlertTriangle } from 'lucide-react';
import BadgeAmmissibile from './BadgeAmmissibile';
import SpesaForm, { CATEGORIE_SPESA } from './SpesaForm';

export interface Spesa {
    id: number;
    categoria: string;
    descrizione: string;
    importo: string;
    data_spesa: string;
    fornitore: string | null;
    numero_fattura: string | null;
    ammissibile: boolean | null;
    allegato_path: string | null;
    richiede_gara: boolean;
}

interface Props {
    rendicontazioneId: number;
    spese: Spesa[];
}

const formatEuro = (v: string | number) => `€${Number(v).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
const labelCategoria = (v: string) => CATEGORIE_SPESA.find(c => c.value === v)?.label ?? v;

export default function TabSpese({ rendicontazioneId, spese }: Props) {
    const [uploadInCorso, setUploadInCorso] = useState<number | null>(null);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const cambiaAmmissibile = (spesaId: number, valore: string) => {
        const ammissibile = valore === 'null' ? null : valore === 'true';
        router.put(`/ente/rendicontazione/${rendicontazioneId}/spese/${spesaId}`, { ammissibile }, { preserveScroll: true });
    };

    const eliminaSpesa = (spesaId: number) => {
        if (!confirm('Eliminare questa spesa?')) return;
        router.delete(`/ente/rendicontazione/${rendicontazioneId}/spese/${spesaId}`, { preserveScroll: true });
    };

    const caricaAllegato = (spesaId: number, file: File) => {
        setUploadInCorso(spesaId);
        const form = new FormData();
        form.append('file', file);
        router.post(`/ente/rendicontazione/${rendicontazioneId}/spese/${spesaId}/upload`, form, {
            preserveScroll: true,
            onFinish: () => setUploadInCorso(null),
        });
    };

    const totale = spese.reduce((s, sp) => s + Number(sp.importo), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    {spese.length} spes{spese.length === 1 ? 'a' : 'e'} · totale {formatEuro(totale)}
                </p>
                <SpesaForm rendicontazioneId={rendicontazioneId} />
            </div>

            {spese.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 p-8 border border-slate-700/50 text-center text-slate-400">
                    Nessuna spesa registrata.
                </div>
            ) : (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 divide-y divide-slate-700/50">
                    {spese.map((s) => (
                        <div key={s.id} className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-medium">{s.descrizione}</span>
                                        {s.richiede_gara && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                                                <AlertTriangle className="h-3 w-3" /> Richiede gara pubblica
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {labelCategoria(s.categoria)} · {new Date(s.data_spesa).toLocaleDateString('it-IT')}
                                        {s.fornitore && ` · ${s.fornitore}`}
                                        {s.numero_fattura && ` · fatt. ${s.numero_fattura}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-white font-semibold">{formatEuro(s.importo)}</span>
                                    <BadgeAmmissibile ammissibile={s.ammissibile} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <select
                                    value={s.ammissibile === null ? 'null' : String(s.ammissibile)}
                                    onChange={(e) => cambiaAmmissibile(s.id, e.target.value)}
                                    className="bg-slate-900/60 border border-slate-600/60 rounded-lg px-2 py-1 text-xs text-slate-300"
                                >
                                    <option value="null">Da verificare</option>
                                    <option value="true">Ammissibile</option>
                                    <option value="false">Non ammissibile</option>
                                </select>

                                <input
                                    type="file"
                                    className="hidden"
                                    ref={(el) => { fileInputRefs.current[s.id] = el; }}
                                    onChange={(e) => e.target.files?.[0] && caricaAllegato(s.id, e.target.files[0])}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[s.id]?.click()}
                                    disabled={uploadInCorso === s.id}
                                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
                                >
                                    <Paperclip className="h-3.5 w-3.5" /> {uploadInCorso === s.id ? 'Caricamento...' : 'Allegato'}
                                </button>

                                {s.allegato_path && (
                                    <a
                                        href={`/ente/rendicontazione/${rendicontazioneId}/spese/${s.id}/download`}
                                        className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition"
                                    >
                                        <Download className="h-3.5 w-3.5" /> Scarica
                                    </a>
                                )}

                                <button
                                    onClick={() => eliminaSpesa(s.id)}
                                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition ml-auto"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Elimina
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
