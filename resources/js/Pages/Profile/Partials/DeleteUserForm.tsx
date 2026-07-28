import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-white">
                    Elimina Account
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Una volta eliminato, tutti i dati e le risorse del tuo account saranno cancellati
                    definitivamente. Prima di procedere, scarica eventuali dati che vuoi conservare.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="px-4 py-2 bg-[#C08FA8]/15 hover:bg-[#C08FA8]/25 border border-[#C08FA8]/40 text-[#C08FA8] rounded-lg text-sm font-medium transition"
            >
                Elimina Account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-semibold text-white">
                        Sei sicuro di voler eliminare il tuo account?
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Una volta eliminato, tutti i dati e le risorse del tuo account saranno cancellati
                        definitivamente. Inserisci la password per confermare.
                    </p>

                    <div className="mt-6">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            autoFocus
                            placeholder="Password"
                            className="w-full sm:w-3/4 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C08FA8]"
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition"
                        >
                            Annulla
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-[#C08FA8]/20 hover:bg-[#C08FA8]/30 border border-[#C08FA8]/40 text-[#C08FA8] rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            Elimina Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
