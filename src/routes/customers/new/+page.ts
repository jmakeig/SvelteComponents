import type { PageLoad } from './$types';
import type { Customer, ID } from '$lib/entities';

export const load = (() => {
	return {
		customer: null as unknown as ID, // New customer: no identifier assigned yet
		name: '',
		label: '',
		segment: null
	} as Customer; // Not really, but a partially filled “template” for a `Customer`
}) satisfies PageLoad;
