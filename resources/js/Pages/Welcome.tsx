import { useState, useEffect, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

const CSS_TITOLO = `
/* Stesso galleggiamento impercettibile del logo nel menu mobile (mb-float-logo2). */
@keyframes lp-float-logo {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
}
.lp-float-logo {
    animation: lp-float-logo 4.2s ease-in-out infinite;
    animation-delay: .6s;
}
@media (prefers-reduced-motion: reduce) {
    .lp-float-logo { animation: none; }
}

/* Testo leggibile "vero" (colore pieno, sempre visibile) — sopra ci passa lo
   sweep lucido come livello separato: se il gradiente stesse sulla stessa
   scritta suddivisa in <span> per lettera, il colore trasparente verrebbe
   ereditato dai figli e la scritta sparirebbe del tutto. */
.lp-titolo-base {
    color: #E7F3ED;
}

/* Contenitore del livello riflesso: sovrapposto esattamente al testo vero. */
.lp-shimmer-layer {
    position: absolute;
    inset: 0;
}

/* Riflesso animato sulle lettere: gradiente lucido che scorre in loop, con
   clip sul testo — applicato per-parola (non sull'intero contenitore, altrimenti
   il colore trasparente si perderebbe sui figli, vedi sopra). */
.lp-shimmer {
    background: linear-gradient(100deg, transparent 38%, rgba(255,255,255,.95) 50%, transparent 62%);
    background-size: 250% auto;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: lp-sweep 4.5s ease-in-out infinite;
}
@keyframes lp-sweep {
    0%   { background-position: 200% center; }
    60%  { background-position: -40% center; }
    100% { background-position: -40% center; }
}

/* Ogni lettera del titolo compare da sola, con un ritardo casuale (assegnato
   in JS via animationDelay) cosi la comparsa complessiva dura ~3s mescolata
   invece che una dissolvenza unica su tutta la scritta. */
.lp-lettera {
    display: inline-block;
    opacity: 0;
    animation: lp-lettera-in .6s ease forwards;
}
@keyframes lp-lettera-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
    .lp-shimmer { animation: none; opacity: 0; }
    .lp-lettera { animation: none; opacity: 1; }
}
`;

// "Deep" verde, "Bandi" in corsivo — stessa lista usata sia per il livello di
// testo leggibile sia per il livello del riflesso, cosi restano allineati.
const PAROLE = [
    { testo: 'Deep', className: 'text-[#7CB08A]' },
    { testo: 'Bandi', className: 'italic' },
];

export default function Welcome({ canLogin, canRegister }: any) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Ogni lettera del titolo parte con un ritardo casuale (0-2.4s, animazione
    // .6s) cosi l'intera comparsa si esaurisce entro ~3s ma in ordine sparso
    // invece che da sinistra a destra. Calcolato una sola volta al mount.
    const ritardiLettere = useMemo(
        () => PAROLE.flatMap((p) => p.testo.split('')).map(() => Math.random() * 2.4),
        []
    );
    let indiceLettera = 0;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#05070a]">
            <style>{CSS_TITOLO}</style>

            {/* Immagine di sfondo su un livello separato, cosi la sua opacita'
                non tocca il contenuto sopra. */}
            <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: "url('/images/sfondo-landing.png')", opacity: 0.5 }}
            />

            {/* Velo scuro sopra l'immagine, per garantire contrasto al testo. */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />

            <div className="relative z-10">
                {/* Navbar — solo logo, centrato */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
                    <img
                        src="/images/logo-deepbandi-chiaro.png"
                        alt="DeepBandi"
                        className="lp-float-logo h-[138px] w-auto"
                        style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }}
                    />
                </nav>

                {/* Hero: titolo animato, sottotitolo, bottoni centrati sotto */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-24 text-center">
                    <div className="relative inline-block">
                        <h1 className="lp-titolo-base text-6xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tight">
                            {PAROLE.map((parola, pi) => (
                                <span key={pi} className={parola.className}>
                                    {parola.testo.split('').map((ch, li) => {
                                        const ritardo = ritardiLettere[indiceLettera++];
                                        return (
                                            <span key={li} className="lp-lettera" style={{ animationDelay: `${ritardo}s` }}>
                                                {ch}
                                            </span>
                                        );
                                    })}
                                </span>
                            ))}
                        </h1>
                        <div aria-hidden="true" className="lp-shimmer-layer select-none">
                            {PAROLE.map((parola, pi) => (
                                <span
                                    key={pi}
                                    className={`lp-shimmer ${parola.className} text-6xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tight`}
                                >
                                    {parola.testo}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className={`text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mt-8 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        Cerca il bando, analizza i requisiti, gestisci i documenti
                    </p>

                    {canLogin && (
                        <div className={`flex flex-row gap-3 sm:gap-4 justify-center mt-10 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            {canRegister && (
                                <Link href="/register" className="border border-slate-600 hover:border-[#66AB93]/50 text-slate-300 hover:text-white px-5 sm:px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 justify-center">
                                    Registrati
                                </Link>
                            )}
                            <Link href="/login" className="bg-gradient-to-r from-[#4FA39B] to-[#66AB93] hover:from-[#66AB93] hover:to-[#7CB08A] text-white px-5 sm:px-8 py-3 rounded-xl font-medium transition shadow-xl shadow-[#66AB93]/20 flex items-center gap-2 justify-center">
                                Accedi <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
