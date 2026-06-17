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
        
        // STEP 6 - NUOVI CRITERI
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
            
            // STEP 6
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

    // ... il resto del componente (categorieBandi, livelliBandi, importiBandi, etc.)
    // e il return con tutti gli input per i nuovi campi
};