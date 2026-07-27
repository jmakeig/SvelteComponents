import { dev } from '$app/environment';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { is_valid_timezone, parse_accept_language } from '$lib/datetime';

export const handle: Handle = ({ event, resolve }) => {
	const timezone = event.cookies.get('timezone');
	event.locals.timezone = timezone && is_valid_timezone(timezone) ? timezone : 'UTC';
	event.locals.locale = parse_accept_language(event.request.headers.get('accept-language'));
	return resolve(event);
};

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
