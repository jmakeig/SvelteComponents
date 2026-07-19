import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const workload = await api.get_workload_by_label(params.label);
	if (!workload) error(404, 'Workload not found');
	return { workload };
}) satisfies LayoutServerLoad;
