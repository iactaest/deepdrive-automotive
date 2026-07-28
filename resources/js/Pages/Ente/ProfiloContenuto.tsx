import { router } from '@inertiajs/react';
import CardBolla, { PALETTE_BOLLA } from '@/Components/CardBolla';
import {
    Building2, MapPin, Heart, Edit, ArrowLeft, CheckCircle, Trash2,
    Phone, Award, Briefcase, Wallet, Shield, Users, Target, TrendingUp,
    Mail, Globe, FileText, Calendar, Users as UsersIcon, Tag, Layers,
    Euro, BarChart3, PieChart
} from 'lucide-react';

// Contenuto della pagina Profilo, senza LayoutEnte: estratto cosi puo essere
// renderizzato sia nella pagina normale sia incorporato in DashboardMobile
// (stesso meccanismo usato per la Dashboard). In modalità compatta la griglia
// a 2 colonne diventa a colonna singola, per stare nel riquadro stretto del menu.
export default function ProfiloContenuto({ profilo, compatto = false }: { profilo: any; compatto?: boolean }) {
    const getTipoLabel = (tipo: string) => {
        const tipi: Record<string, string> = {
            comune: 'Comune', provincia: 'Provincia', regione: 'Regione',
            asl: 'ASL', universita: 'Università', scuola: 'Scuola', altro: 'Altro'
        };
        return tipi[tipo] || tipo;
    };

    const handleDelete = () => {
        if (confirm('⚠️ Sei sicuro di voler cancellare il profilo?')) {
            router.post('/ente/profilo', { _method: 'DELETE' });
        }
    };

    // Normalizzazione dati
    const categorie: string[] = Array.isArray(profilo.categorie_interesse) ? profilo.categorie_interesse : (profilo.categorie_interesse ? JSON.parse(profilo.categorie_interesse) : []);
    const livelli: string[] = Array.isArray(profilo.livelli_interesse) ? profilo.livelli_interesse : (profilo.livelli_interesse ? JSON.parse(profilo.livelli_interesse) : []);
    const importi: string[] = Array.isArray(profilo.importi_interesse) ? profilo.importi_interesse : (profilo.importi_interesse ? JSON.parse(profilo.importi_interesse) : []);
    const tipologiaInvestimento: string[] = Array.isArray(profilo.tipologia_investimento) ? profilo.tipologia_investimento : (profilo.tipologia_investimento ? JSON.parse(profilo.tipologia_investimento) : []);
    const dimensioneImpresa: string[] = Array.isArray(profilo.dimensione_impresa) ? profilo.dimensione_impresa : (profilo.dimensione_impresa ? JSON.parse(profilo.dimensione_impresa) : []);
    const targetGroup: string[] = Array.isArray(profilo.target_group) ? profilo.target_group : (profilo.target_group ? JSON.parse(profilo.target_group) : []);
    const attivitaErogabili: string[] = Array.isArray(profilo.attivita_erogabili) ? profilo.attivita_erogabili : (profilo.attivita_erogabili ? JSON.parse(profilo.attivita_erogabili) : []);
    const sistemiInformativi: string[] = Array.isArray(profilo.sistemi_informativi) ? profilo.sistemi_informativi : (profilo.sistemi_informativi ? JSON.parse(profilo.sistemi_informativi) : []);
    const obiettiviPolicy: string[] = Array.isArray(profilo.obiettivi_policy) ? profilo.obiettivi_policy : (profilo.obiettivi_policy ? JSON.parse(profilo.obiettivi_policy) : []);

    const getIntensitaLabel = (v: string) => ({ '25%':'Fino al 25%', '35%':'Fino al 35%', '45%':'Fino al 45%', '65%+':'Oltre il 65%' }[v] || v);
    const getModelloBudgetLabel = (v: string) => ({ 'full_cost':'Full Cost', 'diretti':'Solo costi diretti', 'lump_sum':'Lump Sum' }[v] || v);
    const getTargetLabel = (v: string) => ({ 'disoccupati':'Disoccupati', 'lavoratori_rischio':'Lavoratori a rischio', 'fragili':'Persone con fragilità', 'neet':'Giovani NEET', 'over55':'Over 55' }[v] || v);
    const getAttivitaLabel = (v: string) => ({ 'formazione':'Formazione', 'tirocini':'Tirocini', 'orientamento':'Orientamento', 'certificazione':'Certificazione', 'creazione_impresa':'Creazione impresa' }[v] || v);
    const getSistemaLabel = (v: string) => ({ 'silav':'SILAV', 'ciapigol':'CIAPIGOL', 'regis':'ReGIS', 'nessuno':'Nessuno' }[v] || v);
    const getPolicyLabel = (v: string) => ({ 'intelligente':'💡 Intelligente', 'verde':'🌿 Verde', 'connessa':'🔗 Connessa', 'sociale':'🤝 Sociale', 'vicina':'🏘️ Vicina' }[v] || v);
    const getTipologiaInvestimentoLabel = (v: string) => ({ 'digitali':'Digitali', 'cleantech':'Clean tech', 'ricerca':'Ricerca', 'innovazione':'Innovazione' }[v] || v);
    const getDimensioneImpresaLabel = (v: string) => ({ 'micro':'Micro', 'piccola':'Piccola', 'media':'Media', 'grande':'Grande' }[v] || v);

    // Mini-card per singolo dato (orizzontale)
    const DataItem = ({ icon: Icon, label, value, color = 'blue', tag = false }: any) => {
        if (!value && value !== 0 && value !== false) return null;
        return (
            <div className="bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 flex-1 min-w-[100px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`h-3 w-3 text-${color}-400`} />
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
                </div>
                <div className="text-white text-xs font-medium truncate">
                    {tag ? <div className="flex flex-wrap gap-1">{value}</div> : value}
                </div>
            </div>
        );
    };

    // Card sezione principale - stesso stile "bolla" della dashboard.
    const SectionCard = ({ icon: Icon, title, children, idx = 0 }: any) => (
        <CardBolla bordo={PALETTE_BOLLA[idx % PALETTE_BOLLA.length]} indice={idx} className="p-4">
            <h2 className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
                <Icon className="card-bolla-icona h-4 w-4" style={{ color: PALETTE_BOLLA[idx % PALETTE_BOLLA.length] }} /> {title}
            </h2>
            <div className="flex flex-wrap gap-2">
                {children}
            </div>
        </CardBolla>
    );

    const renderTags = (items: string[], labelMap?: (v: string) => string, empty: string = 'Nessuna') => {
        if (!items || items.length === 0) return <span className="text-slate-500 text-[10px]">{empty}</span>;
        return items.map((item) => (
            <span key={item} className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] whitespace-nowrap">
                {labelMap ? labelMap(item) : item}
            </span>
        ));
    };

    return (
        <div style={{ marginTop: 25 }}>
            {/* Header */}
            <div className="mb-5">
                {!compatto && (
                    <button onClick={() => router.visit('/ente/dashboard')} className="text-slate-400 hover:text-white mb-2 flex items-center gap-1.5 text-xs">
                        <ArrowLeft className="h-3 w-3" /> Torna alla Dashboard
                    </button>
                )}
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{profilo.nome_ente || 'N/D'}</h1>
                        <p className="text-slate-300 text-sm">{getTipoLabel(profilo.tipo_ente)}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.visit('/ente/profilo/modifica')}
                            className="px-3 py-1.5 bg-[#8FA3C7]/15 hover:bg-[#8FA3C7]/25 border border-[#8FA3C7]/40 rounded-lg text-[#8FA3C7] text-sm font-medium flex items-center gap-1.5 transition"
                        >
                            <Edit className="h-3.5 w-3.5" /> Modifica
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 bg-[#C08FA8]/15 hover:bg-[#C08FA8]/25 border border-[#C08FA8]/40 rounded-lg text-[#C08FA8] text-sm font-medium flex items-center gap-1.5 transition"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Cancella
                        </button>
                    </div>
                </div>
            </div>

            {/* Griglia - 2 colonne per riga (1 colonna in modalità compatta) */}
            <div className={`grid grid-cols-1 gap-4 ${compatto ? '' : 'lg:grid-cols-2'}`}>

                <SectionCard icon={Building2} title="Dati Anagrafici" idx={0}>
                    <DataItem icon={Building2} label="Nome Ente" value={profilo.nome_ente || 'N/D'} color="blue" />
                    <DataItem icon={Tag} label="Tipo Ente" value={getTipoLabel(profilo.tipo_ente)} color="blue" />
                    {profilo.codice_fiscale && <DataItem icon={FileText} label="CF" value={profilo.codice_fiscale} color="blue" />}
                    {profilo.partita_iva && <DataItem icon={FileText} label="P.IVA" value={profilo.partita_iva} color="blue" />}
                </SectionCard>

                <SectionCard icon={Phone} title="Dati di Contatto" idx={1}>
                    {profilo.telefono && <DataItem icon={Phone} label="Telefono" value={profilo.telefono} color="green" />}
                    {profilo.email_pec && <DataItem icon={Mail} label="PEC" value={profilo.email_pec} color="green" />}
                    {profilo.sito_web && <DataItem icon={Globe} label="Sito" value={<a href={profilo.sito_web} target="_blank" className="text-blue-400 hover:underline text-xs">{profilo.sito_web}</a>} color="green" />}
                    {profilo.fax && <DataItem icon={FileText} label="Fax" value={profilo.fax} color="green" />}
                </SectionCard>

                <SectionCard icon={MapPin} title="Localizzazione" idx={2}>
                    <DataItem icon={MapPin} label="Regione" value={profilo.regione || 'N/D'} color="orange" />
                    <DataItem icon={MapPin} label="Provincia" value={profilo.provincia || 'N/D'} color="orange" />
                    <DataItem icon={MapPin} label="Comune" value={profilo.comune || 'N/D'} color="orange" />
                    {profilo.indirizzo && <DataItem icon={MapPin} label="Indirizzo" value={profilo.indirizzo} color="orange" />}
                    {profilo.cap && <DataItem icon={MapPin} label="CAP" value={profilo.cap} color="orange" />}
                </SectionCard>

                <SectionCard icon={Award} title="Caratteristiche Ente" idx={3}>
                    {profilo.popolazione_comune && <DataItem icon={UsersIcon} label="Popolazione" value={profilo.popolazione_comune} color="purple" />}
                    {profilo.settore_prevalente && <DataItem icon={Award} label="Settore" value={profilo.settore_prevalente} color="purple" />}
                    <DataItem icon={CheckCircle} label="Esperienza UE" value={profilo.esperienza_fondi_europei ? '✅ Sì' : '❌ No'} color="purple" />
                    <DataItem icon={Layers} label="Ruolo" value={profilo.ruolo_bandi === 'capofila' ? 'Capofila' : profilo.ruolo_bandi === 'partner' ? 'Partner' : 'Nessuno'} color="purple" />
                    <DataItem icon={Euro} label="Cofinanziamento" value={profilo.cofinanziamento_disponibile ? `✅ ${profilo.percentuale_cofinanziamento}%` : '❌ No'} color="purple" />
                    <DataItem icon={UsersIcon} label="Referente" value={profilo.referente_bandi ? '✅ Sì' : '❌ No'} color="purple" />
                    <DataItem icon={Award} label="PNRR" value={profilo.gia_beneficiario_pnrr ? '✅ Sì' : '❌ No'} color="purple" />
                </SectionCard>

                <SectionCard icon={Heart} title="Preferenze Bandi" idx={4}>
                    <DataItem icon={Heart} label="Categorie" tag value={renderTags(categorie)} color="pink" />
                    <DataItem icon={Layers} label="Livelli" tag value={renderTags(livelli)} color="pink" />
                    <DataItem icon={Euro} label="Importi" tag value={renderTags(importi)} color="pink" />
                </SectionCard>

                <SectionCard icon={Target} title="Capacità Progettuale" idx={5}>
                    <DataItem icon={Target} label="Progetti UE" value={profilo.num_progetti_europei || 'N/D'} color="cyan" />
                    <DataItem icon={UsersIcon} label="Staff" value={
                        (profilo.staff_dedicato_bandi ? 'Staff' : '') +
                        (profilo.staff_dedicato_bandi && profilo.consulente_esterno_bandi ? ' | ' : '') +
                        (profilo.consulente_esterno_bandi ? 'Consulente' : '') ||
                        (profilo.staff_dedicato_bandi || profilo.consulente_esterno_bandi ? '' : 'Nessuno')
                    } color="cyan" />
                    <DataItem icon={Wallet} label="Anticipo" value={profilo.anticipo_spese_disponibile ? '✅ Sì' : '❌ No'} color="cyan" />
                    <DataItem icon={Wallet} label="Conto Dedicato" value={profilo.conto_dedicato_fondi ? '✅ Sì' : '❌ No'} color="cyan" />
                    <DataItem icon={FileText} label="Modello Budget" value={profilo.modello_budget ? getModelloBudgetLabel(profilo.modello_budget) : 'N/D'} color="cyan" />
                    {profilo.obiettivi_policy && profilo.obiettivi_policy.length > 0 && (
                        <DataItem icon={TrendingUp} label="Obiettivi Policy" tag value={renderTags(obiettiviPolicy, getPolicyLabel)} color="cyan" />
                    )}
                </SectionCard>

                <SectionCard icon={Shield} title="STEP - Bando FESR" idx={6}>
                    {tipologiaInvestimento.length > 0 && (
                        <DataItem icon={Shield} label="Tipologia" tag value={renderTags(tipologiaInvestimento, getTipologiaInvestimentoLabel)} color="yellow" />
                    )}
                    {dimensioneImpresa.length > 0 && (
                        <DataItem icon={BarChart3} label="Dimensione" tag value={renderTags(dimensioneImpresa, getDimensioneImpresaLabel)} color="yellow" />
                    )}
                    {profilo.intensita_aiuto && (
                        <DataItem icon={PieChart} label="Intensità" value={getIntensitaLabel(profilo.intensita_aiuto)} color="yellow" />
                    )}
                    <DataItem icon={CheckCircle} label="CUP" value={profilo.cup_attivo ? '✅ Sì' : '❌ No'} color="yellow" />
                    <DataItem icon={Shield} label="Assicurazione" value={profilo.assicurazione_catastrofale ? '✅ Sì' : '❌ No'} color="yellow" />
                </SectionCard>

                <SectionCard icon={Users} title="GOL / PNRR" idx={7}>
                    {targetGroup.length > 0 && (
                        <DataItem icon={Users} label="Target" tag value={renderTags(targetGroup, getTargetLabel)} color="blue" />
                    )}
                    {attivitaErogabili.length > 0 && (
                        <DataItem icon={Award} label="Attività" tag value={renderTags(attivitaErogabili, getAttivitaLabel)} color="blue" />
                    )}
                    <DataItem icon={CheckCircle} label="Accreditamento" value={
                        profilo.accreditamento_formativo
                            ? `✅ ${profilo.regione_accreditamento || 'Sì'}`
                            : '❌ No'
                    } color="blue" />
                    {sistemiInformativi.length > 0 && (
                        <DataItem icon={Layers} label="Sistemi" tag value={renderTags(sistemiInformativi, getSistemaLabel)} color="blue" />
                    )}
                </SectionCard>

            </div>

            {/* Stato profilo - full width */}
            <CardBolla bordo="#7CB08A" className="mt-6 p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="card-bolla-icona h-5 w-5" style={{ color: '#7CB08A' }} />
                    <p style={{ color: '#7CB08A' }}>{profilo.profilo_completo ? '✅ Profilo completo!' : '⚠️ Profilo non ancora completo'}</p>
                </div>
            </CardBolla>
        </div>
    );
}
