import type { Event, ID, PendingEvent } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';

const events: Array<Event> = [];

const db = {
	// node-postgres will throw on things like a constraint violation; callers must catch.
	async execute<T>(query: string, input: T): Promise<T> {
		if (query.toLowerCase().startsWith('insert into event')) {
			const event = Object.assign(input as object, { event: crypto.randomUUID() as ID }) as T;
			events.push(event as Event);
			return event;
		} else if (query.toLowerCase().startsWith('update event')) {
			const index = events.findIndex((event) => event.event === (input as Event).event);
			if (index > -1) {
				events[index] = input as Event;
				return events[index] as T;
			}
			throw new Error('Event not found');
		}
		throw new Error(`Not implemented: ${query}`);
	}
};

export async function get_events(): Promise<Array<Event>> {
	return Promise.resolve(events);
}

export async function get_event(id: ID): Promise<Event | null> {
	const results = events.filter((event) => id === event.event);
	if (1 === results.length) return results[0];
	return null;
}

export async function create_event(pending: unknown): Promise<Validated<Event, PendingEvent>> {
	const result = validate_event(pending as PendingEvent, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute('INSERT INTO event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

export async function update_event(pending: unknown): Promise<Validated<Event, PendingEvent>> {
	const result = validate_event(pending as PendingEvent, false);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute('UPDATE event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}
