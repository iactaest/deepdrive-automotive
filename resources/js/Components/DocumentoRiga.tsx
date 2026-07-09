import { CheckCircle2, Circle, Upload, Download, X, Loader2, ExternalLink } from 'lucide-react';

export interface DocumentoBando {
    id: number;
    nome_documento: string;
    descrizione: string | null;
    link_ufficiale: string | null;
    obbligatorio: boolean;
    categoria: 'basilare' | 'specifico';
    stato: 'da_caricare' | 'caricato';
    path_file: string | null;
}

export default function DocumentoRiga({
    doc, bandoId, uploading, onUpload, onRemove,
}: {
    doc: DocumentoBando;
    bandoId: number;
    uploading: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
}) {
    const inputId = `upload-doc-${bandoId}-${doc.id}`;

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
                    {doc.stato !== 'caricato' && doc.link_ufficiale && (
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
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    doc.stato === 'caricato' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                }`}>
                    {doc.stato === 'caricato' ? 'Caricato' : 'Da caricare'}
                </span>

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
