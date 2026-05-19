import { Link } from '@inertiajs/react';
import { Car, Bot, Shield, TrendingUp } from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Overlay luce centrale */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Car className="h-8 w-8 text-blue-500" />
                    <span className="text-xl font-bold text-white">DeepDrive Auto</span>
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Registrati
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="text-center max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Gestisci la tua <span className="text-blue-500">Concessionaria</span> con AI
                    </h1>
                    <p className="text-xl text-slate-300 mb-8">
                        DeepDrive Automotive è l'assistente intelligente che centralizza clienti, veicoli e diagnostica,
                        aiutandoti a prendere decisioni basate sui dati.
                    </p>
                    
                    {/* Feature cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <Bot className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Diagnostica AI</h3>
                            <p className="text-slate-400 text-sm">Analisi intelligente dei problemi dei veicoli con DeepSeek.</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <Shield className="h-10 w-10 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Gestione Clienti</h3>
                            <p className="text-slate-400 text-sm">Centralizza anagrafiche, veicoli e storico interventi.</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <TrendingUp className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Analisi Tendenze</h3>
                            <p className="text-slate-400 text-sm">Individua pattern e problemi ricorrenti per modello.</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-12">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20"
                        >
                            Inizia Ora
                            <Car className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}