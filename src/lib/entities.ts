import { Validation, type Validated } from '$components/FormControl/validation';

/** Optional properties are always represented as explicit `null`, not `undefined` or missing. */
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

export interface Segment {
	name: string;
	value: 'select' | 'enterprise' | 'corporate' | 'smb';
}

/** The stage of the progression through the sales lifecycle. The `value` property allows for ordering. */
export interface Stage {
	name: string;
	/** The order represents the linear progress through the lifecycle. This allows you to sort, but also compare ranges. */
	value: 0 | 1 | 2 | 3 | 4 | 99;
}

export type Customer = Entity<'customer'> & { segment: Optional<Segment['value']> };

export type Workload = Entity<'workload'> & {
	customer: Ref<'customer'>;
	size: Optional<number>;
	stage: Optional<Stage>;
};

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
 * Human-readable and URL-friendly transformation of a `name`, e.g. for `Entity.label`.
 * @param name
 */
export function slug(name: string): string {
	const maxLength = 80;
	let len = 0,
		index = 0,
		slug = '';
	// https://stackoverflow.com/a/66721429
	const tokens = name.split(/[^\p{L}\p{N}]+/gu);
	while (len < maxLength && index < tokens.length) {
		len += tokens[index].length;
		if (tokens[index].length > 0) {
			slug += (index > 0 ? '-' : '') + tokens[index++].toLowerCase();
		} else {
			index++;
		}
	}
	return slug;
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

/**
 * Strict structural and value type and existence validation for `Customer`.
 * This doesn’t check contraints like uniqueness. Those need to happen closer to the database.
 *
 * @param pending Something with a `Customer`-like shape
 * @param is_new Optional flag to specify whether the intent is to validate a new entry, which will have a `null` `customer` identifier
 * @returns A strongly typed `Customer` instance or the original `pending` input and the `Validation<Customer>` instance
 */
export function validate_customer(pending: unknown, is_new: boolean = false): Validated<Customer> {
	const validation = new Validation<Customer>();
	// @ts-expect-error Same "clever or evil" construction pattern as validate_event.
	const customer: Customer = {};
	if (undefined === pending || null === pending || 'object' !== typeof pending) {
		validation.add('Customer must exist');
	} else {
		const p = pending as Record<string, unknown>;
		if ('customer' in p && 'string' === typeof p.customer && '' !== p.customer) {
			// @ts-expect-error `customer` is readonly on Customer (built from Entity<'customer'>,
			// unlike Event.event); this is the one place it's legitimately assigned.
			customer.customer = p.customer as ID;
		} else if (!is_new) {
			validation.add('Unknown customer', 'customer');
		} else {
			// Careful! Whether the server accepts a client-supplied id is a constraint
			// enforced at the db layer, not a shape-validation concern.
			// @ts-expect-error See above.
			customer.customer = null as unknown as ID;
		}
		if ('name' in p && 'string' === typeof p.name && '' !== p.name.trim()) {
			customer.name = p.name.trim();
			// label isn’t independently submitted; it’s always derived from name, and is the
			// URL identifier — a name that slugifies to nothing (e.g. all punctuation) is invalid.
			const label = slug(customer.name);
			if ('' === label) {
				validation.add('Name must contain at least one letter or number', 'name');
			} else {
				customer.label = label;
			}
		} else {
			validation.add('Name is required', 'name');
		}
		if ('segment' in p && 'string' === typeof p.segment && '' !== p.segment) {
			// Shape only: is this a non-empty string? Whether it's one of the known segment
			// values is a referential check against SEGMENTS, deferred to the db layer —
			// same as customer/workload existence is for Event, not re-checked here.
			customer.segment = p.segment as Segment['value'];
		} else {
			customer.segment = null;
		}
	}
	if (validation.has()) {
		return { data: pending, validation };
	}
	return { data: customer };
}

/**
 * Strict structural and value type and existence validation for `Workload`.
 * This doesn’t check contraints like uniqueness or referential integrity.
 * Those need to happen closer to the database.
 *
 * @param pending Something with a `Workload`-like shape
 * @param is_new Optional flag to specify whether the intent is to validate a new entry, which will have a `null` `workload` identifier
 * @returns A strongly typed `Workload` instance or the original `pending` input and the `Validation<Workload>` instance
 */
export function validate_workload(pending: unknown, is_new: boolean = false): Validated<Workload> {
	const validation = new Validation<Workload>();
	// @ts-expect-error Same "clever or evil" construction pattern as validate_event.
	const workload: Workload = {};
	if (undefined === pending || null === pending || 'object' !== typeof pending) {
		validation.add('Workload must exist');
	} else {
		const p = pending as Record<string, unknown>;
		if ('workload' in p && 'string' === typeof p.workload && '' !== p.workload) {
			// @ts-expect-error `workload` is readonly on Workload (built from Entity<'workload'>,
			// unlike Event.event); this is the one place it's legitimately assigned.
			workload.workload = p.workload as ID;
		} else if (!is_new) {
			validation.add('Unknown workload', 'workload');
		} else {
			// Careful! Whether the server accepts a client-supplied id is a constraint
			// enforced at the db layer, not a shape-validation concern.
			// @ts-expect-error See above.
			workload.workload = null as unknown as ID;
		}
		if ('name' in p && 'string' === typeof p.name && '' !== p.name.trim()) {
			workload.name = p.name.trim();
			// label isn’t independently submitted; it’s always derived from name, and is the
			// URL identifier — a name that slugifies to nothing (e.g. all punctuation) is invalid.
			const label = slug(workload.name);
			if ('' === label) {
				validation.add('Name must contain at least one letter or number', 'name');
			} else {
				workload.label = label;
			}
		} else {
			validation.add('Name is required', 'name');
		}
		if ('customer' in p && 'string' === typeof p.customer && '' !== p.customer) {
			// @ts-expect-error Resolved (name/label filled in) downstream, in db.ts's resolve_workload_refs.
			workload.customer = { customer: p.customer as ID };
		} else {
			validation.add('Customer is required', 'customer');
		}
		if ('size' in p && null !== p.size && '' !== p.size) {
			const size = Number(p.size);
			if (!Number.isFinite(size)) {
				validation.add('Invalid size', 'size');
			} else {
				workload.size = size;
			}
		} else {
			workload.size = null;
		}
		if ('stage' in p && null !== p.stage && '' !== p.stage) {
			const value = Number(p.stage);
			if (!Number.isFinite(value)) {
				validation.add('Invalid stage', 'stage');
			} else {
				// Shape only: is this a number? Whether it's one of the known stage values is a
				// referential check against STAGES, deferred to the db layer, same as segment.
				// @ts-expect-error Resolved (name filled in) downstream, in db.ts's resolve_workload_refs.
				workload.stage = { value: value as Stage['value'] };
			}
		} else {
			workload.stage = null;
		}
	}
	if (validation.has()) {
		return { data: pending, validation };
	}
	return { data: workload };
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
