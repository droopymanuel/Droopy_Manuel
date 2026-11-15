<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import ImageUpload from '#lib/components/ImageUpload.svelte';
	import AdminToast from '#lib/components/AdminToast.svelte';
	import type { NewsItem, NewsSection } from '#lib/data/types';
	import { NEWS_SECTION_KINDS } from '#lib/data/types';
	import { categoryEmoji, categoryLabels } from '#lib/data/news-labels';
	import { newsSectionKindLabels } from '#lib/data/news-section-labels';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<NewsItem | null>(null);
	let showForm = $state(false);

	/** Sección del cuerpo en edición; `null` = agregar una nueva. */
	let sectionEditing = $state<NewsSection | null>(null);
	let sectionKind = $state('chapter');
	let sectionTitle = $state('');
	let sectionBody = $state('');

	/** Secciones de la noticia que se está editando. */
	let currentSections = $derived(editing ? (data.sectionsByNews[editing.slug] ?? []) : []);

	function startSectionCreate() {
		sectionEditing = null;
		sectionKind = 'chapter';
		sectionTitle = '';
		sectionBody = '';
	}

	function startSectionEdit(section: NewsSection) {
		sectionEditing = section;
		sectionKind = section.kind;
		sectionTitle = section.title ?? '';
		sectionBody = section.body.join('\n');
	}

	function resetSectionForm() {
		startSectionCreate();
	}

	/** Posición sugerida para una sección nueva: después de la última. */
	let nextSectionPosition = $derived(
		currentSections.length === 0 ? 1 : Math.max(...currentSections.map((s) => s.position)) + 1
	);

	/** Etiqueta con emoji, como se muestra en el selector y la tabla. */
	function categoryTag(category: string): string {
		const label = (categoryLabels as Record<string, string>)[category] ?? category;
		const emoji = (categoryEmoji as Record<string, string>)[category];
		return emoji ? `${emoji} ${label}` : label;
	}

	function startCreate() {
		editing = null;
		showForm = true;
		resetSectionForm();
	}

	function startEdit(item: NewsItem) {
		editing = item;
		showForm = true;
		resetSectionForm();
	}

	function closeForm() {
		showForm = false;
		editing = null;
		resetSectionForm();
	}

	/** Cierra el modal con Escape. */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showForm) closeForm();
	}

	// Bloquea el scroll de la página mientras el modal está abierto.
	// Al ocultar el scroll, la barra desaparece y el contenido se corre: se
	// compensa con un padding del ancho exacto de la barra. `$effect` solo
	// corre en el navegador, así que `document` siempre existe.
	$effect(() => {
		if (!showForm) return;

		const body = document.body;
		const previousOverflow = body.style.overflow;
		const previousPadding = body.style.paddingRight;

		// Ancho real de la barra (0 en móvil o si no hay scroll).
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		const basePadding = parseFloat(getComputedStyle(body).paddingRight) || 0;

		body.style.overflow = 'hidden';
		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${basePadding + scrollbarWidth}px`;
		}

		return () => {
			body.style.overflow = previousOverflow;
			body.style.paddingRight = previousPadding;
		};
	});

	/** Fecha corta para la tabla. */
	function shortDate(iso: string): string {
		const [year, month, day] = iso.split('-');
		return `${day}/${month}/${year}`;
	}
</script>

<svelte:head>
	<title>Noticias · Panel</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<header class="head">
	<div>
		<h1>Noticias</h1>
		<p class="lead">{data.items.length} noticias publicadas.</p>
	</div>
	<button class="primary" onclick={startCreate}>Redactar noticia</button>
</header>

<AdminToast {form} />

{#if showForm}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) closeForm();
		}}
	>
		<div
			class="editor modal-panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby="news-editor-title"
		>
			<div class="modal-head">
				<h2 id="news-editor-title">
					{editing ? `Editar «${editing.title}»` : 'Nueva noticia'}
				</h2>
				<button class="icon" type="button" onclick={closeForm} title="Cerrar" aria-label="Cerrar">
					✕
				</button>
			</div>

		<form
			method="POST"
			action={editing ? '?/update' : '?/create'}
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') closeForm();
				};
			}}
		>
			{#if editing}
				<input type="hidden" name="slug" value={editing.slug} />
			{/if}

			<div class="grid">
				<label class="wide">
					Título *
					<input name="title" value={editing?.title ?? ''} required />
				</label>

				<label>
					Fecha *
					<input name="date" type="date" value={editing?.date ?? ''} required />
				</label>

				<label>
					Categoría *
					<select name="category" value={editing?.category ?? 'rescate'}>
						{#each data.categories as category (category)}
							<option value={category}>{categoryTag(category)}</option>
						{/each}
					</select>
				</label>

				<label>
					Emoji (opcional)
					<input class="emoji-input" name="emoji" value={editing?.emoji ?? ''} placeholder="🚑" />
				</label>

				<label class="wide">
					Bajada corta *
					<input name="excerpt" value={editing?.excerpt ?? ''} required />
				</label>

				<label class="wide">
					Etiquetas (separadas por coma)
					<input name="tags" value={editing?.tags.join(', ') ?? ''} placeholder="rescate, cachorros" />
				</label>
			</div>

			{#key editing?.slug ?? 'nuevo'}
				<div class="image-upload-wrapper">
					<ImageUpload name="photo" value={editing?.photo ?? ''} folder="noticias" />
				</div>
			{/key}

			<fieldset>
				<legend>Perritos relacionados</legend>
				{#if data.dogs.length === 0}
					<p class="hint">No hay perritos todavía.</p>
				{:else}
					<div class="dog-picker">
						{#each data.dogs as dog (dog.slug)}
							<label class="inline">
								<input
									type="checkbox"
									name="relatedDogSlugs"
									value={dog.slug}
									checked={editing?.relatedDogSlugs.includes(dog.slug) ?? false}
								/>
								{dog.name}
							</label>
						{/each}
					</div>
				{/if}
			</fieldset>

			<label class="inline standalone">
				<input type="checkbox" name="featured" checked={editing?.featured ?? false} />
				Destacada
			</label>

			<div class="actions">
				<button class="primary" type="submit">{editing ? 'Guardar cambios' : 'Publicar'}</button>
				<button class="ghost" type="button" onclick={closeForm}>Cancelar</button>
			</div>
		</form>

		{#if editing}
			<div class="sections-editor">
				<div class="sections-head">
					<h3>Secciones del cuerpo</h3>
				</div>
				<p class="hint">
					Reemplazan al cuerpo antiguo. Un párrafo por línea; **negrita** es el único formato.
				</p>

				{#if currentSections.length === 0}
					<p class="empty-inline">Sin secciones todavía.</p>
				{:else}
					<table class="sections-table">
						<thead>
							<tr>
								<th class="num">#</th>
								<th>Clase</th>
								<th>Título</th>
								<th>Texto</th>
								<th class="right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each currentSections as section, index (section.id)}
								<tr class:active={sectionEditing?.id === section.id}>
									<td class="num">{section.position}</td>
									<td>
										<span class="tag">
											{newsSectionKindLabels[section.kind] ?? section.kind}
										</span>
									</td>
									<td>{section.title ?? '—'}</td>
									<td class="preview">
										{section.body.length === 0
											? '—'
											: `${section.body.length} párrafo${section.body.length === 1 ? '' : 's'} · ${section.body[0]?.slice(0, 50) ?? ''}…`}
									</td>
									<td class="right">
										<div class="row-actions">
											<form method="POST" action="?/updateSection" use:enhance>
												<input type="hidden" name="slug" value={editing.slug} />
												<input type="hidden" name="id" value={section.id} />
												<input type="hidden" name="position" value={section.position - 1} />
												<button class="icon" type="submit" disabled={index === 0} title="Subir">
													↑
												</button>
											</form>
											<form method="POST" action="?/updateSection" use:enhance>
												<input type="hidden" name="slug" value={editing.slug} />
												<input type="hidden" name="id" value={section.id} />
												<input type="hidden" name="position" value={section.position + 1} />
												<button
													class="icon"
													type="submit"
													disabled={index === currentSections.length - 1}
													title="Bajar"
												>
													↓
												</button>
											</form>
											<button
												class="icon"
												type="button"
												onclick={() => startSectionEdit(section)}
												title="Editar"
											>
												✎
											</button>
											<form method="POST" action="?/deleteSection" use:enhance>
												<input type="hidden" name="slug" value={editing.slug} />
												<input type="hidden" name="id" value={section.id} />
												<button
													class="icon danger"
													type="submit"
													title="Borrar"
													onclick={(event) => {
														if (!confirm(`¿Borrar la sección ${section.position}?`)) {
															event.preventDefault();
														}
													}}
												>
													🗑
												</button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}

				<form
					class="section-form"
					method="POST"
					action={sectionEditing ? '?/updateSection' : '?/addSection'}
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') resetSectionForm();
						};
					}}
				>
					<input type="hidden" name="slug" value={editing.slug} />
					{#if sectionEditing}
						<input type="hidden" name="id" value={sectionEditing.id} />
					{/if}

					<div class="grid">
						<label>
							Clase *
							<select
								name="kind"
								value={sectionKind}
								onchange={(event) => (sectionKind = event.currentTarget.value)}
							>
								{#each NEWS_SECTION_KINDS as kind (kind)}
									<option value={kind}>{newsSectionKindLabels[kind]}</option>
								{/each}
							</select>
							<!-- Reserva la fila del hint para que la columna mida igual que Posición. -->
							<span class="hint" aria-hidden="true">&nbsp;</span>
						</label>

						<label>
							Posición
							<input
								name="position"
								type="number"
								min="1"
								step="1"
								value={sectionEditing?.position ?? nextSectionPosition}
							/>
							<span class="hint">Si está ocupada, las demás se recorren.</span>
						</label>

						<label class="wide">
							Título (opcional)
							<input
								name="title"
								value={sectionTitle}
								placeholder="Sin título = sin encabezado"
							/>
						</label>

						<label class="wide">
							Texto {sectionKind === 'hero' ? '(opcional)' : '*'}
							<textarea name="body" rows="6">{sectionBody}</textarea>
							<span class="hint">Un párrafo por línea. **negrita** es el único formato.</span>
						</label>
					</div>

					<div class="actions">
						<button class="primary" type="submit">
							{sectionEditing ? 'Guardar sección' : 'Agregar sección'}
						</button>
						{#if sectionEditing}
							<button class="ghost" type="button" onclick={resetSectionForm}>Cancelar</button>
						{/if}
					</div>
				</form>
			</div>
		{/if}
		</div>
	</div>
{/if}

{#if data.items.length === 0}
	<p class="empty">Todavía no hay noticias. Escribe la primera.</p>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Noticia</th>
					<th>Categoría</th>
					<th>Fecha</th>
					<th>Perritos</th>
					<th>Dest.</th>
					<th class="right">Acciones</th>
				</tr>
			</thead>
		<tbody>
			{#each data.items as item (item.slug)}
				<tr>
					<td>
						<span class="avatar" aria-hidden="true">
							{#if item.photo}<img src={item.photo} alt="" />{:else}{item.emoji || item.title.charAt(0)}{/if}
						</span>
						<span class="name">
							<strong>{item.title}</strong>
							<span class="sub"><code>{item.slug}</code></span>
						</span>
					</td>
					<td><span class="tag">{categoryTag(item.category)}</span></td>
					<td>{shortDate(item.date)}</td>
					<td>
						{#if item.relatedDogSlugs.length > 0}
							{item.relatedDogSlugs.length}
						{:else}
							<span class="muted">—</span>
						{/if}
					</td>
					<td>{item.featured ? '★' : ''}</td>
					<td class="right">
						<div class="row-actions">
							<a class="icon" href={`/noticias/${item.slug}`} target="_blank" rel="noreferrer" title="Ver en la web">
								↗
							</a>
							<button class="icon" onclick={() => startEdit(item)} title="Editar">✎</button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="slug" value={item.slug} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar «${item.title}»? No se puede deshacer.`)) event.preventDefault();
									}}
								>
									🗑
								</button>
							</form>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
		</table>
	</div>
{/if}

