import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import * as api from '$lib/server/api';

export const load = (async ({ params }) => {
	const customer = await api.get_customer({ label: params.label });
	if (!customer) error(404, 'Customer not found');
	return { customer };
}) satisfies LayoutServerLoad;
