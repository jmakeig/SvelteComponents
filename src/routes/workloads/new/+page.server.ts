import type { Actions } from './$types';
import * as api from '$lib/server/api';

export const actions = {
	new: async ({ request }) => {
		const form = await request.formData();
		return api.create_workload(Object.fromEntries(form));
	}
} satisfies Actions;
