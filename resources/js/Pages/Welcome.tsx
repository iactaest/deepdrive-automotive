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
    Sparkles
} from 'lucide-react';

// Stesso trattamento "bolla" usato nella dashboard mobile (pattern in
// trasparenza + gradiente "3D" + bordo colorato + icone in rilievo), cosi le
// card della landing restano coerenti con lo stile dell'app.
const CSS_CARD = `
.lp-card {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    background: linear-gradient(145deg, rgba(69,79,89,.01), rgba(51,59,69,.01) 55%, rgba(36,43,51,.01));
    box-shadow: 0 10px 22px rgba(0,0,0,.4), inset 0 2px 3px rgba(255,255,255,.14), inset 0 -4px 8px rgba(0,0,0,.25);
}
.lp-bg {
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
.lp-icona {
    filter: drop-shadow(0 2px 2px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.12));
}
`;

// Stessa scala di colori usata per le card della dashboard mobile.
const COLORE_STAT = ['#7CB08A', '#8FA3C7', '#C0975F', '#9C93C7'];

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }: any) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const stats = [
        { icon: Landmark, label: 'Bandi Attivi', value: '1.247', change: '+12%' },
        { icon: TrendingUp, label: 'Match Trovati', value: '8.532', change: '+23%' },
        { icon: Users, label: 'Enti Registrati', value: '3.891', change: '+8%' },
        { icon: Award, label: 'Progetti Finanziati', value: '€142M', change: '+18%' },
    ];

    const features = [
        { icon: Shield, title: 'Matching Intelligente', desc: 'AI avanzata per trovare i bandi perfetti per il tuo ente' },
        { icon: BarChart3, title: 'Analisi in Tempo Reale', desc: 'Monitora le performance e le opportunità in tempo reale' },
        { icon: Sparkles, title: 'Scopri Nuove Opportunità', desc: 'Ricevi notifiche personalizzate sui bandi più rilevanti' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            <style>{CSS_CARD}</style>

            {/* Luce fioca al centro — un'unica famiglia cromatica (verde/teal), più sobria */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#66AB93]/10 blur-3xl animate-pulse" />
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#4FA39B]/5 blur-2xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-3" style={{ marginTop: -10 }}>
                        <img src="/images/logo-deepbandi-chiaro.png" alt="DeepBandi" className="h-[78px] w-auto" />
                    </div>
                    <div className="flex items-center gap-4" style={{ marginTop: -10 }}>
                        {canLogin && (
                            <>
                                {canRegister && (
                                    <Link href="/register" className="text-slate-400 hover:text-white transition px-4 py-2 rounded-lg text-sm font-medium border border-slate-600">
                                        Registrati
                                    </Link>
                                )}
                                <Link href="/login" className="bg-gradient-to-r from-[#4FA39B] to-[#66AB93] hover:from-[#66AB93] hover:to-[#7CB08A] text-white px-6 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-[#66AB93]/20 flex items-center gap-2">
                                    Accedi <ChevronRight className="h-4 w-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#66AB93]/10 border border-[#66AB93]/20 mb-6">
                            <Sparkles className="h-3.5 w-3.5 text-[#7CB08A]" />
                            <span className="text-xs text-[#7CB08A] font-medium">Piattaforma di Matching Bandi</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                            Trova i Bandi <br />
                            <span className="bg-gradient-to-r from-[#7CB08A] to-[#4FA39B] bg-clip-text text-transparent">Perfetti per Te</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                            DeepBandi utilizza l'intelligenza artificiale per analizzare il profilo del tuo ente
                            e suggerirti le migliori opportunità di finanziamento.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={canLogin ? '/login' : '/register'} className="bg-gradient-to-r from-[#4FA39B] to-[#66AB93] hover:from-[#66AB93] hover:to-[#7CB08A] text-white px-8 py-3 rounded-xl font-medium transition shadow-xl shadow-[#66AB93]/20 flex items-center gap-2 justify-center">
                                Inizia Ora <ChevronRight className="h-5 w-5" />
                            </Link>
                            <a href="#features" className="border border-slate-700 hover:border-[#66AB93]/40 text-slate-300 hover:text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 justify-center">
                                Scopri di più
                            </a>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className={`lp-card rounded-xl p-5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                style={{ transitionDelay: `${idx * 100}ms`, borderWidth: 2, borderStyle: 'solid', borderColor: COLORE_STAT[idx] }}
                            >
                                <span className="lp-bg" />
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <stat.icon className="lp-icona h-5 w-5" style={{ color: COLORE_STAT[idx] }} />
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{ color: COLORE_STAT[idx], backgroundColor: `${COLORE_STAT[idx]}1A` }}
                                        >
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                                    <p className="text-xs text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Perché DeepBandi - card unica a piena larghezza (12 colonne) sotto le 4 stat card */}
                    <div className="grid grid-cols-12 gap-6 mt-12">
                        <div
                            className={`lp-card col-span-12 rounded-xl p-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: '400ms', borderWidth: 2, borderStyle: 'solid', borderColor: '#66AB93' }}
                        >
                            <span className="lp-bg" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="lp-icona h-5 w-5 text-[#66AB93]" />
                                    <h3 className="text-white font-semibold">Perché DeepBandi?</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-[#66AB93]/10 flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="lp-icona h-4 w-4 text-[#66AB93]" />
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
        </div>
    );
}
