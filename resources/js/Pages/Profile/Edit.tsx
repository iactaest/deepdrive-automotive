import LayoutEnte from '@/Layouts/LayoutEnte';
import ImpostazioniContenuto from '@/Pages/Ente/ImpostazioniContenuto';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <LayoutEnte>
            <Head title="Impostazioni" />

            <div className="max-w-3xl mx-auto py-4">
                <ImpostazioniContenuto mustVerifyEmail={mustVerifyEmail} status={status} />
            </div>
        </LayoutEnte>
    );
}