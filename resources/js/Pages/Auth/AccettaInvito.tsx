import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ChevronRight, Lock, User, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface Props {
    nonValido: boolean;
    email: string | null;
    actionUrl: string | null;
}

export default function AccettaInvito({ nonValido, email, actionUrl }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (actionUrl) post(actionUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-8 shadow-2xl">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Deep<span className="text-green-400">Bandi</span></span>
                    </div>

                    {nonValido || !actionUrl ? (
                        <div className="text-center">
                            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                            <h2 className="text-xl font-bold text-white mb-2">Invito non più valido</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                Questo link di invito è scaduto, è già stato usato o non è più valido.
                                Chiedi al titolare del tuo ente di inviartene uno nuovo.
                            </p>
                            <Link href="/login" className="text-green-400 hover:text-green-300 transition text-sm">
                                Torna al login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">Completa il tuo account</h2>
                            <p className="text-slate-400 text-center text-sm mb-6">
                                Sei stato invitato a collaborare su DeepBandi
                            </p>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email ?? ''}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome e cognome</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
                                            placeholder="Mario Rossi"
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-10 pr-12 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
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

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Conferma Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2.5 rounded-lg font-medium transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Caricamento...' : 'Crea account'}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
