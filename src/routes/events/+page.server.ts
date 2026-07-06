import type { PageServerLoad } from './$types';
import { get_events } from '$lib/server/api';

export const load = (async () => {
	return {
		events: await get_events()
	};
}) satisfies PageServerLoad;
