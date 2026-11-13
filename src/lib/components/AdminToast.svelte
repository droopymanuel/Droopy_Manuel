<script lang="ts">
	import { untrack } from 'svelte';

	/**
	 * Aviso flotante para el panel de administración.
	 *
	 * Cada acción de SvelteKit deja su resultado en el prop `form`. Como las
	 * páginas del panel son largas, un mensaje arriba del todo se pierde: este
	 * aviso aparece fijo sobre la esquina inferior derecha y se va solo.
	 */

	type Form = { success?: boolean; error?: string; message?: string } | null | undefined;

	let { form, duration = 4000 }: { form: Form; duration?: number } = $props();

	let visible = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	let kind = $derived(form?.error ? 'error' : form?.success ? 'ok' : null);
	let text = $derived(form?.error ?? form?.message ?? '');

	function clearTimer() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function dismiss() {
		clearTimer();
		visible = false;
	}

	// Cada respuesta nueva del servidor vuelve a mostrar el aviso.
	$effect(() => {
		const message = form;
		if (!message?.error && !message?.success) return;

		const isError = Boolean(message.error);
		untrack(() => {
			clearTimer();
			visible = true;
			timer = setTimeout(() => {
				visible = false;
				timer = null;
			}, isError ? Math.max(duration, 7000) : duration);
		});

		return clearTimer;
	});

	// Al pasar el mouse por encima el aviso se queda quieto para poder leerlo.
	function pause() {
		clearTimer();
	}

	function resume() {
		if (!visible) return;
		clearTimer();
		timer = setTimeout(() => {
			visible = false;
			timer = null;
		}, 2500);
	}
</script>

{#if visible && kind}
	<div
		class="toast {kind}"
		role={kind === 'error' ? 'alert' : 'status'}
		aria-live={kind === 'error' ? 'assertive' : 'polite'}
		onmouseenter={pause}
		onmouseleave={resume}
	>
		<span class="mark" aria-hidden="true">{kind === 'error' ? '⚠' : '✓'}</span>
		<p>{text}</p>
		<button type="button" class="close" aria-label="Cerrar aviso" onclick={dismiss}>×</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-width: min(24rem, calc(100vw - 2.5rem));
		padding: 0.75rem 0.875rem;
		border-radius: 0.5rem;
		border: 1px solid;
		box-shadow: 0 10px 30px rgb(15 23 42 / 0.18);
		font-size: 0.9375rem;
		animation: toast-in 0.18s ease-out;
	}

	.toast.ok {
		background: #f0fdf4;
		border-color: #bbf7d0;
		color: #15803d;
	}

	.toast.error {
		background: #fef2f2;
		border-color: #fecaca;
		color: #b91c1c;
	}

	.mark {
		line-height: 1.4;
	}

	p {
		margin: 0;
		flex: 1;
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		min-height: 0;
		border: 0;
		border-radius: 0.25rem;
		background: transparent;
		color: inherit;
		font-size: 1.125rem;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.7;
	}

	.close:hover {
		opacity: 1;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 40rem) {
		.toast {
			right: 0.75rem;
			bottom: 0.75rem;
			max-width: calc(100vw - 1.5rem);
		}
	}
</style>
