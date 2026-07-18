import type { Customer, Event, ID, Workload } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';
import { db } from './db';

export const NOT_FOUND = 'not_found';

export async function get_events(): Promise<Array<Event>> {
	return db.execute<Array<Event>>('select event', undefined);
}

export async function get_event(id: ID): Promise<Event | null> {
	return db.execute<Event | null>('select event where', id);
}

export async function create_event(pending: unknown): Promise<Validated<Event>> {
	const result = validate_event(pending, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute<Event>('insert into event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

export async function update_event(pending: unknown): Promise<Validated<Event>> {
	const result = validate_event(pending, false);
	if (result.validation) {
		return result;
	}
	try {
		const updated = await db.execute<Event | null>('update event', result.data);
		if (!updated) {
			return {
				data: result.data,
				validation: new Validation<Event>().add('Event not found', undefined, NOT_FOUND)
			};
		}
		return { data: updated };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

export async function delete_event(id: ID): Promise<Validation<void> | undefined> {
	const deleted = await db.execute<Event | null>('delete event', id);
	if (!deleted) {
		return new Validation<void>().add('Event not found', undefined, NOT_FOUND);
	}
}

export async function match_customer_workload(input: string) {
	const matches = await db.execute<Array<Customer | Workload>>(
		'select customer_workload where like',
		input
	);
	return matches.map((item) => {
		const value = 'customer' in item ? `customer_${item.customer}` : `workload_${item.workload}`;
		return { name: item.name, label: item.label, value };
	});
}
