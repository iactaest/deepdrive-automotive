import { Link } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import {
    LayoutDashboard,
    User,
    Users,
    FileText,
    Settings,
    LogOut,
    Landmark,
    ListChecks,
    Search,
    Bookmark,
    Archive,
    FolderOpen,
    ClipboardCheck,
    ChevronDown,
    Menu,
    type LucideIcon,
} from 'lucide-react';
import DashboardContenuto from './DashboardContenuto';
import ProfiloContenuto from './ProfiloContenuto';
import GestioneTeamContenuto from './GestioneTeam/Contenuto';
import CassettoDocumentiContenuto from './CassettoDocumenti/Contenuto';
import RendicontazioneContenuto from './Rendicontazione/Contenuto';
import ListaBandiContenuto from './ListaBandi/Contenuto';
import RicercaContenuto from '../Bandi/RicercaContenuto';
import BandiSalvatiContenuto from './BandiSalvati/Contenuto';
import StoricoBandiContenuto from './StoricoBandi/Contenuto';
import ImpostazioniContenuto from './ImpostazioniContenuto';
import {
    animaSparizioneMenu,
    animaComparsaMenu,
    animaEmersioneContenuto,
    animaRisucchioContenuto,
    prefersReducedMotion,
    ORIGINE_RISUCCHIO_FRAZIONE,
    type PuntoVortice,
} from './Vortice';

type Bolla = {
    label: string;
    href: string;
    left: number;
    top: number;
    tailLeft: number;
    tailTop: number;
    rot: number;
    bordo: string;
    tail: string;
    icona: LucideIcon;
    size?: number;
    tailSize?: number;
};

// Le voci del menu che aprono un pannello incorporato (invece di navigare a
// una pagina vera e propria), con l'URL dell'endpoint JSON da cui prendere i
// dati e il titolo mostrato nella barra fissa in alto quando sono aperte.
type ChiavePannello =
    | 'dashboard' | 'profilo' | 'team' | 'documenti' | 'rendicontazione'
    | 'lista-bandi' | 'ricerca' | 'bandi-salvati' | 'storico-bandi' | 'impostazioni';

// "impostazioni" non ha una vera fetch (vedi apriPannello): l'url resta vuoto,
// i dati dei form vengono presi dalle props globali condivise di Inertia.
const PANNELLI: Record<ChiavePannello, { url: string; titolo: string }> = {
    dashboard:        { url: '/ente/menu/dati-dashboard', titolo: 'DASHBOARD' },
    profilo:           { url: '/ente/profilo?embed=1', titolo: 'PROFILO' },
    team:              { url: '/ente/team?embed=1', titolo: 'TEAM' },
    documenti:         { url: '/cassetto-documenti?embed=1', titolo: 'DOCUMENTI' },
    rendicontazione:   { url: '/ente/rendicontazione?embed=1', titolo: 'RENDICONTAZIONE' },
    'lista-bandi':     { url: '/ente/lista-bandi?embed=1', titolo: 'LISTA BANDI' },
    ricerca:           { url: '/ente/ricerca?embed=1', titolo: 'RICERCA' },
    'bandi-salvati':   { url: '/bandi-salvati?embed=1', titolo: 'BANDI SALVATI' },
    impostazioni:      { url: '', titolo: 'IMPOSTAZIONI' },
    'storico-bandi':   { url: '/ente/storico-bandi?embed=1', titolo: 'STORICO BANDI' },
};

type SubVoce = {
    label: string;
    chiave: ChiavePannello;
    bordo: string;
    icona: LucideIcon;
    // Font piu' piccolo e forzato su una riga sola, per le etichette troppo
    // lunghe per stare su due parole nella larghezza standard della bolla.
    fontSize?: number;
};

// Sottomenu BANDI: tonalità fredde (blu-violetto-rosa) per distinguersi dalla
// scala arancio-verde delle bolle principali, dato che BANDI ha bordo neutro.
const BANDI_SUB: SubVoce[] = [
    { label: 'LISTA BANDI', chiave: 'lista-bandi', bordo: '#8FA3C7', icona: ListChecks },
    { label: 'RICERCA', chiave: 'ricerca', bordo: '#9C93C7', icona: Search },
    { label: 'BANDI SALVATI', chiave: 'bandi-salvati', bordo: '#B08FC0', icona: Bookmark },
    { label: 'STORICO BANDI', chiave: 'storico-bandi', bordo: '#C08FA8', icona: Archive },
];

// Sottomenu DOCUMENTI: due verdi ravvicinati alla bolla madre (#84AC80).
const DOCUMENTI_SUB: SubVoce[] = [
    { label: 'DOCUMENTAZIONE', chiave: 'documenti', bordo: '#7CB08A', icona: FolderOpen, fontSize: 12 },
    { label: 'RENDICONTAZIONE', chiave: 'rendicontazione', bordo: '#6FA5A0', icona: ClipboardCheck, fontSize: 12 },
];

