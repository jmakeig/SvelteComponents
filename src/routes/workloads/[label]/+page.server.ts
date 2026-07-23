import type { PageServerLoad } from './$types';
import * as api from '$lib/server/api';

export const load = (async ({ parent }) => {
	const { workload } = await parent();
	return {
		history: await api.list_workload_history(workload.workload)
	};
}) satisfies PageServerLoad;
