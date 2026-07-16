import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell } from 'lucide-react';

interface Notifica {
    id: number;
    tipo: string;
    titolo: string;
    testo: string | null;
    url: string | null;
    letta_at: string | null;
    created_at: string;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function CampanellaNotifiche() {
    const [aperto, setAperto] = useState(false);
    const [notifiche, setNotifiche] = useState<Notifica[]>([]);
    const [nonLette, setNonLette] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const caricaConteggio = () => {
        fetch('/notifiche/non-lette-count')
            .then((r) => r.json())
            .then((d) => setNonLette(d.count));
    };

    useEffect(() => {
        caricaConteggio();
        const interval = setInterval(caricaConteggio, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickFuori = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setAperto(false);
        };
        document.addEventListener('mousedown', handleClickFuori);
        return () => document.removeEventListener('mousedown', handleClickFuori);
    }, []);

    const apri = () => {
        setAperto((v) => !v);
        if (!aperto) {
            fetch('/notifiche').then((r) => r.json()).then(setNotifiche);
        }
    };

    const clicNotifica = async (n: Notifica) => {
        if (!n.letta_at) {
            await fetch(`/notifiche/${n.id}/letta`, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken() } });
            caricaConteggio();
        }
        setAperto(false);
        if (n.url) router.visit(n.url);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={apri} className="relative p-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white transition">
                <Bell className="h-5 w-5" />
                {nonLette > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {nonLette > 9 ? '9+' : nonLette}
                    </span>
                )}
            </button>

            {aperto && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50">
                    <div className="p-3 border-b border-slate-700/50">
                        <h3 className="text-sm font-semibold text-white">Notifiche</h3>
                    </div>
                    {notifiche.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center">Nessuna notifica</p>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {notifiche.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => clicNotifica(n)}
                                    className={`w-full text-left p-3 hover:bg-slate-800/70 transition ${!n.letta_at ? 'bg-slate-800/40' : ''}`}
                                >
                                    <p className="text-xs text-white font-medium">{n.titolo}</p>
                                    {n.testo && <p className="text-xs text-slate-400 mt-0.5 truncate">{n.testo}</p>}
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString('it-IT')}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