// Scala di 6 colori derivata da arancio (#F0913A) e verde (#3FCF97): tonalità
// ravvicinate e desaturate cosi il bordo resta poco vistoso ma ogni bottone
// resta riconoscibile dagli altri.
// Tutte le posizioni dell'anello sono spostate di +RING_Y rispetto al design
// originale, per lasciare spazio in alto a un logo più grande e più basso
// senza che si sovrapponga alla bolla DASHBOARD.
// Il logo ora vive fuori dalla tela (sopra, in flusso normale, non si
// rimpicciolisce con la ruota), quindi non serve piu riservargli spazio
// interno alle coordinate dell'anello.
const RING_Y = 0;

const BOLLE: Bolla[] = [
    {
        label: 'DASHBOARD',
        href: '/ente/dashboard',
        left: 320,
        top: 237 + RING_Y,
        tailLeft: 320,
        tailTop: 313 + RING_Y,
        rot: 45,
        bordo: '#CE8A52',
        tail: 'linear-gradient(145deg,#DFA774,#AD6E38)',
        icona: LayoutDashboard,
    },
    {
        label: 'PROFILO',
        href: '/ente/profilo',
        left: 131,
        top: 374 + RING_Y,
        tailLeft: 196,
        tailTop: 414 + RING_Y,
        rot: 76.5,
        bordo: '#C0975F',
        tail: 'linear-gradient(145deg,#D3B27F,#9C7846)',
        icona: User,
    },
    {
        label: 'TEAM',
        href: '/ente/team',
        left: 131,
        top: 624 + RING_Y,
        tailLeft: 193,
        tailTop: 580 + RING_Y,
        rot: 9.7,
        bordo: '#AFA36C',
        tail: 'linear-gradient(145deg,#C4BB89,#8A804E)',
        icona: Users,
    },
    {
        label: 'DOCUMENTI',
        href: '/cassetto-documenti',
        left: 508,
        top: 374 + RING_Y,
        tailLeft: 443,
        tailTop: 414 + RING_Y,
        rot: 193.3,
        bordo: '#84AC80',
        tail: 'linear-gradient(145deg,#A0C79C,#5F8A5C)',
        icona: FileText,
    },
    {
        label: 'IMPOSTAZIONI',
        href: '/profile',
        left: 508,
        top: 624 + RING_Y,
        tailLeft: 446,
        tailTop: 580 + RING_Y,
        rot: -99.5,
        bordo: '#66AB93',
        tail: 'linear-gradient(145deg,#85C7AE,#428069)',
        icona: Settings,
    },
    {
        label: 'LOGOUT',
        href: '/logout',
        left: 320,
        top: 721 + RING_Y,
        tailLeft: 320,
        tailTop: 673 + RING_Y,
        rot: 45,
        bordo: '#C1666B',
        tail: 'linear-gradient(145deg,#D98A82,#9C4A42)',
        icona: LogOut,
        size: 95,
        tailSize: 33,
    },
];

const TESTO = '#E7EAED';
const FONT_LABEL_SIZE = 14;
const FONT_LABEL: React.CSSProperties = {
    fontSize: FONT_LABEL_SIZE,
    letterSpacing: '.03em',
    fontWeight: 500,
    whiteSpace: 'nowrap',
};

const stileBolla: React.CSSProperties = {
    position: 'absolute',
    width: 152,
    height: 152,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    textDecoration: 'none',
    background: 'linear-gradient(145deg,#454F59,#333B45 55%,#242B33)',
    boxShadow:
        '0 18px 32px rgba(0,0,0,.5), inset 0 2px 3px rgba(255,255,255,.28), inset 0 -6px 12px rgba(0,0,0,.35)',
};

// Bolle del sottomenu: più piccole delle bolle principali, senza position
// assoluta propria (vengono posizionate dal pannello-contenitore che le ospita).
const SUB_SIZE = 150;
const stileSubBolla: React.CSSProperties = {
    position: 'relative',
    width: SUB_SIZE,
    height: SUB_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: 'linear-gradient(145deg,#454F59,#333B45 55%,#242B33)',
    boxShadow:
        '0 10px 18px rgba(0,0,0,.5), inset 0 2px 3px rgba(255,255,255,.28), inset 0 -6px 12px rgba(0,0,0,.35)',
};

const FONT_SUB_LABEL: React.CSSProperties = {
    fontSize: 16.5,
    letterSpacing: '.01em',
    fontWeight: 500,
    whiteSpace: 'normal',
    textAlign: 'center',
    lineHeight: 1.15,
    maxWidth: 116,
    wordBreak: 'break-word',
};

const stileTail: React.CSSProperties = {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 10,
    zIndex: 1,
    boxShadow: 'inset 0 2px 3px rgba(255,255,255,.35), inset 0 -4px 8px rgba(0,0,0,.3)',
};

// Ombra bianca statica sotto ogni bolla, stessa forma circolare del bottone:
// dà l'idea che siano sospese senza l'effetto "meccanico" di un'animazione
// che pulsa in sincrono col galleggiamento.
function stileOmbra(size: number): React.CSSProperties {
    return {
        position: 'absolute',
        width: size * 0.5,
        height: size * 0.5,
        borderRadius: '50%',
        background: 'rgba(255,255,255,.05)',
        filter: 'blur(8px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        pointerEvents: 'none',
    };
}

