import LayoutEnte from '@/Layouts/LayoutEnte';
import GestioneTeamContenuto from './Contenuto';

interface Props {
    membri: any[];
    inviti: any[];
    puoInvitare: boolean;
}

export default function GestioneTeamIndex(props: Props) {
    return (
        <LayoutEnte>
            <GestioneTeamContenuto {...props} />
        </LayoutEnte>
    );
}
