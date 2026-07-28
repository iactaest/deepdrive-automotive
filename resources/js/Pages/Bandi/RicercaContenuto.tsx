import { useState } from 'react';
import { router } from '@inertiajs/react';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';
import { Search, Calendar, Euro, Building2, TrendingUp, AlertCircle, Filter, Zap, Globe, Landmark, Award, Clock, FileText, MapPin } from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale);

// Contenuto senza LayoutEnte: riusato sia nella pagina normale sia
// incorporato in DashboardMobile (griglie a colonna singola in compatto). La
// ricerca usa gia' un fetch verso /bandi/cerca (non una navigazione Inertia),
// quindi resta funzionante cosi' com'e' anche incorporata nel menu.
export default function RicercaContenuto({ profilo, compatto = false }: any) {
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

    // Opzioni filtri — colori presi dalla stessa scala desaturata (PALETTE_BOLLA)
    // usata per bordi delle card in tutta l'app, invece delle classi Tailwind
    // generiche bg-${color}-500 (che oltretutto il build non genera, dato che
    // sono costruite a runtime e JIT non le vede mai come stringa letterale).
    const livelliOpzioni = [
        { value: 'comunale', label: 'Comunale', colore: PALETTE_BOLLA[1], icon: MapPin },
        { value: 'regionale', label: 'Regionale', colore: PALETTE_BOLLA[0], icon: Landmark },
        { value: 'nazionale', label: 'Nazionale', colore: PALETTE_BOLLA[3], icon: Globe },
        { value: 'europeo', label: 'Europeo', colore: PALETTE_BOLLA[2], icon: Globe },
    ];

    const categorieOpzioni = [
        { value: 'digitalizzazione', label: 'Digitalizzazione', colore: PALETTE_BOLLA[1] },
        { value: 'ambiente', label: 'Ambiente', colore: PALETTE_BOLLA[0] },
        { value: 'formazione', label: 'Formazione', colore: PALETTE_BOLLA[2] },
        { value: 'sociale', label: 'Sociale', colore: PALETTE_BOLLA[7] },
        { value: 'cultura', label: 'Cultura', colore: PALETTE_BOLLA[3] },
        { value: 'infrastrutture', label: 'Infrastrutture', colore: PALETTE_BOLLA[8] },
        { value: 'agricoltura', label: 'Agricoltura', colore: PALETTE_BOLLA[9] },
        { value: 'pesca', label: 'Pesca/Acquacoltura', colore: PALETTE_BOLLA[5] },
    ];

    const statOpzioni = [
        { value: 'aperto', label: 'Aperto', colore: PALETTE_BOLLA[0] },
        { value: 'in_scadenza', label: 'In scadenza', colore: PALETTE_BOLLA[2] },
        { value: 'chiuso', label: 'Chiuso', colore: PALETTE_BOLLA[7] },
        { value: 'scaduto', label: 'Scaduto', colore: '#8B93A1' },
    ];

    const settoreOpzioni = [
        { value: 'edilizia', label: 'Edilizia', colore: PALETTE_BOLLA[2] },
        { value: 'agricoltura', label: 'Agricoltura', colore: PALETTE_BOLLA[0] },
        { value: 'pesca', label: 'Pesca', colore: PALETTE_BOLLA[5] },
        { value: 'foreste', label: 'Foreste', colore: PALETTE_BOLLA[9] },
        { value: 'promozione', label: 'Promozione', colore: PALETTE_BOLLA[7] },
        { value: 'innovazione', label: 'Innovazione', colore: PALETTE_BOLLA[3] },
    ];

    const toggleFilter = (array: string[], value: string) => {
        return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
    };

    // Stile pillola per i bottoni filtro: non selezionato = neutro scuro,
    // selezionato = sfumatura leggera del colore assegnato + bordo pieno e
    // lieve bagliore, stessa logica "bolla" usata nel resto dell'app invece
    // delle classi Tailwind bg-${color}-500 generate a runtime.
    const stileFiltro = (colore: string, selezionato: boolean): React.CSSProperties =>
        selezionato
            ? {
                  background: `linear-gradient(145deg, ${colore}33, ${colore}1A)`,
                  borderColor: colore,
                  color: colore,
                  boxShadow: `0 0 0 1px ${colore}40, 0 4px 10px ${colore}26`,
              }
            : {
                  background: 'rgba(255,255,255,.03)',
                  borderColor: 'rgba(255,255,255,.12)',
                  color: '#94a3b8',
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
        maintainAspectRatio: false,
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
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: '#94a3b8', font: { size: 10 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        layout: { padding: 10 }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
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
        maintainAspectRatio: false,
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

    const grigliaChart = `grid grid-cols-1 gap-6 mb-8 ${compatto ? '' : 'sm:grid-cols-3'}`;
    const grigliaStat = `grid grid-cols-1 gap-6 mb-8 ${compatto ? '' : 'md:grid-cols-4'}`;

    return (
        <>
            {/* Header */}
            <div className="mb-8 text-center" style={{ marginTop: 25 }}>
                <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2.5">
                    <Zap className="card-bolla-icona h-8 w-8 text-yellow-400" />
                    Bandi Finder Avanzato
                </h1>
                <p className="text-slate-300 mt-2">Cerca bandi e finanziamenti con filtri intelligenti</p>
            </div>

            {/* CHART ROW 1 */}
            <div className={grigliaChart}>
                <CardBolla bordo={PALETTE_BOLLA[0]} indice={0} className="p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-3 text-center">Trend Bandi nel Tempo</h3>
                    <div className="relative h-[280px] w-full"><Line data={trendData} options={chartOptions} /></div>
                </CardBolla>
                <CardBolla bordo={PALETTE_BOLLA[1]} indice={1} className="p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-3 text-center">Tipo Finanziamento</h3>
                    <div className="relative h-[280px] w-full"><Doughnut data={finanziamentoData} options={doughnutOptions} /></div>
                </CardBolla>
                <CardBolla bordo={PALETTE_BOLLA[2]} indice={2} className="p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-3 text-center">Bandi per Stato</h3>
                    <div className="relative h-[280px] w-full"><Bar data={statoData} options={barOptions} /></div>
                </CardBolla>
            </div>

            {/* Filtri */}
            <CardBolla bordo={PALETTE_BOLLA[3]} indice={3} className="p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                    <Filter className="h-5 w-5" style={{ color: PALETTE_BOLLA[3] }} />
                    <h2 className="text-lg font-semibold text-white">Filtri di Ricerca</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Livello Geografico</label>
                        <div className="flex flex-wrap gap-3">
                            {livelliOpzioni.map((opt) => {
                                const selezionato = filters.livello.includes(opt.value);
                                return (
                                    <button key={opt.value} type="button"
                                        onClick={() => setFilters({...filters, livello: toggleFilter(filters.livello, opt.value)})}
                                        style={stileFiltro(opt.colore, selezionato)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all">
                                        <opt.icon className="h-3.5 w-3.5" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Categorie</label>
                        <div className="flex flex-wrap gap-2">
                            {categorieOpzioni.map((cat) => {
                                const selezionato = filters.categoria.includes(cat.value);
                                return (
                                    <button key={cat.value} type="button"
                                        onClick={() => setFilters({...filters, categoria: toggleFilter(filters.categoria, cat.value)})}
                                        style={stileFiltro(cat.colore, selezionato)}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all">
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Stato Bando</label>
                        <div className="flex flex-wrap gap-3">
                            {statOpzioni.map((opt) => {
                                const selezionato = filters.stato.includes(opt.value);
                                return (
                                    <button key={opt.value} type="button"
                                        onClick={() => setFilters({...filters, stato: toggleFilter(filters.stato, opt.value)})}
                                        style={stileFiltro(opt.colore, selezionato)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-all">
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Settore Specifico</label>
                        <div className="flex flex-wrap gap-2">
                            {settoreOpzioni.map((set) => {
                                const selezionato = filters.settore.includes(set.value);
                                return (
                                    <button key={set.value} type="button"
                                        onClick={() => setFilters({...filters, settore: toggleFilter(filters.settore, set.value)})}
                                        style={stileFiltro(set.colore, selezionato)}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all">
                                        {set.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 gap-4 ${compatto ? '' : 'md:grid-cols-2'}`}>
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
                        className="w-full py-3 bg-gradient-to-r from-[#4FA39B] to-[#66AB93] hover:from-[#66AB93] hover:to-[#7CB08A] text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-[#66AB93]/20">
                        {searching ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ricerca in corso...</>) : (<><Search className="h-5 w-5" /> Cerca Bandi</>)}
                    </button>
                </div>
            </CardBolla>

            {/* Messaggio */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${fallback ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {fallback ? <AlertCircle className="h-5 w-5 inline mr-2" /> : null}{message}
                </div>
            )}

            {/* Statistiche */}
            {bandi.length > 0 && (
                <div className={grigliaStat}>
                    {stats.map((stat, idx) => (
                        <CardBolla key={stat.title} bordo={PALETTE_BOLLA[idx % PALETTE_BOLLA.length]} indice={idx} className="p-4">
                            <div className="flex justify-between items-start">
                                <div><p className="text-sm text-slate-400">{stat.title}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
                                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                                </div>
                            </div>
                        </CardBolla>
                    ))}
                </div>
            )}

            {/* CHART ROW 2 */}
            {showAdvancedStats && bandi.length > 0 && (
                <div className={grigliaChart}>
                    <CardBolla bordo={PALETTE_BOLLA[4]} indice={4} className="p-4 flex flex-col">
                        <h3 className="text-sm font-semibold text-white mb-3 text-center">Budget per Categoria (Milioni €)</h3>
                        <div className="relative h-[280px] w-full"><Radar data={budgetPerCategoriaData} options={radarOptions} /></div>
                    </CardBolla>
                    <CardBolla bordo={PALETTE_BOLLA[5]} indice={5} className="p-4 flex flex-col">
                        <h3 className="text-sm font-semibold text-white mb-3 text-center">Distribuzione Scadenze</h3>
                        <div className="relative h-[280px] w-full"><Bar data={scadenzeData} options={barOptions} /></div>
                    </CardBolla>
                    <CardBolla bordo={PALETTE_BOLLA[6]} indice={6} className="p-4 flex flex-col">
                        <h3 className="text-sm font-semibold text-white mb-3 text-center">Match per Livello Geografico</h3>
                        <div className="relative h-[280px] w-full"><Doughnut data={matchLivelloData} options={doughnutOptions} /></div>
                    </CardBolla>
                </div>
            )}

            {/* Risultati */}
            {bandi.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">🎯 Bandi Trovati ({bandi.length})</h2>
                    {bandi.map((bando: any, idx: number) => (
                        <CardBolla key={bando.id} bordo={PALETTE_BOLLA[idx % PALETTE_BOLLA.length]} indice={idx} className="p-6 hover:brightness-110 transition cursor-pointer"
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
                        </CardBolla>
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
        </>
    );
}
