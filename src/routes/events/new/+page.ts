import type { PageLoad } from './$types';
import type { Event, ID } from '$lib/entities';

export const load = (() => {
	return {
		event: null as unknown as ID, // New event: no identifier assigned yet
		outcome: '',
		happened_at: new Date()
		// `customer` and `workload` properties are not set yet
	} as Event; // Not really, but a partially filled “template” for an `Event`
}) satisfies PageLoad;
