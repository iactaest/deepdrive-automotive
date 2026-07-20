import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Sparkles, X, Loader2 } from 'lucide-react';

interface Conversazione {
    id: number;
    domanda: string;
    risposta: string | null;
    created_at: string;
}

interface Props {
    onClose: () => void;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function AssistenteModal({ onClose }: Props) {
    const [conversazioni, setConversazioni] = useState<Conversazione[]>([]);
    const [caricamento, setCaricamento] = useState(true);
    const [domanda, setDomanda] = useState('');
    const [inviando, setInviando] = useState(false);
    const storicoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/assistente', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((data) => { setConversazioni(data.conversazioni ?? []); setCaricamento(false); });
    }, []);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const invia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domanda.trim() || inviando) return;

        setInviando(true);
        const res = await fetch('/assistente/invia', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ domanda }),
        });
        const data = await res.json();
        setConversazioni((prev) => [data.conversazione, ...prev]);
        setDomanda('');
        setInviando(false);
        requestAnimationFrame(() => storicoRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700/50 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-purple-400" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">Assistente Virtuale Bandi</h2>
                            <p className="text-xs text-slate-400">Chiedi tutto su bandi, requisiti e scadenze</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div ref={storicoRef} className="flex-1 overflow-y-auto p-4 space-y-5">
                    {caricamento ? (
                        <p className="text-sm text-slate-500 text-center py-8">Caricamento...</p>
                    ) : conversazioni.length === 0 ? (
                        <div className="text-center py-10">
                            <Bot className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">Nessuna conversazione ancora</p>
                            <p className="text-slate-500 text-sm mt-1">Scrivi la tua prima domanda qui sotto!</p>
                        </div>
                    ) : (
                        conversazioni.map((conv) => (
                            <div key={conv.id} className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-slate-700/50 rounded-xl p-3">
                                            <p className="text-white text-sm">{conv.domanda}</p>
                                            <p className="text-xs text-slate-400 mt-1.5">
                                                {new Date(conv.created_at).toLocaleString('it-IT')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {conv.risposta && (
                                    <div className="flex items-start gap-3 ml-8">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                                                <p className="text-slate-200 text-sm whitespace-pre-wrap">{conv.risposta}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={invia} className="p-4 border-t border-slate-700/50 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-slate-400">Fai una domanda chiara e specifica</span>
                    </div>
                    <div className="flex gap-2">
                        <textarea
                            value={domanda}
                            onChange={(e) => setDomanda(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia(e); } }}
                            rows={2}
                            required
                            disabled={inviando}
                            placeholder="Es: Quali documenti servono di solito per partecipare a un bando PNRR?"
                            className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                        <button
                            type="submit"
                            disabled={inviando || !domanda.trim()}
                            className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium px-4 rounded-lg transition-all flex items-center justify-center"
                        >
                            {inviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
