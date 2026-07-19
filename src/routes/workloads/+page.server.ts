import type { PageServerLoad } from './$types';
import { list_workloads } from '$lib/server/api';

export const load = (async () => {
	return {
		workloads: await list_workloads()
	};
}) satisfies PageServerLoad;
