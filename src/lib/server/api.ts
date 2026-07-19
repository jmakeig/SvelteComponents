import type { Customer, Event, ID, Segment, Stage, Workload } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_customer, validate_event, validate_workload } from '$lib/entities';
import { db, ConstraintError } from './db';

export const NOT_FOUND = 'not_found';

/** Look up an entity by its true id or by its (mutable) label — exactly one, not both. */
type Lookup = { id: ID; label?: never } | { label: string; id?: never };

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

/**
 * Retrieves the fixed reference collection of `Segment` options (name + value), for populating
 * a `<select>` — not a mutable table, but routed through `db.execute` for consistency with
 * every other read.
 */
export async function list_segments(): Promise<Array<Segment>> {
	return db.execute<Array<Segment>>('select segment', undefined);
}

/**
 * Retrieves an ordered collection of `Customer` instances.
 *
 * @returns A collection of `Customer` instances or an empty `Array`
 */
export async function list_customers(): Promise<Array<Customer>> {
	return db.execute<Array<Customer>>('select customer', undefined);
}

export async function get_customer(lookup: Lookup): Promise<Customer | null> {
	if ('id' in lookup) {
		return db.execute<Customer | null>('select customer where', lookup.id);
	}
	return db.execute<Customer | null>('select customer where label', lookup.label);
}

export async function create_customer(pending: unknown): Promise<Validated<Customer>> {
	const result = validate_customer(pending, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute<Customer>('insert into customer', result.data) };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Customer>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function update_customer(pending: unknown): Promise<Validated<Customer>> {
	const result = validate_customer(pending, false);
	if (result.validation) {
		return result;
	}
	try {
		const updated = await db.execute<Customer | null>('update customer', result.data);
		if (!updated) {
			return {
				data: result.data,
				validation: new Validation<Customer>().add('Customer not found', undefined, NOT_FOUND)
			};
		}
		return { data: updated };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Customer>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function delete_customer(id: ID): Promise<Validation<void> | undefined> {
	const deleted = await db.execute<Customer | null>('delete customer', id);
	if (!deleted) {
		return new Validation<void>().add('Customer not found', undefined, NOT_FOUND);
	}
}

/**
 * Retrieves the fixed reference collection of `Stage` options (name + value), for populating
 * a `<select>` — same role as `list_segments`.
 */
export async function list_stages(): Promise<Array<Stage>> {
	return db.execute<Array<Stage>>('select stage', undefined);
}

/**
 * Retrieves an ordered collection of `Workload` instances.
 *
 * @returns A collection of `Workload` instances or an empty `Array`
 */
export async function list_workloads(): Promise<Array<Workload>> {
	return db.execute<Array<Workload>>('select workload', undefined);
}

export async function get_workload(lookup: Lookup): Promise<Workload | null> {
	if ('id' in lookup) {
		return db.execute<Workload | null>('select workload where', lookup.id);
	}
	return db.execute<Workload | null>('select workload where label', lookup.label);
}

export async function create_workload(pending: unknown): Promise<Validated<Workload>> {
	const result = validate_workload(pending, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute<Workload>('insert into workload', result.data) };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Workload>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function update_workload(pending: unknown): Promise<Validated<Workload>> {
	const result = validate_workload(pending, false);
	if (result.validation) {
		return result;
	}
	try {
		const updated = await db.execute<Workload | null>('update workload', result.data);
		if (!updated) {
			return {
				data: result.data,
				validation: new Validation<Workload>().add('Workload not found', undefined, NOT_FOUND)
			};
		}
		return { data: updated };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: result.data, validation: new Validation<Workload>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function delete_workload(id: ID): Promise<Validation<void> | undefined> {
	const deleted = await db.execute<Workload | null>('delete workload', id);
	if (!deleted) {
		return new Validation<void>().add('Workload not found', undefined, NOT_FOUND);
	}
}

/** Customer-only search, for picking the `customer` a `Workload` belongs to — no type ambiguity to encode, unlike `match_customer_workload`. */
export async function match_customer(input: string) {
	const matches = await db.execute<Array<Customer>>('select customer where like', input);
	return matches.map((customer) => ({
		name: customer.name,
		label: customer.label,
		value: customer.customer
	}));
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
