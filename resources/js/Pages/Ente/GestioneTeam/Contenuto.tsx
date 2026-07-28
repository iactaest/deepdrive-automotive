import { useForm, router } from '@inertiajs/react';
import CardBolla from '@/Components/CardBolla';
import { Users, Mail, Trash2, Loader2, Send } from 'lucide-react';

interface Membro {
    id: number;
    name: string;
    email: string;
    ruolo: 'Titolare' | 'Dipendente';
}

interface Invito {
    id: number;
    email: string;
    stato: 'pending' | 'accettato' | 'scaduto' | 'revocato';
    inviato_il: string;
}

interface Props {
    membri: Membro[];
    inviti: Invito[];
    puoInvitare: boolean;
}

const STATO_STILE: Record<Invito['stato'], string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    accettato: 'bg-green-500/20 text-green-400',
    scaduto: 'bg-slate-700 text-slate-400',
    revocato: 'bg-red-500/20 text-red-400',
};

const STATO_LABEL: Record<Invito['stato'], string> = {
    pending: 'In attesa',
    accettato: 'Accettato',
    scaduto: 'Scaduto',
    revocato: 'Revocato',
};

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile.
export default function GestioneTeamContenuto({ membri, inviti, puoInvitare }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });

    const invita = (e: React.FormEvent) => {
        e.preventDefault();
        post('/ente/team/invita', { onSuccess: () => reset() });
    };

    const revoca = (invitoId: number) => {
        router.delete(`/ente/team/inviti/${invitoId}`);
    };

    const rimuovi = (membro: Membro) => {
        if (!confirm(`Rimuovere ${membro.name} dal team? Non potrà più accedere al calendario condiviso dell'ente.`)) return;
        router.delete(`/ente/team/membri/${membro.id}`);
    };

    return (
        <div className="space-y-6 animate-fade-in" style={{ marginTop: 25 }}>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Users className="h-6 w-6 text-green-400" />
                    Gestione Team
                </h1>
                <p className="text-slate-400 mt-1">
                    I membri del tuo ente collaborano insieme sul Calendario Scadenze.
                </p>
            </div>

            {puoInvitare && (
                <CardBolla bordo="#AFA36C" indice={0} className="p-6">
                    <h3 className="text-sm font-semibold text-white mb-3">Invita un collega</h3>
                    <form onSubmit={invita} className="flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[220px]">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="collega@ente.it"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !data.email.trim()}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-medium transition"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Invita
                        </button>
                    </form>
                    {errors.email && <p className="text-red-400 text-xs mt-2">{errors.email}</p>}
                </CardBolla>
            )}

            <CardBolla bordo="#8FA3C7" indice={1}>
                <div className="p-5 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Membri ({membri.length})</h3>
                </div>
                <div className="p-5 space-y-2">
                    {membri.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                            <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">{m.name}</p>
                                <p className="text-xs text-slate-400 truncate">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    m.ruolo === 'Titolare' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                                }`}>
                                    {m.ruolo}
                                </span>
                                {puoInvitare && m.ruolo === 'Dipendente' && (
                                    <button onClick={() => rimuovi(m)} title="Rimuovi dal team" className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBolla>

            {puoInvitare && inviti.length > 0 && (
                <CardBolla bordo="#C0975F" indice={2}>
                    <div className="p-5 border-b border-white/10">
                        <h3 className="text-sm font-semibold text-white">Inviti</h3>
                    </div>
                    <div className="p-5 space-y-2">
                        {inviti.map((i) => (
                            <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-200 truncate">{i.email}</p>
                                    <p className="text-xs text-slate-500">Inviato il {new Date(i.inviato_il).toLocaleDateString('it-IT')}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATO_STILE[i.stato]}`}>
                                        {STATO_LABEL[i.stato]}
                                    </span>
                                    {i.stato === 'pending' && (
                                        <button onClick={() => revoca(i.id)} title="Revoca invito" className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBolla>
            )}
        </div>
    );
}