// Ogni bolla riceve un ritardo/durata leggermente diversi cosi il movimento
// resta "indipendente" invece di sincronizzarsi tutte insieme.
function animazioneGalleggiamento(indice: number): React.CSSProperties {
    return {
        animationDelay: `${(indice * 0.37) % 2.2}s`,
        animationDuration: `${3.6 + (indice % 4) * 0.45}s`,
    };
}

// Pannello "vetro" semi-trasparente che ospita le bolle del sottomenu, in
// sovraimpressione sopra le bolle principali circostanti.
const PANNELLO_PAD = 14;
const PANNELLO_GAP = 12;
const stilePannello: React.CSSProperties = {
    position: 'absolute',
    zIndex: 8,
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: PANNELLO_GAP,
    padding: PANNELLO_PAD,
    borderRadius: 26,
    background: 'rgba(255,255,255,.10)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,.22)',
    boxShadow: '0 25px 50px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.22)',
    transition: 'opacity .3s ease, transform .3s ease',
};

// Sfondo scuro con luce soffusa in alto e in basso, per dare profondità alla
// vista generale (non alla tela del menu, che resta senza sfondo proprio).
const SFONDO_PROFONDITA: React.CSSProperties = {
    backgroundColor: '#0E1318',
    backgroundImage:
        'radial-gradient(ellipse 900px 480px at 50% -6%, rgba(255,255,255,.08), transparent 60%),' +
        'radial-gradient(ellipse 800px 460px at 50% 106%, rgba(180,210,255,.07), transparent 60%),' +
        'radial-gradient(ellipse 900px 900px at 50% 50%, transparent 45%, rgba(0,0,0,.4) 100%)',
};

// Livello con l'immagine di sfondo (pattern di icone) schiarita via filtro CSS e
// fusa in "screen" cosi resta un texture leggera sopra il gradiente della bolla.
const CSS = `
.mb-bolla {
    isolation: isolate;
    overflow: hidden;
    transition: filter .25s ease;
}
.mb-bolla:hover,
.mb-bolla:focus-visible {
    filter: brightness(1.14);
}
.mb-bolla:active {
    filter: brightness(1.3);
}
.mb-bg {
    position: absolute;
    inset: -10%;
    background-image: url('/images/pattern-giochi.png');
    background-size: 110px;
    background-repeat: repeat;
    filter: brightness(3.4) contrast(1.1);
    mix-blend-mode: screen;
    opacity: .1;
    pointer-events: none;
}
.mb-bandi .mb-bg {
    background-size: 150px;
}
.mb-dome {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 32% 26%, rgba(255,255,255,.45), rgba(255,255,255,0) 45%);
    mix-blend-mode: screen;
    opacity: .28;
    transition: opacity .35s ease;
    pointer-events: none;
}
.mb-bolla:hover .mb-dome,
.mb-bolla:focus-visible .mb-dome,
.mb-bolla:active .mb-dome {
    opacity: .65;
}
.mb-shine {
    position: absolute;
    top: -60%;
    left: -55%;
    width: 45%;
    height: 260%;
    background: linear-gradient(120deg, transparent 0%, transparent 35%, rgba(255,255,255,.7) 50%, transparent 65%, transparent 100%);
    transform: translateX(0) rotate(20deg);
    mix-blend-mode: overlay;
    opacity: 0;
    transition: transform .7s ease, opacity .45s ease;
    pointer-events: none;
}
.mb-bolla:hover .mb-shine,
.mb-bolla:focus-visible .mb-shine {
    opacity: 1;
    transform: translateX(320%) rotate(20deg);
}
.mb-bolla:active .mb-shine {
    opacity: 1;
    transform: translateX(320%) rotate(20deg);
    transition: transform .25s ease, opacity .15s ease;
}
.mb-label {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.mb-icona {
    filter: drop-shadow(0 3px 3px rgba(0,0,0,.55)) drop-shadow(0 1px 0 rgba(255,255,255,.12));
}
@keyframes mb-float {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
    50% { transform: translate(-50%, -50%) translateY(-3px); }
}
.mb-float {
    animation-name: mb-float;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}
/* Durante la transizione vortice il galleggiamento continuo delle bolle viene
   messo in pausa: un movimento solo (rotazione+scala del menu) invece di due
   sovrapposti rendeva la comparsa/sparizione meno fluida da vedere. */
.mb-vortex-transizione .mb-float {
    animation-play-state: paused;
}
@keyframes mb-float-logo2 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
}
.mb-float-logo2 {
    animation: mb-float-logo2 4.2s ease-in-out infinite;
    animation-delay: .6s;
}
.mb-luce-bandi {
    position: absolute;
    width: 620px;
    height: 620px;
    left: 320px;
    top: ${490 + RING_Y}px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(160,200,255,.32), rgba(160,200,255,.1) 45%, transparent 72%);
    pointer-events: none;
    z-index: 0;
}
`;

const CANVAS_W = 640;
const CANVAS_H = 880 + RING_Y;

