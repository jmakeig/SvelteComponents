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
	 * What the user would colloqially refer to the entity as. Unlike `ID`s or `label`s,
	 * names are _not_ unique.
	 */
	name: string;
};

/**
 * A `FormData`-ready  reference to another entity.
 *
 * @usage ```
 * 		// TODO
 * ```
 */
interface Ref<Name extends string> {
	/**
	 * The type of entity. This can usually be inferred from the property name,
	 * but may be necessary for a union type property that can accept multiple
	 * entity types.
	 */
	_type?: Name;
	/** The unique identifier of the referenced entity */
	_id: ID;
}

export type Segment = 'select' | 'enterprise' | 'corporate' | 'smb';

export type Customer = Entity<'customer'> & { segment: Optional<Segment> };
export type PendingCustomer = Partial<{
	customer: Optional<Customer['customer']>;
	label: Pending<Customer['label']>;
	name: Pending<Customer['name']>;
	//
	segment: Pending<Customer['segment']>;
}>;

export type Workload = Entity<'workload'> & { size: Optional<number> };
export type PendingWorkload = Partial<{
	workload: Optional<Workload['workload']>;
	label: Pending<Workload['label']>;
	name: Pending<Workload['name']>;
	//
	customer: Ref<'customer'>;
	//
	size: Pending<Workload['size']>;
}>;

type BaseEvent = {
	event: ID;
	outcome: string;
	happened_at: Date;
};
type CustomerEvent = BaseEvent & {
	customer: Entity<'customer'>;
};
type WorkloadEvent = BaseEvent & {
	workload: Entity<'workload'>;
};
export type Event = CustomerEvent | WorkloadEvent;

export type PendingEvent = Partial<{
	event: Optional<Event['event']>;
	outcome: Pending<Event['outcome']>;
	happened_at: Pending<Event['happened_at']>;
	/**
	 * The Customer or Workload
	 */
	entity: Optional<Ref<'customer' | 'workload'>>;
}>;

/**********************************************************************/
{
	const pe0: PendingEvent = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: null,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'WWWW-WWWW-WWWWW-WWWW-WWWW' as ID
		}
	};
	const pe1: PendingEvent = {
		// @ts-expect-error
		event: 'asdf',
		outcome: null,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'WWWW-WWWW-WWWWW-WWWW-WWWW' as ID
		}
	};
	const pe2: PendingEvent = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		// @ts-expect-error
		outcome: 44,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'WWWW-WWWW-WWWWW-WWWW-WWWW' as ID
		}
	};
	const pe3: PendingEvent = {};
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
	const pe4: PendingEvent = {
		// @ts-expect-error Unknown property
		id: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: null,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'WWWW-WWWW-WWWWW-WWWW-WWWW' as ID
		}
	};
	const e3: Event = {
		event: 'EEEE-EEEE-EEEE-EEEE-EEEE' as ID,
		outcome: 'some stuff',
		happened_at: new Date(),
		customer: {
			customer: 'CCCC-CCCC-CCCC-CCCC-CCCC' as ID,
			name: 'Northwind Analytics',
			label: 'northwind_analytics'
		}
	};
	const e4: Event = {
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
}
