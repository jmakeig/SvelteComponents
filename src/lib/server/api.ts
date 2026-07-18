import type { Customer, Event, ID, Workload } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';
import { db, AssertionError } from './db';

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
		return { data: await db.execute<Event>('update event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

export async function delete_event(id: ID): Promise<Validation<Event> | undefined> {
	try {
		await db.execute<void>('delete event', id);
	} catch (db_error) {
		if (db_error instanceof AssertionError) {
			return new Validation<Event>().add(db_error.message);
		}
		throw db_error;
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