<style>
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1.125rem;
	}

	.lead {
		margin: 0;
		color: #5b6470;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: #5b6470;
		background: #fff;
		border: 1px dashed #ccd2d9;
		border-radius: 0.625rem;
	}

	.image-upload-wrapper {
		margin: 1.5rem 0;
	}

	.editor {
		margin-bottom: 1.5rem;
		padding: 1.25rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem 1rem;
		background: rgb(15 23 42 / 0.55);
		overflow-y: auto;
	}

	.modal-panel {
		width: min(56rem, 100%);
		max-height: calc(100vh - 4rem);
		margin: 0;
		overflow-y: auto;
		box-shadow: 0 1.5rem 3rem rgb(15 23 42 / 0.35);
	}

	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.modal-head h2 {
		margin: 0;
	}

	.sections-editor {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid #e2e5e9;
	}

	.sections-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.sections-head h3 {
		margin: 0;
		font-size: 1rem;
	}

	.empty-inline {
		margin: 0.75rem 0;
		padding: 1rem;
		text-align: center;
		color: #5b6470;
		border: 1px dashed #ccd2d9;
		border-radius: 0.375rem;
	}

	.sections-table {
		margin: 0.75rem 0 1rem;
		border: 1px solid #eef0f3;
		border-radius: 0.375rem;
	}

	.sections-table tr.active td {
		background: #f5f7ff;
	}

	.num {
		width: 2.5rem;
		color: #8b949e;
	}

	.preview {
		max-width: 20rem;
		font-size: 0.875rem;
		color: #5b6470;
	}

	.section-form {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px dashed #e2e5e9;
	}

	.icon:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	label.wide {
		grid-column: 1 / -1;
	}

	label.inline {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin-right: 1rem;
		font-weight: 400;
	}

	label.standalone {
		margin-top: 0.75rem;
	}

	.hint {
		font-weight: 400;
		color: #5b6470;
		font-size: 0.8125rem;
	}

	input,
	select,
	textarea {
		padding: 0.5rem 0.625rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		font: inherit;
		font-weight: 400;
	}

	textarea {
		resize: vertical;
		line-height: 1.5;
	}

	.emoji-input {
		width: 5rem;
	}

	fieldset {
		margin: 1rem 0 0;
		padding: 0.75rem;
		border: 1px solid #e2e5e9;
		border-radius: 0.5rem;
	}

	legend {
		padding: 0 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.dog-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	button.primary {
		padding: 0.5rem 0.875rem;
		border: 0;
		border-radius: 0.375rem;
		background: #1f2937;
		color: #fff;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button.ghost {
		padding: 0.5rem 0.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		font: inherit;
		cursor: pointer;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: #fff;
		font-size: 0.9375rem;
	}

	th,
	td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eef0f3;
		vertical-align: middle;
	}

	th {
		background: #f9fafb;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #5b6470;
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	.right {
		text-align: right;
	}

	.avatar {
		display: inline-grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		background: #e8eaee;
		overflow: hidden;
		vertical-align: middle;
		margin-right: 0.5rem;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.name {
		display: inline-grid;
		vertical-align: middle;
		max-width: 28rem;
	}

	.sub {
		font-size: 0.8125rem;
		color: #5b6470;
	}

	code {
		font-size: 0.75rem;
		background: #f1f3f5;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.25rem;
	}

	.muted {
		color: #9aa3af;
	}

	.tag {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 1rem;
		background: #eef2ff;
		color: #3730a3;
		font-size: 0.8125rem;
		white-space: nowrap;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
	}

	.row-actions form {
		display: inline;
	}

	.icon {
		display: inline-grid;
		place-items: center;
		width: 1.875rem;
		height: 1.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
		font-size: 0.875rem;
	}

	.icon.danger:hover {
		border-color: #ef4444;
		color: #b91c1c;
	}

	@media (max-width: 40rem) {
		.modal-backdrop {
			padding: 1rem 0.5rem;
		}

		.modal-panel {
			max-height: calc(100vh - 2rem);
		}

		.editor {
			padding: 0.875rem;
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.name {
			max-width: 100%;
		}

		.actions button {
			flex: 1 1 auto;
		}
	}
</style>
