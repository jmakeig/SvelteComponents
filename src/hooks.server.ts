import { dev } from '$app/environment';
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
	const e = error as Error;
	const message = dev ? e.message : 'Unexpected error';
	console.error('Unexpectd server error:', message, error);
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
