import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, FileText, Calendar, Building2, Eye, Clock, Euro, Landmark, Archive, ClipboardCheck, Receipt, ChevronDown, type LucideIcon } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

interface Scadenza {
    titolo: string;
    scadenza: string;
    giorni: number;
    budget: number | null;
}

interface GaraConsigliata {
    id: number;
    titolo: string;
    match: number;
    budget: number | null;
}

export interface DashboardData {
    stats: {
        bandi_attivi: number;
        budget_mediano: number | null;
        in_scadenza: number;
        storico_progetti: number;
        storico_importo: number;
        progetti_rendicontazione: number;
        spese_registrate_totali: number;
    };
    per_categoria: { labels: string[]; valori: number[] };
    per_livello: { labels: string[]; valori: number[] };
    trend_storico: { labels: string[]; valori: number[] };
    prossime_scadenze: Scadenza[];
    gare_consigliate: GaraConsigliata[];
}

const formatEuro = (v: number | null) => {
    if (!v) return '—';
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}k`;
    return `€${v.toFixed(0)}`;
};

// Stessa scala di colori usata in DashboardMobile per le bolle del menu
// (arancio→verde/teal, desaturati): riusata qui per le card cosi lo stile
// mobile resta coerente tra menu e dashboard incorporata.
const COLORE_STAT: Record<string, string> = {
    green: '#7CB08A',
    blue: '#8FA3C7',
    orange: '#C0975F',
    purple: '#9C93C7',
    emerald: '#66AB93',
    teal: '#4FA39B',
};

// CSS della modalità compatta: stesso trattamento visivo delle bolle del menu
// (pattern di icone in trasparenza, sfondo con gradiente "3D", icone con
// leggero rilievo via drop-shadow) applicato alle card della dashboard.
const CSS_COMPATTO = `
.dc-card {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    background: linear-gradient(145deg, rgba(69,79,89,.13), rgba(51,59,69,.13) 55%, rgba(36,43,51,.13));
    box-shadow: 0 10px 22px rgba(0,0,0,.4), inset 0 2px 3px rgba(255,255,255,.14), inset 0 -4px 8px rgba(0,0,0,.25);
}
.dc-bg {
    position: absolute;
    inset: -10%;
    background-image: url('/images/pattern-giochi.png');
    background-size: 100px;
    background-repeat: repeat;
    filter: brightness(3.4) contrast(1.1);
    mix-blend-mode: screen;
    opacity: .1;
    pointer-events: none;
}
.dc-icona {
    filter: drop-shadow(0 2px 2px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.12));
}
`;

// Wrapper della card: su desktop resta la card piatta originale, in modalità
// compatta applica lo sfondo/pattern/bordo colorato in stile "bolla del menu".
function Card({
    compatto,
    bordo,
    classeDesktop,
    classeCompatta,
    children,
}: {
    compatto: boolean;
    bordo: string;
    classeDesktop: string;
    classeCompatta: string;
    children: React.ReactNode;
}) {
    if (!compatto) {
        return <div className={classeDesktop}>{children}</div>;
    }

    return (
        <div className={`dc-card ${classeCompatta}`} style={{ borderWidth: 2, borderStyle: 'solid', borderColor: bordo }}>
            <span className="dc-bg" />
            <div className="relative">{children}</div>
        </div>
    );
}

// Titolo + contenuto di una card grafico. Su desktop (compatto=false) è sempre
// visibile come prima; in modalità compatta diventa un accordion chiuso di
// default (i grafici occupano parecchio spazio verticale su mobile) — il
// contenuto viene montato solo quando aperto, per evitare che Chart.js calcoli
// le dimensioni mentre il canvas è nascosto (display:none) e resti "storto".
function SezioneGrafico({
    titolo,
    icona: Icona,
    coloreIcona,
    compatto,
    children,
}: {
    titolo: string;
    icona: LucideIcon;
    coloreIcona: string;
    compatto: boolean;
    children: React.ReactNode;
}) {
    const [aperta, setAperta] = useState(false);

    if (!compatto) {
        return (
            <>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Icona className={`h-5 w-5 ${coloreIcona}`} />
                    {titolo}
                </h3>
                {children}
            </>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setAperta((v) => !v)}
                className="text-xs font-semibold text-white mb-0 flex items-center justify-between gap-1.5 w-full"
            >
                <span className="flex items-center gap-1.5">
                    <Icona className={`dc-icona h-3.5 w-3.5 ${coloreIcona}`} />
                    {titolo}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform shrink-0 ${aperta ? 'rotate-180' : ''}`} />
            </button>
            {aperta && <div className="mt-2">{children}</div>}
        </>
    );
}

