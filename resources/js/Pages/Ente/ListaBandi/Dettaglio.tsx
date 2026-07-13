import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { FileText, Bot, Loader2 } from 'lucide-react';
import DocumentoRiga, { DocumentoBando } from '@/Components/DocumentoRiga';

interface Bando {
    id: number;
    titolo: string;
    fonte: string;
    categoria: string;
    regione: string;
    livello: string;
    budget_totale: number;
    scadenza: string;
    stato: string;
    url: string;
    descrizione: string;
}

interface Match {
    punteggio: number;
    punti_forza: string[];
    punti_debolezza: string[];
}

interface Props {
    bando: Bando;
    match: Match;
    ente: any;
    isSalvato: boolean;
}

const getMatchColor = (scadenza: string | null, stato: string): string => {
    if (stato === 'chiuso') return 'text-red-400';
    if (!scadenza) return 'text-green-400';
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    const sc = new Date(scadenza); sc.setHours(0, 0, 0, 0);
    const gg = Math.floor((sc.getTime() - oggi.getTime()) / 86400000);
    if (gg < 0)    return 'text-red-400';
    if (gg <= 30)  return 'text-yellow-400';
    if (gg <= 180) return 'text-orange-400';
    return 'text-green-400';
};

const getStatoBadge = (stato: string) => {
    if (stato === 'aperto')      return 'bg-green-500/20 text-green-400';
    if (stato === 'in_scadenza') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
};

const statoLabel = (stato: string) =>
    stato === 'aperto' ? 'Aperto' : stato === 'in_scadenza' ? 'In scadenza' : 'Chiuso';

