<script lang="ts">
	import { createDonationCheckout } from '#lib/api/donations';
	import { formatCOP } from '#lib/data/format';
	import type { DonationTier } from '#lib/data/types';

	interface Props {
		tiers: DonationTier[];
	}

	let { tiers }: Props = $props();

	let payingStars = $state<number | null>(null);
	let payError = $state('');

	async function pay(tier: DonationTier) {
		if (payingStars !== null) return;

		payingStars = tier.stars;
		payError = '';

		try {
			const result = await createDonationCheckout({ stars: tier.stars });
			// Salir del sitio hacia el checkout de Mercado Pago.
			window.location.assign(result.initPoint);
		} catch (err) {
			payError =
				err instanceof Error
					? err.message
					: 'No pudimos abrir el pago. Intenta de nuevo.';
			payingStars = null;
		}
	}
</script>

{#if tiers.length > 0}
	<section class="online" aria-labelledby="online-title">
		<h2 class="section-title" id="online-title">⭐ Dona en línea</h2>
		<p class="online-hint">
			Elige tus estrellas. El pago se hace con Mercado Pago.
		</p>

		<div class="tier-grid">
			{#each tiers as tier (tier.stars)}
				<article class="tier glass">
					<header class="tier-head">
						<span class="tier-stars" aria-label={`${tier.stars} estrellas`}>
							{tier.stars} ⭐
						</span>
						<span class="tier-price">{formatCOP(tier.priceCents)}</span>
					</header>

					<h3 class="tier-name">{tier.name}</h3>
					<p class="tier-blurb">{tier.blurb}</p>

					{#if tier.perks.length > 0}
						<ul class="tier-perks">
							{#each tier.perks as perk (perk)}
								<li>{perk}</li>
							{/each}
						</ul>
					{/if}

					<button
						type="button"
						class="pay-btn"
						onclick={() => pay(tier)}
						disabled={payingStars !== null}
					>
						{payingStars === tier.stars ? 'Abriendo Mercado Pago…' : 'Donar con Mercado Pago'}
					</button>
				</article>
			{/each}
		</div>

		{#if payError}
			<p class="pay-error" role="alert">{payError}</p>
		{/if}
	</section>
{/if}

<style>
	.online {
		margin-bottom: 2.5rem;
	}

	.section-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.375rem, 5vw, 1.875rem);
		line-height: 1.2;
		margin-bottom: 0.75rem;
		-webkit-text-stroke: 4px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	.online-hint {
		text-align: center;
		text-wrap: balance;
		max-width: 34rem;
		margin: 0 auto 1.25rem;
	}

	.tier-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.tier {
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.tier-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.tier-stars {
		font-size: 1.125rem;
		letter-spacing: 0.02em;
	}

	.tier-price {
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: #7a3f16;
	}

	.tier-name {
		margin-top: 0.5rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.375rem;
		line-height: 1.2;
		color: #7a3f16;
	}

	.tier-blurb {
		margin-top: 0.375rem;
		font-size: 0.9375rem;
		text-wrap: pretty;
	}

	.tier-perks {
		margin-top: 0.75rem;
		padding-left: 1.125rem;
		font-size: 0.9375rem;
	}

	.tier-perks li + li {
		margin-top: 0.25rem;
	}

	.pay-btn {
		width: 100%;
		min-height: var(--tap-min);
		margin-top: 1rem;
		padding: 0.75rem 1.25rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.125rem;
		cursor: pointer;
	}

	.pay-btn:disabled {
		opacity: 0.65;
		cursor: wait;
	}

	.pay-error {
		margin-top: 1rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.85);
		color: #8a1f11;
		text-align: center;
		text-wrap: pretty;
	}

	@media (hover: hover) {
		.pay-btn:not(:disabled):hover {
			background: #388e3c;
		}

		.pay-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 40rem) {
		.tier-grid {
			grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		}
	}
</style>
