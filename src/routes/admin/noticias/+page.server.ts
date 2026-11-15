import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { Dog, NewsItem, NewsSection } from '#lib/data/types';
import { NEWS_CATEGORY_SLUGS } from '#lib/data/types';
import type { NewsSectionInput } from '#lib/data/admin-types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Noticias.
 *
 * Como en las demás secciones, `serverApi` reenvía la cookie de sesión: sin
 * eso la API responde 401 durante el SSR y en las acciones de formulario.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	let items: NewsItem[] = [];
	let dogs: Dog[] = [];
	let sections: NewsSection[] = [];

	try {
		[items, dogs, sections] = await Promise.all([
			serverApi.get<NewsItem[]>('/api/news', cookies),
			serverApi.get<Dog[]>('/api/dogs', cookies),
			serverApi.get<NewsSection[]>('/api/news/sections', cookies)
		]);
	} catch {
		// Si la API no responde, la página sale vacía en vez de romperse.
	}

	// El editor muestra las secciones de la noticia que se está editando.
	const sectionsByNews: Record<string, NewsSection[]> = {};
	for (const section of sections) {
		(sectionsByNews[section.newsSlug] ??= []).push(section);
	}

	return {
		items,
		// Para el selector de perritos relacionados.
		dogs: dogs.map((dog) => ({ slug: dog.slug, name: dog.name })),
		sectionsByNews,
		categories: [...NEWS_CATEGORY_SLUGS]
	};
};

function text(value: FormDataEntryValue | null): string | undefined {
	if (value === null) return undefined;
	const trimmed = String(value).trim();
	return trimmed === '' ? undefined : trimmed;
}

/**
 * Lee el emoji del formulario preservando la cadena vacía: así quitar el
 * emoji al editar lo borra de verdad, en vez de conservar el anterior.
 * Si el campo no viene, devuelve `undefined` (edición parcial).
 */
function emojiField(form: FormData): string | undefined {
	if (!form.has('emoji')) return undefined;
	return String(form.get('emoji') ?? '').trim();
}

/**
 * Lee el cuerpo de la noticia.
 *
 * El formulario usa un `textarea` con un párrafo por línea: es lo más cómodo
 * de escribir y evita pedir un editor enriquecido. Las líneas vacías se
 * descartan.
 *
 * Devuelve `undefined` **solo si el campo no viene** (edición parcial). Si
 * viene vacío, devuelve `[]` para que la validación pueda rechazarlo: una
 * noticia sin cuerpo no debe guardarse.
 */
function readBody(form: FormData): string[] | undefined {
	if (!form.has('body')) return undefined;
	return String(form.get('body') ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

/**
 * Lee una sección del formulario.
 *
 * Los campos que no vengan se omiten: así el mismo lector sirve para editar
 * (todos) y para subir/bajar (solo `position`). El título vacío se envía como
 * `null` para quitar el encabezado de verdad.
 */
function readSectionInput(form: FormData): NewsSectionInput {
	const input: NewsSectionInput = {};

	if (form.has('kind')) {
		const kind = String(form.get('kind') ?? '').trim();
		if (kind !== '') input.kind = kind as NewsSectionInput['kind'];
	}

	if (form.has('position')) {
		const raw = String(form.get('position') ?? '').trim();
		if (raw !== '') {
			const position = Number(raw);
			if (Number.isInteger(position)) input.position = position;
		}
	}

	if (form.has('title')) {
		const title = String(form.get('title') ?? '').trim();
		input.title = title === '' ? null : title;
	}

	if (form.has('body')) input.body = readBody(form);

	return input;
}

/** Lee los perritos relacionados marcados en el formulario. */
function readRelated(form: FormData): string[] {
	return form
		.getAll('relatedDogSlugs')
		.map((value) => String(value).trim())
		.filter(Boolean);
}

function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/** Crea una noticia. */
	create: async ({ request, cookies }) => {
		const form = await request.formData();

		const body = readBody(form);
		if (body !== undefined && body.length === 0) {
			return fail(400, { error: 'La noticia necesita al menos un párrafo.' });
		}

		const input = {
			title: text(form.get('title')),
			excerpt: text(form.get('excerpt')),
			body,
			date: text(form.get('date')),
			category: text(form.get('category')),
			emoji: emojiField(form),
			photo: text(form.get('photo')) ?? null,
			featured: form.get('featured') === 'on',
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			relatedDogSlugs: readRelated(form)
		};

		try {
			const item = await serverApi.post<NewsItem>('/api/admin/news', cookies, input);
			return { success: true, message: `«${item.title}» se publicó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear la noticia.') });
		}
	},

	/** Edita una noticia; los perritos relacionados se reemplazan. */
	update: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la noticia a editar.' });

		const body = readBody(form);
		if (body !== undefined && body.length === 0) {
			return fail(400, { error: 'La noticia necesita al menos un párrafo.' });
		}

		const input = {
			title: text(form.get('title')),
			excerpt: text(form.get('excerpt')),
			body,
			date: text(form.get('date')),
			category: text(form.get('category')),
			emoji: emojiField(form),
			photo: text(form.get('photo')) ?? null,
			featured: form.get('featured') === 'on',
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			relatedDogSlugs: readRelated(form)
		};

		try {
			const item = await serverApi.patch<NewsItem>(
				`/api/admin/news/${encodeURIComponent(slug)}`,
				cookies,
				input
			);
			return { success: true, message: `«${item.title}» se actualizó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar la noticia.') });
		}
	},

	/** Borra una noticia. La API exige rol admin. */
	delete: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la noticia a borrar.' });

		try {
			await serverApi.delete(`/api/admin/news/${encodeURIComponent(slug)}`, cookies);
			return { success: true, message: `${slug} se eliminó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la noticia.') });
		}
	},

	/** Agrega una sección al cuerpo de la noticia. */
	addSection: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la noticia de la sección.' });

		const input = readSectionInput(form);
		if (!input.kind) return fail(400, { error: 'Falta la clase de la sección.' });
		if (input.body !== undefined && input.body.length === 0 && input.kind !== 'hero') {
			return fail(400, { error: 'La sección necesita al menos un párrafo.' });
		}

		try {
			await serverApi.post<NewsSection>(
				`/api/admin/news/${encodeURIComponent(slug)}/sections`,
				cookies,
				input
			);
			return { success: true, message: 'Sección agregada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear la sección.') });
		}
	},

	/** Edita una sección: campos sueltos o solo `position` para moverla. */
	updateSection: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		const id = Number(String(form.get('id') ?? '').trim());
		if (!slug) return fail(400, { error: 'Falta la noticia de la sección.' });
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Falta la sección a editar.' });
		}

		try {
			await serverApi.patch<NewsSection>(
				`/api/admin/news/${encodeURIComponent(slug)}/sections/${id}`,
				cookies,
				readSectionInput(form)
			);
			return { success: true, message: 'Sección actualizada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar la sección.') });
		}
	},

	/** Borra una sección. La API exige rol admin. */
	deleteSection: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		const id = Number(String(form.get('id') ?? '').trim());
		if (!slug) return fail(400, { error: 'Falta la noticia de la sección.' });
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Falta la sección a borrar.' });
		}

		try {
			await serverApi.delete(
				`/api/admin/news/${encodeURIComponent(slug)}/sections/${id}`,
				cookies
			);
			return { success: true, message: 'Sección eliminada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la sección.') });
		}
	}
};
