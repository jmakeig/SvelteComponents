import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
	return { timezone: locals.timezone, locale: locals.locale };
}) satisfies LayoutServerLoad;
