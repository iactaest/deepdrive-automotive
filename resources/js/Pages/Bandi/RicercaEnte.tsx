import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { Search, Calendar, Euro, Building2, TrendingUp, AlertCircle, Filter, BarChart3, PieChart, Activity, Zap, Globe, Landmark, TreePine, Factory, GraduationCap, Heart, Music, Wrench, Award, Clock, Target, FileText, MapPin } from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale);

export default function RicercaEnte({ profilo }: any) {
    const [searching, setSearching] = useState(false);
    const [bandi, setBandi] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [fallback, setFallback] = useState(false);
    const [showAdvancedStats, setShowAdvancedStats] = useState(false);
    const [filters, setFilters] = useState({
        livello: (profilo?.livelli_interesse as string[]) || [],
        categoria: (profilo?.categorie_interesse as string[]) || [],
        stato: ['aperto', 'in_scadenza'] as string[],
        settore: [] as string[],
        importoMin: '',
        importoMax: '',
        scadenza: 'tutti'
    });

    useEffect(() => {
        // Componente montato
    }, []);

    // Opzioni filtri
    const livelliOpzioni = [
        { value: 'comunale', label: 'Comunale', color: 'blue', icon: MapPin },
        { value: 'regionale', label: 'Regionale', color: 'green', icon: Landmark },
        { value: 'nazionale', label: 'Nazionale', color: 'purple', icon: Globe },
        { value: 'europeo', label: 'Europeo', color: 'yellow', icon: Globe },
    ];

    const categorieOpzioni = [
        { value: 'digitalizzazione', label: 'Digitalizzazione', color: 'blue' },
        { value: 'ambiente', label: 'Ambiente', color: 'green' },
        { value: 'formazione', label: 'Formazione', color: 'yellow' },
        { value: 'sociale', label: 'Sociale', color: 'red' },
        { value: 'cultura', label: 'Cultura', color: 'purple' },
        { value: 'infrastrutture', label: 'Infrastrutture', color: 'orange' },
        { value: 'agricoltura', label: 'Agricoltura', color: 'teal' },
        { value: 'pesca', label: 'Pesca/Acquacoltura', color: 'cyan' },
    ];

    const statOpzioni = [
        { value: 'aperto', label: 'Aperto', color: 'green' },
        { value: 'in_scadenza', label: 'In scadenza', color: 'yellow' },
        { value: 'chiuso', label: 'Chiuso', color: 'red' },
        { value: 'scaduto', label: 'Scaduto', color: 'gray' },
    ];

    const settoreOpzioni = [
        { value: 'edilizia', label: 'Edilizia' },
        { value: 'agricoltura', label: 'Agricoltura' },
        { value: 'pesca', label: 'Pesca' },
        { value: 'foreste', label: 'Foreste' },
        { value: 'promozione', label: 'Promozione' },
        { value: 'innovazione', label: 'Innovazione' },
    ];

    const toggleFilter = (array: string[], value: string) => {
        return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
    };

    const handleSearch = async () => {
        setSearching(true);
        setBandi([]);
        
        try {
            const response = await fetch('/bandi/cerca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(filters)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setBandi(data.bandi || []);
                setMessage(data.message);
                setFallback(data.fallback || false);
                setShowAdvancedStats(true);
            } else {
                setMessage(data.message || 'Errore durante la ricerca');
                setShowAdvancedStats(false);
            }
        } catch (error) {
            console.error('Errore ricerca:', error);
            setMessage('Errore di connessione al server');
        } finally {
            setSearching(false);
        }
    };

    // CHART 1: Trend Bandi
    const trendData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        datasets: [{
            label: 'Bandi Pubblicati',
            data: [12, 15, 18, 22, 28, 35, 42, 38, 45, 52, 48, 55],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4,
        }]
    };

    // CHART 2: Tipo Finanziamento
    const finanziamentoData = {
        labels: ['Fondo perduto', 'Contributo capitale', 'Concessione', 'Agevolazione fiscale'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 0,
        }]
    };

    // CHART 3: Bandi per Stato
    const statoData = {
        labels: ['Aperti', 'In scadenza', 'Chiusi', 'Scaduti'],
        datasets: [{
            label: 'Numero Bandi',
            data: [35, 12, 28, 18],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
            borderRadius: 8,
        }]
    };

    // CHART 4: Budget per Categoria
    const budgetPerCategoriaData = {
        labels: ['Digitalizzazione', 'Ambiente', 'Formazione', 'Sociale', 'Cultura', 'Infrastrutture', 'Agricoltura'],
        datasets: [{
            label: 'Budget (Milioni €)',
            data: bandi.length > 0 ? [8.5, 12.3, 5.2, 3.8, 4.1, 15.6, 7.2] : [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
        }]
    };

    // CHART 5: Distribuzione Scadenze
    const scadenzeData = {
        labels: ['< 30gg', '30-60gg', '60-90gg', '> 90gg'],
        datasets: [{
            label: 'Bandi in scadenza',
            data: bandi.length > 0 ? [5, 12, 8, 3] : [0, 0, 0, 0],
            backgroundColor: '#f59e0b',
            borderRadius: 8,
        }]
    };

    // CHART 6: Match per Livello
    const matchLivelloData = {
        labels: ['Comunale', 'Regionale', 'Nazionale', 'Europeo'],
        datasets: [{
            data: bandi.length > 0 ? [15, 45, 30, 10] : [0, 0, 0, 0],
            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { size: 11 } } },
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
            legend: { position: 'bottom' as const, labels: { color: '#94a3b8', font: { size: 10 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        layout: { padding: 10 }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { size: 11 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, beginAtZero: true },
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        },
        layout: { padding: 10 }
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#94a3b8' } },
            tooltip: { backgroundColor: '#1e293b' }
        },
        scales: {
            r: {
                ticks: { color: '#94a3b8', backdropColor: 'transparent' },
                grid: { color: '#334155' },
                angleLines: { color: '#334155' },
                beginAtZero: true
            }
        },
        layout: { padding: 10 }
    };

    const stats = [
        { title: 'Bandi Totali', value: bandi.length, icon: FileText, color: 'blue' },
        { title: 'Match Alto (>80%)', value: bandi.filter(b => b.punteggio >= 80).length, icon: Award, color: 'green' },
        { title: 'Budget Medio', value: '€2.5M', icon: TrendingUp, color: 'purple' },
        { title: 'In Scadenza (<30gg)', value: bandi.filter(b => b.giorni_scadenza <= 30).length, icon: Clock, color: 'orange' },
    ];

    return (
        <LayoutEnte>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <Zap className="h-8 w-8 text-yellow-400" />
                            Bandi Finder Avanzato
                        </h1>
                        <p className="text-slate-400 mt-2">Cerca bandi e finanziamenti con filtri intelligenti</p>
                    </div>

                    {/* CHART ROW 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-white mb-3 text-center">Trend Bandi nel Tempo</h3>
                            <div className="h-[250px] flex items-center justify-center">
                                <div className="w-full"><Line data={trendData} options={chartOptions} /></div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-white mb-3 text-center">Tipo Finanziamento</h3>
                            <div className="h-[250px] flex items-center justify-center">
                                <div className="w-full max-w-[220px]"><Doughnut data={finanziamentoData} options={doughnutOptions} /></div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-white mb-3 text-center">Bandi per Stato</h3>
                            <div className="h-[250px] flex items-center justify-center">
                                <div className="w-full"><Bar data={statoData} options={barOptions} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Filtri */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Filtri di Ricerca</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Livello Geografico</label>
                                <div className="flex flex-wrap gap-3">
                                    {livelliOpzioni.map((opt) => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setFilters({...filters, livello: toggleFilter(filters.livello, opt.value)})}
                                            className={`px-4 py-2 rounded-lg transition-all ${filters.livello.includes(opt.value)
                                                ? `bg-${opt.color}-500/20 text-${opt.color}-400 border border-${opt.color}-500/50`
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Categorie</label>
                                <div className="flex flex-wrap gap-2">
                                    {categorieOpzioni.map((cat) => (
                                        <button key={cat.value} type="button"
                                            onClick={() => setFilters({...filters, categoria: toggleFilter(filters.categoria, cat.value)})}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${filters.categoria.includes(cat.value)
                                                ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/50`
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Stato Bando</label>
                                <div className="flex flex-wrap gap-3">
                                    {statOpzioni.map((opt) => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setFilters({...filters, stato: toggleFilter(filters.stato, opt.value)})}
                                            className={`px-4 py-2 rounded-lg transition-all ${filters.stato.includes(opt.value)
                                                ? `bg-${opt.color}-500/20 text-${opt.color}-400 border border-${opt.color}-500/50`
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Settore Specifico</label>
                                <div className="flex flex-wrap gap-2">
                                    {settoreOpzioni.map((set) => (
                                        <button key={set.value} type="button"
                                            onClick={() => setFilters({...filters, settore: toggleFilter(filters.settore, set.value)})}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${filters.settore.includes(set.value)
                                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                            {set.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Importo Minimo (€)</label>
                                    <input type="number" value={filters.importoMin}
                                        onChange={(e) => setFilters({...filters, importoMin: e.target.value})}
                                        placeholder="0" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Importo Massimo (€)</label>
                                    <input type="number" value={filters.importoMax}
                                        onChange={(e) => setFilters({...filters, importoMax: e.target.value})}
                                        placeholder="Nessun limite" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Scadenza</label>
                                <select value={filters.scadenza} onChange={(e) => setFilters({...filters, scadenza: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                                    <option value="tutti">Tutti</option>
                                    <option value="7">Prossimi 7 giorni</option>
                                    <option value="15">Prossimi 15 giorni</option>
                                    <option value="30">Prossimi 30 giorni</option>
                                    <option value="60">Prossimi 60 giorni</option>
                                </select>
                            </div>

                            <button onClick={handleSearch} disabled={searching}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition">
                                {searching ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ricerca in corso...</>) : (<><Search className="h-5 w-5" /> Cerca Bandi</>)}
                            </button>
                        </div>
                    </div>

                    {/* Messaggio */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${fallback ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {fallback ? <AlertCircle className="h-5 w-5 inline mr-2" /> : null}{message}
                        </div>
                    )}

                    {/* Statistiche */}
                    {bandi.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat) => (
                                <div key={stat.title} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-sm text-slate-400">{stat.title}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
                                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                                            <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CHART ROW 2 */}
                    {showAdvancedStats && bandi.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-sm font-semibold text-white mb-3 text-center">Budget per Categoria (Milioni €)</h3>
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="w-full max-w-[280px]"><Radar data={budgetPerCategoriaData} options={radarOptions} /></div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-sm font-semibold text-white mb-3 text-center">Distribuzione Scadenze</h3>
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="w-full"><Bar data={scadenzeData} options={barOptions} /></div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-sm font-semibold text-white mb-3 text-center">Match per Livello Geografico</h3>
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="w-full max-w-[220px]"><Doughnut data={matchLivelloData} options={doughnutOptions} /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risultati */}
                    {bandi.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">🎯 Bandi Trovati ({bandi.length})</h2>
                            {bandi.map((bando: any) => (
                                <div key={bando.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition cursor-pointer"
                                    onClick={() => router.visit(`/bandi/${bando.id}`)}>
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-xl font-bold text-white">{bando.titolo}</h3>
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">{bando.livello}</span>
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">{bando.categoria}</span>
                                            </div>
                                            <p className="text-slate-300 mt-2">{bando.descrizione}</p>
                                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                                <span className="flex items-center gap-1 text-slate-400"><Building2 className="h-4 w-4" /> {bando.ente_erogatore}</span>
                                                <span className="flex items-center gap-1 text-slate-400"><Calendar className="h-4 w-4" /> Scade: {bando.scadenza}</span>
                                                <span className="flex items-center gap-1 text-slate-400"><Euro className="h-4 w-4" /> Budget: {bando.budget_totale}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${bando.punteggio >= 80 ? 'text-green-400 bg-green-500/20' : bando.punteggio >= 60 ? 'text-yellow-400 bg-yellow-500/20' : 'text-red-400 bg-red-500/20'}`}>
                                                Match {bando.punteggio}%
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                                                <div className={`h-1.5 rounded-full ${bando.punteggio >= 80 ? 'bg-green-500' : bando.punteggio >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${bando.punteggio}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Nessun risultato */}
                    {!searching && bandi.length === 0 && message === '' && (
                        <div className="text-center py-12 text-slate-400">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Utilizza i filtri per trovare bandi adatti al tuo ente</p>
                        </div>
                    )}
                </div>
            </div>
        </LayoutEnte>
    );
}