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
export default function CardBolla({
    bordo,
    className = '',
    style,
    onClick,
    children,
}: {
    bordo: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    children: ReactNode;
}) {
    return (
        <div
            className={`card-bolla ${className}`}
            style={{ borderWidth: 2, borderStyle: 'solid', borderColor: bordo, ...style }}
            onClick={onClick}
        >
            <span className="card-bolla-bg" />
            <div className="relative">{children}</div>
        </div>
    );
}
