import type { PageServerLoad, Actions } from './$types';
import * as api from '$lib/server/api';
import { fail } from '@sveltejs/kit';
import { Validation } from '$components/FormControl/validation';
import { parse_date_local } from '$lib/entities';

export const load = (() => {
	return {
		customer_workload: null,
		outcome: null,
		happened_at: new Date()
	};
}) satisfies PageServerLoad;

export const actions = {
	new: async ({ request }) => {
		// const pending = Object.fromEntries(await request.formData());
		const form = await request.formData();
		const customer_workload = form.get('customer_workload') as string | null;
		let pair = {};
		if (customer_workload) {
			if (!/^(customer|workload)_[a-z0-9\-]+$/.test(customer_workload)) {
				return fail(422, {
					validation: new Validation().add('Invalid customer or workload', 'customer_workload'),
					data: Object.fromEntries(form)
				});
			}
			const [type, entity] = customer_workload!.split('_');
			pair = { [type]: entity };
		}

		return api.create_event({
			...pair,
			outcome: form.get('outcome'),
			happened_at: parse_date_local(form.get('happened_at') as string | null)
		});
	}
} satisfies Actions;
