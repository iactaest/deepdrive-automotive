// Costruisce l'URL di un asset servito da /public (immagini, pattern, ecc.)
// tenendo conto del base path di Vite: in locale import.meta.env.BASE_URL e'
// '/', in un deploy sotto sottopercorso (vedi VITE_BASE_PATH in vite.config.js)
// diventa '/bandi/' — cosi i riferimenti non restano ancorati alla radice del
// dominio quando l'app non vive li'.
export const publicUrl = (path: string) =>
    `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
