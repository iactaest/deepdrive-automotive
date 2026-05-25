import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Car, MessageSquare, Users, TrendingUp, Bot, Clock, Activity, BarChart3, Wrench } from 'lucide-react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

interface DashboardProps {
    stats?: {
        totale_veicoli: number;
        totale_clienti: number;
        totale_conversazioni: number;
        conversazioni_odierne: number;
    };
    trendConversazioni?: Array<{ data: string; count: number }>;
    distribuzioneMarche?: Array<{ nome: string; valore: number }>;
    performanceVendite?: {
        labels: string[];
        vendite_2024: number[];
        vendite_2023: number[];
    };
    manutenzioni?: Array<{ mese: string; ordinarie: number; straordinarie: number }>;
    attivitaRecenti?: Array<{
        id: number;
        tipo: string;
        descrizione: string;
        created_at: string;
    }>;
}

export default function Dashboard(props: DashboardProps) {
    const { user } = usePage().props.auth;
    
    // Valori di default per evitare undefined
    const stats = props.stats || {
        totale_veicoli: 0,
        totale_clienti: 0,
        totale_conversazioni: 0,
        conversazioni_odierne: 0,
    };
    
    const trendConversazioni = props.trendConversazioni || [];
    const distribuzioneMarche = props.distribuzioneMarche || [];
    const performanceVendite = props.performanceVendite || { labels: [], vendite_2024: [], vendite_2023: [] };
    const manutenzioni = props.manutenzioni || [];
    const attivitaRecenti = props.attivitaRecenti || [];
    
    const [chartsLoaded, setChartsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setChartsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // CHART 1: Trend Conversazioni
    const lineData = {
        labels: trendConversazioni.map(item => item.data),
        datasets: [{
            label: 'Conversazioni',
            data: chartsLoaded ? trendConversazioni.map(item => item.count) : [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: chartsLoaded ? 4 : 0,
        }],
    };

    // CHART 2: Distribuzione Veicoli
    const pieData = {
        labels: distribuzioneMarche.map(item => item.nome),
        datasets: [{
            data: chartsLoaded ? distribuzioneMarche.map(item => item.valore) : [],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec489a'],
            borderWidth: 0,
        }],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'bottom' as const, align: 'center' as const, labels: { color: '#94a3b8' } },
            tooltip: {
                backgroundColor: '#1e293b',
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // CHART 3: Performance Vendite
    const barData = {
        labels: performanceVendite.labels,
        datasets: [
            {
                label: 'Vendite 2024',
                data: chartsLoaded ? performanceVendite.vendite_2024 : [],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 8,
            },
            {
                label: 'Vendite 2023',
                data: chartsLoaded ? performanceVendite.vendite_2023 : [],
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderRadius: 8,
            },
        ],
    };

    // CHART 4: Manutenzioni
    const areaData = {
        labels: manutenzioni.map(item => item.mese),
        datasets: [
            {
                label: 'Manutenzioni Ordinarie',
                data: chartsLoaded ? manutenzioni.map(item => item.ordinarie) : [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Manutenzioni Straordinarie',
                data: chartsLoaded ? manutenzioni.map(item => item.straordinarie) : [],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#94a3b8' } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        }
    };

    const ChartPlaceholder = () => (
        <div className="h-[280px] flex items-center justify-center bg-slate-800/30 rounded-xl">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Caricamento grafico...</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Bentornato, {user?.name}! 👋</h1>
                        <p className="text-slate-400 mt-2">Ecco cosa sta succedendo nella tua concessionaria oggi.</p>
                    </div>

                    {/* Statistiche Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-400">Veicoli in Stock</p>
                                <Car className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-2">{stats.totale_veicoli}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-400">Clienti Totali</p>
                                <Users className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-2">{stats.totale_clienti}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-400">Conversazioni Totali</p>
                                <MessageSquare className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-2">{stats.totale_conversazioni}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-400">Conversazioni Oggi</p>
                                <Clock className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold text-white mt-2">{stats.conversazioni_odierne}</p>
                        </div>
                    </div>

                    {/* RIGA 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">📈 Trend Conversazioni</h3>
                            {chartsLoaded && trendConversazioni.length > 0 ? (
                                <div className="h-[280px]"><Line data={lineData} options={chartOptions} /></div>
                            ) : <ChartPlaceholder />}
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">🥧 Distribuzione per Marca</h3>
                            {chartsLoaded && distribuzioneMarche.length > 0 ? (
                                <div className="h-[280px] flex items-center justify-center">
                                    <div className="w-[280px] h-[280px]"><Pie data={pieData} options={pieOptions} /></div>
                                </div>
                            ) : <ChartPlaceholder />}
                        </div>
                    </div>

                    {/* RIGA 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">📊 Performance Vendite</h3>
                            {chartsLoaded && performanceVendite.labels.length > 0 ? (
                                <div className="h-[280px]"><Bar data={barData} options={chartOptions} /></div>
                            ) : <ChartPlaceholder />}
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">🔧 Manutenzioni</h3>
                            {chartsLoaded && manutenzioni.length > 0 ? (
                                <div className="h-[280px]"><Line data={areaData} options={chartOptions} /></div>
                            ) : <ChartPlaceholder />}
                        </div>
                    </div>

                    {/* Attività Recenti + Azioni Rapide */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="p-6 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">📝 Attività Recenti</h3>
                            </div>
                            <div className="p-6 max-h-[400px] overflow-y-auto">
                                {attivitaRecenti.length > 0 ? (
                                    <div className="space-y-4">
                                        {attivitaRecenti.map((attivita) => (
                                            <div key={attivita.id} className="flex items-start gap-3">
                                                <Bot className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-slate-300 text-sm">{attivita.descrizione}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(attivita.created_at).toLocaleString('it-IT')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-center py-8">Nessuna attività recente</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="p-6 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">⚡ Azioni Rapide</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/assistente" className="flex flex-col items-center gap-2 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition group">
                                        <Bot className="h-8 w-8 text-purple-400 group-hover:scale-110 transition" />
                                        <span className="text-sm text-slate-300">Chiedi all'AI</span>
                                    </Link>
                                    <Link href="/vehicles/create" className="flex flex-col items-center gap-2 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition group">
                                        <Car className="h-8 w-8 text-blue-400 group-hover:scale-110 transition" />
                                        <span className="text-sm text-slate-300">Nuovo Veicolo</span>
                                    </Link>
                                    <Link href="/customers/create" className="flex flex-col items-center gap-2 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition group">
                                        <Users className="h-8 w-8 text-green-400 group-hover:scale-110 transition" />
                                        <span className="text-sm text-slate-300">Nuovo Cliente</span>
                                    </Link>
                                    <Link href="/reports" className="flex flex-col items-center gap-2 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition group">
                                        <TrendingUp className="h-8 w-8 text-orange-400 group-hover:scale-110 transition" />
                                        <span className="text-sm text-slate-300">Report</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}