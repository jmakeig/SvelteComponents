import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { match_customer_workload } from '$lib/server/api';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	return json(await match_customer_workload(query));
};
