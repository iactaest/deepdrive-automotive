import { Link } from '@inertiajs/react';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';
import { ClipboardCheck, Calendar } from 'lucide-react';

interface Progetto {
    id: number;
    titolo_progetto: string;
    bando_titolo: string | null;
    importo_finanziato: number;
    stato: 'in_corso' | 'completata' | 'chiusa';
    data_fine: string;
    avanzamento_finanziario: number;
    spese_count: number;
    milestone_count: number;
}

interface Props {
    progetti: Progetto[];
    compatto?: boolean;
}

const formatEuro = (v: number) => `€${v.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`;

const STATO_STILE: Record<Progetto['stato'], string> = {
    in_corso: 'bg-blue-500/20 text-blue-400',
    completata: 'bg-emerald-500/20 text-emerald-400',
    chiusa: 'bg-slate-700 text-slate-400',
};

const STATO_LABEL: Record<Progetto['stato'], string> = {
    in_corso: 'In corso',
    completata: 'Completata',
    chiusa: 'Chiusa',
};

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile (griglia a colonna singola in compatto).
export default function RendicontazioneContenuto({ progetti, compatto = false }: Props) {
    return (
        <div className="space-y-6 animate-fade-in" style={{ marginTop: 25 }}>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2.5">
                    <ClipboardCheck className="card-bolla-icona h-7 w-7 text-green-400" />
                    Rendicontazione
                </h1>
                <p className="text-slate-300 mt-1">
                    Gestisci spese, milestone e report dei progetti finanziati. Per avviarne uno nuovo, vai al dettaglio di un bando.
                </p>
            </div>

            {progetti.length === 0 ? (
                <CardBolla bordo="#6FA5A0" className="p-8 text-center text-slate-400">
                    Nessun progetto in rendicontazione. Apri il dettaglio di un bando e clicca "Avvia Rendicontazione".
                </CardBolla>
            ) : (
                <div className={`grid grid-cols-1 gap-4 ${compatto ? '' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                    {progetti.map((p, idx) => {
                        const bordo = PALETTE_BOLLA[idx % PALETTE_BOLLA.length];
                        return (
                            <Link
                                key={p.id}
                                href={`/ente/rendicontazione/${p.id}`}
                                className="card-bolla card-bolla-entrata block p-5 transition hover:brightness-125"
                                style={{ borderWidth: 2, borderStyle: 'solid', borderColor: bordo, animationDelay: `${Math.min(idx, 10) * 70}ms` }}
                            >
                                <span className="card-bolla-bg" />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-white font-semibold truncate">{p.titolo_progetto}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATO_STILE[p.stato]}`}>
                                            {STATO_LABEL[p.stato]}
                                        </span>
                                    </div>
                                    {p.bando_titolo && <p className="text-xs text-slate-500 truncate mb-3">{p.bando_titolo}</p>}

                                    <p className="text-sm text-slate-300 mb-1">Finanziato: <span className="font-semibold text-white">{formatEuro(p.importo_finanziato)}</span></p>

                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${p.avanzamento_finanziario}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0">{p.avanzamento_finanziario}%</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                                        <span>{p.spese_count} spese · {p.milestone_count} milestone</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(p.data_fine).toLocaleDateString('it-IT')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
