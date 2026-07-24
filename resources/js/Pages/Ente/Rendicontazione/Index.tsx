import LayoutEnte from '@/Layouts/LayoutEnte';
import RendicontazioneContenuto from './Contenuto';

interface Progetto {
    id: number;
    titolo_progetto: string;
    bando_titolo: string | null;
    importo_finanziato: number;
    stato: 'in_corso' | 'completata' | 'chiusa';
    data_fine: string;
    avanzamento_finanziario: number;
    spese_count: number;
    milestone_count: number;
}

interface Props {
    progetti: Progetto[];
}

export default function RendicontazioneIndex({ progetti }: Props) {
    return (
        <LayoutEnte>
            <RendicontazioneContenuto progetti={progetti} />
        </LayoutEnte>
    );
}
