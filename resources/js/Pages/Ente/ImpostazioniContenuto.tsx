import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';
import { Settings } from 'lucide-react';
import DeleteUserForm from '../Profile/Partials/DeleteUserForm';
import UpdatePasswordForm from '../Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '../Profile/Partials/UpdateProfileInformationForm';

interface Props {
    mustVerifyEmail?: boolean;
    status?: string;
    compatto?: boolean;
}

// Contenuto senza LayoutEnte: riusato sia nella pagina normale (Profile/Edit,
// che passa mustVerifyEmail/status reali dal server) sia incorporato nel menu
// mobile (dove non serve una fetch: l'app non ha la verifica email attiva,
// quindi mustVerifyEmail resta false di default).
export default function ImpostazioniContenuto({ mustVerifyEmail = false, status, compatto = false }: Props) {
    return (
        <div className="space-y-6 animate-fade-in" style={{ marginTop: compatto ? 25 : 0 }}>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Settings className="card-bolla-icona h-6 w-6 text-[#66AB93]" strokeWidth={1.75} />
                    Impostazioni
                </h1>
                <p className="text-slate-400 mt-1">Gestisci i dati del tuo account e la sicurezza dell'accesso.</p>
            </div>

            <CardBolla bordo={PALETTE_BOLLA[1]} indice={0} className="p-5">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />
            </CardBolla>

            <CardBolla bordo={PALETTE_BOLLA[4]} indice={1} className="p-5">
                <UpdatePasswordForm />
            </CardBolla>

            <CardBolla bordo={PALETTE_BOLLA[7]} indice={2} className="p-5">
                <DeleteUserForm />
            </CardBolla>
        </div>
    );
}
