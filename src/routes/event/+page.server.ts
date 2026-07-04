import type { PageServerLoad, Actions } from './$types';
import type { ID, Event } from '$lib/entities';
import * as api from '$lib/server/api';

export const load = (async () => {
	const event: Event = {
		event: 'eeee-eeee-eeee-eeee-0001' as ID,
		customer: {
			customer: 'cccc-cccc-ccccc-cccc-0001' as ID,
			label: 'acme_corp',
			name: 'Acme Corp.'
		},
		outcome: 'Some stuff was discussed. Here are next steps.',
		happened_at: new Date()
	};
	console.log((await api.get_events()).length);
	return Promise.resolve(event);
}) satisfies PageServerLoad;

export const actions = {
	new: async ({ request }) => {
		const pending = Object.fromEntries(await request.formData());
		return api.create_event(pending);
	}
} satisfies Actions;
