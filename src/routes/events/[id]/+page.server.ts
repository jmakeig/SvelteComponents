import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { ID } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const event = await api.get_event(params.id as ID);
	if (!event) error(404, 'Event not found');
	return { event };
}) satisfies PageServerLoad;

export const actions = {
	edit: async ({ request }) => {
		const pending = Object.fromEntries(await request.formData());
		return api.update_event(pending);
	}
} satisfies Actions;
