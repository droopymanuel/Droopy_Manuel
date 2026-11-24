import { getDonationStatus } from '#lib/api/donations';

/**
 * La vuelta de Mercado Pago trae `external_reference` en la query. Con esa
 * referencia se busca el estado que guardó el webhook.
 *
 * Si todavía no existe (o la API falla), se devuelve `null` y la página queda
 * en pendiente.
 */
export async function load({ url }) {
	const externalReference = url.searchParams.get('external_reference')?.trim();

	if (!externalReference) {
		return { status: null, externalReference: null };
	}

	try {
		return { status: await getDonationStatus(externalReference), externalReference };
	} catch {
		return { status: null, externalReference };
	}
}
