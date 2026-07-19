import type { Customer, Event, ID, Workload } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';
import { db, ConstraintError } from './db';

export const NOT_FOUND = 'not_found';

/**
 * Retrieves an ordered collection of `Event` instances.
 *
 * @returns A collection of `Event` instances or an empty `Array`
 */
export async function list_events(): Promise<Array<Event>> {
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
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Event>().add(db_error.message) };
		}
		throw db_error;
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
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Event>().add(db_error.message) };
		}
		throw db_error;
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
		if ('workload' in item) {
			return {
				name: item.name,
				label: item.label,
				value: `workload_${item.workload}`,
				ref: {
					name: item.customer.name ?? '',
					label: item.customer.label,
					value: `customer_${item.customer.customer}`
				}
			};
		}
		return { name: item.name, label: item.label, value: `customer_${item.customer}` };
	});
}
