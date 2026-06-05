import { useEffect, useState } from 'react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, FileText, Calendar, Building2, Eye, ArrowRight, Clock, Award, Zap, Euro, Landmark } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardEnte() {
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

    const lineData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
        datasets: [{
            label: 'Gare Pubblicate',
            data: animate ? [8, 12, 15, 22, 28, 35] : [],
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
        labels: ['Lavori', 'Forniture', 'Servizi', 'R&S', 'Sociale'],
        datasets: [{
            label: 'Opportunità',
            data: animate ? [28, 22, 35, 15, 18] : [],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: ['Comunale (€5M)', 'Regionale (€12M)', 'Nazionale (€25M)', 'Europeo (€40M)'],
        datasets: [{
            data: animate ? [5, 12, 25, 40] : [],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
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
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
        }
    };

    const stats = [
        { title: 'Bandi Attivi', value: '47', icon: FileText, change: '+8', color: 'green' },
        { title: 'Budget Totale', value: '€82M', icon: Euro, change: '+15%', color: 'blue' },
        { title: 'In Scadenza (30gg)', value: '12', icon: Calendar, change: '-3', color: 'orange' },
        { title: 'Gare Assegnate', value: '28', icon: Award, change: '+5', color: 'purple' },
    ];

    return (
        <LayoutEnte>
            <div className="space-y-6 animate-fade-in">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-slate-800/50 p-6 border border-slate-700/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Landmark className="h-8 w-8 text-green-400" />
                        Dashboard Ente Pubblico
                    </h1>
                    <p className="text-slate-400 mt-2">Gestisci bandi, gare e appalti pubblici in modo efficiente</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-green-500/50 transition hover:scale-105 cursor-pointer">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            Trend Gare e Appalti
                        </h3>
                        <Line data={lineData} options={chartOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-400" />
                            Bandi per Settore
                        </h3>
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Euro className="h-5 w-5 text-blue-400" />
                            Distribuzione Budget
                        </h3>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            Prossime Scadenze
                        </h3>
                        {[
                            { name: 'Fondo Sviluppo Comuni', days: 8, budget: '€2.5M' },
                            { name: 'PNRR Infrastrutture', days: 15, budget: '€15M' },
                            { name: 'Europa Horizon', days: 25, budget: '€40M' }
                        ].map((item) => (
                            <div key={item.name} className="flex justify-between p-4 rounded-lg bg-slate-900/50 mb-2">
                                <div><p className="text-white font-medium">{item.name}</p><p className="text-xs text-slate-400">Budget: {item.budget}</p></div>
                                <div className="text-right"><p className="text-orange-400 font-semibold">{item.days} giorni</p><p className="text-xs text-slate-500">alla scadenza</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-cyan-400" />
                        Gare Consigliate
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Fornitura IT per Comuni', match: 92, budget: '€500k' },
                            { title: 'Manutenzione Stradale', match: 88, budget: '€2M' },
                            { title: 'Servizi Sociali', match: 85, budget: '€800k' }
                        ].map((gara) => (
                            <div key={gara.title} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50">
                                <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {gara.match}%</span></div>
                                <h4 className="text-white font-semibold mt-2">{gara.title}</h4>
                                <p className="text-xs text-slate-400">Budget: {gara.budget}</p>
                                <button className="mt-3 text-sm text-green-400">Dettagli →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LayoutEnte>
    );
}