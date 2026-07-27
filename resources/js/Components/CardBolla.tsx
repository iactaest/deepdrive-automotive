import { type ReactNode } from 'react';

// Stessa scala di colori desaturati usata nel menu mobile e nella dashboard:
// riusata per dare a ogni card un bordo diverso ma coerente con il resto
// dell'app. Ciclare su questo array per assegnare colori via indice.
export const PALETTE_BOLLA = [
    '#7CB08A', // verde
    '#8FA3C7', // blu
    '#C0975F', // ambra
    '#9C93C7', // viola
    '#66AB93', // smeraldo
    '#4FA39B', // teal
    '#B08FC0', // lavanda
    '#C08FA8', // rosa
    '#AFA36C', // oliva
    '#84AC80', // verde salvia
];

// Card riutilizzabile nello stesso stile "bolla" del menu mobile e della
// dashboard: pattern in trasparenza, sfondo con gradiente 3D, bordo colorato,
// icone in rilievo (classe "card-bolla-icona" da applicare alle icone dentro
// children). Il CSS condiviso è definito globalmente in resources/css/app.css.
//
// Ogni card compare con un piccolo fade-in dall'alto (vedi .card-bolla-entrata
// in app.css): passando "indice" (la posizione nella lista/griglia) le card
// appaiono una dopo l'altra dall'alto verso il basso invece che tutte insieme,
// utile soprattutto nel pannello incorporato del menu mobile dove altrimenti
// si vedrebbe un blocco vuoto finché non è pronto tutto insieme.
export default function CardBolla({
    bordo,
    className = '',
    style,
    indice = 0,
    onClick,
    children,
}: {
    bordo: string;
    className?: string;
    style?: React.CSSProperties;
    indice?: number;
    onClick?: () => void;
    children: ReactNode;
}) {
    return (
        <div
            className={`card-bolla card-bolla-entrata ${className}`}
            style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: bordo,
                animationDelay: `${Math.min(indice, 10) * 70}ms`,
                ...style,
            }}
            onClick={onClick}
        >
            <span className="card-bolla-bg" />
            <div className="relative">{children}</div>
        </div>
    );
}
