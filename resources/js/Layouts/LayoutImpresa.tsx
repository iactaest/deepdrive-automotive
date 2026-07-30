import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Bot, Search, Building2, Star, Settings, LogOut, Menu, X,
    TrendingUp, Bell, HelpCircle, BarChart3, Target, Award
} from 'lucide-react';
import { publicUrl } from '@/lib/publicUrl';

export default function LayoutImpresa({ children }: { children: React.ReactNode }) {
    const { user } = usePage().props.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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

    const navigation = [
        { name: 'Dashboard', href: '/dashboard/impresa', icon: LayoutDashboard },
        { name: 'Assistente AI', href: '/assistente', icon: Bot },
        { name: 'Bandi Finder', href: '/bandi', icon: Search },
        { name: 'Match Trovati', href: '/bandi/match', icon: Target },
        { name: 'Performance', href: '/bandi/performance', icon: BarChart3 },
        { name: 'Profilo Azienda', href: '/profilo-impresa', icon: Building2 },
        { name: 'Bandi Salvati', href: '/bandi-salvati', icon: Star },
        { name: 'Notifiche', href: '/notifiche', icon: Bell },
        { name: 'Supporto', href: '/supporto', icon: HelpCircle },
        { name: 'Impostazioni', href: '/profile', icon: Settings },
    ];

    const handleLinkClick = () => { if (isMobile) setSidebarOpen(false); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex relative">
            {/* Effetto profondità */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {isMobile && sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed lg:relative z-50 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 h-full transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                        <Link href="/dashboard/impresa" className="flex items-center gap-2 group">
                            <img src={publicUrl('images/logo-deepbandi.png')} alt="DeepBandi" className="h-10 w-auto group-hover:scale-110 transition-transform" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }} />
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                        <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-400" /><span className="text-xs text-blue-400 font-medium">Impresa Privata</span></div>
                        <p className="text-sm font-semibold text-white mt-1 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link key={item.name} href={item.href} onClick={handleLinkClick}
                                className="flex items-center gap-3 px-4 py-2.5 text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all group hover:translate-x-1">
                                <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700/50 space-y-2">
                        <div className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-slate-400 truncate">{user?.email}</p></div>
                        </div>
                        <Link href="/logout" method="post" as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition group">
                            <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" /><span>Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-auto">
                <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 lg:hidden">
                    <div className="flex items-center p-3">
                        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white"><Menu className="h-6 w-6" /></button>
                        <div className="flex-1 text-center"><span className="text-white font-bold">DeepAuto - Impresa</span></div>
                        <div className="w-6" />
                    </div>
                </div>
                <div className="p-4 md:p-6 animate-fade-in">{children}</div>
            </main>
        </div>
    );
}