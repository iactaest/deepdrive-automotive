import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Building2, MapPin, Heart, Phone, Check, ChevronRight, ChevronLeft, 
    Award, Briefcase, Wallet, Shield, Users, Target, TrendingUp
} from 'lucide-react';

export default function ProfiloWizard({ profilo }: any) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    
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
    settore_prevalente: profilo?.settore_prevalente || [],  // ✅ CAMBIATO DA STRINGA A ARRAY
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
        
        // Capacità progettuale
        num_progetti_europei: profilo?.num_progetti_europei || '',
        staff_dedicato_bandi: profilo?.staff_dedicato_bandi || false,
        consulente_esterno_bandi: profilo?.consulente_esterno_bandi || false,
        
        // Capacità finanziaria
        anticipo_spese_disponibile: profilo?.anticipo_spese_disponibile || false,
        conto_dedicato_fondi: profilo?.conto_dedicato_fondi || false,
        
        // STEP Bando FESR
        tipologia_investimento: profilo?.tipologia_investimento || [],
        dimensione_impresa: profilo?.dimensione_impresa || [],
        intensita_aiuto: profilo?.intensita_aiuto || '',
        cup_attivo: profilo?.cup_attivo || false,
        
        // GOL/PNRR
        target_group: profilo?.target_group || [],
        attivita_erogabili: profilo?.attivita_erogabili || [],
        accreditamento_formativo: profilo?.accreditamento_formativo || false,
        regione_accreditamento: profilo?.regione_accreditamento || '',
        sistemi_informativi: profilo?.sistemi_informativi || [],
        
        // Obiettivi policy
        obiettivi_policy: profilo?.obiettivi_policy || [],
        
        // Modello budget
        modello_budget: profilo?.modello_budget || '',
        
        // Assicurazione
        assicurazione_catastrofale: profilo?.assicurazione_catastrofale || false,
    });

    // ============================================
    // DATI PER I SELECT
    // ============================================
    
    const tipiEnte = [
        { value: 'comune', label: 'Comune', desc: 'Ente locale territoriale' },
        { value: 'provincia', label: 'Provincia', desc: 'Ente provinciale' },
        { value: 'regione', label: 'Regione', desc: 'Ente regionale' },
        { value: 'asl', label: 'ASL', desc: 'Azienda Sanitaria Locale' },
        { value: 'universita', label: 'Università', desc: 'Ateneo/Università' },
        { value: 'scuola', label: 'Scuola', desc: 'Istituto scolastico' },
        { value: 'altro', label: 'Altro', desc: 'Altro tipo di ente' },
    ];

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

    const livelliBandi = [
        { value: 'comunale', label: 'Comunale', desc: 'Bandi del comune' },
        { value: 'regionale', label: 'Regionale', desc: 'Bandi della regione' },
        { value: 'nazionale', label: 'Nazionale', desc: 'Bandi nazionali (PNRR, Ministeri)' },
        { value: 'europeo', label: 'Europeo', desc: 'Bandi europei (Horizon, LIFE)' },
    ];

    const importiBandi = [
        { value: '<40k', label: '< €40.000', desc: 'Piccoli progetti' },
        { value: '40k-150k', label: '€40.000 - €150.000', desc: 'Progetti medi' },
        { value: '150k-1M', label: '€150.000 - €1.000.000', desc: 'Grandi progetti' },
        { value: '>1M', label: '> €1.000.000', desc: 'Megaprogetti' },
    ];

    // ============================================
    // DATI PER STEP 6
    // ============================================
    
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

    const popolazioneOpzioni = ['<5k', '5k-15k', '15k-50k', '>50k'];
    const settoreOpzioni = ['istruzione', 'mobilita', 'welfare', 'turismo', 'ambiente', 'digitale', 'sanita', 'urbanistica'];
    const ruoloOpzioni = ['capofila', 'partner', 'nessuno'];
    const regioni = ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'];

    const toggleArray = (array: string[], value: string) => {
        return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('📞 CONTATTI prima invio:', {
            telefono: form.telefono,
            email_pec: form.email_pec,
            sito_web: form.sito_web,
            fax: form.fax,
        });
        
        console.log('🎯 PREFERENZE prima invio:', {
            categorie: form.categorie_interesse,
            livelli: form.livelli_interesse,
            importi: form.importi_interesse,
        });
        
        console.log('📊 NUOVI CRITERI:', {
            num_progetti_europei: form.num_progetti_europei,
            staff_dedicato_bandi: form.staff_dedicato_bandi,
            consulente_esterno_bandi: form.consulente_esterno_bandi,
            anticipo_spese_disponibile: form.anticipo_spese_disponibile,
            conto_dedicato_fondi: form.conto_dedicato_fondi,
            tipologia_investimento: form.tipologia_investimento,
            dimensione_impresa: form.dimensione_impresa,
            intensita_aiuto: form.intensita_aiuto,
            cup_attivo: form.cup_attivo,
            target_group: form.target_group,
            attivita_erogabili: form.attivita_erogabili,
            accreditamento_formativo: form.accreditamento_formativo,
            regione_accreditamento: form.regione_accreditamento,
            sistemi_informativi: form.sistemi_informativi,
            obiettivi_policy: form.obiettivi_policy,
            modello_budget: form.modello_budget,
            assicurazione_catastrofale: form.assicurazione_catastrofale,
        });
        
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
            settore_prevalente: form.settore_prevalente || [], 
            esperienza_fondi_europei: form.esperienza_fondi_europei || false,
            ruolo_bandi: form.ruolo_bandi || 'nessuno',
            cofinanziamento_disponibile: form.cofinanziamento_disponibile || false,
            percentuale_cofinanziamento: form.percentuale_cofinanziamento || null,
            referente_bandi: form.referente_bandi || false,
            gia_beneficiario_pnrr: form.gia_beneficiario_pnrr || false,
            categorie_interesse: form.categorie_interesse || [],
            livelli_interesse: form.livelli_interesse || [],
            importi_interesse: form.importi_interesse || [],
            
            // ============================================
            // NUOVI CRITERI STEP 6
            // ============================================
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
        
        console.log('📦 DATI DA INVIARE:', dataToSend);
        
        setSaving(true);
        
        try {
            const response = await fetch('/ente/profilo/completa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(dataToSend)
            });
            
            const data = await response.json();
            console.log('📨 RISPOSTA:', data);
            
            if (response.ok && data.success) {
                router.visit(data.redirect || '/ente/profilo/show');
            } else {
                console.error('Errore server:', data);
                alert('Errore: ' + (data.message || 'Salvataggio fallito'));
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore di connessione al server');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Profilazione Ente</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Completa il profilo del tuo Ente</h1>
                    <p className="text-slate-400">Step {step} di 6: raccontaci la tua organizzazione</p>
                </div>

                {/* BARRA DI PROGRESSO - 6 STEP */}
                <div className="flex justify-between mb-8 px-4">
                    <div className={`flex-1 h-2 rounded-l-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 transition-all ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 transition-all ${step >= 4 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 transition-all ${step >= 5 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    <div className={`flex-1 h-2 rounded-r-full transition-all ${step >= 6 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* ==================== STEP 1 ==================== */}
                    {step === 1 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-400" /> Dati Anagrafici
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Nome Ente *</label>
                                    <input 
                                        type="text" 
                                        value={form.nome_ente} 
                                        onChange={(e) => setForm({...form, nome_ente: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tipo Ente *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {tipiEnte.map((tipo) => (
                                            <button 
                                                key={tipo.value} 
                                                type="button" 
                                                onClick={() => setForm({...form, tipo_ente: tipo.value})} 
                                                className={`p-3 rounded-lg border transition-all text-left ${form.tipo_ente === tipo.value ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}
                                            >
                                                <div className="font-medium">{tipo.label}</div>
                                                <div className="text-xs text-slate-400">{tipo.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Codice Fiscale</label>
                                        <input 
                                            type="text" 
                                            value={form.codice_fiscale} 
                                            onChange={(e) => setForm({...form, codice_fiscale: e.target.value})} 
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Partita IVA</label>
                                        <input 
                                            type="text" 
                                            value={form.partita_iva} 
                                            onChange={(e) => setForm({...form, partita_iva: e.target.value})} 
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 2 ==================== */}
                    {step === 2 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-green-400" /> Dati di Contatto
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Telefono</label>
                                    <input 
                                        type="tel" 
                                        value={form.telefono} 
                                        onChange={(e) => setForm({...form, telefono: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Email PEC</label>
                                    <input 
                                        type="email" 
                                        value={form.email_pec} 
                                        onChange={(e) => setForm({...form, email_pec: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Sito Web</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://www.comune.it"
                                        value={form.sito_web} 
                                        onChange={(e) => setForm({...form, sito_web: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Fax</label>
                                    <input 
                                        type="text" 
                                        value={form.fax} 
                                        onChange={(e) => setForm({...form, fax: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button type="button" onClick={handleBack} className="px-6 py-2 bg-slate-700 rounded-lg text-white flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 3 ==================== */}
                    {step === 3 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-400" /> Localizzazione
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Regione *</label>
                                    <select 
                                        value={form.regione} 
                                        onChange={(e) => setForm({...form, regione: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        required
                                    >
                                        <option value="">Seleziona regione...</option>
                                        {regioni.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Provincia *</label>
                                    <input 
                                        type="text" 
                                        value={form.provincia} 
                                        onChange={(e) => setForm({...form, provincia: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Comune *</label>
                                    <input 
                                        type="text" 
                                        value={form.comune} 
                                        onChange={(e) => setForm({...form, comune: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">CAP</label>
                                    <input 
                                        type="text" 
                                        value={form.cap} 
                                        onChange={(e) => setForm({...form, cap: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Indirizzo</label>
                                    <input 
                                        type="text" 
                                        value={form.indirizzo} 
                                        onChange={(e) => setForm({...form, indirizzo: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button type="button" onClick={handleBack} className="px-6 py-2 bg-slate-700 rounded-lg text-white flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 4 ==================== */}
                    {step === 4 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Award className="h-5 w-5 text-purple-400" /> Caratteristiche Ente
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Popolazione Comune</label>
                                    <select 
                                        value={form.popolazione_comune} 
                                        onChange={(e) => setForm({...form, popolazione_comune: e.target.value})} 
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="">Seleziona...</option>
                                        {popolazioneOpzioni.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
       <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">Settori Prevalenti *</label>
    <p className="text-xs text-slate-400 mb-2">Seleziona uno o più settori di interesse</p>
    <div className="flex flex-wrap gap-2">
        {settoreOpzioni.map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => setForm({
                    ...form, 
                    settore_prevalente: form.settore_prevalente.includes(opt) 
                        ? form.settore_prevalente.filter((s: string) => s !== opt) 
                        : [...form.settore_prevalente, opt]
                })}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.settore_prevalente.includes(opt) 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
    {form.settore_prevalente.length > 0 && (
        <div className="mt-2">
            <span className="text-xs text-slate-400">Selezionati: </span>
            <span className="text-xs text-white">{form.settore_prevalente.join(', ')}</span>
        </div>
    )}
</div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={form.esperienza_fondi_europei} 
                                        onChange={(e) => setForm({...form, esperienza_fondi_europei: e.target.checked})} 
                                        className="w-4 h-4 rounded" 
                                    />
                                    <label className="text-slate-300">Esperienza in fondi europei</label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ruolo in bandi</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {ruoloOpzioni.map(opt => (
                                            <button 
                                                key={opt} 
                                                type="button" 
                                                onClick={() => setForm({...form, ruolo_bandi: opt})} 
                                                className={`p-3 rounded-lg border transition-all ${form.ruolo_bandi === opt ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}
                                            >
                                                {opt === 'capofila' ? 'Capofila' : opt === 'partner' ? 'Partner' : 'Nessuno'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={form.cofinanziamento_disponibile} 
                                        onChange={(e) => setForm({...form, cofinanziamento_disponibile: e.target.checked})} 
                                        className="w-4 h-4 rounded" 
                                    />
                                    <label className="text-slate-300">Cofinanziamento disponibile</label>
                                </div>
                                {form.cofinanziamento_disponibile && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Percentuale cofinanziamento (%)</label>
                                        <input 
                                            type="number" 
                                            value={form.percentuale_cofinanziamento} 
                                            onChange={(e) => setForm({...form, percentuale_cofinanziamento: e.target.value})} 
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" 
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={form.referente_bandi} 
                                        onChange={(e) => setForm({...form, referente_bandi: e.target.checked})} 
                                        className="w-4 h-4 rounded" 
                                    />
                                    <label className="text-slate-300">Referente dedicato per i bandi</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={form.gia_beneficiario_pnrr} 
                                        onChange={(e) => setForm({...form, gia_beneficiario_pnrr: e.target.checked})} 
                                        className="w-4 h-4 rounded" 
                                    />
                                    <label className="text-slate-300">Già beneficiario PNRR</label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button type="button" onClick={handleBack} className="px-6 py-2 bg-slate-700 rounded-lg text-white flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 5 ==================== */}
                    {step === 5 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-pink-400" /> Preferenze Bandi
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Categorie di interesse</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categorieBandi.map((cat) => (
                                            <button 
                                                key={cat.value} 
                                                type="button" 
                                                onClick={() => setForm({...form, categorie_interesse: toggleArray(form.categorie_interesse, cat.value)})} 
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                                    form.categorie_interesse.includes(cat.value) 
                                                        ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/50` 
                                                        : 'bg-slate-700 text-slate-300'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Livelli di interesse</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {livelliBandi.map((livello) => (
                                            <button 
                                                key={livello.value} 
                                                type="button" 
                                                onClick={() => setForm({...form, livelli_interesse: toggleArray(form.livelli_interesse, livello.value)})} 
                                                className={`p-3 rounded-lg border transition-all text-left ${
                                                    form.livelli_interesse.includes(livello.value) 
                                                        ? 'bg-blue-500/20 border-blue-500' 
                                                        : 'bg-slate-900/50 border-slate-700'
                                                }`}
                                            >
                                                <div className="font-medium text-white">{livello.label}</div>
                                                <div className="text-xs text-slate-400">{livello.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Fasce di importo</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {importiBandi.map((importo) => (
                                            <button 
                                                key={importo.value} 
                                                type="button" 
                                                onClick={() => setForm({...form, importi_interesse: toggleArray(form.importi_interesse, importo.value)})} 
                                                className={`p-3 rounded-lg border transition-all text-left ${
                                                    form.importi_interesse.includes(importo.value) 
                                                        ? 'bg-green-500/20 border-green-500' 
                                                        : 'bg-slate-900/50 border-slate-700'
                                                }`}
                                            >
                                                <div className="font-medium text-white">{importo.label}</div>
                                                <div className="text-xs text-slate-400">{importo.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button type="button" onClick={handleBack} className="px-6 py-2 bg-slate-700 rounded-lg text-white flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    Continua <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 6 - NUOVI CRITERI ==================== */}
                    {step === 6 && (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Target className="h-5 w-5 text-cyan-400" /> Capacità e Dettaglio
                            </h2>
                            
                            {/* Capacità progettuale */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.staff_dedicato_bandi} onChange={(e) => setForm({...form, staff_dedicato_bandi: e.target.checked})} className="w-4 h-4 rounded" />
                                    <label className="text-slate-300">Staff interno dedicato ai bandi</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.consulente_esterno_bandi} onChange={(e) => setForm({...form, consulente_esterno_bandi: e.target.checked})} className="w-4 h-4 rounded" />
                                    <label className="text-slate-300">Consulente esterno / Project Manager</label>
                                </div>
                            </div>

                            {/* Capacità finanziaria */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-400" /> Capacità finanziaria
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={form.anticipo_spese_disponibile} onChange={(e) => setForm({...form, anticipo_spese_disponibile: e.target.checked})} className="w-4 h-4 rounded" />
                                        <label className="text-slate-300">Disponibilità ad anticipare spese</label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={form.conto_dedicato_fondi} onChange={(e) => setForm({...form, conto_dedicato_fondi: e.target.checked})} className="w-4 h-4 rounded" />
                                        <label className="text-slate-300">Conto bancario dedicato fondi europei</label>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700 my-6" />

                            {/* STEP Bando FESR */}
                            <div className="mb-6">
                                <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-yellow-400" /> STEP - Bando FESR
                                </h3>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Tipologia di investimento</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tipologieInvestimento.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, tipologia_investimento: toggleArray(form.tipologia_investimento, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.tipologia_investimento.includes(opt.value) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Dimensione impresa</label>
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
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Intensità di aiuto attesa</label>
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
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Presenza CUP</label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <input type="checkbox" checked={form.cup_attivo} onChange={(e) => setForm({...form, cup_attivo: e.target.checked})} className="w-4 h-4 rounded" />
                                            <label className="text-slate-300">L'ente ha già un CUP attivo</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700 my-6" />

                            {/* GOL/PNRR */}
                            <div className="mb-6">
                                <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-400" /> GOL / PNRR - Formazione e Lavoro
                                </h3>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Target group servito</label>
                                    <div className="flex flex-wrap gap-2">
                                        {targetGroups.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, target_group: toggleArray(form.target_group, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.target_group.includes(opt.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di attività erogabile</label>
                                    <div className="flex flex-wrap gap-2">
                                        {attivitaErogabili.map(opt => (
                                            <button key={opt.value} type="button" onClick={() => setForm({...form, attivita_erogabili: toggleArray(form.attivita_erogabili, opt.value)})}
                                                className={`px-3 py-1.5 rounded-full text-sm ${form.attivita_erogabili.includes(opt.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <input type="checkbox" checked={form.accreditamento_formativo} onChange={(e) => setForm({...form, accreditamento_formativo: e.target.checked})} className="w-4 h-4 rounded" />
                                            <label className="text-slate-300">Accreditato come organismo formativo</label>
                                        </div>
                                        {form.accreditamento_formativo && (
                                            <input type="text" placeholder="Regione di accreditamento (es. Sicilia)" value={form.regione_accreditamento} onChange={(e) => setForm({...form, regione_accreditamento: e.target.value})} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Sistemi informativi compatibili</label>
                                        <div className="flex flex-wrap gap-2">
                                            {sistemiInformativi.map(opt => (
                                                <button key={opt.value} type="button" onClick={() => setForm({...form, sistemi_informativi: toggleArray(form.sistemi_informativi, opt.value)})}
                                                    className={`px-3 py-1.5 rounded-full text-sm ${form.sistemi_informativi.includes(opt.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700 my-6" />

                            {/* Obiettivi policy */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-purple-400" /> Obiettivi di policy prioritari (FESR 2021-2027)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {obiettiviPolicy.map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setForm({...form, obiettivi_policy: toggleArray(form.obiettivi_policy, opt.value)})}
                                            className={`px-3 py-1.5 rounded-full text-sm ${form.obiettivi_policy.includes(opt.value) ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-700 text-slate-300'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modello budget */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Tipologia di costi gestibili</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {modelliBudget.map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setForm({...form, modello_budget: opt.value})}
                                            className={`p-3 rounded-lg border text-sm ${form.modello_budget === opt.value ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assicurazione */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-400" /> Assicurazione rischi catastrofali (DM 30/01/2025)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.assicurazione_catastrofale} onChange={(e) => setForm({...form, assicurazione_catastrofale: e.target.checked})} className="w-4 h-4 rounded" />
                                    <label className="text-slate-300">L'ente ha copertura assicurativa catastrofale</label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button type="button" onClick={handleBack} className="px-6 py-2 bg-slate-700 rounded-lg text-white flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Indietro
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium flex items-center gap-2">
                                    {saving ? 'Salvataggio...' : <><Check className="h-4 w-4" /> Completa Profilo</>}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}