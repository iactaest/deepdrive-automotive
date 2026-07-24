import LayoutEnte from '@/Layouts/LayoutEnte';
import CassettoDocumentiContenuto from './Contenuto';
import { DocumentoBando } from '@/Components/DocumentoRiga';

interface BandoConDocumenti {
    bando_id: number;
    bando_titolo: string;
    documenti: DocumentoBando[];
    totale: number;
    caricati: number;
    completamento: number;
}

interface Props {
    bandi: BandoConDocumenti[];
}

export default function CassettoDocumentiIndex({ bandi }: Props) {
    return (
        <LayoutEnte>
            <CassettoDocumentiContenuto bandi={bandi} />
        </LayoutEnte>
    );
}
