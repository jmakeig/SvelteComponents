type Optional<T> = T | null;
type Pending<T> = Optional<T | string>;

declare const __id: unique symbol;
type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type ID = UUID & { readonly [__id]: true };

type Entity<Name extends string> = {
	[P in Name]: ID;
} & {
	name: string;
	label: string;
};

interface Ref {
	_type: string;
	_id: string;
}

export type Customer = Entity<'customer'> & {};
export type Workload = Entity<'workload'> & { size: Optional<number> };

type BaseEvent = {
	event: ID;
	outcome: string;
	happened_at: Date;
};
type CustomerEvent = BaseEvent & {
	customer: Customer;
};
type WorkloadEvent = BaseEvent & {
	workload: Workload;
};
export type Event = CustomerEvent | WorkloadEvent;

export type PendingEvent = {
	id?: Pending<Event['event']>;
	outcome?: Pending<Event['outcome']>;
	happened_at?: Pending<Event['happened_at']>;
	entity?: CustomerWorkloadRef | null;
};

type CustomerWorkloadRef = Ref & {
	_type: 'customer' | 'workload';
	_id: string;
};

/**********************************************************************/
{
	const pe1: PendingEvent = {
		id: 'asdf',
		outcome: null,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'asdf'
		}
	};
	const pe2: PendingEvent = {
		id: 'asdf',
		// @ts-expect-error
		outcome: 44,
		happened_at: new Date(),
		entity: {
			_type: 'workload',
			_id: 'asdf'
		}
	};
	const pe3: PendingEvent = {};
	const pe4: PendingEvent = {
		id: ''
	};
	// @ts-expect-error
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
}
