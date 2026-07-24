import LayoutEnte from '@/Layouts/LayoutEnte';
import ListaBandiContenuto from './Contenuto';

interface Props {
    bandi: any[];
    stats: any;
    categorie: string[];
    regioni: string[];
    filtri: any;
    ente: any;
}

export default function ListaBandiIndex(props: Props) {
    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ListaBandiContenuto {...props} />
                </div>
            </div>
        </LayoutEnte>
    );
}
