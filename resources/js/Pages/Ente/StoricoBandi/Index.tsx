import LayoutEnte from '@/Layouts/LayoutEnte';
import StoricoBandiContenuto from './Contenuto';

interface Props {
    stats: {
        totali: number;
        in_corso: number;
        vinti: number;
        persi: number;
    };
    bandiVinti: any[];
    bandiPersi: any[];
}

export default function StoricoBandiIndex(props: Props) {
    return (
        <LayoutEnte>
            <StoricoBandiContenuto {...props} />
        </LayoutEnte>
    );
}
