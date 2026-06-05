import { useEffect, useState } from 'react';
import LayoutProfessionista from '@/Layouts/LayoutProfessionista';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { TrendingUp, Briefcase, Calendar, User, Eye, ArrowRight, Clock, Award, Zap, Target, BadgeCheck } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DashboardProfessionista() {
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setAnimate(true); }, []);

    const lineData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
        datasets: [{
            label: 'Opportunità Ricevute',
            data: animate ? [3, 5, 8, 12, 15, 22] : [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#1e293b',
            pointRadius: 4,
        }]
    };

    const barData = {
        labels: ['Consulenza', 'Formazione', 'ICT', 'Marketing', 'Legale'],
        datasets: [{
            label: 'Opportunità',
            data: animate ? [25, 18, 30, 12, 10] : [],
            backgroundColor: ['#f59e0b', '#ec489a', '#3b82f6', '#10b981', '#8b5cf6'],
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: ['Proposte Accettate (32%)', 'In Trattativa (28%)', 'In Attesa (40%)'],
        datasets: [{
            data: animate ? [32, 28, 40] : [],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
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
            position: 'bottom' as const,  // ✅ tipo specifico
            labels: { color: '#94a3b8', font: { size: 11 } }
        }
    }
};

    const stats = [
        { title: 'Opportunità Ricevute', value: '47', icon: Briefcase, change: '+12', color: 'orange' },
        { title: 'Tasso di Successo', value: '32%', icon: TrendingUp, change: '+8%', color: 'green' },
        { title: 'Bandi in Scadenza', value: '8', icon: Calendar, change: '-2', color: 'red' },
        { title: 'Certificazioni', value: '5', icon: BadgeCheck, change: '+1', color: 'blue' },
    ];

    return (
        <LayoutProfessionista>
            <div className="space-y-6 animate-fade-in">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-slate-800/50 p-6 border border-slate-700/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Zap className="h-8 w-8 text-yellow-400" />
                        Dashboard Professionista
                    </h1>
                    <p className="text-slate-400 mt-2">Opportunità su misura per il tuo profilo professionale</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 hover:border-orange-500/50 transition hover:scale-105 cursor-pointer">
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
                            <TrendingUp className="h-5 w-5 text-orange-400" />
                            Trend Opportunità
                        </h3>
                        <Line data={lineData} options={chartOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-purple-400" />
                            Bandi per Settore
                        </h3>
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            Tasso di Successo
                        </h3>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                    <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-400" />
                            Prossime Scadenze
                        </h3>
                        {[
                            { name: 'Consulenza Digitale PMI', days: 5, budget: '€50k' },
                            { name: 'Formazione 4.0', days: 12, budget: '€30k' },
                            { name: 'Innovazione ICT', days: 18, budget: '€80k' }
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
                        Opportunità Consigliate
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Consulenza Strategica', match: 95, budget: '€40k' },
                            { title: 'Formazione Digitale', match: 92, budget: '€25k' },
                            { title: 'Sviluppo Software', match: 88, budget: '€60k' }
                        ].map((opp) => (
                            <div key={opp.title} className="rounded-xl bg-slate-900/50 p-4 border border-slate-700/50">
                                <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Match {opp.match}%</span></div>
                                <Award className="h-4 w-4 text-orange-400 mb-2" />
                                <h4 className="text-white font-semibold">{opp.title}</h4>
                                <p className="text-xs text-slate-400">Budget: {opp.budget}</p>
                                <button className="mt-3 text-sm text-orange-400">Candidati →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LayoutProfessionista>
    );
}