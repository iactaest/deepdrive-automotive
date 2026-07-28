import { useState } from 'react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { ClipboardCheck, LayoutGrid, Receipt, Milestone, FileBarChart } from 'lucide-react';
import TabSpese, { Spesa } from '@/Components/Rendicontazione/TabSpese';
import TabMilestone from '@/Components/Rendicontazione/TabMilestone';
import TabPanoramica from '@/Components/Rendicontazione/TabPanoramica';
import TabReport, { Report } from '@/Components/Rendicontazione/TabReport';
import { Milestone as MilestoneItem } from '@/Components/Rendicontazione/MilestoneCard';

interface RendicontazioneDettaglio {
    id: number;
    titolo_progetto: string;
    importo_finanziato: string;
    importo_cofinanziamento: string;
    data_inizio: string;
    data_fine: string;
    stato: 'in_corso' | 'completata' | 'chiusa';
    note: string | null;
    bando: { id: number; titolo: string; categoria: string | null; regione: string | null; livello: string | null } | null;
    avanzamento_finanziario: number;
    avanzamento_temporale: number;
    spese: Spesa[];
    milestone: MilestoneItem[];
    report: Report[];
    alert_spese_generali: {
        percentuale: number;
        soglia: number;
        totale_spese_generali: number;
        totale_ammissibile: number;
    } | null;
}

interface Props {
    rendicontazione: RendicontazioneDettaglio;
}

type Tab = 'panoramica' | 'spese' | 'milestone' | 'report';

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'panoramica', label: 'Panoramica', icon: LayoutGrid },
    { id: 'spese', label: 'Spese', icon: Receipt },
    { id: 'milestone', label: 'Milestone', icon: Milestone },
    { id: 'report', label: 'Report', icon: FileBarChart },
];

export default function RendicontazioneShow({ rendicontazione: r }: Props) {
    const [tab, setTab] = useState<Tab>('panoramica');

    return (
        <LayoutEnte>
            <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <ClipboardCheck className="h-6 w-6 text-green-400" />
                        {r.titolo_progetto}
                    </h1>
                    {r.bando && <p className="text-slate-400 mt-1">{r.bando.titolo}</p>}
                </div>

                <div className="inline-flex items-center rounded-lg bg-slate-800/60 border border-slate-700/50 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                                tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <t.icon className="h-4 w-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'panoramica' && (
                    <TabPanoramica
                        importoFinanziato={r.importo_finanziato}
                        importoCofinanziamento={r.importo_cofinanziamento}
                        dataInizio={r.data_inizio}
                        dataFine={r.data_fine}
                        avanzamentoFinanziario={r.avanzamento_finanziario}
                        avanzamentoTemporale={r.avanzamento_temporale}
                        spese={r.spese}
                        milestone={r.milestone}
                        alertSpeseGenerali={r.alert_spese_generali}
                    />
                )}

                {tab === 'spese' && (
                    <TabSpese rendicontazioneId={r.id} spese={r.spese} />
                )}

                {tab === 'milestone' && (
                    <TabMilestone rendicontazioneId={r.id} milestone={r.milestone} />
                )}

                {tab === 'report' && (
                    <TabReport rendicontazioneId={r.id} report={r.report} dataInizio={r.data_inizio} dataFine={r.data_fine} />
                )}
            </div>
        </LayoutEnte>
    );
}
