import { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Archive } from 'lucide-react';
import DocumentoRiga, { DocumentoBando } from '@/Components/DocumentoRiga';

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

    const salvaNota = async (documentoId: number, nota: string, autore: string) => {
        await fetch(`/bandi/${bando.id}/documenti/${documentoId}/nota`, {
            method: 'PUT',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ nota, autore }),
        });
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
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-1">
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
                                                <DocumentoRiga
                                                    key={doc.id}
                                                    doc={doc}
                                                    bandoId={bando.id}
                                                    uploading={uploadInCorso === doc.id}
                                                    onUpload={(f) => caricaFile(doc.id, f)}
                                                    onRemove={() => rimuoviFile(doc.id)}
                                                    onSaveNota={(nota, autore) => salvaNota(doc.id, nota, autore)}
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
                                                <DocumentoRiga
                                                    key={doc.id}
                                                    doc={doc}
                                                    bandoId={bando.id}
                                                    uploading={uploadInCorso === doc.id}
                                                    onUpload={(f) => caricaFile(doc.id, f)}
                                                    onRemove={() => rimuoviFile(doc.id)}
                                                    onSaveNota={(nota, autore) => salvaNota(doc.id, nota, autore)}
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
