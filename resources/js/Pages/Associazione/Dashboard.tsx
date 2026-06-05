import { useEffect, useState } from 'react';
import LayoutAssociazione from '@/Layouts/LayoutAssociazione';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, Heart, Calendar, Users, Eye, ArrowRight, Clock, Award, Zap, Handshake, Star } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardAssociazione() {
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

    const lineData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
        datasets: [{
            label: 'Finanziamenti Ottenuti',
            data: animate ? [5, 8, 12, 15, 22, 28] : [],
            borderColor: '#ec489a',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ec489a',
            pointBorderColor: '#1e293b',
            pointRadius: 4,
        }]
    };

    const barData = {
        labels: ['Sociale', 'Cultura', 'Ambiente', 'Sport', 'Istruzione'],
        datasets: [{
            label: 'Opportunità',
            data: animate ? [32, 18, 25, 12, 22] : [],
            backgroundColor: ['#ec489a', '#f43f5e', '#14b8a6', '#f59e0b', '#8b5cf6'],
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: ['Regionali (40%)', 'Nazionali (35%)', 'Europei (25%)'],
        datasets: [{
            data: animate ? [40, 35, 25] : [],
            backgroundColor: ['#ec489a', '#8b5cf6', '#06b6d4'],
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
        { title: 'Bandi Aperti', value: '38', icon: Heart, change: '+6', color: 'pink' },
        { title: 'Progetti Finanziati', value: '12', icon: Award, change: '+3', color: 'purple' },
        { title: 'Budget Ottenuto', value: '€1.2M', icon: Handshake, change: '+28%', color: 'teal' },
        { title: 'Partner Attivi', value: '8', icon: Users, change: '+2', color: 'blue' },
    ];

    return (
        <LayoutAssociazione>
            <div className="space-y-6 animate-fade-in">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600/20 via-rose-600/20 to-slate-800/50 p-6 border border-slate-700/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Zap className="h-8 w-8 text-yellow-400" />
                        Dashboard Associazione
                    </h1>
                    <p className="text-slate-400 mt-2">Opportunità per il Terzo Settore e il No-Profit</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-pink-500/50 transition hover:scale-105 cursor-pointer">
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
                            <TrendingUp className="h-5 w-5 text-pink-400" />
                            Trend Finanziamenti
                        </h3>
                        <Line data={lineData} options={chartOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Heart className="h-5 w-5 text-purple-400" />
                            Bandi per Area
                        </h3>
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Handshake className="h-5 w-5 text-blue-400" />
                            Fonti di Finanziamento
                        </h3>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            Prossime Scadenze
                        </h3>
                        {[
                            { name: 'Bando Inclusione Sociale', days: 7, budget: '€150k' },
                            { name: 'Fondo Cultura 2026', days: 14, budget: '€200k' },
                            { name: 'Europa Sociale+', days: 22, budget: '€500k' }
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
                        Bandi Consigliati
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Sostegno al Terzo Settore', match: 96, budget: '€300k' },
                            { title: 'Erasmus+ Giovani', match: 92, budget: '€150k' },
                            { title: 'Fondo Volontariato', match: 89, budget: '€80k' }
                        ].map((bando) => (
                            <div key={bando.title} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50">
                                <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {bando.match}%</span></div>
                                <Star className="h-4 w-4 text-yellow-400 mb-2" />
                                <h4 className="text-white font-semibold">{bando.title}</h4>
                                <p className="text-xs text-slate-400">Budget: {bando.budget}</p>
                                <button className="mt-3 text-sm text-pink-400">Dettagli →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LayoutAssociazione>
    );
}