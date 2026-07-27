import { Link, router } from '@inertiajs/react';
import { Star, Trash2 } from 'lucide-react';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';

interface BandoSalvato {
    preferito_id: number;
    id: number;
    titolo: string;
    categoria: string | null;
    regione: string | null;
    budget_totale: number | null;
    scadenza: string | null;
    stato: string;
    match_punteggio: number | null;
    salvato_il: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    preferiti: Paginated<BandoSalvato>;
    // Quando fornita (vista incorporata nel menu mobile) viene chiamata al posto
    // di router.get per cambiare pagina, dato che li' non siamo sulla vera
    // pagina /bandi-salvati.
    onPagina?: (url: string) => void;
}

const formatEuro = (v: number | null) => {
    if (!v) return '—';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
};

const statoBadge = (stato: string) => {
    if (stato === 'aperto') return 'bg-green-500/20 text-green-400';
    if (stato === 'in_scadenza') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
};

const statoLabel = (stato: string) =>
    stato === 'aperto' ? 'Aperto' : stato === 'in_scadenza' ? 'In scadenza' : 'Chiuso';

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile.
export default function BandiSalvatiContenuto({ preferiti, onPagina }: Props) {
    const rimuovi = (bandoId: number) => {
        router.delete(`/bandi-salvati/${bandoId}`, { preserveScroll: true });
    };

    const vaiAPagina = (url: string) => {
        if (onPagina) onPagina(url);
        else router.get(url, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-6 animate-fade-in" style={{ marginTop: 25 }}>
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-400" />
                    Bandi Salvati
                </h1>
                <p className="text-slate-400 mt-1">{preferiti.total} bandi salvati</p>
            </div>

            {preferiti.data.length === 0 ? (
                <CardBolla bordo="#B08FC0" className="p-8 text-center text-slate-400">
                    Non hai ancora salvato nessun bando. Apri il dettaglio di un bando dalla Lista Bandi e clicca "Salva".
                </CardBolla>
            ) : (
                <div className="space-y-3">
                    {preferiti.data.map((b, idx) => (
                        <CardBolla key={b.preferito_id} bordo={PALETTE_BOLLA[idx % PALETTE_BOLLA.length]} indice={idx} className="p-5 hover:brightness-110 transition">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <Link href={`/ente/lista-bandi/${b.id}`} className="text-white font-semibold hover:text-green-400 transition block truncate">
                                        {b.titolo}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statoBadge(b.stato)}`}>
                                            {statoLabel(b.stato)}
                                        </span>
                                        {b.categoria && (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/60 text-slate-300">{b.categoria}</span>
                                        )}
                                        <span className="text-xs text-slate-400">Budget: {formatEuro(b.budget_totale)}</span>
                                        {b.match_punteggio !== null && (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/60 text-slate-300">
                                                🎯 {b.match_punteggio}%
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500">Salvato il {new Date(b.salvato_il).toLocaleDateString('it-IT')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        href={`/ente/lista-bandi/${b.id}`}
                                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
                                    >
                                        Dettagli
                                    </Link>
                                    <button
                                        onClick={() => rimuovi(b.id)}
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                        title="Rimuovi dai salvati"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </CardBolla>
                    ))}
                </div>
            )}

            {preferiti.last_page > 1 && (
                <div className="flex justify-center gap-1 flex-wrap">
                    {preferiti.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && vaiAPagina(link.url)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                link.active
                                    ? 'bg-green-600 text-white'
                                    : link.url
                                    ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                                    : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
