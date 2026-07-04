import type { Event } from '$lib/entities';
import { is_invalid, Validation, type MaybeInvalid } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';

const events: Array<Event> = [];

const db = {
	async execute<Out>(query: string, input: unknown): Promise<MaybeInvalid<Out>> {
		if (query.toLowerCase().startsWith('insert into event')) {
			const event = Object.assign(input as object, { event: crypto.randomUUID() });
			try {
				events.push(event as Event);
			} catch (db_error) {
				// node-postgres will throw on a things like constraint violation
				const validation = new Validation<Out>();
				validation.add(db_error instanceof Error ? db_error.message : 'db_error');
				return {
					validation,
					input
				};
			}
			return Promise.resolve(event as Out);
		}
		throw new Error(`Not implemented: ${query}`);
	}
};

export async function get_events(): Promise<Array<Event>> {
	return Promise.resolve(events);
}

export async function create_event(pending: unknown): Promise<MaybeInvalid<Event>> {
	const event = validate_event(pending, true);
	if (is_invalid(event)) {
		console.log('is_valid', JSON.stringify(event));
		return Promise.resolve(event);
	}
	return db.execute<Event>('INSERT INTO event', event);
}
