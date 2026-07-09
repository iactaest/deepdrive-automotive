import { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Archive, CheckCircle2, Circle, Upload, Download, X, Loader2, ExternalLink } from 'lucide-react';

interface DocumentoBando {
    id: number;
    nome_documento: string;
    descrizione: string | null;
    link_ufficiale: string | null;
    obbligatorio: boolean;
    categoria: 'basilare' | 'specifico';
    stato: 'da_caricare' | 'caricato';
    path_file: string | null;
}

interface Props {
    bando: { id: number; titolo: string };
    documenti: DocumentoBando[];
    totale: number;
    caricati: number;
    completamento: number;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function CassettoBando({ bando, documenti: documentiIniziali, totale, caricati, completamento }: Props) {
    const [documenti, setDocumenti] = useState(documentiIniziali);
    const [uploadInCorso, setUploadInCorso] = useState<number | null>(null);

    const ricarica = () => router.reload({ only: ['documenti', 'totale', 'caricati', 'completamento'] });

    const caricaFile = async (documentoId: number, file: File) => {
        setUploadInCorso(documentoId);
        const form = new FormData();
        form.append('documento_id', String(documentoId));
        form.append('file', file);
        await fetch(`/bandi/${bando.id}/documenti`, {
            method: 'POST',
            body: form,
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setUploadInCorso(null);
        ricarica();
    };

    const rimuoviFile = async (documentoId: number) => {
        setUploadInCorso(documentoId);
        await fetch(`/bandi/${bando.id}/documenti/${documentoId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setUploadInCorso(null);
        ricarica();
    };

    const documentiBasilari = documenti.filter(d => d.categoria === 'basilare');
    const documentiSpecifici = documenti.filter(d => d.categoria === 'specifico');

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <button
                            onClick={() => router.get(`/ente/lista-bandi/${bando.id}`)}
                            className="text-blue-400 hover:text-blue-300 transition text-sm"
                        >
                            ← Torna al bando
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                                <Archive className="h-6 w-6 text-purple-400" />
                                Cassetto Documenti
                            </h1>
                            <p className="text-sm text-slate-400">{bando.titolo}</p>
                        </div>

                        {/* Barra completamento */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all" style={{ width: `${completamento}%` }} />
                            </div>
                            <span className="text-sm text-slate-300 font-medium shrink-0">
                                {caricati}/{totale} documenti caricati ({completamento}%)
                            </span>
                        </div>

                        {totale === 0 ? (
                            <p className="text-sm text-slate-400">
                                Nessun documento ancora proposto. Vai al dettaglio del bando e avvia l'Assistente AI.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {documentiBasilari.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti basilari</h3>
                                        <div className="space-y-2">
                                            {documentiBasilari.map(doc => (
                                                <RigaDocumento
                                                    key={doc.id}
                                                    doc={doc}
                                                    bandoId={bando.id}
                                                    uploading={uploadInCorso === doc.id}
                                                    onUpload={(f) => caricaFile(doc.id, f)}
                                                    onRemove={() => rimuoviFile(doc.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {documentiSpecifici.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti specifici per questo bando</h3>
                                        <div className="space-y-2">
                                            {documentiSpecifici.map(doc => (
                                                <RigaDocumento
                                                    key={doc.id}
                                                    doc={doc}
                                                    bandoId={bando.id}
                                                    uploading={uploadInCorso === doc.id}
                                                    onUpload={(f) => caricaFile(doc.id, f)}
                                                    onRemove={() => rimuoviFile(doc.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}

function RigaDocumento({
    doc, bandoId, uploading, onUpload, onRemove,
}: {
    doc: DocumentoBando;
    bandoId: number;
    uploading: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
}) {
    const inputId = `cassetto-upload-${doc.id}`;

    return (
        <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-start gap-2 min-w-0">
                {doc.stato === 'caricato'
                    ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    : <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                    <p className="text-sm text-white font-medium flex items-center gap-2 flex-wrap">
                        {doc.nome_documento}
                        {doc.obbligatorio && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">obbligatorio</span>
                        )}
                    </p>
                    {doc.descrizione && <p className="text-xs text-slate-400 mt-0.5">{doc.descrizione}</p>}
                    {doc.link_ufficiale && (
                        <a
                            href={doc.link_ufficiale}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
                        >
                            <ExternalLink className="h-3 w-3" /> Dove trovarlo
                        </a>
                    )}
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
                {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : doc.stato === 'caricato' ? (
                    <>
                        <a
                            href={`/bandi/${bandoId}/documenti/${doc.id}/download`}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition"
                            title="Scarica"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                        <button onClick={onRemove} title="Rimuovi file" className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                            <X className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            id={inputId}
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                        />
                        <label
                            htmlFor={inputId}
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
                        >
                            <Upload className="h-3.5 w-3.5" /> Carica
                        </label>
                    </>
                )}
            </div>
        </div>
    );
}
