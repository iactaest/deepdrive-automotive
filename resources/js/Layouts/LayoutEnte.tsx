import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Star,
    Settings,
    LogOut,
    Menu,
    X,
    Calendar,
    Building2,
    Archive,
    ListChecks,  // ← Icona per Lista Bandi
    Users,
    Bot,
    ClipboardCheck,
    Trophy,
    FolderOpen,
    ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CampanellaNotifiche from '@/Components/Notifiche/CampanellaNotifiche';
import AssistenteModal from '@/Components/Assistente/AssistenteModal';

interface NavItem { name: string; href: string; icon: LucideIcon }
interface NavGroup { name: string; icon: LucideIcon; items: NavItem[] }

const bandiGroup: NavGroup = {
    name: 'Bandi',
    icon: ListChecks,
    items: [
        { name: 'Lista Bandi', href: '/ente/lista-bandi', icon: ListChecks },
        { name: 'Bandi Salvati', href: '/bandi-salvati', icon: Star },
        { name: 'Calendario Bandi', href: '/ente/calendario', icon: Calendar },
        { name: 'Storico Bandi', href: '/ente/storico-bandi', icon: Trophy },
    ],
};

const documentazioneGroup: NavGroup = {
    name: 'Documentazione',
    icon: FolderOpen,
    items: [
        { name: 'Cassetto Documenti', href: '/cassetto-documenti', icon: Archive },
        { name: 'Rendicontazione', href: '/ente/rendicontazione', icon: ClipboardCheck },
    ],
};

const gruppiNavigazione = [bandiGroup, documentazioneGroup];

export default function LayoutEnte({ children }: { children: React.ReactNode }) {
    const { user } = usePage().props.auth;
    const currentUrl = usePage().url;
    const isTitolare = !user?.ente_titolare_id;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [gruppiAperti, setGruppiAperti] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(gruppiNavigazione.map((g) => [g.name, g.items.some((i) => currentUrl.startsWith(i.href))]))
    );

    useEffect(() => {
        const checkScreen = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const toggleGruppo = (nome: string) => setGruppiAperti((prev) => ({ ...prev, [nome]: !prev[nome] }));

    const navPrima = [
        { name: 'Dashboard', href: '/ente/dashboard', icon: LayoutDashboard },
        ...(isTitolare ? [{ name: 'Profilo Ente', href: '/ente/profilo', icon: Building2 }] : []),
    ];

    const navDopo = [
        ...(isTitolare ? [{ name: 'Gestione Team', href: '/ente/team', icon: Users }] : []),
        { name: 'Impostazioni', href: '/settings', icon: Settings },
    ];

    const [assistenteAperto, setAssistenteAperto] = useState(false);

    const handleLinkClick = () => { if (isMobile) setSidebarOpen(false); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl" />
            </div>

            {isMobile && sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            <aside className={`fixed lg:relative z-50 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 h-full transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                        <Link href="/ente/dashboard" className="flex items-center gap-2 group">
                            <img src="/images/logo-deepbandi.png" alt="DeepBandi" className="h-10 w-auto group-hover:scale-110 transition-transform" />
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                        <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-green-400" /><span className="text-xs text-green-400 font-medium">Ente Pubblico</span></div>
                        <p className="text-sm font-semibold text-white mt-1 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navPrima.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 px-4 py-2.5 text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all group hover:translate-x-1"
                            >
                                <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        {gruppiNavigazione.map((gruppo) => (
                            <div key={gruppo.name}>
                                <button
                                    onClick={() => toggleGruppo(gruppo.name)}
                                    className="flex items-center justify-between w-full px-4 py-2.5 text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all group"
                                >
                                    <span className="flex items-center gap-3">
                                        <gruppo.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        <span>{gruppo.name}</span>
                                    </span>
                                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${gruppiAperti[gruppo.name] ? 'rotate-180' : ''}`} />
                                </button>
                                {gruppiAperti[gruppo.name] && (
                                    <div className="ml-4 pl-3 border-l border-slate-700/50 space-y-1 mt-1 mb-1">
                                        {gruppo.items.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={handleLinkClick}
                                                className="flex items-center gap-2.5 px-3 py-2 text-slate-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all text-sm"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {navDopo.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 px-4 py-2.5 text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all group hover:translate-x-1"
                            >
                                <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700/50 space-y-2">
                        <div className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Link href="/logout" method="post" as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition group"
                        >
                            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            <span>Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-auto">
                <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                                <Menu className="h-6 w-6" />
                            </button>
                            <span className="text-white font-bold lg:hidden">DeepBandi - Ente</span>
                        </div>
                        <CampanellaNotifiche />
                    </div>
                </div>
                <div className="p-4 md:p-6 animate-fade-in">{children}</div>
            </main>

            <button
                onClick={() => setAssistenteAperto(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-900/40 flex items-center justify-center transition-transform hover:scale-110"
                title="Assistente Virtuale"
            >
                <Bot className="h-6 w-6 text-white" />
            </button>

            {assistenteAperto && <AssistenteModal onClose={() => setAssistenteAperto(false)} />}
        </div>
    );
}