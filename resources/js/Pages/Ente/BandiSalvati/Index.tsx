import LayoutEnte from '@/Layouts/LayoutEnte';
import BandiSalvatiContenuto from './Contenuto';

interface Props {
    preferiti: any;
}

export default function BandiSalvatiIndex({ preferiti }: Props) {
    return (
        <LayoutEnte>
            <BandiSalvatiContenuto preferiti={preferiti} />
        </LayoutEnte>
    );
}
