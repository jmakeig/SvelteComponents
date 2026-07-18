import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { ID, Event } from '$lib/entities';
import * as api from '$lib/server/api';
import { Validation } from '$components/FormControl/validation';
import { unmarshall } from '../EventForm.svelte';

export const load = (async ({ params }) => {
	const event = await api.get_event(params.id as ID);
	if (!event) error(404, 'Event not found');
	return { event };
}) satisfies PageServerLoad;

export const actions = {
	edit: async ({ request }) => {
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
		return api.update_event(pending);
	},
	delete: async ({ params }) => {
		const validation = await api.delete_event(params.id as ID);
		if (validation) {
			error(404, validation.first()?.message ?? 'Event not found');
		}
		redirect(303, '/events');
	}
} satisfies Actions;
