import type { PageServerLoad, Actions } from './$types';
import * as api from '$lib/server/api';
import { fail } from '@sveltejs/kit';
import { Validation } from '$components/FormControl/validation';
import { type Event, type ID } from '$lib/entities';
import { unmarshall } from '../EventForm.svelte';

export const load = (async ({ url }) => {
	// Seed the new event's customer/workload from a query param, e.g. a "Create Event" link
	// from a Customer's or Workload's own page. Invalid/unknown ids are silently ignored —
	// this is just a convenience pre-fill, not something worth failing the page load over.
	const customer_id = url.searchParams.get('customer');
	const workload_id = url.searchParams.get('workload');
	let seed: Partial<Event> = {};
	if (customer_id) {
		const customer = await api.get_customer({ id: customer_id as ID });
		if (customer) seed = { customer };
	} else if (workload_id) {
		const workload = await api.get_workload({ id: workload_id as ID });
		if (workload) seed = { workload };
	}

	return {
		event: null as unknown as ID, // New event: no identifier assigned yet
		outcome: '',
		happened_at: new Date(),
		...seed
	} as Event; // Not really, but a partially filled “template” for an `Event`
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
