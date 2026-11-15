import type { NewsSectionKind } from './types';

/**
 * Etiqueta visible de cada clase de sección de noticia.
 *
 * Es una constante de presentación, no un dato del backend: las secciones
 * llegan de la API (`#lib/api/news`).
 */
export const newsSectionKindLabels: Record<NewsSectionKind, string> = {
	hero: 'Portada',
	chapter: 'Capítulo',
	closing: 'Cierre'
};
