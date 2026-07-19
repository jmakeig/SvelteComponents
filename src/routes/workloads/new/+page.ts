import type { PageLoad } from './$types';
import type { Workload, ID } from '$lib/entities';

export const load = (() => {
	return {
		workload: null as unknown as ID, // New workload: no identifier assigned yet
		name: '',
		label: '',
		size: null,
		stage: null
		// `customer` is not set yet
	} as Workload; // Not really, but a partially filled “template” for a `Workload`
}) satisfies PageLoad;
