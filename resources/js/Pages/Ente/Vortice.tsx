import { animate } from 'framer-motion';

// ─── Transizione "vortice" per il menu a bolle mobile ──────────────────────
//
// Il menu (la ruota intera, come un'unica unità) ruota e si rimpicciolisce
// fino a sparire in un punto preciso dello schermo. La pagina di destinazione
// nasce ESATTAMENTE in quel punto (stesso centro, in pixel, misurato a runtime
// con getBoundingClientRect — non un generico "centro di se stessa") e cresce
// fino a riempire lo schermo. Le due animazioni condividono la stessa durata
// e la stessa curva di easing, cosi il loro progresso "t" è identico istante
// per istante: a metà tempo il menu è esattamente a metà rimpicciolimento E
// la pagina è esattamente a metà della sua crescita, per costruzione (non
// solo controllato a occhio a t=0.5). Al ritorno, l'inverso.
//
// Solo transform e opacity vengono animati (composited, GPU), eccetto il
// clip-path della pagina (reveal circolare "a iride" dal punto di origine —
// una scala da sola darebbe un rettangolo che cresce, non un cerchio che si
// apre da un punto preciso).

// Frazione del box del menu verso cui collassa (più in alto del centro):
// usata sia per il transform-origin del menu sia, dal chiamante, per
// calcolare in pixel lo stesso punto sullo schermo da passare al contenuto.
export const ORIGINE_RISUCCHIO_FRAZIONE = { x: 0.5, y: 0.28 };
const ORIGINE_RISUCCHIO = `${ORIGINE_RISUCCHIO_FRAZIONE.x * 100}% ${ORIGINE_RISUCCHIO_FRAZIONE.y * 100}%`;

const EASE_APERTURA: [number, number, number, number] = [0.45, 0, 0.2, 1]; // ease morbido, niente overshoot: mantiene menu e contenuto sincronizzati
// Stessa famiglia di curva dell'apertura (decelerazione morbida, niente
// rimbalzo/overshoot): un ease "backOut" su una rotazione così ampia in poco
// tempo dava l'impressione di uno scatto invece che di un movimento continuo.
const EASE_CHIUSURA: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GIRI_MENU = 130;

export const DURATA_APERTURA = 0.9;
export const DURATA_CHIUSURA = 0.9;

export interface PuntoVortice {
    x: number;
    y: number;
}

interface OpzioniFase {
    durata?: number;
}

interface OpzioniContenuto extends OpzioniFase {
    // Punto (in px, relativo al box dell'elemento) da cui la pagina nasce/si
    // richiude: deve coincidere con dove il menu è sparito/ricompare.
    centro?: PuntoVortice;
}

// Raggio di sicurezza per il clip-path: abbastanza grande da coprire tutto lo
// schermo indipendentemente da dove sta il punto di origine e da quanto è
// alto il contenuto (che al momento della misura potrebbe non essere ancora
// stato calcolato dal layout).
function raggioMassimoSchermo(): number {
    if (typeof window === 'undefined') return 2000;
    return Math.hypot(window.innerWidth, window.innerHeight);
}

// Il menu intero (la ruota) gira e si rimpicciolisce fino a sparire, come
// risucchiato nel punto ORIGINE_RISUCCHIO; la trasparenza cresce per tutta la
// durata (non solo nell'ultimo tratto), per una dissolvenza morbida.
export function animaSparizioneMenu(elemento: HTMLElement, { durata = DURATA_APERTURA }: OpzioniFase = {}): Promise<unknown> {
    elemento.style.transformOrigin = ORIGINE_RISUCCHIO;
    elemento.style.willChange = 'transform, opacity';
    return animate(0, 1, {
        duration: durata,
        ease: EASE_APERTURA,
        onUpdate(t) {
            elemento.style.transform = `rotate(${GIRI_MENU * t}deg) scale(${1 - t})`;
            elemento.style.opacity = String(1 - t);
        },
    }).then(() => {
        elemento.style.willChange = 'auto';
    });
}

// Percorso inverso: il menu riemerge dallo stesso punto, girando, fino alla
// forma e dimensione originali.
export function animaComparsaMenu(elemento: HTMLElement, { durata = DURATA_CHIUSURA }: OpzioniFase = {}): Promise<unknown> {
    elemento.style.transformOrigin = ORIGINE_RISUCCHIO;
    elemento.style.willChange = 'transform, opacity';
    return animate(0, 1, {
        duration: durata,
        ease: EASE_CHIUSURA,
        onUpdate(t) {
            elemento.style.transform = `rotate(${GIRI_MENU * (1 - t)}deg) scale(${t})`;
            elemento.style.opacity = String(t);
        },
    }).then(() => {
        elemento.style.willChange = 'auto';
        elemento.style.transform = '';
        elemento.style.opacity = '1';
        elemento.style.transformOrigin = '';
    });
}

// La pagina di destinazione nasce piccola e in trasparenza ESATTAMENTE nel
// punto in cui il menu sta sparendo (centro, in px) e cresce fino a coprire
// lo schermo. Stessa durata/curva di animaSparizioneMenu: il progresso delle
// due animazioni resta identico istante per istante.
export function animaEmersioneContenuto(elemento: HTMLElement, { durata = DURATA_APERTURA, centro }: OpzioniContenuto = {}): Promise<unknown> {
    const raggioMax = raggioMassimoSchermo();
    if (centro) elemento.style.transformOrigin = `${centro.x}px ${centro.y}px`;
    elemento.style.willChange = 'transform, opacity, clip-path';
    return animate(0, 1, {
        duration: durata,
        ease: EASE_APERTURA,
        onUpdate(t) {
            elemento.style.transform = `scale(${t})`;
            elemento.style.clipPath = centro
                ? `circle(${t * raggioMax}px at ${centro.x}px ${centro.y}px)`
                : `circle(${t * 150}% at 50% 52%)`;
            elemento.style.opacity = String(t);
        },
    }).then(() => {
        elemento.style.willChange = 'auto';
        elemento.style.transform = '';
        elemento.style.clipPath = '';
    });
}

// Percorso inverso: la pagina si richiude verso lo stesso punto da cui era
// nata (dove il menu sta per ricomparire).
export function animaRisucchioContenuto(elemento: HTMLElement, { durata = DURATA_CHIUSURA, centro }: OpzioniContenuto = {}): Promise<unknown> {
    const raggioMax = raggioMassimoSchermo();
    if (centro) elemento.style.transformOrigin = `${centro.x}px ${centro.y}px`;
    elemento.style.willChange = 'transform, opacity, clip-path';
    return animate(1, 0, {
        duration: durata,
        ease: EASE_CHIUSURA,
        onUpdate(t) {
            const s = Math.max(0, t);
            elemento.style.transform = `scale(${s})`;
            elemento.style.clipPath = centro
                ? `circle(${s * raggioMax}px at ${centro.x}px ${centro.y}px)`
                : `circle(${s * 150}% at 50% 52%)`;
            elemento.style.opacity = String(Math.min(1, s));
        },
    }).then(() => {
        elemento.style.willChange = 'auto';
        elemento.style.transform = '';
        elemento.style.clipPath = '';
    });
}

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
