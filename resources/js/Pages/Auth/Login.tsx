import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ChevronRight, Lock, Mail, Eye, EyeOff, Landmark } from 'lucide-react';

export default function Login({ status, canResetPassword }: any) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center">
            
            {/* Luce fioca al centro */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-8 shadow-2xl">

                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <img src="/images/logo-deepbandi.png" alt="DeepBandi" className="h-16 w-auto" />
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-2">Benvenuto</h2>
                    <p className="text-slate-400 text-center text-sm mb-6">Accedi per gestire i tuoi bandi e opportunità</p>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-400 text-center bg-green-500/10 border border-green-500/20 rounded-lg py-2">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="nome@ente.it"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-400">Ricordami</span>
                            </label>
                            {canResetPassword && (
                                <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition">
                                    Password dimenticata?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white py-2.5 rounded-lg font-medium transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            {processing ? 'Caricamento...' : 'Accedi'}
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Non hai un account?{' '}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 transition">
                            Registrati
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}