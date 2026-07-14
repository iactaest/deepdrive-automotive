import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Bot, Send, Trash2, User, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Conversazione {
    id: number;
    domanda: string;
    risposta: string | null;
    created_at: string;
}

interface AssistenteProps {
    conversazioni: Conversazione[];
}

export default function Assistente({ conversazioni }: AssistenteProps) {
    const { user } = usePage().props.auth;
    const [domanda, setDomanda] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domanda.trim() || isSubmitting) return;

        setIsSubmitting(true);
        
        // Submit del form via Inertia
        const form = new FormData();
        form.append('domanda', domanda);
        
        await fetch('/assistente/invia', {
            method: 'POST',
            body: form,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        
        setDomanda('');
        setIsSubmitting(false);
        window.location.href = '/assistente';
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3">
                                <Bot className="h-10 w-10 text-purple-400" />
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Assistente Virtuale Bandi</h1>
                                    <p className="text-slate-400 mt-1">
                                        Chiedimi tutto su bandi, finanziamenti, requisiti e scadenze per la tua PA
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form per nuova domanda */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 sticky top-24">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-5 w-5 text-purple-400" />
                                        <h3 className="text-lg font-semibold text-white">Nuova Domanda</h3>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <textarea
                                            value={domanda}
                                            onChange={(e) => setDomanda(e.target.value)}
                                            rows={5}
                                            required
                                            disabled={isSubmitting}
                                            placeholder="Es: Quali documenti servono di solito per partecipare a un bando PNRR?"
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                        
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Invio in corso...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Invia Domanda
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    
                                    <div className="mt-6 p-4 bg-slate-900/30 rounded-lg">
                                        <p className="text-xs text-slate-400">
                                            💡 <span className="font-semibold">Suggerimenti:</span><br />
                                            • Fai domande chiare e specifiche<br />
                                            • L'AI risponderà in pochi secondi<br />
                                            • Tutte le conversazioni vengono salvate
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Cronologia conversazioni */}
                            <div className="lg:col-span-2">
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                                    <div className="p-6 border-b border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Bot className="h-5 w-5 text-purple-400" />
                                                <h3 className="text-lg font-semibold text-white">Cronologia Conversazioni</h3>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {conversazioni.length} conversazioni
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                                        {conversazioni.length > 0 ? (
                                            conversazioni.map((conv) => (
                                                <div key={conv.id} className="space-y-3">
                                                    {/* Domanda utente */}
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                            <User className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-slate-700/50 rounded-xl p-4">
                                                                <p className="text-white">{conv.domanda}</p>
                                                                <p className="text-xs text-slate-400 mt-2">
                                                                    {new Date(conv.created_at).toLocaleString('it-IT')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Risposta AI */}
                                                    {conv.risposta && (
                                                        <div className="flex items-start gap-3 ml-8">
                                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Bot className="h-4 w-4 text-purple-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                                                                    <p className="text-slate-200 whitespace-pre-wrap">{conv.risposta}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                                                <p className="text-slate-400">Nessuna conversazione ancora</p>
                                                <p className="text-slate-500 text-sm mt-2">Scrivi la tua prima domanda per iniziare!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
