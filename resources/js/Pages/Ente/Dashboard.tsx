import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, FileText, Calendar, Building2, Eye, Clock, Euro, Landmark, Archive, ClipboardCheck, Receipt } from 'lucide-react';

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

interface DashboardData {
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

export default function DashboardEnte({ dashboard, profilo }: { dashboard: DashboardData; profilo?: { nome_ente?: string | null } }) {
    const { user } = usePage().props.auth;
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

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
            legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: '#94a3b8', font: { size: 11 } }
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

    return (
        <LayoutEnte>
            <div className="space-y-6 animate-fade-in">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-slate-800/50 p-6 border border-slate-700/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Landmark className="h-8 w-8 text-green-400" />
                        Bentornato, {user?.name}!
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {profilo?.nome_ente ? `${profilo.nome_ente} — ` : ''}Gestisci bandi, gare e appalti pubblici in modo efficiente
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-green-500/50 transition hover:scale-105 cursor-pointer">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            Storico Finanziamenti nel Territorio (OpenCoesione)
                        </h3>
                        {dashboard.trend_storico.labels.length > 0
                            ? <Line data={lineData} options={chartOptions} />
                            : <p className="text-slate-400 text-sm">Nessun dato storico disponibile per il tuo territorio.</p>}
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-400" />
                            Bandi Attivi per Categoria
                        </h3>
                        {dashboard.per_categoria.labels.length > 0
                            ? <Bar data={barData} options={chartOptions} />
                            : <p className="text-slate-400 text-sm">Nessun bando attivo per categoria.</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Euro className="h-5 w-5 text-blue-400" />
                            Budget per Livello
                        </h3>
                        {dashboard.per_livello.labels.length > 0
                            ? <Doughnut data={doughnutData} options={doughnutOptions} />
                            : <p className="text-slate-400 text-sm">Nessun budget disponibile.</p>}
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            Prossime Scadenze
                        </h3>
                        {dashboard.prossime_scadenze.length > 0 ? dashboard.prossime_scadenze.map((item) => (
                            <div key={item.titolo} className="flex justify-between p-4 rounded-lg bg-slate-900/50 mb-2">
                                <div><p className="text-white font-medium">{item.titolo}</p><p className="text-xs text-slate-400">Budget: {formatEuro(item.budget)}</p></div>
                                <div className="text-right"><p className="text-orange-400 font-semibold">{item.giorni} giorni</p><p className="text-xs text-slate-500">alla scadenza</p></div>
                            </div>
                        )) : <p className="text-slate-400 text-sm">Nessuna scadenza imminente.</p>}
                    </div>
                </div>

                <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-cyan-400" />
                        Bandi Consigliati
                    </h3>
                    {dashboard.gare_consigliate.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dashboard.gare_consigliate.map((gara) => (
                                <Link key={gara.id} href={`/ente/lista-bandi/${gara.id}`} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50 block hover:border-cyan-500/50 transition">
                                    <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {gara.match}%</span></div>
                                    <h4 className="text-white font-semibold mt-2">{gara.titolo}</h4>
                                    <p className="text-xs text-slate-400">Budget: {formatEuro(gara.budget)}</p>
                                    <span className="mt-3 text-sm text-green-400 inline-block">Dettagli →</span>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-slate-400 text-sm">Nessun bando compatibile al momento.</p>}
                </div>
            </div>
        </LayoutEnte>
    );
}
