import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Archive, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import DocumentoRiga, { DocumentoBando } from '@/Components/DocumentoRiga';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';

interface BandoConDocumenti {
    bando_id: number;
    bando_titolo: string;
    documenti: DocumentoBando[];
    totale: number;
    caricati: number;
    completamento: number;
}

interface Props {
    bandi: BandoConDocumenti[];
    // Quando fornita (vista incorporata nel menu mobile) viene chiamata al posto
    // di router.reload per ricaricare i dati, dato che li' non siamo sulla vera
    // pagina /cassetto-documenti e un reload Inertia non avrebbe la prop "bandi".
    onRicarica?: () => void;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile.
export default function CassettoDocumentiContenuto({ bandi, onRicarica }: Props) {
    const bandoDaAprire = onRicarica ? null : (Number(new URLSearchParams(window.location.search).get('bando')) || null);

    const [aperti, setAperti] = useState<Set<number>>(() => bandoDaAprire ? new Set([bandoDaAprire]) : new Set());
    const [uploadInCorso, setUploadInCorso] = useState<number | null>(null);

    useEffect(() => {
        if (bandoDaAprire) {
            document.getElementById(`bando-${bandoDaAprire}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    const toggleAperto = (bandoId: number) => {
        setAperti(prev => {
            const next = new Set(prev);
            next.has(bandoId) ? next.delete(bandoId) : next.add(bandoId);
            return next;
        });
    };

    const ricarica = () => onRicarica ? onRicarica() : router.reload({ only: ['bandi'] });

    const caricaFile = async (bandoId: number, documentoId: number, file: File) => {
        setUploadInCorso(documentoId);
        const form = new FormData();
        form.append('documento_id', String(documentoId));
        form.append('file', file);
        await fetch(`/bandi/${bandoId}/documenti`, {
            method: 'POST',
            body: form,
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setUploadInCorso(null);
        ricarica();
    };

    const rimuoviFile = async (bandoId: number, documentoId: number) => {
        setUploadInCorso(documentoId);
        await fetch(`/bandi/${bandoId}/documenti/${documentoId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        setUploadInCorso(null);
        ricarica();
    };

    const salvaNota = async (bandoId: number, documentoId: number, nota: string, autore: string) => {
        await fetch(`/bandi/${bandoId}/documenti/${documentoId}/nota`, {
            method: 'PUT',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ nota, autore }),
        });
        ricarica();
    };

    return (
        <div className="space-y-6 animate-fade-in" style={{ marginTop: 25 }}>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2.5">
                    <Archive className="card-bolla-icona h-7 w-7 text-purple-400" />
                    Cassetto Documenti
                </h1>
                <p className="text-slate-300 mt-1">
                    Tutti i documenti compilati e caricati per ogni bando. Da qui puoi completare quelli mancanti.
                </p>
            </div>

            {bandi.length === 0 ? (
                <CardBolla bordo="#7CB08A" className="p-8 text-center text-slate-400">
                    Nessun documento ancora proposto per nessun bando. Apri il dettaglio di un bando e avvia l'Assistente AI.
                </CardBolla>
            ) : (
                <div className="space-y-3">
                    {bandi.map((b, idx) => {
                        const aperto = aperti.has(b.bando_id);
                        const mancantiObbligatori = b.documenti.filter(d => d.obbligatorio && d.stato !== 'caricato').length;
                        const documentiBasilari = b.documenti.filter(d => d.categoria === 'basilare');
                        const documentiSpecifici = b.documenti.filter(d => d.categoria === 'specifico');

                        return (
                            <CardBolla key={b.bando_id} bordo={PALETTE_BOLLA[idx % PALETTE_BOLLA.length]} indice={idx}>
                                <div id={`bando-${b.bando_id}`}>
                                <button
                                    onClick={() => toggleAperto(b.bando_id)}
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-800/80 transition"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white font-semibold truncate">{b.bando_titolo}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${b.completamento}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {b.caricati}/{b.totale} caricati ({b.completamento}%)
                                            </span>
                                            {mancantiObbligatori > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                                    <AlertTriangle className="h-3 w-3" /> {mancantiObbligatori} obbligatori mancanti
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {aperto ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
                                </button>

                                {aperto && (
                                    <div className="px-5 pb-5 space-y-6 border-t border-slate-700/50 pt-4">
                                        {documentiBasilari.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti basilari</h4>
                                                <div className="space-y-2">
                                                    {documentiBasilari.map(doc => (
                                                        <DocumentoRiga
                                                            key={doc.id}
                                                            doc={doc}
                                                            bandoId={b.bando_id}
                                                            uploading={uploadInCorso === doc.id}
                                                            onUpload={(f) => caricaFile(b.bando_id, doc.id, f)}
                                                            onRemove={() => rimuoviFile(b.bando_id, doc.id)}
                                                            onSaveNota={(nota, autore) => salvaNota(b.bando_id, doc.id, nota, autore)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {documentiSpecifici.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti specifici per questo bando</h4>
                                                <div className="space-y-2">
                                                    {documentiSpecifici.map(doc => (
                                                        <DocumentoRiga
                                                            key={doc.id}
                                                            doc={doc}
                                                            bandoId={b.bando_id}
                                                            uploading={uploadInCorso === doc.id}
                                                            onUpload={(f) => caricaFile(b.bando_id, doc.id, f)}
                                                            onRemove={() => rimuoviFile(b.bando_id, doc.id)}
                                                            onSaveNota={(nota, autore) => salvaNota(b.bando_id, doc.id, nota, autore)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                </div>
                            </CardBolla>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
