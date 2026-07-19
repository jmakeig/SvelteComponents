import type { PageServerLoad } from './$types';
import { list_customers } from '$lib/server/api';

export const load = (async () => {
	return {
		customers: await list_customers()
	};
}) satisfies PageServerLoad;
