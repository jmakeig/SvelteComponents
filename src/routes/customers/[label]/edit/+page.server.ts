import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as api from '$lib/server/api';

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
		// Delete stays keyed on the true id — the label is only how this page is addressed.
		const customer = await api.get_customer_by_label(params.label);
		if (!customer) error(404, 'Customer not found');
		const validation = await api.delete_customer(customer.customer);
		if (validation?.coded(api.NOT_FOUND)) {
			error(404, validation.first(undefined, api.NOT_FOUND)?.message ?? 'Customer not found');
		}
		redirect(303, '/customers');
	}
} satisfies Actions;