const MAX_RIGHE = 20;

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function ListaBandiDettaglio({ bando, match, isSalvato }: Props) {
    const [descAperta, setDescAperta] = useState(false);

    const [documenti, setDocumenti] = useState<DocumentoBando[]>([]);
    const [completamento, setCompletamento] = useState(0);
    const [caricamentoLista, setCaricamentoLista] = useState(true);
    const [analizzando, setAnalizzando] = useState(false);
    const [erroreAnalisi, setErroreAnalisi] = useState<string | null>(null);
    const [uploadInCorso, setUploadInCorso] = useState<number | null>(null);

    const caricaDocumenti = async () => {
        const res = await fetch(`/bandi/${bando.id}/documenti`);
        const data = await res.json();
        setDocumenti(data.documenti ?? []);
        setCompletamento(data.completamento ?? 0);
        setCaricamentoLista(false);
    };

    useEffect(() => {
        caricaDocumenti();
    }, [bando.id]);

    const avviaAssistente = async () => {
        setAnalizzando(true);
        setErroreAnalisi(null);
        try {
            const res = await fetch(`/bandi/${bando.id}/analizza-documenti`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken() },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDocumenti(data.documenti ?? []);
            setCompletamento(data.completamento ?? 0);
        } catch {
            setErroreAnalisi("Analisi AI non riuscita, riprova tra poco.");
        } finally {
            setAnalizzando(false);
        }
    };

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
        await caricaDocumenti();
        setUploadInCorso(null);
    };

    const rimuoviFile = async (documentoId: number) => {
        setUploadInCorso(documentoId);
        await fetch(`/bandi/${bando.id}/documenti/${documentoId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken() },
        });
        await caricaDocumenti();
        setUploadInCorso(null);
    };

    const salvaNota = async (documentoId: number, nota: string, autore: string) => {
        await fetch(`/bandi/${bando.id}/documenti/${documentoId}/nota`, {
            method: 'PUT',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ nota, autore }),
        });
        await caricaDocumenti();
    };

    const documentiBasilari = documenti.filter(d => d.categoria === 'basilare');
    const documentiSpecifici = documenti.filter(d => d.categoria === 'specifico');

    const toggleSalva = () => {
        if (isSalvato) {
            router.delete(`/bandi-salvati/${bando.id}`, { preserveScroll: true });
        } else {
            router.post('/bandi-salvati', { bando_id: bando.id }, { preserveScroll: true });
        }
    };

    const righe = (bando.descrizione ?? '').split('\n');
    const descrizioneBreve = righe.slice(0, MAX_RIGHE).join('\n');
    const haAltro = righe.length > MAX_RIGHE;

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <button
                            onClick={() => router.get('/ente/lista-bandi')}
                            className="text-blue-400 hover:text-blue-300 transition text-sm"
                        >
                            ← Torna alla lista
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">

                        {/* Header: titolo + badges + button */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white mb-3">{bando.titolo}</h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatoBadge(bando.stato)}`}>
                                        {statoLabel(bando.stato)}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                        📅 Scadenza:{' '}
                                        {bando.scadenza
                                            ? new Date(bando.scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
                                            : 'Non specificata'}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300">
                                        🎯 Match: {match.punteggio}%
                                    </span>
                                </div>
                            </div>

                            {/* Button link bando — sempre visibile */}
                            <div className="shrink-0 flex flex-row flex-wrap gap-2">
                                <button
                                    onClick={toggleSalva}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition border ${
                                        isSalvato
                                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/40'
                                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600/60'
                                    }`}
                                >
                                    {isSalvato ? '⭐ Salvato' : '☆ Salva'}
                                </button>
                                <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(bando.titolo + ' bando sito:gov.it OR sito:regione.sicilia.it OR sito:europa.eu')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm font-medium transition border border-slate-600/60"
                                >
                                    🔍 Cerca il bando online
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Colonna sinistra — info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-3">📋 Informazioni</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Fonte</span>
                                        <span className="text-white">{bando.fonte || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Categoria</span>
                                        <span className="text-right text-white max-w-[60%]">{bando.categoria || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Livello</span>
                                        <span className="text-white">{bando.livello || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Regione</span>
                                        <span className="text-right text-white max-w-[60%]">{bando.regione || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Budget totale</span>
                                        <span className="text-white">
                                            {bando.budget_totale
                                                ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(bando.budget_totale)
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Scadenza</span>
                                        <span className={`font-medium ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                            {bando.scadenza
                                                ? new Date(bando.scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
                                                : 'Non specificata'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Colonna destra — match */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 mb-3">🎯 Match con il tuo profilo</h3>
                                <div className={`text-5xl font-bold ${getMatchColor(bando.scadenza, bando.stato)}`}>
                                    {match.punteggio}%
                                </div>
                                <p className="text-xs text-slate-500 mt-1">compatibilità stimata</p>

                                {match.punti_forza?.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-green-400 mb-1">✅ Punti di forza</h4>
                                        <ul className="space-y-1">
                                            {match.punti_forza.map((p, i) => (
                                                <li key={i} className="text-sm text-white">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {match.punti_debolezza?.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-red-400 mb-1">⚠️ Punti di debolezza</h4>
                                        <ul className="space-y-1">
                                            {match.punti_debolezza.map((p, i) => (
                                                <li key={i} className="text-sm text-white">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descrizione — larghezza piena, sotto entrambe le colonne */}
                        {bando.descrizione && (
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Descrizione
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {descAperta ? bando.descrizione : descrizioneBreve}
                                </p>
                                {haAltro && (
                                    <button
                                        onClick={() => setDescAperta(v => !v)}
                                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
                                    >
                                        {descAperta ? '▲ Mostra meno' : '▼ Mostra tutto'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Assistente AI Documenti */}
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                <Bot className="h-4 w-4" /> Assistente AI Documenti
                            </h3>

                            {caricamentoLista ? (
                                <p className="text-sm text-slate-500">Caricamento...</p>
                            ) : documenti.length === 0 ? (
                                <div>
                                    <p className="text-sm text-slate-400 mb-3">
                                        Fai analizzare il bando dall'AI per ottenere l'elenco dei documenti necessari a partecipare.
                                    </p>
                                    <button
                                        onClick={avviaAssistente}
                                        disabled={analizzando}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-lg text-white text-sm font-medium transition"
                                    >
                                        {analizzando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                                        {analizzando ? 'Analisi in corso...' : 'Avvia Assistente AI'}
                                    </button>
                                    {erroreAnalisi && <p className="text-xs text-red-400 mt-2">{erroreAnalisi}</p>}
                                </div>
                            ) : (
                                <div>
                                    {/* Barra di completamento */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all"
                                                style={{ width: `${completamento}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0">
                                            {documenti.filter(d => d.stato === 'caricato').length}/{documenti.length} caricati ({completamento}%)
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => router.get(`/ente/lista-bandi/${bando.id}/cassetto`)}
                                        className="mb-4 text-xs text-purple-400 hover:text-purple-300 transition"
                                    >
                                        📂 Apri Cassetto Documenti →
                                    </button>

                                    {documentiBasilari.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti basilari</h4>
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
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Documenti specifici per questo bando</h4>
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

                        {/* Footer: URL per esteso se disponibile */}
                        {bando.url && (
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 break-all">{bando.url}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}
