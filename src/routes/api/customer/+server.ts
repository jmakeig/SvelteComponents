import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { match_customer } from '$lib/server/api';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	return json(await match_customer(query));
};
