import type {
	Customer,
	Event,
	ID,
	Segment,
	Stage,
	Workload,
	WorkloadHistoryEntry
} from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import {
	validate_customer,
	validate_event,
	validate_workload,
	validate_workload_snapshot
} from '$lib/entities';
import { create_connection, ConstraintError, revive_happened_at } from './db';
import ufuzzy from '@leeoniya/ufuzzy';

const db = create_connection();

export const NOT_FOUND = 'not_found';

/** Look up an entity by its true id or by its (mutable) label — exactly one, not both. */
type Lookup = { id: ID; label?: never } | { label: string; id?: never };

/** Only needs `name` to match against — kept generic so callers can pass partial rows
 *  (e.g. without `segment`) without lying to the type checker that they're a full `Customer`. */
function _search<T extends { name: string }>(list: Array<T>, input: string, limit = 10): Array<T> {
	if ('' === input) return [];

	const options: ufuzzy.Options = { intraMode: 1 };
	const fuzzy = new ufuzzy(options);
	const haystack = list.map((item) => item.name);

	const indexes = fuzzy.filter(haystack, input);
	if (null === indexes) return [];
	const info = fuzzy.info(indexes, haystack, input);
	const order = fuzzy.sort(info, haystack, input);

	// YIKES! This two-level indirection was not at all obvious
	return order
		.map((o) => info.idx[o])
		.map((i) => list[i])
		.slice(0, limit);
}

/**
 * Shapes one `events` row (aliased `e`, joined against `c`/`w`/`st` for `customers`/
 * `workloads_base`/`stages`) as an `Event` — customer XOR workload branch, with `size`/`stage`
 * keys present only when the underlying column is non-null (absence, not `null`, is how the
 * schema's own CHECK constraints represent "this event didn't touch that field"; see the
 * `events` table comment in db/schema.sql). Reused for insert/update/delete `RETURNING` via
 * `.replaceAll('e.', ...)` so a write's response matches what a subsequent read of the same
 * row would show, rather than echoing back the raw input.
 */
const EVENT_SHAPE_SQL = `jsonb_build_object('event', e.event, 'outcome', e.outcome, 'happened_at', e.happened_at)
	|| CASE WHEN e.customer IS NOT NULL THEN
	     jsonb_build_object('customer', jsonb_build_object('customer', c.customer, 'name', c.name, 'label', c.label))
	   ELSE
	     jsonb_build_object('workload', jsonb_build_object('workload', w.workload, 'name', w.name, 'label', w.label))
	     || CASE WHEN e.workload_size IS NOT NULL THEN jsonb_build_object('size', e.workload_size) ELSE '{}'::jsonb END
	     || CASE WHEN e.workload_stage IS NOT NULL
	          THEN jsonb_build_object('stage', jsonb_build_object('name', st.name, 'value', e.workload_stage))
	          ELSE '{}'::jsonb END
	   END`;

/** Shapes one `workloads` (or `workloads_base` joined the same way) row `w` as a `Workload`. */
const WORKLOAD_SHAPE_SQL = `jsonb_build_object(
	   'workload', w.workload, 'label', w.label, 'name', w.name,
	   'customer', jsonb_build_object('customer', c.customer, 'name', c.name, 'label', c.label),
	   'size', w.size,
	   'stage', CASE WHEN w.stage IS NULL THEN NULL
	                 ELSE jsonb_build_object('name', st.name, 'value', w.stage) END
	 )`;

/** Shared by `create_event` and `create_workload`'s implicit "Initial creation" event. */
async function insert_event(pending: Event): Promise<Event> {
	// event is a generated column: the caller may never set it directly.
	if (pending.event) {
		throw new ConstraintError('Cannot set id when creating a new event');
	}
	const result = await db.query<{ event: Event }>(
		`WITH inserted AS (
		   INSERT INTO events (outcome, happened_at, customer, workload, workload_size, workload_stage)
		   VALUES ($1, $2, $3, $4, $5, $6)
		   RETURNING event, outcome, happened_at, customer, workload, workload_size, workload_stage,
		             recorded_at
		 )
		 SELECT ${EVENT_SHAPE_SQL.replaceAll('e.', 'i.')} AS event
		 FROM inserted i
		 LEFT JOIN customers c ON c.customer = i.customer
		 LEFT JOIN workloads_base w ON w.workload = i.workload
		 LEFT JOIN stages st ON st.stage = i.workload_stage`,
		[
			pending.outcome,
			pending.happened_at,
			pending.customer?.customer ?? null,
			pending.workload?.workload ?? null,
			'workload' in pending && 'size' in pending ? pending.size : null,
			'workload' in pending && 'stage' in pending ? (pending.stage?.value ?? null) : null
		]
	);
	// 23503 (bad customer/workload/stage ref) / 23514 (XOR / null-implies-null checks)
	// -> ConstraintError via connection.ts. No recompute call needed — the `workloads`
	// view derives current size/stage live on every read.
	return revive_happened_at(result.rows[0].event);
}

