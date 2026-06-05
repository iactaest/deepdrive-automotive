import { Link } from '@inertiajs/react';
import { Search, TrendingUp, Award, Globe, Shield, Zap, ArrowRight, Sparkles, Target, Rocket } from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Effetto profondità sfondo */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-6 py-4 border-b border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 group">
                    <div className="relative">
                        <Search className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md group-hover:blur-xl transition" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                        DeepBandi
                    </span>
                </div>
                <div className="space-x-4">
                    <Link
                        href="/login"
                        className="px-4 py-2 text-white hover:text-blue-400 transition"
                    >
                        Accedi
                    </Link>
                    <Link
                        href="/register"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition shadow-lg shadow-blue-500/25"
                    >
                        Registrati
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="text-center max-w-4xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Piattaforma Bandi AI</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        Trova il{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Bando Perfetto
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        DeepBandi è la piattaforma intelligente che ti aiuta a scoprire bandi, finanziamenti e opportunità su misura per la tua organizzazione.
                    </p>

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 group"
                        >
                            Inizia Ora
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                        </Link>
                        <Link
                            href="/bandi"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-800/50 border border-slate-700 hover:border-blue-500 rounded-lg text-white font-semibold transition-all duration-200 group"
                        >
                            Esplora Bandi
                            <Search className="h-5 w-5 group-hover:scale-110 transition" />
                        </Link>
                    </div>

                    {/* Statistiche */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">10k+</p>
                            <p className="text-sm text-slate-400">Bandi Attivi</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">€5B+</p>
                            <p className="text-sm text-slate-400">Budget Totale</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">50k+</p>
                            <p className="text-sm text-slate-400">Organizzazioni</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">98%</p>
                            <p className="text-sm text-slate-400">Match Accuracy</p>
                        </div>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="group relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-sm p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Search className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Ricerca Intelligente</h3>
                            <p className="text-slate-400 text-sm">Cerca bandi per settore, regione, budget e scadenza con filtri avanzati.</p>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-sm p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Sparkles className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Match con AI</h3>
                            <p className="text-slate-400 text-sm">Ricevi bandi consigliati in base al profilo della tua organizzazione.</p>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-sm p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Target className="h-6 w-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Monitoraggio Scadenze</h3>
                            <p className="text-slate-400 text-sm">Non perdere mai una scadenza con alert automatici e promemoria.</p>
                        </div>
                    </div>

                    {/* Sezione Tipologie Utenti */}
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-white mb-8">Una piattaforma per ogni organizzazione</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <span className="text-2xl mb-2 block">🏢</span>
                                <p className="text-white font-medium">Impresa</p>
                                <p className="text-xs text-slate-400">Privata</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <span className="text-2xl mb-2 block">🏛️</span>
                                <p className="text-white font-medium">Ente</p>
                                <p className="text-xs text-slate-400">Pubblico</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <span className="text-2xl mb-2 block">🤝</span>
                                <p className="text-white font-medium">Associazione</p>
                                <p className="text-xs text-slate-400">No-Profit</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <span className="text-2xl mb-2 block">👤</span>
                                <p className="text-white font-medium">Professionista</p>
                                <p className="text-xs text-slate-400">Libero</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA finale */}
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-slate-700/50">
                        <h3 className="text-xl font-semibold text-white mb-2">Pronto a trovare il bando giusto?</h3>
                        <p className="text-slate-400 mb-4">Unisciti a migliaia di organizzazioni che già utilizzano DeepBandi</p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition"
                        >
                            Registrati Gratuitamente
                            <Rocket className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}