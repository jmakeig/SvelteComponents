import type { Event, PendingEvent } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';

const events: Array<Event> = [];

const db = {
	async execute<Out, In = unknown>(query: string, input: In): Promise<Validated<Out, In>> {
		if (query.toLowerCase().startsWith('insert into event')) {
			const event = Object.assign(input as object, { event: crypto.randomUUID() });
			const validation = new Validation<Out>();
			try {
				events.push(event as Event);
			} catch (db_error) {
				// node-postgres will throw on a things like constraint violation
				validation.add(db_error instanceof Error ? db_error.message : 'db_error');
			}
			return { data: event as In, validation };
		}
		throw new Error(`Not implemented: ${query}`);
	}
};

export async function get_events(): Promise<Array<Event>> {
	return Promise.resolve(events);
}

export async function create_event(pending: unknown): Promise<Validated<Event, PendingEvent>> {
	const result = validate_event(pending as PendingEvent, true);
	if (result.validation.has()) {
		console.log('is_valid', JSON.stringify(result));
		return result;
	}
	return db.execute('INSERT INTO event', result.data as Event);
}
