import type { PageServerLoad, Actions } from './$types';
import * as api from '$lib/server/api';

export const actions = {
	new: async ({ request }) => {
		const pending = Object.fromEntries(await request.formData());
		return api.create_event(pending);
	}
} satisfies Actions;
