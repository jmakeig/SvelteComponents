import { Validation, type Validated } from '$components/FormControl/validation';

type Optional<T> = T | null;
type Pending<T> = Optional<T | string>;

declare const __id: unique symbol;
/** UUID v4 string type */
type UUID = `${string}-${string}-${string}-${string}-${string}`;
/**
 * Synthetic identifier branded UUID `string` type.
 * @usage ```
 *   '6b47e099-e412-4de5-a2c2-af570a5131a0' as ID
 * ```
 */
export type ID = UUID & { readonly [__id]: true };

// type Entities = 'customer' | 'workload' | 'event';

/**
 * The basics that every entity needs to support. Specifically,
 *   * Identity: Synthentic immutable key, here implemented as UUID v4
 *   * Addressibility: Human-readable and -settable label that can be used in URLs
 *   * Colloquial name
 * @template Name The name of the entity type, e.g. `'customer'`.
 *   This defines the property under which its unique indentier is available.
 */
type Entity<Name extends string> = {
	/** Identifiers use the entity’s name, e.g. `customer` vs. the generic `id`.  */
	readonly [P in Name]: ID;
} & {
	/**
	 * Human-readable and URL friendly unique identifier. While uniuqe like idnetifiers,
	 * labels are mutable. A good default implementation is a slug transformation of the `name`.
	 */
	label: string;
	/**
	 * What the user would colloqially refer to the entity as. Unlike `ID` or `label`,
	 * names are _not_ unique.
	 */
	name: string;
};

/**
 * A reference to another entity, e.g. `Event.customer`. Structurally identical to `Entity<Name>` —
 * the name exists to communicate role (a reference, not the entity itself) even though there's
 * currently no structural difference. `name`/`label` are required, matching a genuinely resolved
 * reference. A pending, not-yet-resolved reference (just an id) is intentionally not representable
 * here; `validate_event` builds one anyway, using the same escape hatch as its `Event` construction.
 */
type Ref<Name extends string> = Entity<Name>;

export type Segment = 'select' | 'enterprise' | 'corporate' | 'smb';

export type Customer = Entity<'customer'> & { segment: Optional<Segment> };

export type Workload = Entity<'workload'> & { customer: Ref<'customer'>; size: Optional<number> };

type BaseEvent = {
	event: ID;
	outcome: string;
	happened_at: Date;
};
type CustomerEvent = BaseEvent & {
	customer: Ref<'customer'>;
	workload?: never;
};
type WorkloadEvent = BaseEvent & {
	workload: Ref<'workload'>;
	customer?: never;
};
export type Event = CustomerEvent | WorkloadEvent;

/**
 * TODO: Oof. This will be different on the client and the server because of locales.
 *
 * @param iso_date
 * @returns `Date` or `new Date(NaN)` for invalid dates
 */
export function parse_date_local(iso_date: string | null): Date {
	if (null === iso_date) return new Date(NaN);
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(iso_date)) {
		return new Date(NaN);
	}
	const [year, month, day] = iso_date.split('-').map((part) => parseInt(part, 10));
	const local = new Date(year, month - 1, day);

	if (isNaN(local.getTime())) {
		return new Date(NaN);
	}

	return local;
}

/**
 * Strict structural and value type and existence validation.
 * This doesn’t check contraints like uniqueness or referential integrity.
 * Those need to happen closer to the database.
 *
 * @param pending Something with and `Event`-like shape
 * @param is_new Optional flag to specify whether the intent is to validate a new entry, which will have a `null` `event` identifier
 * @returns A strongly typed `Event` instance or the original `pending` inupt and the `Validation<Event>` instance
 */
export function validate_event(pending: unknown, is_new: boolean = false): Validated<Event> {
	const validation = new Validation<Event>();
	// @ts-expect-error Clever or evil?
	const event: Event = {};
	if (undefined === pending || null === pending || 'object' !== typeof pending) {
		validation.add('Event must exist');
	} else {
		const p = pending as Record<string, unknown>;
		if ('event' in p && 'string' === typeof p.event && '' !== p.event) {
			event.event = p.event as ID;
		} else if (!is_new) {
			validation.add('Unknown event', 'event');
		} else {
			// Careful! Whether the server accepts a client-supplied id is a constraint
			// enforced at the db layer, not a shape-validation concern.
			event.event = null as unknown as ID;
		}
		if ('customer' in p || 'workload' in p) {
			if ('customer' in p && 'string' === typeof p.customer && !('workload' in p)) {
				// @ts-expect-error Resolved (name/label filled in) downstream, in db.ts's resolve_event_refs.
				event.customer = {
					customer: p.customer as ID
				};
			} else if ('workload' in p && 'string' === typeof p.workload && !('customer' in p)) {
				// @ts-expect-error Resolved (name/label filled in) downstream, in db.ts's resolve_event_refs.
				event.workload = {
					workload: p.workload as ID
				};
			} else {
				validation.add('Invalid customer or workload', 'customer_workload');
			}
		} else {
			validation.add('Customer or workload is required', 'customer_workload');
		}
		if ('happened_at' in p) {
			if (p.happened_at instanceof Date) event.happened_at = p.happened_at;
			else if ('string' === typeof p.happened_at) {
				const happened_at = parse_date_local(p.happened_at);
				if (isNaN(happened_at.getTime())) {
					validation.add('Invalid date', 'happened_at');
				} else {
					event.happened_at = happened_at;
				}
			} else {
				validation.add('Invalid date', 'happened_at');
			}
		} else {
			if (!is_new) {
				validation.add('Date required', 'happened_at');
			}
		}
		if ('outcome' in p && 'string' === typeof p.outcome) {
			if (p.outcome.trim().length < 3) {
				validation.add('Outcome must be at least 3 characters', 'outcome');
			} else {
				event.outcome = p.outcome.trim();
			}
		} else {
			validation.add('Outcome is required', 'outcome');
		}
	}
	// console.log('validate_event', pending, event, validation.length);
	if (validation.has()) {
		return { data: pending, validation };
	}
	return { data: event };
}
/**********************************************************************/
/*
{
	const e0: Event = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: 'some stuff',
		happened_at: new Date(),
		customer: {
			customer: 'CCCC-CCCC-CCCC-CCCC-CCCC' as ID,
			name: 'Northwind Analytics',
			label: 'northwind_analytics'
		}
	};
	// @ts-expect-error Missing properties
	const e1: Event = {};
	const e2: Event = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: 'some stuff',
		happened_at: new Date(),
		customer: {
			customer: 'CCCC-CCCC-CCCC-CCCC-CCCC' as ID,
			name: 'Northwind Analytics',
			label: 'northwind_analytics'
		}
	};
	const e3: Event = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: 'some stuff',
		happened_at: new Date(),
		customer: {
			customer: 'CCCC-CCCC-CCCC-CCCC-CCCC' as ID,
			name: 'Northwind Analytics',
			label: 'northwind_analytics',
			// @ts-expect-error
			segment: 'select' // even valid entity property isn’t supported on FKs
		}
	};
	// @ts-expect-error One of customer or workload, not both
	const e4: Event = {
		event: 'eeee-eeee-eeee-eeee-0001' as ID,
		customer: {
			customer: 'cccc-cccc-ccccc-cccc-0001' as ID,
			label: '',
			name: ''
		},
		workload: {
			workload: 'cccc-cccc-ccccc-cccc-0001' as ID,
			label: '',
			name: ''
		},
		outcome: 'Some stuff was discussed. Here are next steps.',
		happened_at: new Date()
	};
}
*/
