import type { PageServerLoad } from './$types';
import { list_events } from '$lib/server/api';

export const load = (async () => {
	return {
		events: await list_events()
	};
}) satisfies PageServerLoad;
