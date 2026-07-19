import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { ID } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const workload = await api.get_workload(params.id as ID);
	if (!workload) error(404, 'Workload not found');
	return { workload };
}) satisfies PageServerLoad;

export const actions = {
	edit: async ({ request }) => {
		const form = await request.formData();
		const result = await api.update_workload(Object.fromEntries(form));
		if (result.validation?.coded(api.NOT_FOUND)) {
			error(
				404,
				result.validation.first(undefined, api.NOT_FOUND)?.message ?? 'Workload not found'
			);
		}
		return result;
	},
	delete: async ({ params }) => {
		const validation = await api.delete_workload(params.id as ID);
		if (validation?.coded(api.NOT_FOUND)) {
			error(404, validation.first(undefined, api.NOT_FOUND)?.message ?? 'Workload not found');
		}
		redirect(303, '/workloads');
	}
} satisfies Actions;