function PannelloSotto({
    voci,
    left,
    top,
    colonne,
    aperto,
    onSeleziona,
}: {
    voci: SubVoce[];
    left: number;
    top: number;
    colonne: number;
    aperto: boolean;
    onSeleziona: (chiave: ChiavePannello) => void;
}) {
    const righe = Math.ceil(voci.length / colonne);
    // +6px di margine: con box-sizing:border-box il calcolo esatto lascia 0px di
    // slack e un arrotondamento subpixel basta a far andare a capo le bolle.
    const larghezza = PANNELLO_PAD * 2 + SUB_SIZE * colonne + PANNELLO_GAP * (colonne - 1) + 6;
    const altezza = PANNELLO_PAD * 2 + SUB_SIZE * righe + PANNELLO_GAP * (righe - 1);

    return (
        <div
            style={{
                ...stilePannello,
                left,
                top,
                width: larghezza,
                transform: `translate(-50%, -50%) scale(${aperto ? 1 : 0.85})`,
                opacity: aperto ? 1 : 0,
                pointerEvents: aperto ? 'auto' : 'none',
            }}
        >
            {voci.map((s) => (
                <button
                    key={s.label}
                    type="button"
                    onClick={() => onSeleziona(s.chiave)}
                    className="mb-bolla"
                    style={{ ...stileSubBolla, border: `5px solid ${s.bordo}`, cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                    <span className="mb-bg" />
                    <span className="mb-dome" />
                    <span className="mb-shine" />
                    <span
                        className="mb-label"
                        style={{
                            ...FONT_SUB_LABEL,
                            color: TESTO,
                            ...(s.fontSize ? { fontSize: s.fontSize, whiteSpace: 'nowrap' } : null),
                        }}
                    >
                        <s.icona className="mb-icona" size={24} strokeWidth={1.75} color={TESTO} />
                        {s.label}
                    </span>
                </button>
            ))}
        </div>
    );
}

export default function DashboardMobile() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [bandiAperto, setBandiAperto] = useState(false);
    const [documentiAperto, setDocumentiAperto] = useState(false);

    // Ogni voce del menu (Dashboard, Profilo, Team, Documenti, ecc.) si apre
    // "incorporata" sopra la ruota, che nel frattempo si rimpicciolisce e
    // scende, invece di navigare alla pagina vera e propria.
    const [pannelloAperto, setPannelloAperto] = useState<ChiavePannello | null>(null);
    const [caricando, setCaricando] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);
    const [dati, setDati] = useState<any>(null);

    // Transizione "vortice": il menu (wrapRef, l'intera ruota) ruota e si
    // rimpicciolisce fino a sparire; contenutoRef è il blocco che "boccia"
    // rotondo dal punto in cui è sparito. menuFinito/contenutoFinito tracciano
    // le due animazioni che corrono in sovrapposizione, cosi vortexBusy si
    // sblocca solo quando entrambe sono terminate.
    const contenutoRef = useRef<HTMLDivElement | null>(null);
    const menuFinito = useRef(true);
    const contenutoFinito = useRef(true);
    const [vortexBusy, setVortexBusy] = useState(false);

    // Logo di fondo: appare appena si clicca un bottone (mentre il menu
    // sparisce e le card devono ancora arrivare), resta dietro le card man
    // mano che compaiono, e si dissolve mezzo secondo dopo che i dati sono
    // pronti. Dinamico: parte piccolo e da subito si ingrandisce mentre
    // svanisce (un'unica animazione continua, non statico e poi ingrandito
    // solo alla fine) — logoCresciuto passa a true un frame dopo la comparsa,
    // cosi la transizione parte da uno stato piccolo osservabile.
    const [testoSfondoVisibile, setTestoSfondoVisibile] = useState(false);
    const [logoCresciuto, setLogoCresciuto] = useState(false);

    useEffect(() => {
        if (caricando || !testoSfondoVisibile) return;
        const timer = setTimeout(() => setTestoSfondoVisibile(false), 500);
        return () => clearTimeout(timer);
    }, [caricando, testoSfondoVisibile]);

    useEffect(() => {
        if (!testoSfondoVisibile) {
            setLogoCresciuto(false);
            return;
        }
        const raf = requestAnimationFrame(() => setLogoCresciuto(true));
        return () => cancelAnimationFrame(raf);
    }, [testoSfondoVisibile]);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const osserva = new ResizeObserver((entries) => {
            const larghezza = entries[0]?.contentRect.width ?? CANVAS_W;
            setScale(Math.min(1, larghezza / CANVAS_W));
        });
        osserva.observe(el);

        return () => osserva.disconnect();
    }, []);

    const apriBandi = () => {
        if (vortexBusy) return;
        setBandiAperto((v) => !v);
        setDocumentiAperto(false);
    };

    const apriDocumenti = () => {
        if (vortexBusy) return;
        setDocumentiAperto((v) => !v);
        setBandiAperto(false);
    };

    const caricaPannello = async (chiave: ChiavePannello, url: string) => {
        setCaricando(true);
        setErrore(null);
        try {
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setDati(json);
        } catch (e) {
            setErrore('Non è stato possibile caricare il contenuto. Riprova.');
        } finally {
            setCaricando(false);
        }
    };

    const apriPannello = (chiave: ChiavePannello) => {
        if (pannelloAperto === chiave) {
            setPannelloAperto(null);
            return;
        }

        setBandiAperto(false);
        setDocumentiAperto(false);
        setPannelloAperto(chiave);

        // "impostazioni" non richiede una fetch: i form usano le props
        // globali condivise di Inertia (auth.user), non un endpoint JSON.
        if (chiave === 'impostazioni') {
            setErrore(null);
            setCaricando(false);
            setDati({});
            return;
        }

        setDati(null);
        caricaPannello(chiave, PANNELLI[chiave].url);
    };

    // Ricarica il pannello aperto senza cambiarne lo stato aperto/chiuso: usata
    // dalle azioni interne (upload documenti, filtri, paginazione) che sulla
    // vera pagina userebbero router.reload/router.get, qui non disponibili dato
    // che non siamo su quella pagina ma sul menu incorporato.
    const ricaricaPannello = (urlOverride?: string) => {
        if (!pannelloAperto) return;
        caricaPannello(pannelloAperto, urlOverride ?? PANNELLI[pannelloAperto].url);
    };

    // Si sblocca solo quando SIA il menu SIA il contenuto hanno finito di
    // animarsi: le due animazioni corrono in sovrapposizione (il menu sparisce
    // mentre il contenuto sboccia), non in sequenza.
    const provaSbloccareVortice = () => {
        if (menuFinito.current && contenutoFinito.current) setVortexBusy(false);
    };

    // Punto (in px, relativo al box del blocco contenuto) in cui il menu
    // sparisce/ricompare: misurato a runtime cosi la pagina nasce/si richiude
    // esattamente li, anche se contenuto e menu vivono in punti diversi del
    // layout. Il left/top del blocco contenuto restano validi anche quando è
    // ancora "collassato" a altezza zero (non ancora aperto): solo l'altezza
    // finale non è nota in anticipo, per questo il raggio del cerchio usa un
    // valore di sicurezza abbastanza grande da coprire tutto lo schermo.
    const calcolaPuntoVortice = (): PuntoVortice | undefined => {
        const menuEl = wrapRef.current;
        const contenutoEl = contenutoRef.current;
        if (!menuEl || !contenutoEl) return undefined;
        const rMenu = menuEl.getBoundingClientRect();
        const rContenuto = contenutoEl.getBoundingClientRect();
        const puntoX = rMenu.left + rMenu.width * ORIGINE_RISUCCHIO_FRAZIONE.x;
        const puntoY = rMenu.top + rMenu.height * ORIGINE_RISUCCHIO_FRAZIONE.y;
        return { x: puntoX - rContenuto.left, y: puntoY - rContenuto.top };
    };

    // Al tap su un satellite: il menu che sparisce e il contenuto che sboccia
    // partono ESATTAMENTE insieme, con la stessa durata e la stessa curva —
    // cosi il loro progresso resta identico istante per istante (a metà
    // tempo il menu è a metà rimpicciolimento e il contenuto è a metà della
    // sua crescita, per costruzione) — e nascono/si richiudono nello stesso
    // punto fisico dello schermo. Il fetch dei dati reali (apriPannello)
    // parte in parallelo: il contenuto rivelato mostra intanto il loader già
    // esistente finché i dati non arrivano.
    const avviaAperturaVortice = (chiave: ChiavePannello) => {
        if (vortexBusy) return;

        if (pannelloAperto === chiave) {
            avviaChiusuraVortice();
            return;
        }

        if (prefersReducedMotion()) {
            apriPannello(chiave);
            return;
        }

        const punto = calcolaPuntoVortice();

        setVortexBusy(true);
        menuFinito.current = false;
        contenutoFinito.current = false;
        setTestoSfondoVisibile(true);
        apriPannello(chiave);

        if (wrapRef.current) {
            animaSparizioneMenu(wrapRef.current).then(() => {
                menuFinito.current = true;
                provaSbloccareVortice();
            });
        } else {
            menuFinito.current = true;
        }

        if (contenutoRef.current) {
            animaEmersioneContenuto(contenutoRef.current, { centro: punto }).then(() => {
                contenutoFinito.current = true;
                provaSbloccareVortice();
            });
        } else {
            contenutoFinito.current = true;
        }
    };

    // Percorso inverso: stessa logica, contenuto e menu partono insieme verso
    // lo stesso punto.
    const avviaChiusuraVortice = () => {
        if (vortexBusy) return;

        setTestoSfondoVisibile(false);

        if (prefersReducedMotion()) {
            setPannelloAperto(null);
            return;
        }

        const punto = calcolaPuntoVortice();

        setVortexBusy(true);
        menuFinito.current = false;
        contenutoFinito.current = false;

        if (contenutoRef.current) {
            animaRisucchioContenuto(contenutoRef.current, { centro: punto }).then(() => {
                contenutoFinito.current = true;
                provaSbloccareVortice();
            });
        } else {
            contenutoFinito.current = true;
        }

        setPannelloAperto(null);

        if (wrapRef.current) {
            animaComparsaMenu(wrapRef.current).then(() => {
                menuFinito.current = true;
                provaSbloccareVortice();
            });
        } else {
            menuFinito.current = true;
        }
    };

    const dashboardAperta = pannelloAperto !== null;

    // Contenuto del pannello incorporato: stessa UI della pagina vera e propria
    // (componente "Contenuto" condiviso), con eventuali callback che sostituiscono
    // router.get/reload perché qui non siamo sulla pagina reale.
    const renderPannello = () => {
        if (!dati) return null;
        switch (pannelloAperto) {
            case 'dashboard':
                return <DashboardContenuto dashboard={dati.dashboard} profilo={dati.profilo} compatto />;
            case 'profilo':
                return <ProfiloContenuto profilo={dati.profilo} compatto />;
            case 'team':
                return <GestioneTeamContenuto membri={dati.membri} inviti={dati.inviti} puoInvitare={dati.puoInvitare} />;
            case 'documenti':
                return <CassettoDocumentiContenuto bandi={dati.bandi} onRicarica={() => ricaricaPannello()} />;
            case 'rendicontazione':
                return <RendicontazioneContenuto progetti={dati.progetti} compatto />;
            case 'lista-bandi':
                return (
                    <ListaBandiContenuto
                        bandi={dati.bandi}
                        stats={dati.stats}
                        categorie={dati.categorie}
                        regioni={dati.regioni}
                        filtri={dati.filtri}
                        compatto
                        onFiltra={(params) => {
                            const qs = new URLSearchParams(
                                Object.entries(params).reduce((acc, [k, v]) => {
                                    if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
                                    return acc;
                                }, {} as Record<string, string>)
                            );
                            qs.set('embed', '1');
                            ricaricaPannello(`/ente/lista-bandi?${qs.toString()}`);
                        }}
                    />
                );
            case 'ricerca':
                return <RicercaContenuto profilo={dati.profilo} compatto />;
            case 'bandi-salvati':
                return (
                    <BandiSalvatiContenuto
                        preferiti={dati.preferiti}
                        onPagina={(url) => ricaricaPannello(url + (url.includes('?') ? '&' : '?') + 'embed=1')}
                    />
                );
            case 'storico-bandi':
                return <StoricoBandiContenuto stats={dati.stats} bandiVinti={dati.bandiVinti} bandiPersi={dati.bandiPersi} compatto />;
            case 'impostazioni':
                return <ImpostazioniContenuto compatto />;
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                // Crea un contesto di stacking locale: senza questo, lo
                // zIndex:-1 dei livelli di sfondo qui sotto viene confrontato
                // con l'intera pagina, e il colore di sfondo pieno di QUESTO
                // stesso div (non essendo lui stesso "positioned") finisce
                // comunque sopra — l'immagine risultava disegnata ma coperta.
                isolation: 'isolate',
                ...SFONDO_PROFONDITA,
            }}
        >
            {/* Stessa immagine di sfondo di Welcome/Login, stessa opacita' — fixed
                cosi resta ferma dietro a tutto anche mentre il contenuto scorre.
                zIndex:-1 esplicito: essendo "position:fixed" (un elemento
                posizionato) altrimenti finirebbe comunque sopra al contenuto
                statico sottostante (titoli, testi) per le regole di stacking
                CSS, anche stando prima nel DOM — non basta l'ordine markup. */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    backgroundImage: "url('/images/sfondo-menu.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.35), rgba(0,0,0,.65))',
                    pointerEvents: 'none',
                }}
            />

            {/* Logo di fondo, centrato sullo schermo (fixed, non legato all'altezza
                variabile del pannello): primo elemento nel DOM, senza z-index, cosi
                resta dietro a tutto il resto per semplice ordine di disegno
                (nessuna guerra di z-index con header/bolle). */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    // Non appena compare parte già piccolo e a piena opacità; un
                    // frame dopo (logoCresciuto) inizia un'unica crescita lenta e
                    // continua verso grande+trasparente — durata lunga apposta:
                    // se i dati arrivano prima che finisca (il caso normale), la
                    // sparizione vera e propria (sotto, testoSfondoVisibile=false)
                    // la interrompe/taglia subito, cosi il logo resta visibile
                    // per tutto il tempo di caricamento invece di sparire da solo
                    // troppo presto e lasciare un vuoto prima che arrivino le card.
                    opacity: !testoSfondoVisibile ? 0 : logoCresciuto ? 0 : 0.55,
                    transition: testoSfondoVisibile && logoCresciuto ? 'opacity 3.5s ease' : 'opacity 0s',
                }}
            >
                <img
                    src="/images/logo-deepbandi-chiaro.png"
                    alt=""
                    style={{
                        height: 'min(290px, 27vh)',
                        width: 'auto',
                        // Parte un po' più piccolo (0.8x) e cresce di +100px
                        // rispetto alla base (1.4x = 350px) in un'unica corsa lenta.
                        transform: logoCresciuto ? 'scale(1.4)' : 'scale(0.8)',
                        transition: testoSfondoVisibile && logoCresciuto ? 'transform 3.5s ease' : 'transform 0s',
                        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))',
                    }}
                />
            </div>

            {/* Barra fissa in alto: resta visibile durante lo scroll del contenuto
                sottostante (position:fixed, non sticky, per non dipendere dagli
                overflow:hidden usati per l'animazione di apertura/chiusura). */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    opacity: dashboardAperta ? 1 : 0,
                    pointerEvents: dashboardAperta ? 'auto' : 'none',
                    transition: 'opacity .3s ease',
                    background: 'rgba(14,19,24,.85)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,.08)',
                }}
            >
                <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 16px' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 15, letterSpacing: '.06em' }}>
                        {pannelloAperto ? PANNELLI[pannelloAperto].titolo : ''}
                    </span>
                    <img
                        src="/images/logo-deepbandi-chiaro.png"
                        alt="DeepBandi"
                        style={{ height: 75, width: 'auto', justifySelf: 'center', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }}
                    />
                    <button
                        type="button"
                        onClick={avviaChiusuraVortice}
                        aria-label="Torna al menu"
                        style={{
                            justifySelf: 'end',
                            background: 'rgba(255,255,255,.08)',
                            border: '1px solid rgba(255,255,255,.16)',
                            borderRadius: 999,
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Menu size={26} color={TESTO} />
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto' }}>

            {/* Logo fuori dalla tela: a ruota piena resta in cima qui; quando la
                Dashboard è aperta si sposta invece nella barra fissa in alto
                (vedi sopra), cosi questo blocco collassa a spazio zero. */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: dashboardAperta ? 0 : '8px 0 0',
                    height: dashboardAperta ? 0 : undefined,
                    overflow: 'hidden',
                    transition: 'padding-top .3s ease, height .3s ease',
                }}
            >
                {!dashboardAperta && (
                    <img
                        src="/images/logo-deepbandi-chiaro.png"
                        alt="DeepBandi"
                        className="mb-float-logo2"
                        style={{ height: 160, width: 'auto', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }}
                    />
                )}
            </div>

            <div
                style={{
                    display: 'grid',
                    // Resta espansa per tutta la durata della transizione (non solo
                    // quando il pannello è "ufficialmente" aperto), altrimenti la
                    // riga si schiaccerebbe a metà dell'animazione di comparsa —
                    // niente transition qui: la crescita visiva la fa già
                    // l'animazione JS su contenutoRef (scale/opacity/clip-path).
                    gridTemplateRows: dashboardAperta || vortexBusy ? '1fr' : '0fr',
                    marginTop: 70,
                }}
            >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    {/* opacity/transform/clip-path qui sono gestiti imperativamente da
                        animaEmersioneContenuto/animaRisucchioContenuto (fase 3 del
                        vortice): niente transizione/valori dichiarativi React, altrimenti
                        ogni re-render (es. quando arrivano i dati) sovrascriverebbe i
                        frame dell'animazione in corso. */}
                    <div
                        ref={contenutoRef}
                        style={{ padding: '10px 16px 18px' }}
                    >
                        {errore && !caricando && (
                            <p style={{ color: '#F0A0A0', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>{errore}</p>
                        )}
                        {!caricando && !errore && renderPannello()}
                    </div>
                </div>
            </div>

            <div
                ref={wrapRef}
                className={vortexBusy ? 'mb-vortex-transizione' : undefined}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: dashboardAperta ? CANVAS_W * 0.5 : CANVAS_W,
                    height: CANVAS_H * scale,
                    margin: '0 auto',
                    marginTop: dashboardAperta ? 0 : -100,
                    borderRadius: 12,
                    overflow: 'hidden',
                    // Durante il vortice la transizione va disattivata: max-width
                    // e' osservato da un ResizeObserver che riscala il contenuto
                    // interno via stato React, un sistema indipendente e non
                    // perfettamente sincronizzato con l'animazione JS del
                    // vortice — le due animazioni in parallelo sulla stessa
                    // dimensione producevano un piccolo scatto residuo
                    // nell'ultimo fotogramma. Fuori dal vortice resta comunque
                    // morbida (es. resize della finestra).
                    transition: vortexBusy ? 'none' : 'max-width .3s cubic-bezier(.4,0,.2,1), margin-top .3s cubic-bezier(.4,0,.2,1)',
                }}
            >
            <div
                style={{
                    position: 'absolute',
                    top: -80,
                    left: 0,
                    width: CANVAS_W,
                    height: CANVAS_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}
        >
            <style>{CSS}</style>

            <div className="mb-luce-bandi" aria-hidden="true" />

            {BOLLE.map((b) => (
                <div
                    key={`tail-${b.label}`}
                    style={{
                        ...stileTail,
                        width: b.tailSize ?? 48,
                        height: b.tailSize ?? 48,
                        left: b.tailLeft,
                        top: b.tailTop,
                        background: b.tail,
                        transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
                    }}
                />
            ))}

            {BOLLE.map((b) => (
                <div
                    key={`ombra-${b.label}`}
                    style={{
                        ...stileOmbra(b.size ?? 152),
                        left: b.left,
                        top: b.top + (b.size ?? 152) * 0.16,
                    }}
                />
            ))}
            <div
                style={{
                    ...stileOmbra(212),
                    background: 'rgba(255,255,255,.025)',
                    left: 320,
                    top: 490 + RING_Y + 212 * 0.16,
                }}
            />

            {BOLLE.map((b, indice) => {
                const size = b.size ?? 152;
                const isDocumenti = b.label === 'DOCUMENTI';
                // DASHBOARD, PROFILO e TEAM aprono direttamente il proprio pannello
                // incorporato (nessun sottomenu, a differenza di DOCUMENTI/BANDI).
                const chiaveEmbed: ChiavePannello | null =
                    b.label === 'DASHBOARD' ? 'dashboard' :
                    b.label === 'PROFILO' ? 'profilo' :
                    b.label === 'TEAM' ? 'team' :
                    b.label === 'IMPOSTAZIONI' ? 'impostazioni' :
                    null;
                const conFreccia = isDocumenti;
                const freccaAperta = documentiAperto;
                const contenuto = (
                    <>
                        <span className="mb-bg" />
                        <span className="mb-dome" />
                        <span className="mb-shine" />
                        <span className="mb-label" style={{ ...FONT_LABEL, color: TESTO, fontSize: FONT_LABEL_SIZE * (size / 152) }}>
                            <b.icona className="mb-icona" size={24} strokeWidth={1.75} color={TESTO} />
                            {b.label}
                            {conFreccia && (
                                <ChevronDown
                                    size={14}
                                    className="mb-icona"
                                    color={TESTO}
                                    style={{
                                        transform: freccaAperta ? 'rotate(180deg)' : 'none',
                                        transition: 'transform .3s ease',
                                        marginTop: -2,
                                    }}
                                />
                            )}
                        </span>
                    </>
                );

                if (isDocumenti) {
                    return (
                        <button
                            key={b.label}
                            type="button"
                            onClick={apriDocumenti}
                            aria-expanded={documentiAperto}
                            className="mb-bolla mb-float"
                            style={{
                                ...stileBolla,
                                width: size,
                                height: size,
                                left: b.left,
                                top: b.top,
                                border: `9px solid ${b.bordo}`,
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                ...animazioneGalleggiamento(indice),
                            }}
                        >
                            {contenuto}
                        </button>
                    );
                }

                if (chiaveEmbed) {
                    return (
                        <button
                            key={b.label}
                            type="button"
                            onClick={() => avviaAperturaVortice(chiaveEmbed)}
                            aria-expanded={pannelloAperto === chiaveEmbed}
                            className="mb-bolla mb-float"
                            style={{
                                ...stileBolla,
                                width: size,
                                height: size,
                                left: b.left,
                                top: b.top,
                                border: `9px solid ${b.bordo}`,
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                ...animazioneGalleggiamento(indice),
                            }}
                        >
                            {contenuto}
                        </button>
                    );
                }

                return (
                    <Link
                        key={b.label}
                        href={b.href}
                        // /logout accetta solo POST: un <Link> senza method farebbe una
                        // GET e il server risponderebbe 405 MethodNotAllowedHttpException.
                        method={b.label === 'LOGOUT' ? 'post' : 'get'}
                        as={b.label === 'LOGOUT' ? 'button' : undefined}
                        className="mb-bolla mb-float"
                        style={{
                            ...stileBolla,
                            width: size,
                            height: size,
                            left: b.left,
                            top: b.top,
                            border: `${size < 152 ? 8 : 9}px solid ${b.bordo}`,
                            cursor: b.label === 'LOGOUT' ? 'pointer' : undefined,
                            font: b.label === 'LOGOUT' ? 'inherit' : undefined,
                            padding: b.label === 'LOGOUT' ? 0 : undefined,
                            ...animazioneGalleggiamento(indice),
                        }}
                    >
                        {contenuto}
                    </Link>
                );
            })}

            <button
                type="button"
                onClick={apriBandi}
                aria-expanded={bandiAperto}
                className="mb-bolla mb-bandi mb-float"
                style={{
                    position: 'absolute',
                    left: 320,
                    top: 490 + RING_Y,
                    transform: 'translate(-50%, -50%)',
                    width: 212,
                    height: 212,
                    borderRadius: '50%',
                    border: '10px solid rgba(221,226,230,.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3,
                    textDecoration: 'none',
                    background: 'linear-gradient(145deg,#3A434D,#292F38 50%,#1A1F26)',
                    boxShadow:
                        '0 24px 46px rgba(0,0,0,.6), inset 0 3px 4px rgba(255,255,255,.22), inset 0 -8px 16px rgba(0,0,0,.45)',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                    ...animazioneGalleggiamento(6),
                }}
            >
                <span className="mb-bg" />
                <span className="mb-dome" />
                <span className="mb-shine" />
                <span className="mb-label" style={{ ...FONT_LABEL, fontSize: 24, color: '#FFFFFF' }}>
                    <Landmark className="mb-icona" size={34} strokeWidth={1.75} color="#FFFFFF" />
                    BANDI
                    <ChevronDown
                        size={18}
                        className="mb-icona"
                        color="#FFFFFF"
                        style={{
                            transform: bandiAperto ? 'rotate(180deg)' : 'none',
                            transition: 'transform .3s ease',
                            marginTop: -4,
                        }}
                    />
                </span>
            </button>

            <PannelloSotto
                voci={BANDI_SUB}
                left={320}
                top={490 + RING_Y}
                colonne={2}
                aperto={bandiAperto}
                onSeleziona={avviaAperturaVortice}
            />
            <PannelloSotto
                voci={DOCUMENTI_SUB}
                left={508}
                top={374 + RING_Y}
                colonne={1}
                aperto={documentiAperto}
                onSeleziona={avviaAperturaVortice}
            />
            </div>
            </div>
            </div>
        </div>
    );
}
