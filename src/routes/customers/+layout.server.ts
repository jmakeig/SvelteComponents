import type { LayoutServerLoad } from './$types';
import { list_segments } from '$lib/server/api';

export const load = (async () => {
	return {
		segments: await list_segments()
	};
}) satisfies LayoutServerLoad;