/**
 * Retrieves an ordered collection of `Event` instances.
 *
 * @returns A collection of `Event` instances or an empty `Array`
 */
export async function list_events(): Promise<Array<Event>> {
	const result = await db.readonly<{ events: Array<Event> }>(
		`SELECT COALESCE(jsonb_agg(payload ORDER BY happened_at DESC, recorded_at DESC), '[]'::jsonb) AS events
		 FROM (
		   SELECT e.happened_at, e.recorded_at, ${EVENT_SHAPE_SQL} AS payload
		   FROM events e
		   LEFT JOIN customers c ON c.customer = e.customer
		   LEFT JOIN workloads_base w ON w.workload = e.workload
		   LEFT JOIN stages st ON st.stage = e.workload_stage
		 ) x`
	);
	return result.rows[0].events.map(revive_happened_at);
}

export async function get_event(id: ID): Promise<Event | null> {
	const result = await db.readonly<{ event: Event }>(
		`SELECT ${EVENT_SHAPE_SQL} AS event
		 FROM events e
		 LEFT JOIN customers c ON c.customer = e.customer
		 LEFT JOIN workloads_base w ON w.workload = e.workload
		 LEFT JOIN stages st ON st.stage = e.workload_stage
		 WHERE e.event = $1`,
		[id]
	);
	return result.rows[0] ? revive_happened_at(result.rows[0].event) : null;
}

