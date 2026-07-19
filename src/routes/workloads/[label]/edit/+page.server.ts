import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as api from '$lib/server/api';

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
		// Delete stays keyed on the true id — the label is only how this page is addressed.
		const workload = await api.get_workload({ label: params.label });
		if (!workload) error(404, 'Workload not found');
		const validation = await api.delete_workload(workload.workload);
		if (validation?.coded(api.NOT_FOUND)) {
			error(404, validation.first(undefined, api.NOT_FOUND)?.message ?? 'Workload not found');
		}
		redirect(303, '/workloads');
	}
} satisfies Actions;
