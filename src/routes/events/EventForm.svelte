<script lang="ts" module>
	/**
	 * Reshapes raw event `FormData` into the flat pending object `validate_event` expects,
	 * splitting the ComboBox's combined `customer_workload` value (`"customer_<id>"` /
	 * `"workload_<id>"`) back into a `customer` or `workload` key. Shared between the client
	 * (`create_submit_enhance`, below) and the server action so they agree on the same shape.
	 *
	 * @throws {TypeError} Unexpectd parse error
	 */
	export function unmarshall(form: FormData): Record<string, unknown> {
		const customer_workload = form.get('customer_workload') as string | null;
		let pair = {};
		if (customer_workload) {
			if (!/^(customer|workload)_[a-z0-9\-]+$/.test(customer_workload)) {
				throw new TypeError(`'${customer_workload}' is not valid`); // This should never happen
			}
			const [type, entity] = customer_workload.split('_');
			pair = { [type]: entity };
		}
		return {
			event: form.get('event'),
			outcome: form.get('outcome'),
			happened_at: form.get('happened_at'),
			...pair
		};
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import CustomerWorkloadCombo from '$lib/components/CustomerWorkloadCombo.svelte';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { create_submit_enhance } from '$components/FormControl/FormControl.svelte';
	import type { Validated } from '$components/FormControl/validation';

	import { type Event, validate_event } from '$lib/entities';
	import type { Match } from '$components/ComboBox/machine';

	interface Props {
		action?: 'new' | 'edit' | 'view';
		data: Event;
		form?: Validated<Event> | null; // ActionData
	}

	const { action = 'edit', data, form }: Props = $props();
	/** Either a validated `Event` or the raw (possibly invalid) submission being redisplayed — read fields off it with a local cast, not a modeled shape. */
	const event = $derived((form?.data ?? data) as Record<string, unknown> | undefined);

	$inspect(event);

	/** TODO: Extract later */
	type Loosey<T> = T | string | null | undefined;

	function to_iso_date(value: Loosey<Date>): Loosey<string> {
		if (value instanceof Date) {
			if (isNaN(value.getTime())) return null;
			return value.toISOString().slice(0, 10);
		}
		return value;
	}

	/**
	 * TODO: Only ever called with `data` (the loaded `Event`), never `form?.data`, so the
	 * combo's selection is silently lost when a submission fails and redisplays — unlike
	 * `outcome`/`happened_at`, which do read from `form?.data ?? data`. Fixing that means
	 * feeding a failed submission's `customer`/`workload` through here too, which is a
	 * `Ref` in name only at that point: a client-side/shape validation failure carries a raw
	 * string id (`unmarshall`'s output, unparsed), while a server-side db-constraint failure
	 * (see `resolve_event_refs` in db.ts) carries a `{customer: id}`/`{workload: id}` object
	 * with no `name`/`label` yet — neither matches `Ref`'s (now `Entity`'s) required shape.
	 * Whichever shape, this needs to degrade gracefully rather than assume a resolved `Ref`.
	 */
	function initial_match(event: Event): Match | undefined {
		if ('customer' in event && event.customer) {
			const { customer: id, name, label } = event.customer;
			return { name, label, value: `customer_${id}` };
		}
		if ('workload' in event && event.workload) {
			const { workload: id, name, label } = event.workload;
			return { name, label, value: `workload_${id}` };
		}
		return undefined;
	}
</script>

<form
	method="post"
	action="?/{action}"
	novalidate
	class:invalid={form?.validation?.has()}
	use:enhance={create_submit_enhance<Event>(
		(value: unknown) => validate_event(value, true),
		unmarshall
	)}
>
	{#if form}
		{#if form.validation}
			<p class="error">Nope! {form.validation.first()?.message}</p>
		{:else}
			<p>Sucessfully submitted ({event!.event})</p>
		{/if}
	{/if}
	<input type="hidden" name="event" value={event?.event} />
	<FormControl
		name="customer_workload"
		label="Entity"
		value={undefined}
		validation={form?.validation}
	>
		{#snippet input({ name, label = '' })}
			<CustomerWorkloadCombo {name} {label} value={initial_match(data)} />
		{/snippet}
	</FormControl>
	<FormControl name="outcome" value={event?.outcome} validation={form?.validation}>
		{#snippet input(provided)}
			<textarea {...provided}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={to_iso_date(event?.happened_at as Loosey<Date>)}
		validation={form?.validation}
	>
		{#snippet input(provided)}
			<input type="date" {...provided} />
		{/snippet}
	</FormControl>
	<div class="control actions">
		<button class="default">
			{#if 'new' === action}
				{@render icon_create()} Create
			{:else if 'edit' === action}
				{@render icon_create()} Update
			{/if}
		</button>
		{#if 'edit' === action}
			<button
				type="submit"
				form="event-delete"
				onclick={(evt) => {
					if (!confirm('Delete this event?')) evt.preventDefault();
				}}
			>
				Delete
			</button>
		{/if}
	</div>
</form>

{#if 'edit' === action}
	<form id="event-delete" method="post" action="?/delete" use:enhance></form>
{/if}

{#snippet icon_create(width = '1em', height = '1em')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-plus"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
		/><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" /><path
			d="M10 14h4"
		/><path d="M12 12v4" /></svg
	>
{/snippet}
