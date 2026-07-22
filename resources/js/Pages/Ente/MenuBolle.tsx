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
    type LucideIcon,
} from 'lucide-react';

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
};

type SubVoce = {
    label: string;
    href: string;
    bordo: string;
    icona: LucideIcon;
};

// Sottomenu BANDI: tonalità fredde (blu-violetto-rosa) per distinguersi dalla
// scala arancio-verde delle bolle principali, dato che BANDI ha bordo neutro.
const BANDI_SUB: SubVoce[] = [
    { label: 'LISTA BANDI', href: '/ente/lista-bandi', bordo: '#8FA3C7', icona: ListChecks },
    { label: 'RICERCA', href: '/ente/ricerca', bordo: '#9C93C7', icona: Search },
    { label: 'BANDI SALVATI', href: '/bandi-salvati', bordo: '#B08FC0', icona: Bookmark },
    { label: 'STORICO BANDI', href: '/ente/storico-bandi', bordo: '#C08FA8', icona: Archive },
];

// Sottomenu DOCUMENTI: due verdi ravvicinati alla bolla madre (#84AC80).
const DOCUMENTI_SUB: SubVoce[] = [
    { label: 'DOCUMENTAZIONE', href: '/cassetto-documenti', bordo: '#7CB08A', icona: FolderOpen },
    { label: 'RENDICONTAZIONE', href: '/ente/rendicontazione', bordo: '#6FA5A0', icona: ClipboardCheck },
];

// Scala di 6 colori derivata da arancio (#F0913A) e verde (#3FCF97): tonalità
// ravvicinate e desaturate cosi il bordo resta poco vistoso ma ogni bottone
// resta riconoscibile dagli altri.
const BOLLE: Bolla[] = [
    {
        label: 'DASHBOARD',
        href: '/ente/dashboard',
        left: 320,
        top: 237,
        tailLeft: 320,
        tailTop: 313,
        rot: 45,
        bordo: '#CE8A52',
        tail: 'linear-gradient(145deg,#DFA774,#AD6E38)',
        icona: LayoutDashboard,
    },
    {
        label: 'PROFILO',
        href: '/ente/profilo',
        left: 131,
        top: 374,
        tailLeft: 196,
        tailTop: 414,
        rot: 76.5,
        bordo: '#C0975F',
        tail: 'linear-gradient(145deg,#D3B27F,#9C7846)',
        icona: User,
    },
    {
        label: 'TEAM',
        href: '/ente/team',
        left: 131,
        top: 624,
        tailLeft: 193,
        tailTop: 580,
        rot: 9.7,
        bordo: '#AFA36C',
        tail: 'linear-gradient(145deg,#C4BB89,#8A804E)',
        icona: Users,
    },
    {
        label: 'DOCUMENTI',
        href: '/cassetto-documenti',
        left: 508,
        top: 374,
        tailLeft: 443,
        tailTop: 414,
        rot: 193.3,
        bordo: '#84AC80',
        tail: 'linear-gradient(145deg,#A0C79C,#5F8A5C)',
        icona: FileText,
    },
    {
        label: 'IMPOSTAZIONI',
        href: '/settings',
        left: 508,
        top: 624,
        tailLeft: 446,
        tailTop: 580,
        rot: -99.5,
        bordo: '#66AB93',
        tail: 'linear-gradient(145deg,#85C7AE,#428069)',
        icona: Settings,
    },
    {
        label: 'LOGOUT',
        href: '/logout',
        left: 320,
        top: 761,
        tailLeft: 320,
        tailTop: 685,
        rot: 45,
        bordo: '#4FA39B',
        tail: 'linear-gradient(145deg,#70C0B8,#2F7F78)',
        icona: LogOut,
        size: 130,
    },
];

