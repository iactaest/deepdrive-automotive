import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Building2, Landmark, ArrowRight } from 'lucide-react';

export default function Landing() {
    const [tipo, setTipo] = useState<'impresa' | 'ente' | null>(null);

    const handleContinue = () => {
        if (tipo === 'impresa') {
            router.visit('/profilo-impresa');
        } else if (tipo === 'ente') {
            router.visit('/bandi/ricerca');
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            📢 Bandi e Finanziamenti
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Trova i bandi più adatti alla tua organizzazione con l'aiuto dell'AI
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Impresa Privata */}
                        <div
                            onClick={() => setTipo('impresa')}
                            className={`
                                cursor-pointer rounded-2xl p-8 transition-all duration-300
                                ${tipo === 'impresa' 
                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-blue-400 scale-105' 
                                    : 'bg-slate-800/50 border border-slate-700/50 hover:scale-105 hover:border-blue-500'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Building2 className="h-10 w-10 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Impresa Privata</h2>
                                <p className="text-slate-300">
                                    Azienda, Startup, PMI, Libero professionista
                                </p>
                                <ul className="mt-4 text-sm text-slate-400 space-y-1">
                                    <li>✓ Cerca finanziamenti e agevolazioni</li>
                                    <li>✓ Partecipa a bandi regionali/nazionali</li>
                                    <li>✓ Match automatico con il tuo profilo</li>
                                </ul>
                            </div>
                        </div>

                        {/* Ente Pubblico */}
                        <div
                            onClick={() => setTipo('ente')}
                            className={`
                                cursor-pointer rounded-2xl p-8 transition-all duration-300
                                ${tipo === 'ente' 
                                    ? 'bg-gradient-to-br from-green-600 to-teal-600 border-2 border-green-400 scale-105' 
                                    : 'bg-slate-800/50 border border-slate-700/50 hover:scale-105 hover:border-green-500'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Landmark className="h-10 w-10 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Ente Pubblico</h2>
                                <p className="text-slate-300">
                                    Comune, Regione, ASL, Università, Scuola
                                </p>
                                <ul className="mt-4 text-sm text-slate-400 space-y-1">
                                    <li>✓ Cerca appalti e gare d'appalto</li>
                                    <li>✓ Trova fornitori qualificati</li>
                                    <li>✓ Gestisci procedure pubbliche</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={handleContinue}
                            disabled={!tipo}
                            className={`
                                px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
                                ${tipo 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }
                            `}
                        >
                            Continua
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}