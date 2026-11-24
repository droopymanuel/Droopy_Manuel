<script lang="ts">
	interface Props {
		tone: 'success' | 'pending' | 'error';
		emoji: string;
		eyebrow: string;
		title: string;
		message: string;
		note?: string;
		primaryHref: string;
		primaryLabel: string;
		onPrimary?: () => void;
		primaryDisabled?: boolean;
		secondaryHref: string;
		secondaryLabel: string;
	}

	let {
		tone,
		emoji,
		eyebrow,
		title,
		message,
		note = '',
		primaryHref,
		primaryLabel,
		onPrimary,
		primaryDisabled = false,
		secondaryHref,
		secondaryLabel
	}: Props = $props();
</script>

<main class="container result-page">
	<section class="result glass {tone}" aria-labelledby="result-title">
		<p class="emoji" aria-hidden="true">{emoji}</p>
		<p class="eyebrow">{eyebrow}</p>
		<h1 id="result-title">{title}</h1>
		<p class="message">{message}</p>

		{#if note}
			<p class="note">{note}</p>
		{/if}

		<div class="actions">
			{#if onPrimary}
				<button type="button" class="primary-btn" onclick={onPrimary} disabled={primaryDisabled}>
					{primaryLabel}
				</button>
			{:else}
				<a class="primary-btn" href={primaryHref}>{primaryLabel}</a>
			{/if}
			<a class="secondary-btn" href={secondaryHref}>{secondaryLabel}</a>
		</div>
	</section>
</main>

<style>
	.result-page {
		display: grid;
		place-items: center;
		min-height: 60vh;
		padding-block: 2rem 4rem;
	}

	.result {
		width: min(100%, 40rem);
		padding: clamp(1.5rem, 5vw, 2.5rem);
		border: 1px solid rgb(255 255 255 / 0.6);
		border-radius: 1.5rem;
		box-shadow: 0 18px 50px rgb(122 63 22 / 0.18);
		text-align: center;
	}

	.result.success {
		--accent: #2e7d32;
		--accent-hover: #388e3c;
	}

	.result.pending {
		--accent: #a16207;
		--accent-hover: #ca8a04;
	}

	.result.error {
		--accent: #b91c1c;
		--accent-hover: #dc2626;
	}

	.emoji {
		font-size: clamp(3rem, 12vw, 4.5rem);
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.eyebrow {
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: var(--accent);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	h1 {
		margin-top: 0.25rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.75rem, 6vw, 2.5rem);
		line-height: 1.15;
		color: #5a2f10;
		text-wrap: balance;
	}

	.message {
		margin-top: 0.75rem;
		font-size: 1.0625rem;
		text-wrap: pretty;
	}

	.note {
		margin-top: 1.25rem;
		padding: 0.75rem 1rem;
		border-radius: 0.875rem;
		background: rgb(255 255 255 / 0.55);
		font-size: 0.9375rem;
		text-wrap: pretty;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.75rem;
	}

	.primary-btn,
	.secondary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		text-decoration: none;
	}

	.primary-btn {
		border: 0;
		background: var(--accent);
		color: #fff8ef;
		cursor: pointer;
	}

	.primary-btn:disabled {
		opacity: 0.65;
		cursor: wait;
	}

	.secondary-btn {
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.85);
		color: #7a3f16;
	}

	@media (hover: hover) {
		.primary-btn:hover {
			background: var(--accent-hover);
		}

		.secondary-btn:hover {
			background: #fff8ef;
		}
	}

	.primary-btn:focus-visible,
	.secondary-btn:focus-visible {
		outline: 3px solid #7a3f16;
		outline-offset: 2px;
	}
</style>
