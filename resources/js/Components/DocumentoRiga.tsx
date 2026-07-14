import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Upload, Download, X, Loader2, ExternalLink, StickyNote, Search } from 'lucide-react';

export interface DocumentoBando {
    id: number;
    nome_documento: string;
    descrizione: string | null;
    link_ufficiale: string | null;
    obbligatorio: boolean;
    categoria: 'basilare' | 'specifico';
    stato: 'da_caricare' | 'caricato';
    path_file: string | null;
    nota: string | null;
    nota_autore: string | null;
    nota_data: string | null;
}

const AUTORE_STORAGE_KEY = 'deepdrive_nota_autore';

const formattaData = (iso: string) =>
    new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function DocumentoRiga({
    doc, bandoId, uploading, onUpload, onRemove, onSaveNota,
}: {
    doc: DocumentoBando;
    bandoId: number;
    uploading: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
    onSaveNota: (nota: string, autore: string) => Promise<void>;
}) {
    const inputId = `upload-doc-${bandoId}-${doc.id}`;

    const [notaAperta, setNotaAperta] = useState(false);
    const [testoNota, setTestoNota] = useState(doc.nota ?? '');
    const [autore, setAutore] = useState(() => localStorage.getItem(AUTORE_STORAGE_KEY) ?? doc.nota_autore ?? '');
    const [salvandoNota, setSalvandoNota] = useState(false);
    const [queryRicerca, setQueryRicerca] = useState(doc.nome_documento);

    useEffect(() => {
        setTestoNota(doc.nota ?? '');
    }, [doc.nota]);

    const haNota = !!doc.nota;

    const salvaNota = async () => {
        if (!testoNota.trim() || !autore.trim()) return;
        setSalvandoNota(true);
        localStorage.setItem(AUTORE_STORAGE_KEY, autore.trim());
        await onSaveNota(testoNota.trim(), autore.trim());
        setSalvandoNota(false);
        setNotaAperta(false);
    };

    return (
        <div className="rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-start justify-between gap-3 p-3">
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

                <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        doc.stato === 'caricato' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                        {doc.stato === 'caricato' ? 'Caricato' : 'Da caricare'}
                    </span>

                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={queryRicerca}
                            onChange={(e) => setQueryRicerca(e.target.value)}
                            className="w-28 sm:w-40 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(queryRicerca)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Cerca nel web"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition shrink-0"
                        >
                            <Search className="h-4 w-4" />
                        </a>
                    </div>

                    <button
                        onClick={() => setNotaAperta(v => !v)}
                        title="Nota"
                        className={`p-1.5 rounded-lg transition ${
                            haNota
                                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                        }`}
                    >
                        <StickyNote className="h-4 w-4" />
                    </button>

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

            {haNota && !notaAperta && (
                <div className="px-3 pb-3 -mt-1">
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{doc.nota}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                        — {doc.nota_autore}{doc.nota_data ? `, ${formattaData(doc.nota_data)}` : ''}
                    </p>
                </div>
            )}

            {notaAperta && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50 pt-3">
                    <textarea
                        value={testoNota}
                        onChange={(e) => setTestoNota(e.target.value)}
                        rows={3}
                        placeholder="Scrivi una nota su questo documento..."
                        className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={autore}
                            onChange={(e) => setAutore(e.target.value)}
                            placeholder="Nome operatore"
                            className="flex-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                            onClick={salvaNota}
                            disabled={salvandoNota || !testoNota.trim() || !autore.trim()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition"
                        >
                            {salvandoNota ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salva'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
