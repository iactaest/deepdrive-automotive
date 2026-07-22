import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bot, Settings, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { user } = usePage().props.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

   const navigation = [
    { name: 'Dashboard', href: '/ente/dashboard', icon: LayoutDashboard },
    { name: 'Assistente', href: '/assistente', icon: Bot },
    { name: 'Impostazioni', href: '/settings', icon: Settings },
];

    const handleLinkClick = () => {
        if (isMobile) setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
            
            {/* Overlay mobile */}
            {isMobile && sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar - laterale fissa */}
            <aside className={`
                fixed lg:relative z-50 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50
                h-full transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                        <Link href="/ente/dashboard" className="flex items-center gap-2">
                            <img src="/images/logo-deepbandi.png" alt="DeepBandi" className="h-10 w-auto" />
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigazione */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 px-4 py-2.5 text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition group"
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer utente */}
                    <div className="p-4 border-t border-slate-700/50 space-y-2">
                        <div className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Contenuto principale - AFFIANCATO alla sidebar */}
            <main className="flex-1 min-w-0 overflow-auto">
                {/* Pulsante hamburger per mobile */}
                <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 lg:hidden">
                    <div className="flex items-center p-3">
                        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-white font-bold">DeepBandi</span>
                        </div>
                        <div className="w-6" />
                    </div>
                </div>
                
                {/* Contenuto della pagina (Dashboard) */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}