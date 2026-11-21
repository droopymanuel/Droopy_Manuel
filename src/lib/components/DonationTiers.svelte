<script lang="ts">
	import { formatCOP } from '#lib/data/format';
	import type { DonationTier } from '#lib/data/types';

	interface Props {
		tiers: DonationTier[];
	}

	let { tiers }: Props = $props();
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
				</article>
			{/each}
		</div>
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

	@media (min-width: 40rem) {
		.tier-grid {
			grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		}
	}
</style>
