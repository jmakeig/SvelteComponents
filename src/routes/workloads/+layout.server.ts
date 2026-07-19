import type { LayoutServerLoad } from './$types';
import { list_stages } from '$lib/server/api';

export const load = (async () => {
	return {
		stages: await list_stages()
	};
}) satisfies LayoutServerLoad;
