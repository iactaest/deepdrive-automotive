import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    Landmark,
    TrendingUp,
    Users,
    Award,
    Shield,
    BarChart3,
    PieChart,
    Sparkles
} from 'lucide-react';

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }: any) {
    const [animatedValues, setAnimatedValues] = useState<number[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        // Animazione barre all'entrata (si bloccano dopo 1.5s)
        const categories = [78, 65, 82, 70, 58];
        const initialValues = categories.map(() => 0);
        setAnimatedValues(initialValues);

        const startTime = Date.now();
        const duration = 1500; // 1.5 secondi

        const animateBars = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing ease-out
            const eased = 1 - Math.pow(1 - progress, 3);

            const newValues = categories.map((target) => Math.round(target * eased));
            setAnimatedValues(newValues);

            if (progress < 1) {
                requestAnimationFrame(animateBars);
            }
        };

        requestAnimationFrame(animateBars);
    }, []);

    // Dati per i grafici — palette unificata (verde/smeraldo/teal), niente arcobaleno
    const stats = [
        { icon: Landmark, label: 'Bandi Attivi', value: '1.247', change: '+12%' },
        { icon: TrendingUp, label: 'Match Trovati', value: '8.532', change: '+23%' },
        { icon: Users, label: 'Enti Registrati', value: '3.891', change: '+8%' },
        { icon: Award, label: 'Progetti Finanziati', value: '€142M', change: '+18%' },
    ];

    const categories = [
        { label: 'Digitalizzazione', percentage: 78, color: 'from-emerald-500 to-teal-400' },
        { label: 'Ambiente & Green', percentage: 65, color: 'from-teal-500 to-cyan-400' },
        { label: 'Innovazione Sociale', percentage: 82, color: 'from-green-500 to-emerald-400' },
    ];

    const features = [
        { icon: Shield, title: 'Matching Intelligente', desc: 'AI avanzata per trovare i bandi perfetti per il tuo ente' },
        { icon: BarChart3, title: 'Analisi in Tempo Reale', desc: 'Monitora le performance e le opportunità in tempo reale' },
        { icon: Sparkles, title: 'Scopri Nuove Opportunità', desc: 'Ricevi notifiche personalizzate sui bandi più rilevanti' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">

            {/* Luce fioca al centro — un'unica famiglia cromatica (verde/teal), più sobria */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-2xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Landmark className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Deep<span className="text-emerald-400">Bandi</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        {canLogin && (
                            <>
                                {canRegister && (
                                    <Link href="/register" className="text-slate-400 hover:text-white transition px-4 py-2 rounded-lg text-sm font-medium">
                                        Registrati
                                    </Link>
                                )}
                                <Link href="/login" className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                    Accedi <ChevronRight className="h-4 w-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Piattaforma di Matching Bandi</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                            Trova i Bandi <br />
                            <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Perfetti per Te</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                            DeepBandi utilizza l'intelligenza artificiale per analizzare il profilo del tuo ente
                            e suggerirti le migliori opportunità di finanziamento.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={canLogin ? '/login' : '/register'} className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white px-8 py-3 rounded-xl font-medium transition shadow-xl shadow-emerald-500/20 flex items-center gap-2 justify-center">
                                Inizia Ora <ChevronRight className="h-5 w-5" />
                            </Link>
                            <a href="#features" className="border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 justify-center">
                                Scopri di più
                            </a>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
                        {stats.map((stat, idx) => (
                            <div key={idx} className={`bg-slate-800/40 backdrop-blur-sm rounded-xl p-5 border border-slate-700/30 transition-all duration-700 hover:border-emerald-500/30 hover:bg-slate-800/60 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                                <div className="flex items-center justify-between">
                                    <stat.icon className="h-5 w-5 text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section - CARD IN ORDINE: CATEGORIE + PERCHÉ DEEPBANDI */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                        {/* Categorie Chart - Card 1 (SINISTRA) */}
                        <div className={`bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 transition-all duration-700 hover:border-emerald-500/30 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-white font-semibold">Categorie più Richieste</h3>
                            </div>
                            <div className="space-y-2">
                                {categories.map((cat, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{cat.label}</span>
                                            <span className="text-white">{animatedValues[idx] || 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-1000 ease-out`}
                                                style={{ width: `${animatedValues[idx] || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Perché DeepBandi - Card 2 (DESTRA) */}
                        <div className={`bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 transition-all duration-700 hover:border-emerald-500/30 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-white font-semibold">Perché DeepBandi?</h3>
                            </div>
                            <div className="space-y-4">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                                            <p className="text-slate-400 text-xs">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
