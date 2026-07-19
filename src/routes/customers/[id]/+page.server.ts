import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { ID } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const customer = await api.get_customer(params.id as ID);
	if (!customer) error(404, 'Customer not found');
	return { customer };
}) satisfies PageServerLoad;

export const actions = {
	edit: async ({ request }) => {
		const form = await request.formData();
		const result = await api.update_customer(Object.fromEntries(form));
		if (result.validation?.coded(api.NOT_FOUND)) {
			error(
				404,
				result.validation.first(undefined, api.NOT_FOUND)?.message ?? 'Customer not found'
			);
		}
		return result;
	},
	delete: async ({ params }) => {
		const validation = await api.delete_customer(params.id as ID);
		if (validation?.coded(api.NOT_FOUND)) {
			error(404, validation.first(undefined, api.NOT_FOUND)?.message ?? 'Customer not found');
		}
		redirect(303, '/customers');
	}
} satisfies Actions;
