import type {
	DonationCheckoutPayload,
	DonationCheckoutResult,
	DonationStatus
} from '#lib/data/types';
import { api } from './client';

/**
 * Primera interacción con Mercado Pago.
 *
 * El backend crea la preferencia con el precio real del tier y devuelve el
 * enlace al que hay que redirigir. El front solo manda las estrellas.
 */
export async function createDonationCheckout(
	payload: DonationCheckoutPayload
): Promise<DonationCheckoutResult> {
	return api.post<DonationCheckoutResult>('/api/donations/checkout', {
		stars: payload.stars
	});
}

/**
 * Estado guardado de una donación.
 *
 * `null` cuando el webhook todavía no llegó: la página lo muestra como
 * pendiente.
 */
export async function getDonationStatus(externalReference: string): Promise<DonationStatus | null> {
	return api.getOrNull<DonationStatus>(
		`/api/donations/status?external_reference=${encodeURIComponent(externalReference)}`
	);
}
