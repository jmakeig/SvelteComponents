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
		const result = await api.update_event(pending);
		if (result.validation?.coded(api.NOT_FOUND)) {
			error(404, result.validation.first(undefined, api.NOT_FOUND)?.message ?? 'Event not found');
		}
		return result;
	},
	delete: async ({ params }) => {
		const validation = await api.delete_event(params.id as ID);
		if (validation?.coded(api.NOT_FOUND)) {
			error(404, validation.first(undefined, api.NOT_FOUND)?.message ?? 'Event not found');
		}
		redirect(303, '/events');
	}
} satisfies Actions;
