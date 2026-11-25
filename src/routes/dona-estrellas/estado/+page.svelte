<script lang="ts">
	import { getDonationStatus } from '#lib/api/donations';
	import DonationResult from '#lib/components/DonationResult.svelte';
	import { formatCOP } from '#lib/data/format';
	import type { DonationStatus } from '#lib/data/types';
	import { pageTitle } from '#lib/site';
	import { onDestroy, untrack } from 'svelte';

	const title = pageTitle('Estado de tu donación');

	const FAILED_STATUSES = new Set(['rejected', 'cancelled', 'refunded', 'charged_back']);
	const REVERTED_STATUSES = new Set(['refunded', 'charged_back']);

	/** Espera antes de volver a consultar: varios clics = una sola llamada. */
	const RETRY_DEBOUNCE_MS = 450;

	let { data } = $props();

	let status = $state<DonationStatus | null>(untrack(() => data.status));
	let checking = $state(false);
	let retryError = $state('');
	let retryTimer: ReturnType<typeof setTimeout> | null = null;

	const reverted = $derived(status ? REVERTED_STATUSES.has(status.status) : false);
	const canRetry = $derived(Boolean(data.externalReference));

	const tone = $derived.by(() => {
		if (status?.status === 'approved') return 'success' as const;
		if (status && FAILED_STATUSES.has(status.status)) return 'error' as const;
		return 'pending' as const;
	});

	const summary = $derived.by(() => {
		if (!status || !status.stars || status.amountCents <= 0) return '';
		const stars = `${status.stars} ${status.stars === 1 ? 'estrella' : 'estrellas'}`;
		return `${stars} · ${formatCOP(status.amountCents)}`;
	});

	function reviewAgain() {
		const reference = data.externalReference;
		if (!reference || checking) return;

		if (retryTimer) clearTimeout(retryTimer);

		retryTimer = setTimeout(async () => {
			retryTimer = null;
			checking = true;
			retryError = '';

			try {
				status = await getDonationStatus(reference);
			} catch {
				retryError = 'No pudimos revisar el pago. Intenta de nuevo.';
			} finally {
				checking = false;
			}
		}, RETRY_DEBOUNCE_MS);
	}

	onDestroy(() => {
		if (retryTimer) clearTimeout(retryTimer);
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Estado de tu donación a Droopy Manuel." />
	<meta name="robots" content="noindex" />
</svelte:head>

{#if tone === 'success'}
	<DonationResult
		tone="success"
		emoji="⭐"
		eyebrow="Pago aprobado"
		title="¡Gracias por sumar estrellas!"
		message="Tu donación quedó confirmada. Mercado Pago ya nos avisó y tus estrellas se convierten en comida, vacunas y hogar para la manada."
		detail={summary}
		note="Guarda el comprobante que te dio Mercado Pago. Si quieres contarnos a quién dedicas tu estrella, escríbenos por WhatsApp."
		primaryHref="/dona-estrellas"
		primaryLabel="Donar otra vez"
		secondaryHref="/manada"
		secondaryLabel="Conocer la manada"
	/>
{:else if tone === 'error'}
	<DonationResult
		tone="error"
		emoji="😿"
		eyebrow="Pago no completado"
		title={reverted ? 'Tu pago fue revertido' : 'No pudimos completar tu donación'}
		message={reverted
			? 'Mercado Pago revirtió este pago. Si tienes dudas, escríbenos y lo revisamos juntos.'
			: 'Mercado Pago rechazó o canceló este pago, así que no se realizó ningún cobro. Puedes intentarlo de nuevo con otro medio de pago.'}
		note="¿Prefieres transferir? También hay cuentas disponibles en la página de donación."
		primaryHref="/dona-estrellas"
		primaryLabel="Intentar de nuevo"
		secondaryHref="/dona-estrellas#cuentas"
		secondaryLabel="Ver cuentas"
	/>
{:else}
	<DonationResult
		tone="pending"
		emoji="⏳"
		eyebrow="Pago en revisión"
		title="Aún no nos llega tu pago"
		message="Todavía no nos llega la confirmación de Mercado Pago. Puede tardar unos segundos; revisa de nuevo en un momento."
		detail={summary}
		note={retryError}
		primaryHref="/dona-estrellas"
		primaryLabel={canRetry ? (checking ? 'Revisando…' : 'Revisar de nuevo') : 'Volver a donar'}
		onPrimary={canRetry ? reviewAgain : undefined}
		primaryDisabled={checking}
		secondaryHref="/"
		secondaryLabel="Ir al inicio"
	/>
{/if}
