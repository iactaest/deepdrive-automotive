import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ChevronRight, Lock, Mail, Eye, EyeOff, Landmark } from 'lucide-react';
import { publicUrl } from '@/lib/publicUrl';
import RotatingCone3D from '@/Components/RotatingCone3D';

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
        <div className="min-h-screen bg-[#05070a] relative overflow-hidden flex items-center justify-center">

            <div className="relative z-10 w-full max-w-md px-4">
                {/* L'immagine vive dentro la card (non su tutta la pagina): livello
                    assoluto dietro al contenuto, contenuto in un contenitore con
                    overflow-hidden cosi' resta dentro ai bordi arrotondati. */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 shadow-2xl">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center pointer-events-none"
                        style={{ backgroundImage: `url(${publicUrl('images/sfondo-landing.jpg')})`, opacity: 0.5 }}
                    />

                    <div className="relative z-10 bg-slate-800/50 backdrop-blur-sm p-8">

                    {/* Logo */}
                    <div className="relative flex items-center justify-center mb-8 h-[160px]">
                        <RotatingCone3D className="absolute z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-[15%] w-[260px] h-[260px] opacity-45 pointer-events-none" />
                        <img src={publicUrl('images/logo-deepbandi-chiaro.png')} alt="DeepBandi" className="relative z-10 h-[84px] w-auto" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }} />
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
                            className="w-full bg-gradient-to-b from-emerald-500 to-green-600/90 backdrop-blur-md border border-white/10 text-white py-[5px] rounded-lg font-medium transition-all duration-200 shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
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
        </div>
    );
}