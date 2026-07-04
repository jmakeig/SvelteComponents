import { is_invalid, Validation, type MaybeInvalid } from '$components/FormControl/validation';
import type { Customer, Event, ID } from '$lib/entities';

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

function validate_event(pending: unknown, is_new: boolean = false): MaybeInvalid<Event> {
	const validation = new Validation<Event>();
	// @ts-expect-error Clever or evil?
	const event: Event = {};
	if (undefined === pending || null === pending || 'object' !== typeof pending) {
		validation.add('Event must exist');
	} else {
		if (is_new) {
			//
		} else {
			if ('event' in pending && 'string' === typeof pending.event) {
				event.event = pending.event as ID;
			} else {
				validation.add('Unknown event', 'event');
			}
			if ('happened_at' in pending) {
				if (pending.happened_at instanceof Date) event.happened_at;
				else if ('string' === typeof pending.happened_at) {
					event.happened_at = new Date(Date.parse(pending.happened_at));
				} else {
					validation.add('Invalid date', 'happened_at');
				}
			} else {
				validation.add('Date required', 'happened_at');
			}
		}
		if ('outcome' in pending && 'string' === typeof pending.outcome) {
			if (pending.outcome.trim().length < 3) {
				validation.add('Outcome must be at least 3 characters', 'outcome');
			} else {
				event.outcome = pending.outcome.trim();
			}
		}
	}
	console.log('validate_event', pending, event, validation.length);
	if (validation.has()) {
		return {
			validation,
			input: pending
		};
	}
	return event;
}
