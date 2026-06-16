import { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutEnte from '@/Layouts/LayoutEnte';
import { 
    Building2, MapPin, Heart, Phone, Save, ArrowLeft, Award, 
    ChevronLeft, Briefcase, Wallet, Shield, Users, Target, TrendingUp 
} from 'lucide-react';

export default function ProfiloEdit({ profilo }: any) {
    const [form, setForm] = useState({
        // STEP 1 - Dati Anagrafici
        nome_ente: profilo?.nome_ente || '',
        tipo_ente: profilo?.tipo_ente || 'comune',
        codice_fiscale: profilo?.codice_fiscale || '',
        partita_iva: profilo?.partita_iva || '',
        
        // STEP 2 - Contatti
        telefono: profilo?.telefono || '',
        email_pec: profilo?.email_pec || '',
        sito_web: profilo?.sito_web || '',
        fax: profilo?.fax || '',
        
        // STEP 3 - Localizzazione
        regione: profilo?.regione || '',
        provincia: profilo?.provincia || '',
        comune: profilo?.comune || '',
        indirizzo: profilo?.indirizzo || '',
        cap: profilo?.cap || '',
        
        // STEP 4 - Caratteristiche
        popolazione_comune: profilo?.popolazione_comune || '',
        settore_prevalente: profilo?.settore_prevalente || '',
        esperienza_fondi_europei: profilo?.esperienza_fondi_europei || false,
        ruolo_bandi: profilo?.ruolo_bandi || 'nessuno',
        cofinanziamento_disponibile: profilo?.cofinanziamento_disponibile || false,
        percentuale_cofinanziamento: profilo?.percentuale_cofinanziamento || '',
        referente_bandi: profilo?.referente_bandi || false,
        gia_beneficiario_pnrr: profilo?.gia_beneficiario_pnrr || false,
        
        // STEP 5 - Preferenze Bandi
        categorie_interesse: profilo?.categorie_interesse || [],
        livelli_interesse: profilo?.livelli_interesse || [],
        importi_interesse: profilo?.importi_interesse || [],
        
        // ============================================
        // STEP 6 - NUOVI CRITERI
        // ============================================
        num_progetti_europei: profilo?.num_progetti_europei || '',
        staff_dedicato_bandi: profilo?.staff_dedicato_bandi || false,
        consulente_esterno_bandi: profilo?.consulente_esterno_bandi || false,
        anticipo_spese_disponibile: profilo?.anticipo_spese_disponibile || false,
        conto_dedicato_fondi: profilo?.conto_dedicato_fondi || false,
        tipologia_investimento: profilo?.tipologia_investimento || [],
        dimensione_impresa: profilo?.dimensione_impresa || [],
        intensita_aiuto: profilo?.intensita_aiuto || '',
        cup_attivo: profilo?.cup_attivo || false,
        target_group: profilo?.target_group || [],
        attivita_erogabili: profilo?.attivita_erogabili || [],
        accreditamento_formativo: profilo?.accreditamento_formativo || false,
        regione_accreditamento: profilo?.regione_accreditamento || '',
        sistemi_informativi: profilo?.sistemi_informativi || [],
        obiettivi_policy: profilo?.obiettivi_policy || [],
        modello_budget: profilo?.modello_budget || '',
        assicurazione_catastrofale: profilo?.assicurazione_catastrofale || false,
    });

    const [saving, setSaving] = useState(false);

    const toggleArray = (array: string[], value: string) => {
        return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        const dataToSend = {
            nome_ente: form.nome_ente,
            tipo_ente: form.tipo_ente,
            codice_fiscale: form.codice_fiscale || null,
            partita_iva: form.partita_iva || null,
            telefono: form.telefono || null,
            email_pec: form.email_pec || null,
            sito_web: form.sito_web || null,
            fax: form.fax || null,
            regione: form.regione,
            provincia: form.provincia,
            comune: form.comune,
            indirizzo: form.indirizzo || null,
            cap: form.cap || null,
            popolazione_comune: form.popolazione_comune || null,
            settore_prevalente: form.settore_prevalente || null,
            esperienza_fondi_europei: form.esperienza_fondi_europei || false,
            ruolo_bandi: form.ruolo_bandi || 'nessuno',
            cofinanziamento_disponibile: form.cofinanziamento_disponibile || false,
            percentuale_cofinanziamento: form.percentuale_cofinanziamento || null,
            referente_bandi: form.referente_bandi || false,
            gia_beneficiario_pnrr: form.gia_beneficiario_pnrr || false,
            categorie_interesse: form.categorie_interesse || [],
            livelli_interesse: form.livelli_interesse || [],
            importi_interesse: form.importi_interesse || [],
            
            // Step 6
            num_progetti_europei: form.num_progetti_europei || null,
            staff_dedicato_bandi: form.staff_dedicato_bandi || false,
            consulente_esterno_bandi: form.consulente_esterno_bandi || false,
            anticipo_spese_disponibile: form.anticipo_spese_disponibile || false,
            conto_dedicato_fondi: form.conto_dedicato_fondi || false,
            tipologia_investimento: form.tipologia_investimento || [],
            dimensione_impresa: form.dimensione_impresa || [],
            intensita_aiuto: form.intensita_aiuto || null,
            cup_attivo: form.cup_attivo || false,
            target_group: form.target_group || [],
            attivita_erogabili: form.attivita_erogabili || [],
            accreditamento_formativo: form.accreditamento_formativo || false,
            regione_accreditamento: form.regione_accreditamento || null,
            sistemi_informativi: form.sistemi_informativi || [],
            obiettivi_policy: form.obiettivi_policy || [],
            modello_budget: form.modello_budget || null,
            assicurazione_catastrofale: form.assicurazione_catastrofale || false,
        };

        try {
            const response = await fetch('/ente/profilo', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(dataToSend)
            });
            
            if (response.ok) {
                router.visit('/ente/profilo/show');
            } else {
                const data = await response.json();
                alert('Errore: ' + (data.message || 'Salvataggio fallito'));
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore di connessione al server');
        } finally {
            setSaving(false);
        }
    };

    // ============================================
    // DATI PER I SELECT
    // ============================================
    
    const categorieBandi = [
        { value: 'digitalizzazione', label: 'Digitalizzazione', color: 'blue' },
        { value: 'ambiente', label: 'Ambiente', color: 'green' },
        { value: 'formazione', label: 'Formazione', color: 'yellow' },
        { value: 'sociale', label: 'Sociale', color: 'red' },
        { value: 'cultura', label: 'Cultura', color: 'purple' },
        { value: 'infrastrutture', label: 'Infrastrutture', color: 'orange' },
        { value: 'sanita', label: 'Sanità', color: 'teal' },
        { value: 'innovazione', label: 'Innovazione', color: 'cyan' },
    ];

    const livelliBandi = ['comunale', 'regionale', 'nazionale', 'europeo'];
    const importiBandi = ['<40k', '40k-150k', '150k-1M', '>1M'];
    const popolazioneOpzioni = ['<5k', '5k-15k', '15k-50k', '>50k'];
    const settoreOpzioni = ['istruzione', 'mobilita', 'welfare', 'turismo', 'ambiente', 'digitale', 'sanita', 'urbanistica'];
    const ruoloOpzioni = ['capofila', 'partner', 'nessuno'];
    
    // Step 6
    const progettiEuropei = ['0', '1-3', '4+'];
    const intensitaAiuto = ['25%', '35%', '45%', '65%+'];
    const tipologieInvestimento = [
        { value: 'digitali', label: 'Tecnologie digitali / deep tech / biotecnologie' },
        { value: 'cleantech', label: 'Clean tech / tecnologie pulite' },
        { value: 'ricerca', label: 'Ricerca e sviluppo' },
        { value: 'innovazione', label: 'Innovazione di processo/prodotto' },
    ];
    const dimensioniImpresa = [
        { value: 'micro', label: 'Micro impresa' },
        { value: 'piccola', label: 'Piccola impresa' },
        { value: 'media', label: 'Media impresa' },
        { value: 'grande', label: 'Grande impresa' },
    ];
    const targetGroups = [
        { value: 'disoccupati', label: 'Disoccupati / inoccupati' },
        { value: 'lavoratori_rischio', label: 'Lavoratori a rischio' },
        { value: 'fragili', label: 'Persone con fragilità' },
        { value: 'neet', label: 'Giovani NEET' },
        { value: 'over55', label: 'Over 55' },
    ];
    const attivitaErogabili = [
        { value: 'formazione', label: 'Formazione professionale' },
        { value: 'tirocini', label: 'Tirocini / stage' },
        { value: 'orientamento', label: 'Orientamento al lavoro' },
        { value: 'certificazione', label: 'Certificazione delle competenze' },
        { value: 'creazione_impresa', label: 'Creazione d\'impresa' },
    ];
    const sistemiInformativi = [
        { value: 'silav', label: 'SILAV Sicilia' },
        { value: 'ciapigol', label: 'CIAPIGOL' },
        { value: 'regis', label: 'ReGIS (PNRR)' },
        { value: 'nessuno', label: 'Nessuno' },
    ];
    const obiettiviPolicy = [
        { value: 'intelligente', label: '💡 Europa più intelligente' },
        { value: 'verde', label: '🌿 Europa più verde' },
        { value: 'connessa', label: '🔗 Europa più connessa' },
        { value: 'sociale', label: '🤝 Europa più sociale' },
        { value: 'vicina', label: '🏘️ Europa più vicina ai cittadini' },
    ];
    const modelliBudget = [
        { value: 'full_cost', label: 'Full Cost (costi diretti + indiretti)' },
        { value: 'diretti', label: 'Solo costi diretti' },
        { value: 'lump_sum', label: 'Lump Sum / Flat Rate' },
    ];

    return (
        <LayoutEnte>
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <button onClick={() => router.visit('/ente/profilo/show')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Torna al Profilo
                        </button>
                        <h1 className="text-3xl font-bold text-white">✏️ Modifica Profilo Ente</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* STEP 1 - Dati Anagrafici */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-400" /> Dati Anagrafici</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm text-slate-300 mb-1">Nome Ente</label><input type="text" value={form.nome_ente} onChange={(e) => setForm({...form, nome_ente: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Tipo Ente</label><select value={form.tipo_ente} onChange={(e) => setForm({...form, tipo_ente: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"><option value="comune">Comune</option><option value="provincia">Provincia</option><option value="regione">Regione</option><option value="asl">ASL</option><option value="universita">Università</option><option value="scuola">Scuola</option><option value="altro">Altro</option></select></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Codice Fiscale</label><input type="text" value={form.codice_fiscale} onChange={(e) => setForm({...form, codice_fiscale: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Partita IVA</label><input type="text" value={form.partita_iva} onChange={(e) => setForm({...form, partita_iva: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                            </div>
                        </div>

                        {/* STEP 2 - Dati di Contatto */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Phone className="h-5 w-5 text-green-400" /> Dati di Contatto</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm text-slate-300 mb-1">Telefono</label><input type="tel" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Email PEC</label><input type="email" value={form.email_pec} onChange={(e) => setForm({...form, email_pec: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Sito Web</label><input type="url" value={form.sito_web} onChange={(e) => setForm({...form, sito_web: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Fax</label><input type="text" value={form.fax} onChange={(e) => setForm({...form, fax: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                            </div>
                        </div>

                        {/* STEP 3 - Localizzazione */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-400" /> Localizzazione</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm text-slate-300 mb-1">Regione</label><input type="text" value={form.regione} onChange={(e) => setForm({...form, regione: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Provincia</label><input type="text" value={form.provincia} onChange={(e) => setForm({...form, provincia: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Comune</label><input type="text" value={form.comune} onChange={(e) => setForm({...form, comune: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Indirizzo</label><input type="text" value={form.indirizzo} onChange={(e) => setForm({...form, indirizzo: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                                <div><label className="block text-sm text-slate-300 mb-1">CAP</label><input type="text" value={form.cap} onChange={(e) => setForm({...form, cap: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>
                            </div>
                        </div>

                        {/* STEP 4 - Caratteristiche Ente */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-purple-400" /> Caratteristiche Ente</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm text-slate-300 mb-1">Popolazione Comune</label><select value={form.popolazione_comune} onChange={(e) => setForm({...form, popolazione_comune: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"><option value="">Seleziona...</option>{popolazioneOpzioni.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Settore Prevalente</label><select value={form.settore_prevalente} onChange={(e) => setForm({...form, settore_prevalente: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"><option value="">Seleziona...</option>{settoreOpzioni.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                <div className="flex items-center gap-3"><input type="checkbox" checked={form.esperienza_fondi_europei} onChange={(e) => setForm({...form, esperienza_fondi_europei: e.target.checked})} className="w-4 h-4" /><label className="text-slate-300">Esperienza in fondi europei</label></div>
                                <div><label className="block text-sm text-slate-300 mb-1">Ruolo in bandi</label><select value={form.ruolo_bandi} onChange={(e) => setForm({...form, ruolo_bandi: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"><option value="capofila">Capofila</option><option value="partner">Partner</option><option value="nessuno">Nessuno</option></select></div>
                                <div className="flex items-center gap-3"><input type="checkbox" checked={form.cofinanziamento_disponibile} onChange={(e) => setForm({...form, cofinanziamento_disponibile: e.target.checked})} className="w-4 h-4" /><label className="text-slate-300">Cofinanziamento disponibile</label></div>
                                {form.cofinanziamento_disponibile && <div><label className="block text-sm text-slate-300 mb-1">Percentuale cofinanziamento</label><input type="number" value={form.percentuale_cofinanziamento} onChange={(e) => setForm({...form, percentuale_cofinanziamento: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" /></div>}
                                <div className="flex items-center gap-3"><input type="checkbox" checked={form.referente_bandi} onChange={(e) => setForm({...form, referente_bandi: e.target.checked})} className="w-4 h-4" /><label className="text-slate-300">Referente dedicato per i bandi</label></div>
                                <div className="flex items-center gap-3"><input type="checkbox" checked={form.gia_beneficiario_pnrr} onChange={(e) => setForm({...form, gia_beneficiario_pnrr: e.target.checked})} className="w-4 h-4" /><label className="text-slate-300">Già beneficiario PNRR</label></div>
                            </div>
                        </div>

                        {/* STEP 5 - Preferenze Bandi */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" /> Preferenze Bandi</h2>
                            <div className="space-y-4">
                                <div><label className="block text-sm text-slate-300 mb-2">Categorie di interesse</label><div className="flex flex-wrap gap-2">{categorieBandi.map(cat => (<button key={cat.value} type="button" onClick={() => setForm({...form, categorie_interesse: form.categorie_interesse.includes(cat.value) ? form.categorie_interesse.filter((c: string) => c !== cat.value) : [...form.categorie_interesse, cat.value]})} className={`px-3 py-1.5 rounded-full text-sm ${form.categorie_interesse.includes(cat.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700 text-slate-300'}`}>{cat.label}</button>))}</div></div>
                                <div><label className="block text-sm text-slate-300 mb-2">Livelli di interesse</label><div className="flex flex-wrap gap-2">{livelliBandi.map(liv => (<button key={liv} type="button" onClick={() => setForm({...form, livelli_interesse: form.livelli_interesse.includes(liv) ? form.livelli_interesse.filter((l: string) => l !== liv) : [...form.livelli_interesse, liv]})} className={`px-3 py-1.5 rounded-full text-sm ${form.livelli_interesse.includes(liv) ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-700 text-slate-300'}`}>{liv}</button>))}</div></div>
                                <div><label className="block text-sm text-slate-300 mb-2">Fasce di importo</label><div className="flex flex-wrap gap-2">{importiBandi.map(imp => (<button key={imp} type="button" onClick={() => setForm({...form, importi_interesse: form.importi_interesse.includes(imp) ? form.importi_interesse.filter((i: string) => i !== imp) : [...form.importi_interesse, imp]})} className={`px-3 py-1.5 rounded-full text-sm ${form.importi_interesse.includes(imp) ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-700 text-slate-300'}`}>{imp}</button>))}</div></div>
                            </div>
                        </div>

                        {/* ============================================
                            STEP 6 - NUOVI CRITERI
                            ============================================ */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Target className="h-5 w-5 text-cyan-400" /> Capacità e Dettaglio
                            </h2>
                            
                            {/* Capacità progettuale */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-cyan-400" /> Progetti europei completati (ultimi 5 anni)
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {progettiEuropei.map(opt => (
                                        <button key={opt} type="button" onClick={() => setForm({...form, num_progetti_europei: opt})} 
                                            className={`p-3 rounded-lg border transition-all ${form.num_progetti_europei === opt ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.staff_dedicato_bandi} onChange={(e) => setForm({...form, staff_dedicato_bandi: e.target.checked})} className="w-4 h-4" />
                                    <label className="text-slate-300">Staff interno dedicato ai bandi</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.consulente_esterno_bandi} onChange={(e) => setForm({...form, consulente_esterno_bandi: e.target.checked})} className="w-4 h-4" />
                                    <label className="text-slate-300">Consulente esterno / Project Manager</label>
                                </div>
                            </div>

                            {/* Capacità finanziaria */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-400" /> Capacità finanziaria
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={form.anticipo_spese_disponibile} onChange={(e) => setForm({...form, anticipo_spese_disponibile: e.target.checked})} className="w-4 h-4" />
                                        <label className="text-slate-300">Disponibilità ad anticipare spese</label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={form.conto_dedicato_fondi} onChange={(e) => setForm({...form, conto_dedicato_fondi: e.target.checked})} className="w-4 h-4" />
                                        <label className="text-slate-300">Conto bancario dedicato fondi europei</label>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700 my-4" />

                            {/* STEP Bando FESR */}
                            <div className="mb-4">
                                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-yellow-400" /> STEP - Bando FESR
                                </h3>
                                
                                <div className="mb-3">
                                    <label className="block text-sm text-slate-300 mb-2">Tipologia di investimento</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tipologieInvestimento.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, tipologia_investimento: toggleArray(form.tipologia_investimento, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.tipologia_investimento.includes(opt.value) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm text-slate-300 mb-2">Dimensione impresa</label>
                                    <div className="flex flex-wrap gap-2">
                                        {dimensioniImpresa.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, dimensione_impresa: toggleArray(form.dimensione_impresa, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.dimensione_impresa.includes(opt.value) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-2">Intensità di aiuto attesa</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {intensitaAiuto.map(opt => (
                                                <button key={opt} type="button" onClick={() => setForm({...form, intensita_aiuto: opt})}
                                                    className={`p-2 rounded-lg border text-sm ${form.intensita_aiuto === opt ? 'bg-yellow-500/20 border-yellow-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-2">Presenza CUP</label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <input type="checkbox" checked={form.cup_attivo} onChange={(e) => setForm({...form, cup_attivo: e.target.checked})} className="w-4 h-4" />
                                            <label className="text-slate-300">L'ente ha già un CUP attivo</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700 my-4" />

                            {/* GOL/PNRR */}
                            <div className="mb-4">
                                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-400" /> GOL / PNRR - Formazione e Lavoro
                                </h3>
                                
                                <div className="mb-3">
                                    <label className="block text-sm text-slate-300 mb-2">Target group servito</label>
                                    <div className="flex flex-wrap gap-2">
                                        {targetGroups.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, target_group: toggleArray(form.target_group, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.target_group.includes(opt.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm text-slate-300 mb-2">Tipo di attività erogabile</label>
                                    <div className="flex flex-wrap gap-2">
                                        {att