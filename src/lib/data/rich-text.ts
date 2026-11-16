/**
 * Texto enriquecido mínimo para contenido del panel.
 *
 * Los párrafos llegan en texto plano y `**negrita**` es el único formato: se
 * escapa el HTML y luego se convierten los pares `**…**` en `<strong>`. Un
 * `**` sin cerrar se deja como texto literal.
 *
 * Las URLs `http(s)://…` se vuelven enlaces (`<a>`), con `target="_blank"` y
 * `rel="noopener noreferrer"`. Los enlaces se detectan **antes** de escapar,
 * con marcadores temporales, para no romper `&` ni comerse puntuación final.
 */
export function renderRichText(text: string): string {
	const links: string[] = [];

	const withTokens = text.replace(/(?:https?:\/\/|www\.)[^\s<>"']+/gi, (match) => {
		const url = trimTrailingPunctuation(match);
		const rest = match.slice(url.length);
		links.push(url);
		return `\u0000${links.length - 1}\u0000${rest}`;
	});

	return escapeHtml(withTokens)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\u0000(\d+)\u0000/g, (_, index: string) => {
			const raw = links[Number(index)];
			const href = escapeHtml(/^www\./i.test(raw) ? `https://${raw}` : raw);
			const label = escapeHtml(raw);
			return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
		});
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Quita puntuación de cierre que no forma parte de la URL. */
function trimTrailingPunctuation(url: string): string {
	let end = url.length;

	while (end > 0 && /[.,;:!?…]/.test(url[end - 1])) end--;

	let trimmed = url.slice(0, end);

	// Un `)` final solo se quita si no cierra un `(` dentro de la URL.
	while (trimmed.endsWith(')')) {
		const open = (trimmed.match(/\(/g) ?? []).length;
		const close = (trimmed.match(/\)/g) ?? []).length;
		if (close <= open) break;
		trimmed = trimmed.slice(0, -1);
	}

	return trimmed;
}