// Contenuto della Dashboard ente, senza il LayoutEnte (sidebar/header): estratto
// cosi puo essere renderizzato sia nella pagina normale sia in altri contesti
// (es. incorporato dentro DashboardMobile) riusando la stessa UI.
//
// `compatto`: le classi Tailwind responsive (md:/lg:/xl:) si basano sulla
// larghezza del VIEWPORT, non del contenitore — in un riquadro stretto tipo
// DashboardMobile (max 640px) su un browser desktop largo continuerebbero comunque
// ad attivarsi, producendo card/testo troppo grandi per lo spazio reale. In
// modalità compatta le sostituiamo con classi fisse pensate per il mobile, e
// applichiamo lo stesso stile "bolla" (pattern, gradiente, bordo colorato,
// icone in rilievo) usato dal menu, per coerenza visiva tra le due schermate.
export default function DashboardContenuto({
    dashboard,
    profilo,
    compatto = false,
}: {
    dashboard: DashboardData;
    profilo?: { nome_ente?: string | null };
    compatto?: boolean;
}) {
    const { user } = usePage().props.auth;
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

    const c = (normale: string, compatta: string) => (compatto ? compatta : normale);

    const lineData = {
        labels: dashboard.trend_storico.labels,
        datasets: [{
            label: 'Progetti finanziati (storico)',
            data: animate ? dashboard.trend_storico.valori : [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#1e293b',
            pointRadius: 4,
        }]
    };

    const barData = {
        labels: dashboard.per_categoria.labels,
        datasets: [{
            label: 'Bandi',
            data: animate ? dashboard.per_categoria.valori : [],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'],
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: dashboard.per_livello.labels,
        datasets: [{
            data: animate ? dashboard.per_livello.valori : [],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: compatto ? 9 : 11 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
            y: { ticks: { color: '#94a3b8', font: { size: compatto ? 9 : undefined } }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8', font: { size: compatto ? 9 : undefined } }, grid: { color: '#334155' } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: '#94a3b8', font: { size: compatto ? 9 : 11 } }
            }
        }
    };

    const stats = [
        { title: 'Bandi Attivi', value: String(dashboard.stats.bandi_attivi), icon: FileText, color: 'green' },
        { title: 'Budget Mediano (bandi attivi)', value: formatEuro(dashboard.stats.budget_mediano), icon: Euro, color: 'blue' },
        { title: 'In Scadenza (30gg)', value: String(dashboard.stats.in_scadenza), icon: Calendar, color: 'orange' },
        { title: 'Progetti Storici nel Territorio', value: String(dashboard.stats.storico_progetti), icon: Archive, color: 'purple' },
        { title: 'Progetti in Rendicontazione', value: String(dashboard.stats.progetti_rendicontazione), icon: ClipboardCheck, color: 'emerald' },
        { title: 'Spese Registrate', value: formatEuro(dashboard.stats.spese_registrate_totali), icon: Receipt, color: 'teal' },
    ];

    const coloriConsigliati = ['#8FA3C7', '#9C93C7', '#B08FC0'];

    return (
        <div className={c('space-y-6 animate-fade-in', 'space-y-3 animate-fade-in')}>
            {compatto && <style>{CSS_COMPATTO}</style>}

            <Card
                compatto={compatto}
                bordo="#CE8A52"
                classeDesktop="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-slate-800/50 p-6 border border-slate-700/50"
                classeCompatta="rounded-xl p-3"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <h1 className={c('text-3xl font-bold text-white flex items-center gap-2', 'text-base font-bold text-white flex items-center gap-1.5')}>
                    <Landmark className={c('h-8 w-8 text-green-400', 'dc-icona h-4 w-4 text-green-400')} />
                    Bentornato, {user?.name}!
                </h1>
                <p className={c('text-slate-400 mt-2', 'text-slate-400 mt-1 text-[11px]')}>
                    {profilo?.nome_ente ? `${profilo.nome_ente} — ` : ''}Gestisci bandi, gare e appalti pubblici in modo efficiente
                </p>
            </Card>

            <div className={c('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6', 'grid grid-cols-2 gap-2')}>
                {stats.map((stat) => (
                    <Card
                        key={stat.title}
                        compatto={compatto}
                        bordo={COLORE_STAT[stat.color] ?? '#8FA3C7'}
                        classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-green-500/50 transition hover:scale-105 cursor-pointer"
                        classeCompatta="rounded-lg p-2.5"
                    >
                        <div className="flex justify-between">
                            <div>
                                <p className={c('text-sm text-slate-400', 'text-[10px] text-slate-400 leading-tight')}>{stat.title}</p>
                                <p className={c('text-3xl font-bold text-white mt-1', 'text-lg font-bold text-white mt-0.5')}>{stat.value}</p>
                            </div>
                            <div className={c(
                                `w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center shrink-0`,
                                `w-7 h-7 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center shrink-0`
                            )}>
                                <stat.icon className={c(`h-6 w-6 text-${stat.color}-400`, `dc-icona h-3.5 w-3.5 text-${stat.color}-400`)} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className={c('grid grid-cols-1 lg:grid-cols-2 gap-6', 'grid grid-cols-1 gap-3')}>
                <Card compatto={compatto} bordo="#8FA3C7" classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50" classeCompatta="rounded-lg p-3">
                    <SezioneGrafico titolo="Storico Finanziamenti nel Territorio (OpenCoesione)" icona={TrendingUp} coloreIcona="text-green-400" compatto={compatto}>
                        {dashboard.trend_storico.labels.length > 0
                            ? <Line data={lineData} options={chartOptions} />
                            : <p className={c('text-slate-400 text-sm', 'text-slate-400 text-[11px]')}>Nessun dato storico disponibile per il tuo territorio.</p>}
                    </SezioneGrafico>
                </Card>
                <Card compatto={compatto} bordo="#9C93C7" classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50" classeCompatta="rounded-lg p-3">
                    <SezioneGrafico titolo="Bandi Attivi per Categoria" icona={Building2} coloreIcona="text-purple-400" compatto={compatto}>
                        {dashboard.per_categoria.labels.length > 0
                            ? <Bar data={barData} options={chartOptions} />
                            : <p className={c('text-slate-400 text-sm', 'text-slate-400 text-[11px]')}>Nessun bando attivo per categoria.</p>}
                    </SezioneGrafico>
                </Card>
            </div>

            <div className={c('grid grid-cols-1 lg:grid-cols-3 gap-6', 'grid grid-cols-1 gap-3')}>
                <Card compatto={compatto} bordo="#B08FC0" classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50" classeCompatta="rounded-lg p-3">
                    <SezioneGrafico titolo="Budget per Livello" icona={Euro} coloreIcona="text-blue-400" compatto={compatto}>
                        {dashboard.per_livello.labels.length > 0
                            ? <Doughnut data={doughnutData} options={doughnutOptions} />
                            : <p className={c('text-slate-400 text-sm', 'text-slate-400 text-[11px]')}>Nessun budget disponibile.</p>}
                    </SezioneGrafico>
                </Card>
                <Card
                    compatto={compatto}
                    bordo="#C08FA8"
                    classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2"
                    classeCompatta="rounded-lg p-3"
                >
                    <h3 className={c('text-lg font-semibold text-white mb-4 flex items-center gap-2', 'text-xs font-semibold text-white mb-2 flex items-center gap-1.5')}>
                        <Clock className={c('h-5 w-5 text-orange-400', 'dc-icona h-3.5 w-3.5 text-orange-400')} />
                        Prossime Scadenze
                    </h3>
                    {dashboard.prossime_scadenze.length > 0 ? dashboard.prossime_scadenze.map((item) => (
                        <div key={item.titolo} className={c('flex justify-between p-4 rounded-lg bg-slate-900/50 mb-2', 'flex justify-between p-2.5 rounded-md bg-slate-900/50 mb-1.5')}>
                            <div>
                                <p className={c('text-white font-medium', 'text-white font-medium text-[11px]')}>{item.titolo}</p>
                                <p className={c('text-xs text-slate-400', 'text-[10px] text-slate-400')}>Budget: {formatEuro(item.budget)}</p>
                            </div>
                            <div className="text-right">
                                <p className={c('text-orange-400 font-semibold', 'text-orange-400 font-semibold text-[11px]')}>{item.giorni} giorni</p>
                                <p className={c('text-xs text-slate-500', 'text-[10px] text-slate-500')}>alla scadenza</p>
                            </div>
                        </div>
                    )) : <p className={c('text-slate-400 text-sm', 'text-slate-400 text-[11px]')}>Nessuna scadenza imminente.</p>}
                </Card>
            </div>

            <Card compatto={compatto} bordo="#66AB93" classeDesktop="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50" classeCompatta="rounded-lg p-3">
                <h3 className={c('text-lg font-semibold text-white mb-4 flex items-center gap-2', 'text-xs font-semibold text-white mb-2 flex items-center gap-1.5')}>
                    <Eye className={c('h-5 w-5 text-cyan-400', 'dc-icona h-3.5 w-3.5 text-cyan-400')} />
                    Bandi Consigliati
                </h3>
                {dashboard.gare_consigliate.length > 0 ? (
                    <div className={c('grid grid-cols-1 md:grid-cols-3 gap-4', 'grid grid-cols-1 gap-2')}>
                        {dashboard.gare_consigliate.map((gara, indice) =>
                            compatto ? (
                                <Link
                                    key={gara.id}
                                    href={`/ente/lista-bandi/${gara.id}`}
                                    className="dc-card rounded-lg p-2.5 block"
                                    style={{ borderWidth: 2, borderStyle: 'solid', borderColor: coloriConsigliati[indice % coloriConsigliati.length] }}
                                >
                                    <span className="dc-bg" />
                                    <div className="relative">
                                        <div className="text-right"><span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">Match {gara.match}%</span></div>
                                        <h4 className="text-white font-semibold mt-1 text-[11px]">{gara.titolo}</h4>
                                        <p className="text-[10px] text-slate-400">Budget: {formatEuro(gara.budget)}</p>
                                        <span className="mt-1.5 text-[11px] text-green-400 inline-block">Dettagli →</span>
                                    </div>
                                </Link>
                            ) : (
                                <Link key={gara.id} href={`/ente/lista-bandi/${gara.id}`} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50 block hover:border-cyan-500/50 transition">
                                    <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {gara.match}%</span></div>
                                    <h4 className="text-white font-semibold mt-2">{gara.titolo}</h4>
                                    <p className="text-xs text-slate-400">Budget: {formatEuro(gara.budget)}</p>
                                    <span className="mt-3 text-sm text-green-400 inline-block">Dettagli →</span>
                                </Link>
                            )
                        )}
                    </div>
                ) : <p className={c('text-slate-400 text-sm', 'text-slate-400 text-[11px]')}>Nessun bando compatibile al momento.</p>}
            </Card>
        </div>
    );
}
