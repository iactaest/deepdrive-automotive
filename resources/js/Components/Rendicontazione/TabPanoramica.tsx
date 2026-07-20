import { AlertTriangle } from 'lucide-react';
import { Spesa } from './TabSpese';
import { Milestone } from './MilestoneCard';

interface AlertSpeseGenerali {
    percentuale: number;
    soglia: number;
    totale_spese_generali: number;
    totale_ammissibile: number;
}

interface Props {
    importoFinanziato: string;
    importoCofinanziamento: string;
    dataInizio: string;
    dataFine: string;
    avanzamentoFinanziario: number;
    avanzamentoTemporale: number;
    spese: Spesa[];
    milestone: Milestone[];
    alertSpeseGenerali: AlertSpeseGenerali | null;
}

const formatEuro = (v: string | number) => `€${Number(v).toLocaleString('it-IT', { maximumFractionDigits: 0 })}`;

export default function TabPanoramica({
    importoFinanziato, importoCofinanziamento, dataInizio, dataFine,
    avanzamentoFinanziario, avanzamentoTemporale, spese, milestone, alertSpeseGenerali,
}: Props) {
    const ammissibili = spese.filter(s => s.ammissibile === true).length;
    const nonAmmissibili = spese.filter(s => s.ammissibile === false).length;
    const daVerificare = spese.filter(s => s.ammissibile === null).length;
    const gareRichieste = spese.filter(s => s.richiede_gara).length;
    const milestoneCompletate = milestone.filter(m => m.stato === 'completata').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                    <p className="text-xs text-slate-400">Importo finanziato</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatEuro(importoFinanziato)}</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                    <p className="text-xs text-slate-400">Cofinanziamento</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatEuro(importoCofinanziamento)}</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                    <p className="text-xs text-slate-400">Periodo progetto</p>
                    <p className="text-sm font-medium text-white mt-2">
                        {new Date(dataInizio).toLocaleDateString('it-IT')} — {new Date(dataFine).toLocaleDateString('it-IT')}
                    </p>
                </div>
            </div>

            <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50 space-y-5">
                <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-slate-300">Avanzamento finanziario (spese ammissibili)</span>
                        <span className="text-white font-medium">{avanzamentoFinanziario}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-emerald-500" style={{ width: `${avanzamentoFinanziario}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-slate-300">Avanzamento temporale</span>
                        <span className="text-white font-medium">{avanzamentoTemporale}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-600 to-cyan-500" style={{ width: `${avanzamentoTemporale}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                    <p className="text-sm font-semibold text-slate-300 mb-3">Spese ({spese.length})</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-lg font-bold text-green-400">{ammissibili}</p>
                            <p className="text-[11px] text-slate-500">Ammissibili</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-400">{nonAmmissibili}</p>
                            <p className="text-[11px] text-slate-500">Non ammissibili</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-yellow-400">{daVerificare}</p>
                            <p className="text-[11px] text-slate-500">Da verificare</p>
                        </div>
                    </div>
                    {gareRichieste > 0 && (
                        <p className="text-xs text-orange-400 mt-3">
                            {gareRichieste} spes{gareRichieste === 1 ? 'a richiede' : 'e richiedono'} una gara pubblica (&gt;40.000€)
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-slate-800/50 p-5 border border-slate-700/50">
                    <p className="text-sm font-semibold text-slate-300 mb-3">Milestone</p>
                    <p className="text-2xl font-bold text-white">{milestoneCompletate}/{milestone.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">completate</p>
                </div>
            </div>

            {alertSpeseGenerali && (
                <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-orange-300 font-medium">
                            Spese generali oltre soglia: {alertSpeseGenerali.percentuale}% (limite {alertSpeseGenerali.soglia}%)
                        </p>
                        <p className="text-xs text-orange-400/80 mt-1">
                            {formatEuro(alertSpeseGenerali.totale_spese_generali)} su {formatEuro(alertSpeseGenerali.totale_ammissibile)} di spese ammissibili totali.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
