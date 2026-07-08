import type { PageServerLoad, Actions } from './$types';
import * as api from '$lib/server/api';
import { fail } from '@sveltejs/kit';
import { Validation } from '$components/FormControl/validation';
import { type Event } from '$lib/entities';
import { unmarshall } from '../EventForm.svelte';

export const load = (() => {
	return {
		event: null,
		customer_workload: null,
		outcome: null,
		happened_at: new Date()
	};
}) satisfies PageServerLoad;

export const actions = {
	new: async ({ request }) => {
		const form = await request.formData();
		let pending: Record<string, unknown>;
		try {
			pending = unmarshall(form);
		} catch {
			return fail(422, {
				validation: new Validation<Event>().add(
					'Invalid customer or workload',
					'customer_workload'
				),
				data: Object.fromEntries(form)
			});
		}
		return api.create_event(pending);
	}
} satisfies Actions;
