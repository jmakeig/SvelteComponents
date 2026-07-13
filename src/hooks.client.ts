import { dev } from '$app/environment';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
	const e = error as Error;
	const message = dev ? e.message : 'Unexpected client error';
	console.error(message);
	return {
		message,
		original: dev
			? {
					message: e.message,
					name: e.name,
					stack: e.stack?.split('\n')
				}
			: { message }
	};
};
