import { useEffect, useState } from 'react';
import LayoutImpresa from '@/Layouts/LayoutImpresa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, Target, Award, Briefcase, Eye, ArrowRight, Calendar, Clock, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardImpresa() {
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

    const lineData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
        datasets: [{
            label: 'Match Trovati',
            data: animate ? [12, 19, 15, 27, 32, 45] : [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#1e293b',
            pointRadius: 4,
        }]
    };

    const barData = {
        labels: ['Digitalizzazione', 'Ambiente', 'Formazione', 'Startup', 'Agricoltura'],
        datasets: [{
            label: 'Bandi Disponibili',
            data: animate ? [24, 18, 15, 12, 8] : [],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: ['Alta (>80%)', 'Media (50-80%)', 'Bassa (<50%)'],
        datasets: [{
            data: animate ? [35, 42, 23] : [],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: '#94a3b8' } },
            tooltip: { backgroundColor: '#1e293b' }
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
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
        }
    };

    const stats = [
        { title: 'Bandi Compatibili', value: '47', icon: Target, change: '+12%', color: 'blue' },
        { title: 'Match Alta Compatibilità', value: '35', icon: Award, change: '+8%', color: 'green' },
        { title: 'Bandi Salvati', value: '12', icon: Briefcase, change: '+3', color: 'purple' },
        { title: 'Tasso di Successo', value: '68%', icon: TrendingUp, change: '+15%', color: 'orange' },
    ];

    return (
        <LayoutImpresa>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-slate-800/50 p-6 border border-slate-700/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Zap className="h-8 w-8 text-yellow-400" />
                        Dashboard Impresa
                    </h1>
                    <p className="text-slate-400 mt-2">Benvenuto nella tua area riservata. Ecco i bandi più adatti a te!</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-blue-500/50 transition hover:scale-105 cursor-pointer">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                    <p className="text-xs text-green-400 mt-2">{stat.change}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                            Trend Match Bandi
                        </h3>
                        <Line data={lineData} options={chartOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-purple-400" />
                            Bandi per Categoria
                        </h3>
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-400" />
                            Compatibilità
                        </h3>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            Prossime Scadenze
                        </h3>
                        {[
                            { name: 'Bando Transizione 5.0', days: 5, budget: '€10M' },
                            { name: 'PNRR Transizione Energetica', days: 12, budget: '€25M' },
                            { name: 'Bando Startup Innovative', days: 20, budget: '€5M' }
                        ].map((item) => (
                            <div key={item.name} className="flex justify-between p-4 rounded-lg bg-slate-900/50 mb-2">
                                <div>
                                    <p className="text-white font-medium">{item.name}</p>
                                    <p className="text-xs text-slate-400">Budget: {item.budget}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-orange-400 font-semibold">{item.days} giorni</p>
                                    <p className="text-xs text-slate-500">alla scadenza</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bandi Consigliati */}
                <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-cyan-400" />
                        Bandi Consigliati
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Digitalizzazione PMI', match: 95, budget: '€50k' },
                            { title: 'Startup Innovative', match: 88, budget: '€100k' },
                            { title: 'Formazione 4.0', match: 82, budget: '€30k' }
                        ].map((bando) => (
                            <div key={bando.title} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50">
                                <div className="text-right">
                                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {bando.match}%</span>
                                </div>
                                <h4 className="text-white font-semibold mt-2">{bando.title}</h4>
                                <p className="text-xs text-slate-400">Budget: {bando.budget}</p>
                                <button className="mt-3 text-sm text-blue-400">Dettagli →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LayoutImpresa>
    );
}