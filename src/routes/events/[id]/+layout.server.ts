import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { ID } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const event = await api.get_event(params.id as ID);
	if (!event) error(404, 'Event not found');
	return { event };
}) satisfies LayoutServerLoad;
