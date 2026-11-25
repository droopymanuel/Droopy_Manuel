<script lang="ts">
	interface Props {
		tone: 'success' | 'pending' | 'error';
		emoji: string;
		eyebrow: string;
		title: string;
		message: string;
		/** Dato corto y destacado, por ejemplo «3 estrellas · $3.000». */
		detail?: string;
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
		detail = '',
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
	<section class="result {tone}" aria-labelledby="result-title">
		<span class="topline" aria-hidden="true"></span>

		<div class="badge" aria-hidden="true">
			<span>{emoji}</span>
		</div>

		<p class="eyebrow">
			<span class="dot" aria-hidden="true"></span>
			{eyebrow}
		</p>

		<h1 id="result-title">{title}</h1>

		{#if detail}
			<p class="detail">{detail}</p>
		{/if}

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
		min-height: 64vh;
		padding-block: 2.5rem 4.5rem;
	}

	.result {
		--accent: #2e7d32;
		--accent-hover: #388e3c;
		--accent-soft: #e5f2e6;
		--glow: rgb(46 125 50 / 0.16);

		position: relative;
		width: min(100%, 42rem);
		padding: clamp(1.75rem, 6vw, 3rem) clamp(1.25rem, 5vw, 2.75rem) clamp(1.5rem, 5vw, 2.25rem);
		overflow: hidden;
		border: 1px solid rgb(255 255 255 / 0.75);
		border-radius: 1.75rem;
		background:
			radial-gradient(circle at 100% 0%, var(--glow), transparent 42%),
			linear-gradient(160deg, rgb(255 253 248 / 0.94), rgb(255 246 234 / 0.86));
		box-shadow:
			0 30px 70px rgb(90 47 16 / 0.16),
			0 2px 0 rgb(255 255 255 / 0.9) inset;
		text-align: center;
		animation: result-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.result.pending {
		--accent: #a16207;
		--accent-hover: #ca8a04;
		--accent-soft: #fbf0d3;
		--glow: rgb(202 138 4 / 0.18);
	}

	.result.error {
		--accent: #b91c1c;
		--accent-hover: #dc2626;
		--accent-soft: #fbe5e5;
		--glow: rgb(185 28 28 / 0.14);
	}

	.topline {
		position: absolute;
		inset: 0 0 auto;
		height: 5px;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		opacity: 0.85;
	}

	.badge {
		display: grid;
		place-items: center;
		width: clamp(4.5rem, 14vw, 5.5rem);
		height: clamp(4.5rem, 14vw, 5.5rem);
		margin: 0 auto 1rem;
		border-radius: 50%;
		background: linear-gradient(145deg, #fffdf8, var(--accent-soft));
		box-shadow:
			0 0 0 6px rgb(255 255 255 / 0.55),
			0 14px 30px var(--glow);
		font-size: clamp(2.25rem, 8vw, 3rem);
		line-height: 1;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.85rem;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent);
		font-family: var(--font-brand);
		font-size: 1.0625rem;
		letter-spacing: 0.05em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 4px rgb(255 255 255 / 0.55);
	}

	h1 {
		margin-top: 0.75rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.9rem, 6.4vw, 2.75rem);
		line-height: 1.1;
		color: #5a2f10;
		text-wrap: balance;
	}

	.detail {
		display: inline-block;
		margin-top: 0.9rem;
		padding: 0.4rem 0.9rem;
		border: 1px solid rgb(122 63 22 / 0.16);
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.7);
		color: #6b3a17;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.message {
		max-width: 33rem;
		margin: 0.9rem auto 0;
		font-size: 1.0625rem;
		line-height: 1.55;
		text-wrap: pretty;
	}

	.note {
		max-width: 33rem;
		margin: 1.25rem auto 0;
		padding: 0.8rem 1rem;
		border: 1px dashed rgb(122 63 22 / 0.22);
		border-radius: 0.9rem;
		background: rgb(255 255 255 / 0.5);
		font-size: 0.9rem;
		line-height: 1.45;
		text-wrap: pretty;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.9rem;
	}

	.primary-btn,
	.secondary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.75rem 1.6rem;
		border-radius: 999px;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		line-height: 1.1;
		text-decoration: none;
		transition:
			background-color 160ms ease,
			transform 160ms ease,
			box-shadow 160ms ease;
	}

	.primary-btn {
		border: 0;
		background: linear-gradient(180deg, var(--accent-hover), var(--accent));
		box-shadow:
			0 8px 18px var(--glow),
			0 1px 0 rgb(255 255 255 / 0.35) inset;
		color: #fffdf8;
		cursor: pointer;
	}

	.primary-btn:disabled {
		opacity: 0.7;
		cursor: wait;
		transform: none;
		box-shadow: none;
	}

	.secondary-btn {
		border: 2px solid rgb(122 63 22 / 0.65);
		background: rgb(255 255 255 / 0.7);
		color: #7a3f16;
	}

	.primary-btn:focus-visible,
	.secondary-btn:focus-visible {
		outline: 3px solid #7a3f16;
		outline-offset: 3px;
	}

	@media (hover: hover) {
		.primary-btn:not(:disabled):hover {
			background: var(--accent-hover);
			transform: translateY(-1px);
			box-shadow: 0 12px 24px var(--glow);
		}

		.secondary-btn:hover {
			background: #fff8ef;
		}
	}

	@keyframes result-in {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
