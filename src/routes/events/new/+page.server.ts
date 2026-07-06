import type { PageServerLoad, Actions } from './$types';
import type { PendingEvent } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (() => {
	return {
		happened_at: new Date()
	};
}) satisfies PageServerLoad;

export const actions = {
	new: async ({ request }) => {
		const pending = Object.fromEntries(await request.formData());
		return api.create_event(pending);
	}
} satisfies Actions;
