import { Link, router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Trophy, XCircle, ListChecks, Clock, Undo2 } from 'lucide-react';

interface BandoVinto {
    bando_id: number;
    titolo: string | null;
    rendicontazione_id: number;
}

interface BandoPerso {
    id: number;
    bando_id: number;
    titolo: string | null;
    marcato_il: string;
}

interface Props {
    stats: {
        totali: number;
        in_corso: number;
        vinti: number;
        persi: number;
    };
    bandiVinti: BandoVinto[];
    bandiPersi: BandoPerso[];
}

export default function StoricoBandiIndex({ stats, bandiVinti, bandiPersi }: Props) {
    const annullaPerso = (bandoId: number) => {
        if (!confirm('Annullare la marcatura "perso" per questo bando?')) return;
        router.delete(`/ente/lista-bandi/${bandoId}/perso`, { preserveScroll: true });
    };

    const cards = [
        { title: 'Bandi Totali', value: stats.totali, icon: ListChecks, color: 'blue' },
        { title: 'In Corso', value: stats.in_corso, icon: Clock, color: 'orange' },
        { title: 'Vinti', value: stats.vinti, icon: Trophy, color: 'emerald' },
        { title: 'Persi', value: stats.persi, icon: XCircle, color: 'red' },
    ];

    return (
        <LayoutEnte>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-emerald-400" />
                        Storico Bandi
                    </h1>
                    <p className="text-slate-400 mt-1">Riepilogo dei bandi seguiti dal tuo ente: quanti totali, in corso, vinti e persi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((c) => (
                        <div key={c.title} className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-400">{c.title}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
                                </div>
                                <div className={`w-11 h-11 rounded-xl bg-${c.color}-500/20 flex items-center justify-center`}>
                                    <c.icon className={`h-5 w-5 text-${c.color}-400`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-emerald-400" /> Bandi vinti ({bandiVinti.length})
                        </h3>
                        {bandiVinti.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Nessun bando vinto finora. Un bando risulta vinto quando avvii la Rendicontazione dal suo dettaglio.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {bandiVinti.map((b) => (
                                    <div key={b.bando_id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50">
                                        <span className="text-sm text-white truncate">{b.titolo ?? 'Bando'}</span>
                                        <Link
                                            href={`/ente/rendicontazione/${b.rendicontazione_id}`}
                                            className="shrink-0 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                                        >
                                            Rendicontazione
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" /> Bandi persi ({bandiPersi.length})
                        </h3>
                        {bandiPersi.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Nessun bando marcato come perso. Puoi farlo dal dettaglio di un bando chiuso a cui hai partecipato.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {bandiPersi.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50">
                                        <div className="min-w-0">
                                            <p className="text-sm text-white truncate">{b.titolo ?? 'Bando'}</p>
                                            <p className="text-xs text-slate-500">Marcato il {new Date(b.marcato_il).toLocaleDateString('it-IT')}</p>
                                        </div>
                                        <button
                                            onClick={() => annullaPerso(b.bando_id)}
                                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
                                        >
                                            <Undo2 className="h-3.5 w-3.5" /> Annulla
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}