const TESTO = '#E7EAED';
const FONT_LABEL: React.CSSProperties = {
    fontSize: 14,
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
const SUB_SIZE = 92;
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
    fontSize: 9.5,
    letterSpacing: '.01em',
    fontWeight: 500,
    whiteSpace: 'normal',
    textAlign: 'center',
    lineHeight: 1.15,
    maxWidth: 68,
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

// Sfondo scuro con luce soffusa (invece del quadrettato) per dare profondità.
const SFONDO_PROFONDITA: React.CSSProperties = {
    backgroundColor: '#0E1318',
    backgroundImage:
        'radial-gradient(ellipse 900px 520px at 50% -8%, rgba(255,255,255,.07), transparent 60%),' +
        'radial-gradient(ellipse 700px 480px at 50% 108%, rgba(0,0,0,.4), transparent 62%)',
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
`;

const CANVAS_W = 640;
const CANVAS_H = 880;

function PannelloSotto({
    voci,
    left,
    top,
    colonne,
    aperto,
}: {
    voci: SubVoce[];
    left: number;
    top: number;
    colonne: number;
    aperto: boolean;
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
                <Link key={s.label} href={s.href} className="mb-bolla" style={{ ...stileSubBolla, border: `5px solid ${s.bordo}` }}>
                    <span className="mb-bg" />
                    <span className="mb-dome" />
                    <span className="mb-shine" />
                    <span className="mb-label" style={{ ...FONT_SUB_LABEL, color: TESTO }}>
                        <s.icona className="mb-icona" size={16} strokeWidth={1.75} color={TESTO} />
                        {s.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export default function MenuBolle() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [bandiAperto, setBandiAperto] = useState(false);
    const [documentiAperto, setDocumentiAperto] = useState(false);

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
        setBandiAperto((v) => !v);
        setDocumentiAperto(false);
    };

    const apriDocumenti = () => {
        setDocumentiAperto((v) => !v);
        setBandiAperto(false);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                ...SFONDO_PROFONDITA,
            }}
        >
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div
                ref={wrapRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: CANVAS_W,
                    height: CANVAS_H * scale,
                    margin: '0 auto',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}
            >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: CANVAS_W,
                    height: CANVAS_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    borderRadius: 12,
                    overflow: 'hidden',
                    ...SFONDO_PROFONDITA,
                }}
        >
            <style>{CSS}</style>

            <svg
                viewBox="0 0 640 880"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                aria-hidden="true"
            >
                <line x1="320" y1="384" x2="320" y2="346" stroke="#3A454F" strokeWidth="1.5" />
                <line x1="320" y1="596" x2="320" y2="653" stroke="#3A454F" strokeWidth="1.5" />
            </svg>

            {BOLLE.map((b) => (
                <div
                    key={`tail-${b.label}`}
                    style={{
                        ...stileTail,
                        left: b.tailLeft,
                        top: b.tailTop,
                        background: b.tail,
                        transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
                    }}
                />
            ))}

            {BOLLE.map((b) => {
                const size = b.size ?? 152;
                const isDocumenti = b.label === 'DOCUMENTI';
                const contenuto = (
                    <>
                        <span className="mb-bg" />
                        <span className="mb-dome" />
                        <span className="mb-shine" />
                        <span className="mb-label" style={{ ...FONT_LABEL, color: TESTO }}>
                            <b.icona className="mb-icona" size={24} strokeWidth={1.75} color={TESTO} />
                            {b.label}
                            {isDocumenti && (
                                <ChevronDown
                                    size={14}
                                    className="mb-icona"
                                    color={TESTO}
                                    style={{
                                        transform: documentiAperto ? 'rotate(180deg)' : 'none',
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
                            className="mb-bolla"
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
                        className="mb-bolla"
                        style={{
                            ...stileBolla,
                            width: size,
                            height: size,
                            left: b.left,
                            top: b.top,
                            border: `${size < 152 ? 8 : 9}px solid ${b.bordo}`,
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
                className="mb-bolla mb-bandi"
                style={{
                    position: 'absolute',
                    left: 320,
                    top: 490,
                    transform: 'translate(-50%, -50%)',
                    width: 212,
                    height: 212,
                    borderRadius: '50%',
                    border: '10px solid #DDE2E6',
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

            <PannelloSotto voci={BANDI_SUB} left={320} top={490} colonne={2} aperto={bandiAperto} />
            <PannelloSotto voci={DOCUMENTI_SUB} left={508} top={374} colonne={2} aperto={documentiAperto} />
            </div>
            </div>
            </div>
        </div>
    );
}