export async function create_event(pending: unknown): Promise<Validated<Event>> {
	const result = validate_event(pending, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await insert_event(result.data) };
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
	const event = result.data;
	try {
		const updated = await db.query<{ event: Event }>(
			`WITH updated AS (
			   UPDATE events SET outcome = $2, happened_at = $3, customer = $4, workload = $5,
			          workload_size = $6, workload_stage = $7
			   WHERE event = $1
			   RETURNING event, outcome, happened_at, customer, workload, workload_size, workload_stage,
			             recorded_at
			 )
			 SELECT ${EVENT_SHAPE_SQL.replaceAll('e.', 'u.')} AS event
			 FROM updated u
			 LEFT JOIN customers c ON c.customer = u.customer
			 LEFT JOIN workloads_base w ON w.workload = u.workload
			 LEFT JOIN stages st ON st.stage = u.workload_stage`,
			[
				event.event,
				event.outcome,
				event.happened_at,
				event.customer?.customer ?? null,
				event.workload?.workload ?? null,
				'workload' in event && 'size' in event ? event.size : null,
				'workload' in event && 'stage' in event ? (event.stage?.value ?? null) : null
			]
		);
		// UPDATE ... RETURNING event: an empty result means nothing matched. Re-pointing an
		// event onto/off of a workload (or shifting happened_at) needs no manual recompute —
		// the `workloads` view re-derives both the old and new workload's size/stage live.
		if (!updated.rows[0]) {
			return {
				data: event,
				validation: new Validation<Event>().add('Event not found', undefined, NOT_FOUND)
			};
		}
		return { data: revive_happened_at(updated.rows[0].event) };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: event, validation: new Validation<Event>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function delete_event(id: ID): Promise<Validation<void> | undefined> {
	const result = await db.query<{ event: Event }>(
		`WITH deleted AS (
		   DELETE FROM events WHERE event = $1
		   RETURNING event, outcome, happened_at, customer, workload, workload_size, workload_stage,
		             recorded_at
		 )
		 SELECT ${EVENT_SHAPE_SQL.replaceAll('e.', 'd.')} AS event
		 FROM deleted d
		 LEFT JOIN customers c ON c.customer = d.customer
		 LEFT JOIN workloads_base w ON w.workload = d.workload
		 LEFT JOIN stages st ON st.stage = d.workload_stage`,
		[id]
	);
	// DELETE ... RETURNING event: an empty result means nothing matched. The affected
	// workload's size/stage falls back to its next most-recent event automatically —
	// same "no manual recompute" reasoning as insert/update above.
	if (!result.rows[0]) {
		return new Validation<void>().add('Event not found', undefined, NOT_FOUND);
	}
}

/**
 * Retrieves the fixed reference collection of `Segment` options (name + value), for populating
 * a `<select>`.
 */
export async function list_segments(): Promise<Array<Segment>> {
	const result = await db.readonly<{ segments: Array<Segment> }>(
		`SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'value', segment) ORDER BY ordinal), '[]'::jsonb) AS segments
		 FROM segments`
	);
	return result.rows[0].segments;
}

/**
 * Retrieves an ordered collection of `Customer` instances.
 *
 * @returns A collection of `Customer` instances or an empty `Array`
 */
export async function list_customers(): Promise<Array<Customer>> {
	const result = await db.readonly<{ customers: Array<Customer> }>(
		`SELECT COALESCE(jsonb_agg(
		   jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment)
		   ORDER BY name
		 ), '[]'::jsonb) AS customers
		 FROM customers`
	);
	return result.rows[0].customers;
}

export async function get_customer(lookup: Lookup): Promise<Customer | null> {
	const result =
		'id' in lookup
			? await db.readonly<{ customer: Customer }>(
					`SELECT jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment) AS customer
					 FROM customers WHERE customer = $1`,
					[lookup.id]
				)
			: await db.readonly<{ customer: Customer }>(
					`SELECT jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment) AS customer
					 FROM customers WHERE label = $1`,
					[lookup.label]
				);
	return result.rows[0]?.customer ?? null;
}

export async function create_customer(pending: unknown): Promise<Validated<Customer>> {
	const result = validate_customer(pending, true);
	if (result.validation) {
		return result;
	}
	const customer = result.data;
	try {
		// customer is a generated column: the caller may never set it directly. Structurally
		// unreachable now that the INSERT below never lists the column, but cheap insurance
		// against a future caller mistake.
		if (customer.customer) {
			throw new ConstraintError('Cannot set id when creating a new customer');
		}
		const inserted = await db.query<{ customer: Customer }>(
			`INSERT INTO customers (label, name, segment) VALUES ($1, $2, $3)
			 RETURNING jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment) AS customer`,
			[customer.label, customer.name, customer.segment]
		);
		// 23505 (dup label) / 23503 (bad segment ref) surface as ConstraintError via connection.ts.
		return { data: inserted.rows[0].customer };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: customer, validation: new Validation<Customer>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function update_customer(pending: unknown): Promise<Validated<Customer>> {
	const result = validate_customer(pending, false);
	if (result.validation) {
		return result;
	}
	const customer = result.data;
	try {
		const updated = await db.query<{ customer: Customer }>(
			`UPDATE customers SET label = $2, name = $3, segment = $4 WHERE customer = $1
			 RETURNING jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment) AS customer`,
			[customer.customer, customer.label, customer.name, customer.segment]
		);
		// UPDATE ... RETURNING customer: an empty result means nothing matched.
		if (!updated.rows[0]) {
			return {
				data: customer,
				validation: new Validation<Customer>().add('Customer not found', undefined, NOT_FOUND)
			};
		}
		return { data: updated.rows[0].customer };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: customer, validation: new Validation<Customer>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function delete_customer(id: ID): Promise<Validation<void> | undefined> {
	try {
		const result = await db.query<{ customer: Customer }>(
			`DELETE FROM customers WHERE customer = $1
			 RETURNING jsonb_build_object('customer', customer, 'label', label, 'name', name, 'segment', segment) AS customer`,
			[id]
		);
		// DELETE ... RETURNING customer: an empty result means nothing matched. A customer
		// that still has workloads/events now correctly throws (23503, FK RESTRICT) ->
		// ConstraintError.
		if (!result.rows[0]) {
			return new Validation<void>().add('Customer not found', undefined, NOT_FOUND);
		}
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return new Validation<Customer>().add(db_error.message);
		}
		throw db_error;
	}
}

/**
 * Retrieves the fixed reference collection of `Stage` options (name + value), for populating
 * a `<select>` — same role as `list_segments`.
 */
export async function list_stages(): Promise<Array<Stage>> {
	const result = await db.readonly<{ stages: Array<Stage> }>(
		`SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'value', stage) ORDER BY stage), '[]'::jsonb) AS stages
		 FROM stages`
	);
	return result.rows[0].stages;
}

/**
 * Retrieves an ordered collection of `Workload` instances.
 *
 * @returns A collection of `Workload` instances or an empty `Array`
 */
export async function list_workloads(): Promise<Array<Workload>> {
	const result = await db.readonly<{ workloads: Array<Workload> }>(
		`SELECT COALESCE(jsonb_agg(${WORKLOAD_SHAPE_SQL} ORDER BY w.name), '[]'::jsonb) AS workloads
		 FROM workloads w
		 JOIN customers c ON c.customer = w.customer
		 LEFT JOIN stages st ON st.stage = w.stage`
	);
	return result.rows[0].workloads;
}

export async function get_workload(lookup: Lookup): Promise<Workload | null> {
	const result =
		'id' in lookup
			? await db.readonly<{ workload: Workload }>(
					`SELECT ${WORKLOAD_SHAPE_SQL} AS workload
					 FROM workloads w
					 JOIN customers c ON c.customer = w.customer
					 LEFT JOIN stages st ON st.stage = w.stage
					 WHERE w.workload = $1`,
					[lookup.id]
				)
			: await db.readonly<{ workload: Workload }>(
					`SELECT ${WORKLOAD_SHAPE_SQL} AS workload
					 FROM workloads w
					 JOIN customers c ON c.customer = w.customer
					 LEFT JOIN stages st ON st.stage = w.stage
					 WHERE w.label = $1`,
					[lookup.label]
				);
	return result.rows[0]?.workload ?? null;
}

export async function create_workload(pending: unknown): Promise<Validated<Workload>> {
	const result = validate_workload(pending, true);
	// Size/stage aren't part of the Workload row (see `validate_workload`) — they're validated
	// separately here so an initial value can seed the implicit "Initial creation" event below,
	// keeping "size/stage only change via events" true even at creation time.
	const snapshot = validate_workload_snapshot(pending);
	if (result.validation || snapshot.validation) {
		const validation = new Validation<Workload>();
		if (result.validation) validation.merge(result.validation);
		if (snapshot.validation) {
			validation.merge(snapshot.validation);
		}
		return { data: pending, validation };
	}
	const new_workload = result.data;
	try {
		// workload is a generated column: the caller may never set it directly. Structurally
		// unreachable now that the INSERT below never lists the column, but cheap insurance
		// against a future caller mistake.
		if (new_workload.workload) {
			throw new ConstraintError('Cannot set id when creating a new workload');
		}
		const inserted = await db.query<{ workload: Workload }>(
			`WITH inserted AS (
			   INSERT INTO workloads_base (label, name, customer) VALUES ($1, $2, $3)
			   RETURNING workload, label, name, customer
			 )
			 SELECT jsonb_build_object(
			   'workload', i.workload, 'label', i.label, 'name', i.name,
			   'customer', jsonb_build_object('customer', c.customer, 'name', c.name, 'label', c.label),
			   'size', NULL::int, 'stage', NULL::jsonb
			 ) AS workload
			 FROM inserted i JOIN customers c ON c.customer = i.customer`,
			[new_workload.label, new_workload.name, new_workload.customer.customer]
		);
		// 23503 (bad customer ref) / 23505 (dup label) -> ConstraintError via connection.ts.
		const workload = inserted.rows[0].workload;
		if (null !== snapshot.data.size || null !== snapshot.data.stage) {
			// Same "clever or evil" construction pattern as `validate_event`: `event` is a
			// generated column, so `null` stands in for "not yet assigned" ahead of the insert.
			// @ts-expect-error See entities.ts's validate_event for the same trick.
			const seed: Event = {};
			seed.event = null as unknown as ID;
			// @ts-expect-error Pending ref (just an id, no name/label yet) — same escape hatch
			// `Ref`'s own doc comment calls out for `validate_event`'s `Ref` construction.
			seed.workload = { workload: workload.workload };
			seed.outcome = 'Initial creation';
			seed.happened_at = new Date();
			seed.size = snapshot.data.size;
			seed.stage = snapshot.data.stage;
			await insert_event(seed);
			// `workload` is a fresh row from the insert above, so it doesn't reflect the seed
			// event just inserted — merge what was just written directly rather than
			// round-tripping another query for it.
			workload.size = snapshot.data.size;
			workload.stage = snapshot.data.stage;
		}
		return { data: workload };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: pending, validation: new Validation<Workload>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function update_workload(pending: unknown): Promise<Validated<Workload>> {
	const result = validate_workload(pending, false);
	if (result.validation) {
		return result;
	}
	const patch = result.data;
	try {
		const updated = await db.query<{ workload: Workload }>(
			`WITH updated AS (
			   UPDATE workloads_base SET label = $2, name = $3, customer = $4 WHERE workload = $1
			   RETURNING workload
			 )
			 SELECT ${WORKLOAD_SHAPE_SQL} AS workload
			 FROM updated u
			 JOIN workloads w ON w.workload = u.workload
			 JOIN customers c ON c.customer = w.customer
			 LEFT JOIN stages st ON st.stage = w.stage`,
			[patch.workload, patch.label, patch.name, patch.customer.customer]
		);
		// UPDATE ... RETURNING workload: an empty result means nothing matched.
		if (!updated.rows[0]) {
			return {
				data: patch,
				validation: new Validation<Workload>().add('Workload not found', undefined, NOT_FOUND)
			};
		}
		return { data: updated.rows[0].workload };
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return { data: patch, validation: new Validation<Workload>().add(db_error.message) };
		}
		throw db_error;
	}
}

export async function delete_workload(id: ID): Promise<Validation<void> | undefined> {
	try {
		const result = await db.query<{ workload: Workload }>(
			`DELETE FROM workloads_base WHERE workload = $1
			 RETURNING jsonb_build_object('workload', workload, 'label', label, 'name', name) AS workload`,
			[id]
		);
		// DELETE ... RETURNING workload: an empty result means nothing matched. A workload
		// that still has events now correctly throws (23503, FK RESTRICT) -> ConstraintError,
		// same category of behavior change as customer delete.
		if (!result.rows[0]) {
			return new Validation<void>().add('Workload not found', undefined, NOT_FOUND);
		}
	} catch (db_error) {
		if (db_error instanceof ConstraintError) {
			return new Validation<void>().add(db_error.message);
		}
		throw db_error;
	}
}

/**
 * Retrieves a `Workload`'s append-only size/stage update history, reverse chronological
 * (most-recent first) — the same events that `Workload.size`/`.stage` are themselves derived
 * from. Read-only: entries can only be added by creating (or edited/removed by editing/deleting)
 * a `WorkloadEvent`, never written directly.
 */
export async function list_workload_history(id: ID): Promise<Array<WorkloadHistoryEntry>> {
	const result = await db.readonly<{ history: Array<WorkloadHistoryEntry> }>(
		`SELECT COALESCE(jsonb_agg(
		   jsonb_build_object('event', e.event, 'happened_at', e.happened_at)
		   || CASE WHEN e.workload_size IS NOT NULL
		        THEN jsonb_build_object('size', e.workload_size) ELSE '{}'::jsonb END
		   || CASE WHEN e.workload_stage IS NOT NULL
		        THEN jsonb_build_object('stage', jsonb_build_object('name', st.name, 'value', e.workload_stage))
		        ELSE '{}'::jsonb END
		   ORDER BY e.happened_at DESC, e.recorded_at DESC
		 ), '[]'::jsonb) AS history
		 FROM events e
		 LEFT JOIN stages st ON st.stage = e.workload_stage
		 WHERE e.workload = $1 AND (e.workload_size IS NOT NULL OR e.workload_stage IS NOT NULL)`,
		[id]
	);
	return result.rows[0].history.map(revive_happened_at);
}

/** Customer-only search, for picking the `customer` a `Workload` belongs to — no type ambiguity to encode, unlike `match_customer_workload`. */
export async function match_customer(input: string) {
	const result = await db.readonly<{ customer: ID; label: string; name: string }>(
		'SELECT customer, label, name FROM customers'
	);
	const matches = _search(result.rows, input);
	return matches.map((customer) => ({
		name: customer.name,
		label: customer.label,
		value: customer.customer
	}));
}

export async function match_customer_workload(input: string) {
	// Candidates fetched from Postgres; the actual typo-tolerant matching still runs in
	// Node via `_search()`.
	const customers_result = await db.readonly<{ customer: ID; label: string; name: string }>(
		'SELECT customer, label, name FROM customers'
	);
	const workloads_result = await db.readonly<{
		workload: ID;
		label: string;
		name: string;
		customer: ID;
		customer_name: string;
		customer_label: string;
	}>(
		`SELECT w.workload, w.label, w.name, c.customer, c.name AS customer_name, c.label AS customer_label
		 FROM workloads_base w JOIN customers c ON c.customer = w.customer`
	);
	const candidates = [
		...customers_result.rows,
		...workloads_result.rows.map((row) => ({
			workload: row.workload,
			label: row.label,
			name: row.name,
			customer: { customer: row.customer, name: row.customer_name, label: row.customer_label }
		}))
	];
	const matches = _search(candidates, input);
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
